import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeCheckout } from '../store/cartThunks';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import CartSummary from './CartSummary';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { successToast, errorToast, validationErrorToast } from '../utils/toast';

function CheckoutForm({ onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const { items, total, itemCount, isValid, validationErrors } = useSelector((state) => state.cart);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria'
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load saved customer data from localStorage
  useEffect(() => {
    const savedCustomerData = localStorage.getItem('customerData');
    if (savedCustomerData) {
      try {
        const parsed = JSON.parse(savedCustomerData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved customer data:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }
    
    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      validationErrorToast('Please fill in all required fields correctly');
      return;
    }
    
    if (!isValid) {
      errorToast('Please resolve cart issues before checkout');
      return;
    }
    
    if (items.length === 0) {
      errorToast('Your cart is empty');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      console.log('🛒 CHECKOUT FORM - Submitting checkout:', formData);
      
      // Save customer data for future use
      localStorage.setItem('customerData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      }));
      
      // Initialize checkout
      const result = await dispatch(initializeCheckout(formData)).unwrap();
      
      console.log('✅ CHECKOUT FORM - Checkout initialized:', result);
      
      successToast('Redirecting to payment...');
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Redirect to Paystack payment page
        setTimeout(() => {
          window.location.href = result.payment_url;
        }, 1000);
      }
    } catch (error) {
      console.error('❌ CHECKOUT FORM - Checkout failed:', error);
      errorToast(error.message || 'Checkout failed. Please try again.');
      setSubmitError(error.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-4">Add some products to proceed with checkout</p>
          <Button onClick={onCancel} variant="outline">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Checkout Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Checkout Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +2348012345678"
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h3>
              
              <div>
                <Label htmlFor="address.street">Street Address *</Label>
                <Input
                  id="address.street"
                  name="address.street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Enter your street address"
                  className={errors['address.street'] ? 'border-red-500' : ''}
                />
                {errors['address.street'] && (
                  <p className="text-sm text-red-500 mt-1">{errors['address.street']}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address.city">City *</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className={errors['address.city'] ? 'border-red-500' : ''}
                  />
                  {errors['address.city'] && (
                    <p className="text-sm text-red-500 mt-1">{errors['address.city']}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="address.state">State *</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    className={errors['address.state'] ? 'border-red-500' : ''}
                  />
                  {errors['address.state'] && (
                    <p className="text-sm text-red-500 mt-1">{errors['address.state']}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="address.country">Country</Label>
                <Input
                  id="address.country"
                  name="address.country"
                  type="text"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Nigeria"
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            {/* Error Display */}
            {submitError && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Cart Validation Errors */}
            {!isValid && validationErrors && validationErrors.length > 0 && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  <div className="font-medium mb-1">Cart Issues:</div>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">
                        • {error.product_name ? `${error.product_name}: ${error.error}` : error.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                disabled={isSubmitting || !isValid || items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <CartSummary showDetails={true} />
          
          <Separator className="my-4" />
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure payment with Paystack</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free delivery nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Direct communication with sellers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CheckoutForm;