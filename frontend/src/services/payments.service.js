import api from './api';

export const paymentsService = {
  // Initialize payment
  initializePayment: async (orderData) => {
    const response = await api.post('/payments/initialize', orderData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference) => {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  },
};

