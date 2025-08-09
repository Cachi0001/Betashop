import { toast } from '../hooks/use-toast';

export const showToast = {
  success: (title, description) => {
    console.log('🍞 TOAST - Showing success toast:', title, description);
    toast({
      title,
      variant: "success",
      duration: 2000,
    });
  },
  
  error: (title, description) => {
    console.log('🍞 TOAST - Showing error toast:', title, description);
    // Make error messages user-friendly
    let friendlyMessage = title;
    if (typeof title === 'string') {
      if (title.includes('duplicate key value violates unique constraint') || title.includes('products_slug_key')) {
        friendlyMessage = 'A product with this name already exists. Please use a different name.';
      } else if (title.includes('Failed to create product:')) {
        friendlyMessage = title.replace('Failed to create product: ', '').replace('Failed to create product:', '');
        if (friendlyMessage.includes('duplicate key value violates unique constraint')) {
          friendlyMessage = 'A product with this name already exists. Please use a different name.';
        }
      }
    }
    
    toast({
      title: friendlyMessage,
      variant: "destructive",
      duration: 3000,
    });
  },
  
  warning: (title, description) => {
    toast({
      title,
      description,
      variant: "warning",
      duration: 2000,
    });
  },
  
  info: (title, description) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 2000,
    });
  }
};

// Quick toast functions with better messaging
export const successToast = (message, title = "Success") => {
  return showToast.success(title, message);
};

export const errorToast = (message, title = "Error") => {
  return showToast.error(title, message);
};

export const warningToast = (message, title = "Warning") => {
  return showToast.warning(title, message);
};

export const infoToast = (message, title = "Info") => {
  return showToast.info(title, message);
};

// Specialized toast functions for common scenarios
export const authErrorToast = (message = "Authentication failed. Please log in again.") => {
  return showToast.error("Authentication Error", message);
};

export const networkErrorToast = (message = "Network error. Please check your connection and try again.") => {
  return showToast.error("Connection Error", message);
};

export const validationErrorToast = (message = "Please check your input and try again.") => {
  return showToast.error("Validation Error", message);
};

export const loadingToast = (message = "Loading...") => {
  return showToast.info("Please Wait", message);
};

export const productToast = {
  created: () => successToast("Product created successfully!"),
  updated: () => successToast("Product updated successfully!"),
  deleted: () => successToast("Product deleted successfully!"),
  createError: (error) => errorToast(`Failed to create product: ${error}`),
  updateError: (error) => errorToast(`Failed to update product: ${error}`),
  deleteError: (error) => errorToast(`Failed to delete product: ${error}`),
  uploadError: (error) => errorToast(`Image upload failed: ${error}`),
  uploadSuccess: (count) => successToast(`${count} image${count > 1 ? 's' : ''} uploaded successfully!`),
};

export const orderToast = {
  created: () => successToast("Order placed successfully!"),
  updated: () => successToast("Order updated successfully!"),
  cancelled: () => successToast("Order cancelled successfully!"),
  error: (error) => errorToast(`Order error: ${error}`),
};

export const paymentToast = {
  success: () => successToast("Payment completed successfully!"),
  failed: () => errorToast("Payment failed. Please try again."),
  pending: () => infoToast("Payment is being processed..."),
  cancelled: () => warningToast("Payment was cancelled."),
};

export const authToast = {
  loginSuccess: () => successToast("Welcome back! Login successful."),
  loginError: (error) => errorToast(`Login failed: ${error}`),
  logoutSuccess: () => successToast("Logged out successfully."),
  registerSuccess: () => successToast("Admin account created successfully! Redirecting to dashboard..."),
  registerError: (error) => errorToast(`Registration failed: ${error}`),
  sessionExpired: () => authErrorToast("Your session has expired. Please log in again."),
};