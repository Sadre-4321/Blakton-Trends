/**
 * Flipkart-style query understanding for tailor catalog.
 * Maps free text → category / color / pant style / occasion filters.
 */

const COLORS = [
  'white', 'black', 'navy', 'blue', 'sky', 'skyblue', 'grey', 'gray', 'cream',
  'beige', 'brown', 'pink', 'red', 'ivory', 'gold', 'charcoal', 'lavender',
  'maroon', 'green', 'olive',
];

const PANT_STYLES = ['bootcut', 'baggy', 'straight', 'slim', 'regular', 'ankle', 'long'];

const OCCASIONS = ['wedding', 'party', 'formal', 'regular', 'festive', 'office'];

const CATEGORY_RULES = [
  { category: 'formal-shirt', words: ['shirt', 'shirts', 'formalshirt', 'formal-shirt'] },
  { category: 'formal-pant', words: ['pant', 'pants', 'paint', 'paints', 'trouser', 'trousers', 'formalpant', 'formal-pant', 'formalpaint'] },
  { category: 'coat', words: ['coat', 'coats', 'blazer', 'blazers', 'jacket'] },
  { category: 'kurta-pajama', words: ['kurta', 'kurtas', 'pajama', 'pyjama', 'kurta-pajama'] },
  { category: '2-piece', words: ['2piece', '2-piece', 'twopiece', 'pair', 'pairs', 'set'] },
  { category: '3-piece', words: ['3piece', '3-piece', 'threepiece', 'suit', 'suits', 'tuxedo'] },
];

const normalize = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseSearchQuery = (rawQuery = '') => {
  const original = String(rawQuery || '').trim();
  let text = normalize(original);

  // multi-word category phrases first
  const phraseMap = [
    { phrase: 'formal shirt', category: 'formal-shirt' },
    { phrase: 'formal pant', category: 'formal-pant' },
    { phrase: 'formal paint', category: 'formal-pant' },
    { phrase: 'kurta pajama', category: 'kurta-pajama' },
    { phrase: '2 piece', category: '2-piece' },
    { phrase: '3 piece', category: '3-piece' },
    { phrase: 'shirt pant', category: '2-piece' },
    { phrase: 'sky blue', color: 'sky' },
    { phrase: 'light blue', color: 'blue' },
  ];

  let category = '';
  let color = '';
  let pantStyle = '';
  let occasion = '';

  phraseMap.forEach((item) => {
    if (text.includes(item.phrase)) {
      if (item.category) category = item.category;
      if (item.color) color = item.color;
      text = text.replace(item.phrase, ' ');
    }
  });

  const tokens = text.split(' ').filter(Boolean);
  const leftover = [];

  tokens.forEach((token) => {
    if (!category) {
      const rule = CATEGORY_RULES.find((r) => r.words.includes(token));
      if (rule) {
        category = rule.category;
        return;
      }
    }
    if (!color && COLORS.includes(token)) {
      color = token === 'gray' ? 'grey' : token === 'skyblue' ? 'sky' : token;
      return;
    }
    if (!pantStyle && PANT_STYLES.includes(token)) {
      pantStyle = token;
      return;
    }
    if (!occasion && OCCASIONS.includes(token)) {
      occasion = token === 'office' ? 'formal' : token === 'festive' ? 'wedding' : token;
      return;
    }
    leftover.push(token);
  });

  // pant-related style implies pant category if none set
  if (!category && pantStyle) category = 'formal-pant';

  return {
    original,
    category,
    color,
    pantStyle,
    occasion,
    keywords: leftover,
    tokens: original ? normalize(original).split(' ').filter(Boolean) : [],
  };
};

const buildSmartProductQuery = (rawQuery) => {
  const parsed = parseSearchQuery(rawQuery);
  const and = [{ status: 'active' }];

  if (parsed.category) and.push({ category: parsed.category });
  if (parsed.color) {
    const colorRx = new RegExp(escapeRegex(parsed.color), 'i');
    // Prefer primary product color / name so "white shirt" is not flooded by option lists
    and.push({
      $or: [
        { color: colorRx },
        { name: colorRx },
      ],
    });
  }
  if (parsed.pantStyle) {
    const styleRx = new RegExp(escapeRegex(parsed.pantStyle), 'i');
    and.push({
      $or: [
        { pantStyle: styleRx },
        { fit: styleRx },
        { name: styleRx },
        { description: styleRx },
      ],
    });
  }
  if (parsed.occasion) {
    and.push({ occasion: parsed.occasion });
  }
  if (parsed.keywords.length) {
    const keywordOr = parsed.keywords.flatMap((word) => {
      const rx = new RegExp(escapeRegex(word), 'i');
      return [
        { name: rx },
        { description: rx },
        { fabric: rx },
        { fit: rx },
        { collection: rx },
      ];
    });
    and.push({ $or: keywordOr });
  }

  // If user typed only free text with no structured match, broad token search
  if (
    !parsed.category
    && !parsed.color
    && !parsed.pantStyle
    && !parsed.occasion
    && parsed.tokens.length
  ) {
    const broadOr = parsed.tokens.flatMap((word) => {
      const rx = new RegExp(escapeRegex(word), 'i');
      return [
        { name: rx },
        { description: rx },
        { category: rx },
        { collection: rx },
        { color: rx },
        { colors: rx },
        { fabric: rx },
        { fit: rx },
        { pantStyle: rx },
        { occasion: rx },
      ];
    });
    return {
      parsed,
      primary: { status: 'active', $or: broadOr },
      fallbackCategory: null,
      fallbackBroad: { status: 'active' },
    };
  }

  return {
    parsed,
    primary: { $and: and },
    fallbackCategory: parsed.category
      ? { status: 'active', category: parsed.category }
      : null,
    fallbackBroad: parsed.tokens.length
      ? {
        status: 'active',
        $or: parsed.tokens.flatMap((word) => {
          const rx = new RegExp(escapeRegex(word), 'i');
          return [
            { name: rx },
            { description: rx },
            { category: rx },
            { color: rx },
            { colors: rx },
            { pantStyle: rx },
            { fit: rx },
            { occasion: rx },
          ];
        }),
      }
      : { status: 'active' },
  };
};

module.exports = {
  parseSearchQuery,
  buildSmartProductQuery,
};
