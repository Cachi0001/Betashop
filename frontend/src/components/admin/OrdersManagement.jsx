import { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Package, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  Eye,
  MessageCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { successToast, errorToast, warningToast } from '../../utils/toast';
import { API_BASE } from '../../lib/apiBase';

 

function OrdersManagement() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      console.log('📋 ORDERS MANAGEMENT - Fetching orders...');
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📋 ORDERS MANAGEMENT - API response:', data);

      if (data.success) {
        setOrders(data.data.orders || []);
        setError(null);
        console.log('✅ ORDERS MANAGEMENT - Orders loaded:', data.data.orders?.length || 0);
      } else {
        setError(data.error || 'Failed to fetch orders');
        console.error('❌ ORDERS MANAGEMENT - API error:', data.error);
      }
    } catch (error) {
      console.error('❌ ORDERS MANAGEMENT - Fetch error:', error);
      setError(error.message || 'Failed to fetch orders');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactCustomer = async (order) => {
    try {
      console.log('📱 ORDERS MANAGEMENT - Generating WhatsApp link for order:', order.id);
      
      // Clean phone number (remove all non-digits and ensure it starts with country code)
      let phoneNumber = order.customer_phone.replace(/[^0-9]/g, '');
      
      // If phone starts with 0, replace with 234 (Nigeria)
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '234' + phoneNumber.substring(1);
      }
      // If phone doesn't start with country code, add 234
      else if (!phoneNumber.startsWith('234')) {
        phoneNumber = '234' + phoneNumber;
      }
      
      const message = `Hi ${order.customer_name}! Thank you for your order #${order.order_number || order.id.substring(0, 8)}. 

Order Details:
- Total: ${formatPrice(order.total_amount)}
- Status: ${order.order_status}
- Payment: ${order.payment_status}

We'll process your order shortly. Please let us know if you have any questions!`;
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      console.log('📱 Opening WhatsApp URL:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      
      successToast('WhatsApp opened successfully!');
      
    } catch (error) {
      console.error('❌ ORDERS MANAGEMENT - WhatsApp link generation failed:', error);
      errorToast('Failed to open WhatsApp. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading orders...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Order Details Modal Component
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              Order Details - #{order.order_number || order.id.substring(0, 8)}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badges */}
            <div className="flex gap-2">
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                Payment: {order.payment_status}
              </Badge>
              <Badge className={getStatusColor(order.order_status)}>
                Order: {order.order_status}
              </Badge>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm">{order.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{order.customer_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm">{order.customer_phone}</p>
                  </div>
                  {order.customer_address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm">
                        {order.customer_address.street && `${order.customer_address.street}, `}
                        {order.customer_address.city}, {order.customer_address.state}, {order.customer_address.country}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order Total</label>
                    <p className="text-lg font-bold">{formatPrice(order.total_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Reference</label>
                    <p className="text-sm font-mono">{order.payment_reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order Date</label>
                    <p className="text-sm">{formatDate(order.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.order_items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.order_items && order.order_items.length > 0 ? (
                  <div className="space-y-3">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.name || 'Product'}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No items found</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleContactCustomer(order)}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Orders will appear here when customers make purchases.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_number || order.id.substring(0, 8)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Details
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {order.customer_name}</p>
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {order.customer_email}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.customer_phone}
                      </p>
                      {order.customer_address && (
                        <p className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5" />
                          <span>
                            {order.customer_address.street && `${order.customer_address.street}, `}
                            {order.customer_address.city}, {order.customer_address.state}, {order.customer_address.country}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Order Details
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Total:</strong> {formatPrice(order.total_amount)}</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </p>
                      <p><strong>Reference:</strong> {order.payment_reference}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Items Ordered</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.products?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.total_price)}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.unit_price)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleContactCustomer(order)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Customer
                  </Button>
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}

export default OrdersManagement;