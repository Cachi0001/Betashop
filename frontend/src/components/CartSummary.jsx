import { useSelector } from 'react-redux';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  Truck, 
  Calculator,
  Info
} from 'lucide-react';

function CartSummary({ showDetails = true }) {
  const { items, total, itemCount, isValid, validationErrors } = useSelector((state) => state.cart);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const totalItems = itemCount || items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = total || items.reduce((sum, item) => sum + (item.product.customer_price * item.quantity), 0);
  
  // Calculate potential savings or additional costs
  const shippingCost = 0; // Free shipping for now
  const taxAmount = 0; // No tax for now
  const finalTotal = totalPrice + shippingCost + taxAmount;

  if (items.length === 0) {
    return (
      <div className="text-center py-4">
        <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">No items in cart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Items Summary */}
      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calculator className="w-4 h-4" />
            <span>Order Summary</span>
          </div>
          
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between items-center text-sm">
              <div className="flex-1 min-w-0">
                <span className="text-white truncate block">
                  {item.product.name}
                </span>
                <span className="text-gray-400">
                  {item.quantity} × {formatPrice(item.product.customer_price)}
                </span>
              </div>
              <span className="text-white font-medium ml-2">
                {formatPrice(item.product.customer_price * item.quantity)}
              </span>
            </div>
          ))}
          
          <Separator className="bg-slate-700" />
        </div>
      )}

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span className="text-lg font-semibold text-white">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Truck className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Shipping</span>
          </div>
          <span className="text-sm text-green-400 font-medium">
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>

        {taxAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Tax</span>
            <span className="text-sm text-white">
              {formatPrice(taxAmount)}
            </span>
          </div>
        )}

        <Separator className="bg-slate-700" />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-white">
            {formatPrice(finalTotal)}
          </span>
        </div>

        {/* Validation Status */}
        {!isValid && validationErrors && validationErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <Info className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-400">
              <div className="font-medium mb-1">Cart Issues:</div>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-xs">
                    • {error.product_name ? `${error.product_name}: ${error.error}` : error.error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Valid Cart Indicator */}
        {isValid && items.length > 0 && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Cart is ready for checkout</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartSummary;