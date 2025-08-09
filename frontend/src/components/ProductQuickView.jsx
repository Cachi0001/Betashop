import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  X
} from 'lucide-react';
import ProductViewer from './Product3DViewer';
import { successToast, errorToast } from '../utils/toast';

function ProductQuickView({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      dispatch(addToCart({ product, quantity }));
      successToast(`${quantity} ${product.name} added to cart!`);
      
      // Close modal after success
      setTimeout(() => {
        setIsAddingToCart(false);
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      errorToast('Failed to add item to cart');
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Product Quick View</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Left Side - Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
              {product.model_url ? (
                <ProductViewer 
                  modelUrl={product.model_url} 
                  className="w-full h-full"
                />
              ) : product.images && product.images.length > 0 ? (
                <img
                  src={typeof product.images[selectedImageIndex] === 'string' 
                    ? product.images[selectedImageIndex] 
                    : product.images[selectedImageIndex]?.url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  style={{ width: '100%', height: '400px' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p>No image available</p>
                  </div>
                </div>
              )}
              
              {/* Gallery Badge */}
              {product.model_url && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Gallery View
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-purple-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={typeof image === 'string' ? image : image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{ width: '64px', height: '64px' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {renderStars()}
                </div>
                <span className="text-sm text-gray-600">(4.5)</span>
                <Badge variant="outline" className="ml-auto">
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
              
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.customer_price)}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Sold by: {product.admins?.business_name || 'Unknown Seller'}
              </p>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                    className="w-10 h-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm text-gray-500 ml-2">
                    {product.stock_quantity} available
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || isAddingToCart}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg h-12 font-semibold"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - {formatPrice(product.customer_price * quantity)}
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-green-600" />
                <span>Free delivery on orders over ₦50,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                  <div className="space-y-2">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductQuickView;