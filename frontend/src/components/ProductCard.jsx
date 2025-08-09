import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import Product3DViewer from './Product3DViewer';
import '../App.css';

function ProductCard({ product, onViewDetails }) {
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    // Check if product is in stock
    if (product.stock_quantity <= 0) {
      alert('Sorry, this product is out of stock.');
      return;
    }
    
    console.log('🛒 PRODUCT CARD - Adding to cart:', product.name);
    dispatch(addToCart({ product, quantity: 1 }));
    
    // Show success message
    const event = new CustomEvent('product-added-to-cart', {
      detail: { product: product.name }
    });
    window.dispatchEvent(event);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  // Fallback: if customer_price is missing, compute from admin_price using base ₦5,000 + 7%
  const displayPrice = (() => {
    if (typeof product.customer_price === 'number' && !Number.isNaN(product.customer_price)) return product.customer_price;
    const admin = Number(product.admin_price) || 0;
    return admin + 5000 + Math.round(admin * 0.07);
  })();

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          {product.model_3d_url && !imageError ? (
            <Product3DViewer 
              modelUrl={product.model_3d_url} 
              className="w-full h-full"
            />
          ) : product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewDetails}
                className="bg-white hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className={`${product.stock_quantity <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                title={product.stock_quantity <= 0 ? 'Out of stock' : 'Add to cart'}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {product.admins?.business_name || 'Unknown Seller'}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl text-primary">
              {formatPrice(displayPrice)}
            </span>
            <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;

