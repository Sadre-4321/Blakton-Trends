import apiClient from '../config/apiClient';

const deliveryService = {
  getMyOrders: () => apiClient.get('/delivery/orders'),
  getDeliveryOrder: (orderId) => apiClient.get(`/delivery/orders/${orderId}`),
  updateDeliveryStatus: (orderId, body) => apiClient.patch(`/delivery/orders/${orderId}`, body),
};

export default deliveryService;
