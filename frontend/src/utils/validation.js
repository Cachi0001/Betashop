export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
  if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
    errors.phone = 'Phone number is invalid';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.address.trim()) errors.address = 'Address is required';
  if (!formData.city.trim()) errors.city = 'City is required';
  if (!formData.state.trim()) errors.state = 'State is required';
  if (!formData.accountName.trim()) errors.accountName = 'Account name is required';
  
  if (!formData.accountNumber.trim()) {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d{10}$/.test(formData.accountNumber)) {
    errors.accountNumber = 'Account number must be 10 digits';
  }

  if (!formData.bankName) errors.bankName = 'Please select a bank';

  return errors;
};

export const validateProductForm = (productData) => {
  const errors = {};
  
  if (!productData.name?.trim()) errors.name = 'Product name is required';
  if (!productData.description?.trim()) errors.description = 'Description is required';
  if (!productData.category_id) errors.category_id = 'Category is required';
  if (!productData.admin_price || productData.admin_price <= 0) errors.admin_price = 'Valid price is required';
  if (productData.stock_quantity < 0) errors.stock_quantity = 'Stock quantity cannot be negative';

  return errors;
};

export const validateCheckoutForm = (checkoutData) => {
  const errors = {};
  
  if (!checkoutData.customer_name?.trim()) errors.customer_name = 'Name is required';
  if (!checkoutData.customer_email?.trim()) errors.customer_email = 'Email is required';
  if (!checkoutData.customer_phone?.trim()) errors.customer_phone = 'Phone is required';
  if (!checkoutData.shipping_address?.street?.trim()) errors.street = 'Address is required';
  if (!checkoutData.shipping_address?.city?.trim()) errors.city = 'City is required';
  if (!checkoutData.shipping_address?.state?.trim()) errors.state = 'State is required';

  return errors;
};