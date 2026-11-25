/**
 * Local product images from Frontend/public/Image
 * Paths keep real folder/file names; resolveImageUrl encodes for the browser.
 */

const img = (folder, file) => `/Image/${folder}/${file}`;

export const PRODUCT_IMAGE_CATALOG = {
  'formal-shirt': {
    folder: 'Formal shirt',
    files: [
      'Img 1.jpg', 'Img 2.jpg', 'img 3.jpg', 'Img 4.jpg', 'Img 5.jpg', 'Img 6.jpg',
      'Img 7.jpg', 'Img 8.jpg', 'Img 9.jpg', 'Img 10.jpg', 'Img 11.jpg', 'Img 12.jpg',
      'Img 13.jpg', 'Img 14.jpg', 'Img 15.jpg', 'Img 16.jpg', 'Img 17.jpg', 'Img 18.jpg', 'Img 19.jpg',
    ],
  },
  'formal-pant': {
    folder: 'Formal paint',
    files: ['Pn 1.jpg', 'Pn 2.jpg', 'Pn 3.jpg', 'Pn 4.jpg', 'Pn 5.jpg', 'Pn 6.jpg', 'Pn 7.jpg'],
  },
  coat: {
    folder: 'Single coat',
    files: ['Ct 1.jpg', 'Ct 2.jpg', 'Ct 3.jpg', 'Ct 4.jpg', 'Ct 5.jpg', 'Ct 6.jpg', 'Ct 7.jpg', 'Ct 8.jpg', 'Ct 9.jpg', 'Ct 10.jpg'],
  },
  '2-piece': {
    folder: '2 peice',
    files: [
      'Pair 1.jpg', 'Pair 2.jpg', 'pair 3.jpg', 'Pair 4.jpg', 'Pair 5.jpg', 'pair 6.jpg',
      'pair 7.jpg', 'pair 8.jpg', 'pair 9.jpg', 'pair 10.jpg', 'Pair 11.jpg', 'Pair 12.jpg',
      'Pair 13.jpg', 'Pair 14.jpg',
    ],
  },
  'shirt-pant-pair': {
    folder: 'Paired shirt paint',
    files: [
      'Fr 1.jpg', 'Fr 2.jpg', 'Fr 3.jpg', 'Fr 4.jpg', 'Fr 5.jpg', 'Fr 6.jpg',
      'Fr 7.jpg', 'fr 8.jpg', 'Fr 9.jpg', 'Fr 10.jpg',
    ],
  },
  '3-piece': {
    folder: '3 peice',
    files: ['Tr 1.jpg', 'Tr 2.jpg', 'Tr 3.jpg', 'Tr 4.jpg', 'Tr 5.jpg', 'Tr 6.jpg', 'Tr 7.jpg', 'Tr 8.jpg', 'Tr 9.jpg', 'Tr 10.jpg'],
  },
  'kurta-pajama': {
    folder: 'Kurta pajamas',
    files: ['Kr 1.jpg', 'kr 2.jpg', 'Kr 3.jpg', 'Kr 4.jpg', 'Kr 5.jpg'],
  },
};

export const getCategoryImages = (key) => {
  const entry = PRODUCT_IMAGE_CATALOG[key];
  if (!entry) return [];
  return entry.files.map((file) => img(entry.folder, file));
};

export const CATEGORY_COVER_IMAGES = {
  offers: img('2 peice', 'Pair 5.jpg'),
  'formal-shirt': img('Formal shirt', 'Img 7.jpg'),
  'formal-pant': img('Formal paint', 'Pn 3.jpg'),
  '2-piece': img('2 peice', 'Pair 5.jpg'),
  coat: img('Single coat', 'Ct 4.jpg'),
  '3-piece': img('3 peice', 'Tr 2.jpg'),
  'kurta-pajama': img('Kurta pajamas', 'Kr 3.jpg'),
  summer: img('Paired shirt paint', 'Fr 4.jpg'),
  winter: img('Single coat', 'Ct 6.jpg'),
};

export const BANNER_IMAGES = [
  img('3 peice', 'Tr 2.jpg'),
  img('2 peice', 'Pair 5.jpg'),
  img('Formal shirt', 'Img 7.jpg'),
];

export default PRODUCT_IMAGE_CATALOG;
