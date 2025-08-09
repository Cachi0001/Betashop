import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create user-friendly error messages
    let userMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          userMessage = data?.error || data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Authentication required. Please log in.';
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/admin/login';
            }, 1000);
          }
          break;
        case 403:
          userMessage = 'Access denied. You don\'t have permission for this action.';
          break;
        case 404:
          userMessage = 'Resource not found.';
          break;
        case 422:
          userMessage = data?.error || 'Validation failed. Please check your input.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        default:
          userMessage = data?.error || data?.message || `Request failed (${status})`;
      }
    } else if (error.request) {
      // Network error
      userMessage = 'Network error. Please check your connection and try again.';
    }
    
    // Create a new error with user-friendly message
    const enhancedError = new Error(userMessage);
    enhancedError.originalError = error;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
);

export default api;

