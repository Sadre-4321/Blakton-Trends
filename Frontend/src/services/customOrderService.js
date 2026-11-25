import apiClient from '../config/apiClient';

const customOrderService = {
  create: (payload) => apiClient.post('/custom-orders', payload),
  getMine: () => apiClient.get('/custom-orders/mine'),
  getMineById: (id) => apiClient.get(`/custom-orders/mine/${id}`),
  initiatePayment: (id) => apiClient.post(`/custom-orders/${id}/payment`),
  verifyPayment: (id, body) => apiClient.post(`/custom-orders/${id}/verify-payment`, body),
  getAdminAll: (params) => apiClient.get('/admin/custom-orders', { params }),
  getAdminById: (id) => apiClient.get(`/admin/custom-orders/${id}`),
  updateAdmin: (id, body) => apiClient.patch(`/admin/custom-orders/${id}`, body),
};

export default customOrderService;
