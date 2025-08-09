import { createAsyncThunk } from '@reduxjs/toolkit';
import { productsService } from '../services/products.service';
import { 
  setLoading, 
  setProducts, 
  setCurrentProduct, 
  setPagination, 
  setError,
  clearError 
} from './productsSlice';
import { errorToast, networkErrorToast } from '../utils/toast';

// Fetch products with pagination and filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await productsService.getProducts(params);
      console.log('🛍️ PRODUCTS THUNK - API response:', response);
      
      // Extract products from the API response structure
      const products = response.data?.products || response.products || response.data || [];
      console.log('🛍️ PRODUCTS THUNK - Extracted products:', products.length);
      
      dispatch(setProducts(products));
      
      if (response.pagination) {
        dispatch(setPagination(response.pagination));
      }
      
      return response;
    } catch (error) {
      console.error('❌ PRODUCTS THUNK - Error:', error);
      const errorMessage = error.message || 'Failed to fetch products';
      
      // Only show toast for non-network errors or if it's the first load
      if (!error.message.includes('Network error')) {
        errorToast(errorMessage);
      }
      
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await productsService.getProductById(productId);
      
      dispatch(setCurrentProduct(response.data || response));
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch product';
      errorToast(errorMessage);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchQuery, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const params = {
        search: searchQuery,
        page: 1,
        limit: 12
      };
      
      const response = await productsService.getProducts(params);
      
      // Extract products from the API response structure
      const products = response.data?.products || response.products || response.data || [];
      dispatch(setProducts(products));
      
      if (response.pagination) {
        dispatch(setPagination(response.pagination));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to search products';
      errorToast(errorMessage);
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);