import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    category_id: '',
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProducts,
  setCategories,
  setCurrentProduct,
  setPagination,
  setFilters,
  setError,
  clearError,
} = productsSlice.actions;

export default productsSlice.reducer;

