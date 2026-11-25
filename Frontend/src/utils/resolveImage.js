const PLACEHOLDER =
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

/**
 * Normalize product/banner image paths for <img> and CSS url().
 * Handles array, string, and already-encoded local /Image paths.
 */
export const resolveImageUrl = (source) => {
  let src = source;
  if (Array.isArray(src)) src = src[0];
  if (!src || typeof src !== 'string') return PLACEHOLDER;

  // If a string was accidentally indexed as chars elsewhere
  if (src.length <= 2 && source && typeof source === 'string' && source.length > 2) {
    src = source;
  }

  try {
    // Decode once so we never double-encode (%2520)
    src = decodeURIComponent(src);
  } catch {
    // keep as-is
  }

  // Absolute / data / blob URLs
  if (/^(https?:|data:|blob:)/i.test(src)) return src;

  // Ensure leading slash for local public assets
  if (!src.startsWith('/')) src = `/${src}`;

  // Backend-hosted uploads (avatars)
  if (src.startsWith('/uploads/')) {
    return `${API_ORIGIN}${src}`;
  }

  // Encode each path segment (spaces → %20) exactly once
  return src
    .split('/')
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join('/');
};

export const cssImageUrl = (source) => {
  const url = resolveImageUrl(source);
  return `url("${url}")`;
};

export default resolveImageUrl;
