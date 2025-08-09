import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { paymentsService } from '../services/payments.service';
import '../App.css';

function GuestCheckout({ onSuccess, onError }) {
  const { items, total } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postal_code: ''
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomerInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
        items: items.map(item => ({
          product_id: item.id,
          admin_id: item.admin_id,
          quantity: item.quantity,
          customer_price: item.customer_price,
          admin_price: item.admin_price
        }))
      };

      const response = await paymentsService.initializePayment(orderData);
      
      if (response.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.payment_url;
      } else {
        onError('Failed to initialize payment');
      }
    } catch (error) {
      onError(error.response?.data?.error || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  type="text"
                  required
                  value={customerInfo.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    value={customerInfo.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    type="text"
                    required
                    value={customerInfo.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  type="text"
                  value={customerInfo.address.postal_code}
                  onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || items.length === 0}
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.customer_price * item.quantity)}
                  </p>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GuestCheckout;

