import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { 
  setValidationErrors, 
  clearValidationErrors, 
  syncCartWithProducts,
  updateProductStock 
} from './cartSlice';
import { errorToast, warningToast } from '../utils/toast';

// Validate cart items against current stock and prices
export const validateCart = createAsyncThunk(
  'cart/validateCart',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      
      if (cart.items.length === 0) {
        dispatch(clearValidationErrors());
        return { valid: true, items: [] };
      }

      console.log('🛒 CART THUNKS - Validating cart with', cart.items.length, 'items');

      // Prepare cart items for validation
      const cartItems = cart.items.map(item => ({
        product_id: item.product.id,
        admin_id: item.product.admin_id,
        quantity: item.quantity,
        unit_price: item.product.customer_price,
        total_price: item.product.customer_price * item.quantity
      }));

      const response = await api.post('/payments/validate-cart', {
        items: cartItems
      });

      if (response.data.success) {
        if (response.data.data.valid) {
          dispatch(clearValidationErrors());
          console.log('✅ CART THUNKS - Cart validation successful');
          return { valid: true, items: response.data.data.items };
        } else {
          dispatch(setValidationErrors(response.data.data.errors || []));
          console.log('❌ CART THUNKS - Cart validation failed:', response.data.data.errors?.length || 0, 'errors');
          
          // Show warning toast for cart validation issues
          const errorCount = response.data.data.errors?.length || 0;
          if (errorCount > 0) {
            warningToast(`${errorCount} item${errorCount > 1 ? 's' : ''} in your cart need${errorCount === 1 ? 's' : ''} attention`);
          }
          
          return { valid: false, errors: response.data.data.errors };
        }
      } else {
        throw new Error(response.data.error || 'Cart validation failed');
      }
    } catch (error) {
      console.error('❌ CART THUNKS - Cart validation error:', error);
      const errorMessage = error.message || 'Cart validation failed';
      dispatch(setValidationErrors([{ error: errorMessage }]));
      // Don't show toast for validation errors as they're handled in the UI
      return rejectWithValue(errorMessage);
    }
  }
);

// Sync cart with latest product data
export const syncCartWithLatestProducts = createAsyncThunk(
  'cart/syncWithLatestProducts',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      
      if (cart.items.length === 0) {
        return { synced: true, changes: [] };
      }

      console.log('🔄 CART THUNKS - Syncing cart with latest product data');

      // Get product IDs from cart
      const productIds = cart.items.map(item => item.product.id);
      
      // Fetch latest product data
      const response = await api.get('/products', {
        params: {
          ids: productIds.join(','),
          limit: productIds.length
        }
      });

      if (response.data.success) {
        const latestProducts = response.data.data.products || [];
        dispatch(syncCartWithProducts(latestProducts));
        
        console.log('✅ CART THUNKS - Cart synced with latest product data');
        return { synced: true, products: latestProducts };
      } else {
        throw new Error(response.data.error || 'Failed to sync cart');
      }
    } catch (error) {
      console.error('❌ CART THUNKS - Cart sync error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Cart sync failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Check stock availability for a specific product
export const checkProductStock = createAsyncThunk(
  'cart/checkProductStock',
  async ({ productId }, { dispatch, rejectWithValue }) => {
    try {
      console.log('📦 CART THUNKS - Checking stock for product:', productId);

      const response = await api.get(`/products/${productId}`);

      if (response.data.success) {
        const product = response.data.data.product;
        
        // Update stock in cart if product is in cart
        dispatch(updateProductStock({
          productId: productId,
          newStock: product.stock_quantity
        }));

        console.log('✅ CART THUNKS - Stock check complete:', product.stock_quantity, 'available');
        return {
          productId: productId,
          stock: product.stock_quantity,
          available: product.stock_quantity > 0
        };
      } else {
        throw new Error(response.data.error || 'Failed to check stock');
      }
    } catch (error) {
      console.error('❌ CART THUNKS - Stock check error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Stock check failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize checkout process
export const initializeCheckout = createAsyncThunk(
  'cart/initializeCheckout',
  async (customerData, { dispatch, getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      console.log('🛒 CART THUNKS - Initializing checkout for', cart.items.length, 'items');

      // First validate cart
      const validation = await dispatch(validateCart()).unwrap();
      
      if (!validation.valid) {
        errorToast('Please resolve cart issues before checkout');
        throw new Error('Cart validation failed. Please review your items.');
      }

      // Prepare checkout data
      const checkoutData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        items: cart.items.map(item => ({
          product_id: item.product.id,
          admin_id: item.product.admin_id,
          quantity: item.quantity,
          unit_price: item.product.customer_price,
          total_price: item.product.customer_price * item.quantity
        }))
      };

      // Initialize payment
      const response = await api.post('/payments/initialize', checkoutData);

      if (response.data.success) {
        console.log('✅ CART THUNKS - Checkout initialized successfully');
        return {
          order_id: response.data.data.order_id,
          payment_url: response.data.data.payment_url,
          reference: response.data.data.reference,
          amount: response.data.data.amount
        };
      } else {
        throw new Error(response.data.error || 'Checkout initialization failed');
      }
    } catch (error) {
      console.error('❌ CART THUNKS - Checkout initialization error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Checkout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get cart summary for display
export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (_, { getState }) => {
    const { cart } = getState();
    
    const summary = {
      itemCount: cart.itemCount,
      totalAmount: cart.total,
      items: cart.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.customer_price,
        total_price: item.product.customer_price * item.quantity,
        stock_available: item.product.stock_quantity,
        max_quantity: item.maxQuantity
      })),
      isValid: cart.isValid,
      validationErrors: cart.validationErrors,
      lastValidated: cart.lastValidated
    };

    console.log('📊 CART THUNKS - Cart summary generated:', summary.itemCount, 'items, ₦', summary.totalAmount);
    return summary;
  }
);

// Auto-validate cart periodically
export const autoValidateCart = createAsyncThunk(
  'cart/autoValidateCart',
  async (_, { dispatch, getState }) => {
    const { cart } = getState();
    
    // Only validate if cart has items and hasn't been validated recently
    if (cart.items.length > 0) {
      const lastValidated = cart.lastValidated ? new Date(cart.lastValidated) : null;
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (!lastValidated || lastValidated < fiveMinutesAgo) {
        console.log('🔄 CART THUNKS - Auto-validating cart');
        return await dispatch(validateCart()).unwrap();
      }
    }
    
    return { valid: true, skipped: true };
  }
);