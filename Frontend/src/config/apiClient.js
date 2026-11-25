import axios from 'axios';
import { getLocalStorage, removeLocalStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/appConstants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const clearAuthStorage = () => {
  removeLocalStorage(STORAGE_KEYS.AUTH_TOKEN);
  removeLocalStorage(STORAGE_KEYS.USER);
  // Clean any raw keys that may exist from older builds
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let browser set multipart boundary for FormData uploads
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // eslint-disable-next-line no-param-reassign
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest = /\/auth\/(login|register|forgot-password|reset-password)/.test(requestUrl);
    const onAuthPage = typeof window !== 'undefined'
      && /\/(auth\/)?(login|register)/.test(window.location.pathname);

    // Never hard-reload on login/register failures — show form error instead
    if (status === 401 && !isAuthRequest && !onAuthPage) {
      clearAuthStorage();
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  },
);

export default apiClient;
