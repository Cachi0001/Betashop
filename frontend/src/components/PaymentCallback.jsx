import { useState, useEffect } from 'react';

import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { API_BASE } from '../lib/apiBase';

 

function PaymentCallback() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [whatsappLinks, setWhatsappLinks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    const paymentReference = reference || trxref;
    
    if (paymentReference) {
      verifyPayment(paymentReference);
    } else {
      setStatus('failed');
      setError('No payment reference found');
    }
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      console.log('🔍 PAYMENT CALLBACK - Verifying payment:', reference);
      
      // Verify payment with backend
      const response = await fetch(`${API_BASE}/payments/verify/${reference}`);
      const data = await response.json();
      
      console.log('🔍 PAYMENT CALLBACK - Verification result:', data);
      
      if (data.success) {
        setStatus('success');
        setPaymentData(data.data);
        
        // Clear cart after successful payment
        dispatch(clearCart());
        
        // Generate WhatsApp links
        if (data.data.order?.id) {
          generateWhatsAppLinks(data.data.order.id);
        }
      } else {
        setStatus('failed');
        setError(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('❌ PAYMENT CALLBACK - Verification error:', error);
      setStatus('failed');
      setError('Failed to verify payment: ' + error.message);
    }
  };

  const generateWhatsAppLinks = async (orderId) => {
    try {
      console.log('📱 PAYMENT CALLBACK - Generating WhatsApp links for order:', orderId);
      
      const response = await fetch(`${API_BASE}/whatsapp/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success && data.data.whatsapp_links) {
        setWhatsappLinks(data.data.whatsapp_links);
        console.log('✅ PAYMENT CALLBACK - WhatsApp links generated:', data.data.whatsapp_links.length);
      } else {
        console.error('❌ PAYMENT CALLBACK - WhatsApp generation failed:', data.error);
      }
    } catch (error) {
      console.error('❌ PAYMENT CALLBACK - WhatsApp error:', error);
    }
  };

  const handleWhatsAppClick = (whatsappUrl) => {
    window.open(whatsappUrl, '_blank');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleContinueShopping} className="flex-1">
                Back to Shop
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Print Header - Only visible when printing */}
      <div className="print-header hidden print:block">
        <h1>Beta shop</h1>
        <p>Your Nigerian Marketplace</p>
      </div>
      
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Header */}
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been confirmed and payment processed successfully.
            </p>
            {paymentData?.order && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(paymentData.order.total_amount)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Communication */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Next Steps - Contact Sellers</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully. Now contact the sellers directly via WhatsApp to coordinate delivery.
            </p>
            
            {whatsappLinks.length > 0 ? (
              <div className="space-y-3">
                {whatsappLinks.map((link, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{link.admin_name}</h4>
                        <p className="text-sm text-gray-600">
                          {link.items?.length || 0} item{(link.items?.length || 0) !== 1 ? 's' : ''} • {link.whatsapp_number}
                        </p>
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
                  WhatsApp links are being generated. You can also contact the sellers using the information in your order confirmation.
                </p>
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
            onClick={() => {
              // Add print-specific styling and content
              const printContent = document.createElement('div');
              printContent.innerHTML = `
                <div class="print-header">
                  <h1>Beta shop</h1>
                  <p>Your Nigerian Marketplace - Payment Receipt</p>
                </div>
                <div style="margin: 20px 0;">
                  <h2>Payment Successful!</h2>
                  <p>Order Total: ${paymentData?.order ? formatPrice(paymentData.order.total_amount) : 'N/A'}</p>
                  <p>Date: ${new Date().toLocaleDateString()}</p>
                  <p>Thank you for shopping with Beta shop!</p>
                </div>
              `;
              
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Beta shop - Payment Receipt</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 20px; }
                      .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                      .print-header h1 { margin: 0; font-size: 24px; color: #000; }
                      .print-header p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
                    </style>
                  </head>
                  <body>
                    ${printContent.innerHTML}
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
              printWindow.close();
            }}
            className="flex-1"
            variant="outline"
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCallback;