import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle, 
  MessageCircle, 
  Package, 
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';

function PaymentSuccess({ paymentResult, orderData, onClose }) {
  const dispatch = useDispatch();
  const [whatsappLinks, setWhatsappLinks] = useState([]);
  const [isLoadingWhatsApp, setIsLoadingWhatsApp] = useState(false);

  useEffect(() => {
    // Clear cart after successful payment
    dispatch(clearCart());
    
    // Generate WhatsApp links if we have order data
    if (orderData?.order_id) {
      generateWhatsAppLinks(orderData.order_id);
    }
  }, [dispatch, orderData]);

  const generateWhatsAppLinks = async (orderId) => {
    try {
      setIsLoadingWhatsApp(true);
      console.log('📱 PAYMENT SUCCESS - Generating WhatsApp links for order:', orderId);
      
      const response = await fetch(`http://localhost:3000/api/whatsapp/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setWhatsappLinks(data.data.whatsapp_links || []);
        console.log('✅ PAYMENT SUCCESS - WhatsApp links generated:', data.data.whatsapp_links?.length || 0);
      } else {
        console.error('❌ PAYMENT SUCCESS - Failed to generate WhatsApp links:', data.error);
      }
    } catch (error) {
      console.error('❌ PAYMENT SUCCESS - WhatsApp link generation error:', error);
    } finally {
      setIsLoadingWhatsApp(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleWhatsAppClick = (whatsappUrl) => {
    window.open(whatsappUrl, '_blank');
  };

  const handleContinueShopping = () => {
    if (onClose) {
      onClose();
    }
    // Navigate to products page or close modal
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">
            Your order has been confirmed and payment processed successfully.
          </p>
          {paymentResult?.reference && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Reference: {paymentResult.reference}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      {orderData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <p className="font-medium">{orderData.order_id?.substring(0, 8) || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <p className="font-medium">{formatPrice(orderData.amount || paymentResult?.amount || 0)}</p>
              </div>
            </div>
            
            {orderData.customer_name && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {orderData.customer_name}</p>
                    {orderData.customer_email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {orderData.customer_email}
                      </p>
                    )}
                    {orderData.customer_phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {orderData.customer_phone}
                      </p>
                    )}
                    {orderData.customer_address && (
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <span>
                          {orderData.customer_address.street && `${orderData.customer_address.street}, `}
                          {orderData.customer_address.city}, {orderData.customer_address.state}, {orderData.customer_address.country}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Next Steps - Contact Sellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully. Now you can contact the sellers directly via WhatsApp to coordinate delivery and ask any questions about your order.
          </p>
          
          {isLoadingWhatsApp ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating WhatsApp links...</p>
            </div>
          ) : whatsappLinks.length > 0 ? (
            <div className="space-y-3">
              {whatsappLinks.map((link, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{link.admin_name}</h4>
                      <p className="text-sm text-gray-600">
                        {link.items.length} item{link.items.length !== 1 ? 's' : ''} • {link.whatsapp_number}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {link.items.map((item, idx) => (
                          <span key={idx}>
                            {item.product_name} (×{item.quantity})
                            {idx < link.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleWhatsAppClick(link.whatsapp_url)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat on WhatsApp
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                WhatsApp links will be available shortly. You can also contact the sellers using the information provided in your order confirmation email.
              </p>
              <Button
                onClick={() => orderData?.order_id && generateWhatsAppLinks(orderData.order_id)}
                variant="outline"
                size="sm"
              >
                Retry WhatsApp Links
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleContinueShopping}
          className="flex-1"
          variant="outline"
        >
          Continue Shopping
        </Button>
        <Button
          onClick={() => window.print()}
          className="flex-1"
          variant="outline"
        >
          Print Receipt
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">Important Notes:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your order confirmation has been sent to your email address</li>
              <li>Please contact the sellers via WhatsApp to arrange delivery</li>
              <li>Keep your order reference number for future communication</li>
              <li>Delivery time and method will be coordinated directly with each seller</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccess;