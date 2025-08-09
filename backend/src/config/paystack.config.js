const axios = require('axios');

if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}

const paystackAPI = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

const paystackConfig = {
  initializePayment: async (data) => {
    try {
      const response = await paystackAPI.post('/transaction/initialize', data);
      return response.data;
    } catch (error) {
      throw new Error(`Paystack initialization error: ${error.response?.data?.message || error.message}`);
    }
  },

  verifyPayment: async (reference) => {
    try {
      const response = await paystackAPI.get(`/transaction/verify/${reference}`);
      return response.data;
    } catch (error) {
      throw new Error(`Paystack verification error: ${error.response?.data?.message || error.message}`);
    }
  },

  createTransferRecipient: async (data) => {
    try {
      const response = await paystackAPI.post('/transferrecipient', data);
      return response.data;
    } catch (error) {
      throw new Error(`Paystack recipient creation error: ${error.response?.data?.message || error.message}`);
    }
  },

  initiateTransfer: async (data) => {
    try {
      const response = await paystackAPI.post('/transfer', data);
      return response.data;
    } catch (error) {
      throw new Error(`Paystack transfer error: ${error.response?.data?.message || error.message}`);
    }
  }
};

module.exports = paystackConfig;

