import apiClient from '../config/apiClient';

const adminService = {
  getRevenue: (params) => apiClient.get('/admin/stats/revenue', { params }),
  getOrderStatus: (params) => apiClient.get('/admin/stats/orders', { params }),
  getRecentOrders: (params) => apiClient.get('/admin/orders', { params }),
  getLowStock: (params) => apiClient.get('/admin/products', { params: { ...params, stock_lt: params?.stock_lt || 5 } }),
  updateOrderStatus: (orderId, body) => apiClient.patch(`/admin/orders/${orderId}`, body),
  getProducts: (params) => apiClient.get('/admin/products', { params }),
  updateProductStatus: (id, body) => apiClient.patch(`/products/${id}`, body),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  createProduct: (body) => apiClient.post('/admin/products', body),
  updateProduct: (id, body) => apiClient.put(`/admin/products/${id}`, body),
  getAdminOrders: (params) => apiClient.get('/admin/orders', { params }),
  getAdminOrderById: (orderId) => apiClient.get(`/admin/orders/${orderId}`),
  updateAdminOrder: (orderId, body) => apiClient.patch(`/admin/orders/${orderId}`, body),
  getPaymentSummary: () => apiClient.get('/admin/payments/summary'),
  getPayments: (params) => apiClient.get('/admin/payments', { params }),
  confirmPayment: (paymentId, body) => apiClient.patch(`/admin/payments/${paymentId}`, body),
  getCustomers: () => apiClient.get('/admin/customers'),
  toggleCustomerStatus: (customerId, body) => apiClient.patch(`/admin/users/${customerId}/status`, body),
  getDeliveryBoys: () => apiClient.get('/admin/users', { params: { role: 'delivery_boy' } }),
  addDeliveryBoy: (payload) => apiClient.post('/admin/users', payload),
  updateUser: (id, payload) => apiClient.patch(`/admin/users/${id}`, payload),
  getBanners: () => apiClient.get('/admin/banners'),
  createBanner: (body) => apiClient.post('/admin/banners', body),
  updateBanner: (id, body) => apiClient.put(`/admin/banners/${id}`, body),
  patchBanner: (id, body) => apiClient.patch(`/admin/banners/${id}`, body),
  deleteBanner: (id) => apiClient.delete(`/admin/banners/${id}`),
};

export default adminService;
