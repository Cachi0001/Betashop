import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    registerSuccess: (state, action) => {
      const { admin, token } = action.payload;
      state.admin = admin;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
    },
    
    loginSuccess: (state, action) => {
      const { admin, token } = action.payload;
      state.admin = admin;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
    },
    
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.admin = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    },
    
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    },
    
    updateProfile: (state, action) => {
      state.admin = { ...state.admin, ...action.payload };
      localStorage.setItem('admin', JSON.stringify(state.admin));
    },
    
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const admin = localStorage.getItem('admin');
      
      if (token && admin) {
        state.token = token;
        state.admin = JSON.parse(admin);
        state.isAuthenticated = true;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

