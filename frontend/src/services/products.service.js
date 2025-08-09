import api from './api';

export const productsService = {
  // Get all products with pagination and filters
  getProducts: async (params = {}) => {
    console.log('🔗 PRODUCTS SERVICE - Making API call with params:', params);
    
    // Add cache-busting parameter to avoid 304 responses
    const requestParams = {
      ...params,
      _t: Date.now() // Cache buster
    };
    
    const response = await api.get('/products', { 
      params: requestParams,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('🔗 PRODUCTS SERVICE - API response:', response.data);
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (admin only)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (admin only)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product images (admin only)
  uploadProductImages: async (productId, images) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

