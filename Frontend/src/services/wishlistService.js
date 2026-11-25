import apiClient from '../config/apiClient';

const wishlistService = {
  getWishlist: () => apiClient.get('/wishlist'),
  addToWishlist: (productId) => apiClient.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}`),
  clearWishlist: () => apiClient.delete('/wishlist'),
  isInWishlist: (productId) => apiClient.get(`/wishlist/check/${productId}`),
  moveToCart: (productId) => apiClient.post(`/wishlist/${productId}/move-to-cart`),
};

export default wishlistService;
