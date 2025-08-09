import api from './api';

export const authService = {
  // Admin registration
  registerAdmin: async (adminData) => {
    const response = await api.post('/auth/owner-register', adminData);
    return response.data;
  },

  // Admin login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Get admin profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current admin data
  getCurrentAdmin: () => {
    const adminData = localStorage.getItem('admin');
    return adminData ? JSON.parse(adminData) : null;
  },

  // Update bank details
  updateBankDetails: async (bankDetails) => {
    const response = await api.put('/auth/bank-details', bankDetails);
    return response.data;
  }
};