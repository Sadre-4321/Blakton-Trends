import apiClient from '../config/apiClient';

const orderService = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderById: (orderId) => apiClient.get(`/orders/${orderId}`),
  updateOrder: (orderId, updateData) => apiClient.put(`/orders/${orderId}`, updateData),
  cancelOrder: (orderId) => apiClient.post(`/orders/${orderId}/cancel`),
  trackOrder: (orderId) => apiClient.get(`/orders/${orderId}/track`),
  initiatePayment: (orderId, paymentData) => apiClient.post(`/orders/${orderId}/payment`, paymentData),
  verifyPayment: (orderId, paymentData) => apiClient.post(`/orders/${orderId}/verify-payment`, paymentData),
  downloadInvoice: (orderId) => apiClient.get(`/orders/${orderId}/invoice`, { responseType: 'blob' }),
};

export default orderService;
