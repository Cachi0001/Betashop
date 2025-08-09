import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

function CartItem({ item }) {
  const dispatch = useDispatch();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleRemoveItem = () => {
    dispatch(removeFromCart(item.product.id));
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId: item.product.id, quantity: newQuantity }));
    }
  };

  const maxQuantity = item.maxQuantity || item.product.stock_quantity;
  const isOutOfStock = maxQuantity === 0;
  const isLowStock = maxQuantity > 0 && maxQuantity <= 5;
  const exceedsStock = item.quantity > maxQuantity;

  return (
    <div className={`bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border ${
      exceedsStock ? 'border-red-500/50' : 'border-slate-700/50'
    }`}>
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
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
              <ShoppingCart className="w-6 h-6 text-gray-500" />
            </div>
          )}
          
          {/* Stock Status Indicator */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
              <span className="text-xs text-white font-semibold">OUT</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">
            {item.product.name}
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {item.product.admins?.business_name || 'Shop Naija Seller'}
          </p>
          
          {/* Stock Status */}
          <div className="flex items-center gap-2 mt-1">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                Only {maxQuantity} left
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                {maxQuantity} available
              </Badge>
            )}
            
            {exceedsStock && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs">Exceeds stock</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-white">
              {formatPrice(item.product.customer_price)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveItem}
              className="w-6 h-6 p-0 hover:bg-red-500/20 hover:text-red-400"
              title="Remove from cart"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
            title="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <div className="flex flex-col items-center">
            <span className={`w-8 text-center text-sm font-medium ${
              exceedsStock ? 'text-red-400' : 'text-white'
            }`}>
              {item.quantity}
            </span>
            {exceedsStock && (
              <span className="text-xs text-red-400">max: {maxQuantity}</span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= maxQuantity || isOutOfStock}
            className="w-7 h-7 p-0 bg-slate-700 border-slate-600 hover:bg-slate-600"
            title={
              isOutOfStock 
                ? 'Out of stock' 
                : item.quantity >= maxQuantity 
                  ? 'Maximum stock reached' 
                  : 'Increase quantity'
            }
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="text-right">
          <span className={`text-sm font-semibold ${exceedsStock ? 'text-red-400' : 'text-white'}`}>
            {formatPrice(item.product.customer_price * item.quantity)}
          </span>
          {exceedsStock && (
            <div className="text-xs text-red-400">
              Available: {formatPrice(item.product.customer_price * maxQuantity)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartItem;