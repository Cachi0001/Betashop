import { configureStore } from '@reduxjs/toolkit';
import cartSlice from './cartSlice';
import authSlice from './authSlice';
import productsSlice from './productsSlice';

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    auth: authSlice,
    products: productsSlice,
  },
});

export default store;

