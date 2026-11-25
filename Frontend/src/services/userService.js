import apiClient from '../config/apiClient';

const userService = {
  getAddresses: () => apiClient.get('/users/addresses'),
  updateAddresses: (addresses) => apiClient.patch('/users/addresses', { addresses }),
  changePassword: (passwordData) => apiClient.patch('/users/change-password', passwordData),
};

export default userService;
