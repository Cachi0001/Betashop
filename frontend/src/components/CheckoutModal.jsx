import { useState } from 'react';
import { useSelector } from 'react-redux';
import CheckoutForm from './CheckoutForm';
import PaymentSuccess from './PaymentSuccess';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';

function CheckoutModal({ isOpen, onClose }) {
  const { items } = useSelector((state) => state.cart);
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form', 'processing', 'success', 'error'
  const [paymentResult, setPaymentResult] = useState(null);

  const handleCheckoutSuccess = (result) => {
    console.log('🎉 CHECKOUT MODAL - Payment initialized:', result);
    setPaymentResult(result);
    setCheckoutStep('processing');
    
    // Redirect to Paystack payment page
    if (result.payment_url) {
      window.location.href = result.payment_url;
    }
  };

  const handleClose = () => {
    setCheckoutStep('form');
    setPaymentResult(null);
    onClose();
  };

  const renderContent = () => {
    switch (checkoutStep) {
      case 'form':
        return (
          <CheckoutForm
            onSuccess={handleCheckoutSuccess}
            onCancel={handleClose}
          />
        );
      
      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Redirecting to Payment</h3>
            <p className="text-gray-600 mb-4">
              You will be redirected to Paystack to complete your payment securely.
            </p>
            <p className="text-sm text-gray-500">
              If you're not redirected automatically, please check your popup blocker.
            </p>
          </div>
        );
      
      case 'success':
        return (
          <PaymentSuccess
            paymentResult={paymentResult}
            onClose={handleClose}
          />
        );
      
      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setCheckoutStep('form')}>
                Try Again
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {checkoutStep === 'form' && 'Checkout'}
            {checkoutStep === 'processing' && 'Processing Payment'}
            {checkoutStep === 'success' && 'Payment Successful'}
            {checkoutStep === 'error' && 'Payment Failed'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckoutModal;