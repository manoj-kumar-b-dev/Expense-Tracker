/**
 * @file axiosInstance.js
 * @description Central Axios HTTP client with request and response interceptors.
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Inject Bearer JWT token if stored in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Catch generic errors, 401 sessions expiration, and toast alerts
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Skip auto-logout for auth endpoints — they legitimately return 401
    // (e.g. wrong password, unverified email). Let the caller handle those.
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    // Auto logout and clear storage on 401 Unauthorized (non-auth routes only)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      console.warn('⚠️ Session expired or invalid. Logging out...');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Prevent infinite redirect loops
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    
    // Toast alert on 500 Internal Server Errors
    if (error.response && error.response.status === 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
