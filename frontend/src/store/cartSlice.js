import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return {
        items: parsedCart.items || [],
        total: parsedCart.total || 0,
        isOpen: false,
        itemCount: parsedCart.itemCount || 0,
        isValid: true,
        validationErrors: [],
        lastValidated: null
      };
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
  return {
    items: [],
    total: 0,
    isOpen: false,
    itemCount: 0,
    isValid: true,
    validationErrors: [],
    lastValidated: null
  };
};

// Save cart to localStorage
const saveCartToStorage = (cartState) => {
  try {
    const cartToSave = {
      items: cartState.items,
      total: cartState.total,
      itemCount: cartState.itemCount
    };
    localStorage.setItem('cart', JSON.stringify(cartToSave));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      
      // Check if product has sufficient stock
      if (product.stock_quantity < quantity) {
        console.warn('Insufficient stock for product:', product.name);
        return;
      }
      
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Check if new quantity exceeds stock
        if (newQuantity > product.stock_quantity) {
          existingItem.quantity = product.stock_quantity;
        } else {
          existingItem.quantity = newQuantity;
        }
        // Update product data in case stock changed
        existingItem.product = { ...existingItem.product, ...product };
      } else {
        state.items.push({
          product,
          quantity: Math.min(quantity, product.stock_quantity),
          maxQuantity: product.stock_quantity,
          addedAt: new Date().toISOString()
        });
      }
      
      // Recalculate totals
      state.total = state.items.reduce((sum, item) => 
        sum + (item.product.customer_price * item.quantity), 0
      );
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product.id !== productId);
      
      // Recalculate totals
      state.total = state.items.reduce((sum, item) => 
        sum + (item.product.customer_price * item.quantity), 0
      );
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
    
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item.product.id !== productId);
        } else {
          // Limit quantity to available stock
          item.quantity = Math.min(quantity, item.product.stock_quantity);
          item.maxQuantity = item.product.stock_quantity;
        }
      }
      
      // Recalculate totals
      state.total = state.items.reduce((sum, item) => 
        sum + (item.product.customer_price * item.quantity), 0
      );
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
    
    updateProductStock: (state, action) => {
      const { productId, newStock } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      
      if (item) {
        // Update product stock
        item.product.stock_quantity = newStock;
        item.maxQuantity = newStock;
        
        // Adjust quantity if it exceeds new stock
        if (item.quantity > newStock) {
          if (newStock === 0) {
            // Remove item if out of stock
            state.items = state.items.filter(item => item.product.id !== productId);
          } else {
            item.quantity = newStock;
          }
        }
        
        // Recalculate totals
        state.total = state.items.reduce((sum, item) => 
          sum + (item.product.customer_price * item.quantity), 0
        );
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
      state.isValid = action.payload.length === 0;
      state.lastValidated = new Date().toISOString();
    },
    
    clearValidationErrors: (state) => {
      state.validationErrors = [];
      state.isValid = true;
    },
    
    syncCartWithProducts: (state, action) => {
      const products = action.payload;
      let hasChanges = false;
      
      state.items = state.items.map(item => {
        const updatedProduct = products.find(p => p.id === item.product.id);
        if (updatedProduct) {
          const updatedItem = {
            ...item,
            product: updatedProduct,
            maxQuantity: updatedProduct.stock_quantity
          };
          
          // Adjust quantity if stock changed
          if (item.quantity > updatedProduct.stock_quantity) {
            updatedItem.quantity = updatedProduct.stock_quantity;
            hasChanges = true;
          }
          
          return updatedItem;
        }
        return item;
      }).filter(item => item.product.stock_quantity > 0); // Remove out of stock items
      
      if (hasChanges) {
        // Recalculate totals
        state.total = state.items.reduce((sum, item) => 
          sum + (item.product.customer_price * item.quantity), 0
        );
        state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Save to localStorage
        saveCartToStorage(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.validationErrors = [];
      state.isValid = true;
      
      // Clear from localStorage
      localStorage.removeItem('cart');
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    setCartOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    
    restoreCartFromStorage: (state) => {
      const savedCart = loadCartFromStorage();
      state.items = savedCart.items;
      state.total = savedCart.total;
      state.itemCount = savedCart.itemCount;
    }
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateProductStock,
  setValidationErrors,
  clearValidationErrors,
  syncCartWithProducts,
  clearCart,
  toggleCart,
  setCartOpen,
  restoreCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;
