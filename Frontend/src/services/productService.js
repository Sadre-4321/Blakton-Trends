import apiClient from '../config/apiClient';

const productService = {
  getAllProducts: (params) => apiClient.get('/products', { params }),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  getProductsByCategory: (category, params) => apiClient.get(`/products/category/${category}`, { params }),
  searchProducts: (query, params) => apiClient.get('/products/search', { params: { q: query, ...params } }),
  getCategories: () => apiClient.get('/categories'),
  getCollections: () => apiClient.get('/collections'),
  getFeaturedProducts: () => apiClient.get('/products/featured'),
  getNewArrivals: () => apiClient.get('/products/new-arrivals'),
  getProductReviews: (productId) => apiClient.get(`/products/${productId}/reviews`),
  addProductReview: (productId, reviewData) => apiClient.post(`/products/${productId}/reviews`, reviewData),
  getOfferProducts: (params) => apiClient.get('/products', { params: { onOffer: true, ...params } }),
  getBanners: () => apiClient.get('/banners'),
};

export default productService;
