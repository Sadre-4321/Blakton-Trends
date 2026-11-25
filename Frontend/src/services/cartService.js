import apiClient from '../config/apiClient';

const cartService = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (productId, quantity, size = '', color = '') => apiClient.post('/cart/add', { productId, quantity, size, color }),
  updateCartItem: (productId, quantity) => apiClient.put(`/cart/item/${productId}`, { quantity }),
  removeFromCart: (productId) => apiClient.delete(`/cart/item/${productId}`),
  clearCart: () => apiClient.delete('/cart'),
  applyCoupon: (couponCode) => apiClient.post('/cart/apply-coupon', { couponCode }),
  removeCoupon: () => apiClient.post('/cart/remove-coupon'),
};

export default cartService;
