import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { toggleCart, clearCart, removeFromCart, updateQuantity } from '../store/cartSlice';
import { validateCart } from '../store/cartThunks';
import CheckoutModal from './CheckoutModal';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ShoppingCart, 
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Minus,
  X
} from 'lucide-react';

// Clean Cart Item Component
function CartItemCard({ item }) {
  const dispatch = useDispatch();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleRemoveItem = () => {
    console.log('🗑️ Removing item:', item.product.name);
    dispatch(removeFromCart(item.product.id));
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem();
    } else {
      console.log('📝 Updating quantity:', item.product.name, 'to', newQuantity);
      dispatch(updateQuantity({ productId: item.product.id, quantity: newQuantity }));
    }
  };

  const maxQuantity = item.maxQuantity || item.product.stock_quantity;
  const isOutOfStock = maxQuantity === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.product.images && item.product.images.length > 0 ? (
            <img
              src={typeof item.product.images[0] === 'string' 
                ? item.product.images[0] 
                : item.product.images[0].url}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.product.name}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            {item.product.admins?.business_name || 'Shop'}
          </p>
          
          {/* Stock Status */}
          <div className="mt-1">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            ) : maxQuantity <= 5 ? (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Only {maxQuantity} left
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                In Stock
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(item.product.customer_price)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveItem}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Remove item"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="h-8 w-8 p-0 border-gray-300"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= maxQuantity || isOutOfStock}
            className="h-8 w-8 p-0 border-gray-300"
            title={isOutOfStock ? 'Out of stock' : item.quantity >= maxQuantity ? 'Maximum stock reached' : 'Increase quantity'}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <span className="text-sm font-semibold text-gray-900">
          {formatPrice(item.product.customer_price * item.quantity)}
        </span>
      </div>
    </div>
  );
}

function CartDrawer({ onCheckout }) {
  const dispatch = useDispatch();
  const { items, isOpen, total, itemCount, isValid, validationErrors } = useSelector((state) => state.cart);
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleClose = () => {
    dispatch(toggleCart());
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Validate cart when it opens or items change
  useEffect(() => {
    if (isOpen && items.length > 0) {
      handleValidateCart();
    }
  }, [isOpen, items.length]);

  const handleValidateCart = async () => {
    if (items.length === 0) return;
    
    setIsValidating(true);
    try {
      await dispatch(validateCart()).unwrap();
      console.log('✅ CART DRAWER - Cart validation successful');
    } catch (error) {
      console.error('❌ CART DRAWER - Cart validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = () => {
    if (!isValid) {
      alert('Please resolve cart issues before checkout');
      return;
    }
    
    if (onCheckout) {
      onCheckout();
    } else {
      // Open checkout modal
      console.log('🛒 CART DRAWER - Opening checkout modal');
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCheckoutModalClose = () => {
    setIsCheckoutModalOpen(false);
  };

  const totalItems = itemCount || items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = total || items.reduce((sum, item) => sum + (item.product.customer_price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md bg-white border-l border-gray-200 shadow-xl">
        <SheetHeader className="text-left pb-6">
          <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge className="bg-blue-600 text-white">
                {totalItems}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to get started</p>
                <Button
                  onClick={handleClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {items.map((item) => (
                  <CartItemCard key={item.product.id} item={item} />
                ))}
              </div>

              <Separator className="my-4" />

              {/* Validation Errors */}
              {validationErrors && validationErrors.length > 0 && (
                <Alert className="bg-red-50 border-red-200 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-sm">
                          {error.product_name ? `${error.product_name}: ${error.error}` : error.error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Cart Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-semibold">₦{total?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <span className="text-sm text-green-600 font-medium">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-gray-900">₦{total?.toLocaleString() || '0'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold rounded-lg"
                  disabled={items.length === 0 || !isValid || isValidating}
                >
                  {isValidating ? 'Validating...' : !isValid ? 'Resolve Issues to Checkout' : 'Proceed to Checkout'}
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="border-red-300 text-red-600 hover:bg-red-50 px-4"
                    disabled={items.length === 0}
                    title="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCheckoutModalClose}
      />
    </Sheet>
  );
}

export default CartDrawer;