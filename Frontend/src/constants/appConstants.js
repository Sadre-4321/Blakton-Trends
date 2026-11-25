// App Constants — Blakton
export const APP_NAME = 'Blakton';
export const APP_DESCRIPTION = 'Modern men\'s fashion — suits, blazers, shirts, pants and occasion wear';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  AUTH: '/auth',
  PRODUCTS: '/products',
  CART: '/cart',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  USER: '/users',
  ADMIN: '/admin',
  DELIVERY: '/delivery',
};

export const PRODUCT_CATEGORIES = [
  { label: 'Formal Shirt', slug: 'formal-shirt' },
  { label: 'Formal Pant', slug: 'formal-pant' },
  { label: 'Coat / Blazer', slug: 'coat' },
  { label: 'Waistcoat', slug: 'waistcoat' },
  { label: 'Kurta Pajama', slug: 'kurta-pajama' },
  { label: '2-Piece', slug: '2-piece' },
  { label: '3-Piece', slug: '3-piece' },
];

export const COLLECTIONS = [
  { id: 1, name: 'Formal Shirts', slug: 'formal-shirts' },
  { id: 2, name: 'Formal Pants', slug: 'formal-pants' },
  { id: 3, name: 'Coats & Blazers', slug: 'coats-blazers' },
  { id: 4, name: '2 Piece Sets', slug: '2-piece-sets' },
  { id: 5, name: '3 Piece Suits', slug: '3-piece-suits' },
  { id: 6, name: 'Summer Edit', slug: 'summer-edit' },
  { id: 7, name: 'Winter Edit', slug: 'winter-edit' },
  { id: 8, name: 'Kurta Collection', slug: 'kurta-collection' },
];

export const ORDER_STATUS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  DISPATCHED: 'Dispatched',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_METHODS = {
  ONLINE: 'Pay Online (UPI / Card)',
  COD: 'Cash on Delivery',
};

export const SIZE_CHART = {
  SHIRT: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  PANTS: ['28', '30', '32', '34', '36', '38', '40'],
  KURTA: ['S', 'M', 'L', 'XL', 'XXL'],
};

export const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

export const PRICE_RANGES = [
  { label: '₹0 - ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
  { label: '₹5000+', min: 5000, max: 999999 },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  DEFAULT_LIMIT_OPTIONS: [6, 12, 24, 48],
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  WISHLIST: 'wishlist',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recentSearches',
};

export const MESSAGES = {
  SUCCESS: 'Operation completed successfully!',
  ERROR: 'Something went wrong. Please try again.',
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  ADDED_TO_CART: 'Item added to cart!',
  REMOVED_FROM_CART: 'Item removed from cart!',
  ORDER_PLACED: 'Order placed successfully!',
};
