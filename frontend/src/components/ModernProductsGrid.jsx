import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ArrowRight, Star, ShoppingCart, Eye, Sparkles, Heart, Zap } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { successToast, errorToast, infoToast } from '../utils/toast';

function ModernProductsGrid({ products, loading, error, onProductSelect, onRetry }) {
  const dispatch = useDispatch();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleLoadMore = () => {
    // Check if all products are loaded
    if (products && products.length > 0) {
      infoToast('All available products are already displayed!', 'No More Products');
    } else {
      infoToast('No products available at the moment', 'No Products');
    }
  };

  const renderStars = (rating = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const ProductSkeleton = () => (
    <Card className="group cursor-pointer border-0 bg-slate-800/60 backdrop-blur-sm shadow-lg border border-slate-700/50 overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 lg:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20 bg-slate-600" />
            <Skeleton className="h-4 w-8 bg-slate-600" />
          </div>
          <Skeleton className="h-6 w-3/4 bg-slate-600" />
          <Skeleton className="h-4 w-1/2 bg-slate-600" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 bg-slate-600" />
            <Skeleton className="h-5 w-16 bg-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section id="products-section" className="py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4 bg-slate-700" />
            <Skeleton className="h-6 w-96 mx-auto bg-slate-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products-section" className="py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Unable to load products</h3>
            <p className="text-gray-400 mb-8 text-lg">Please check your connection and try again</p>
            <Button
              onClick={() => {
                onRetry();
                // Show a loading toast when retrying
                setTimeout(() => {
                  successToast('Refreshing products...');
                }, 100);
              }}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section id="products-section" className="py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 text-lg">Check back later for new products</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products-section" className="py-12 lg:py-20 relative z-10">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="bg-slate-800/80 backdrop-blur-sm border-purple-400/50 text-purple-400 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Collection
            </Badge>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Discover Amazing Products
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Browse our curated collection of premium Nigerian products, carefully selected for quality and innovation
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className="group cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 border-0 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 overflow-hidden hover:-translate-y-2"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-500" />
                    </div>
                  )}

                  {/* Enhanced Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-500 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-slate-700 border-slate-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductSelect(product);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 transition-all duration-300 hover:scale-105 font-medium ${
                          product.stock_quantity > 0 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' 
                            : 'bg-gray-500 cursor-not-allowed opacity-60'
                        }`}
                        disabled={product.stock_quantity <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.stock_quantity <= 0) {
                            errorToast('This item is out of stock');
                            return;
                          }
                          try {
                            dispatch(addToCart({ product, quantity: 1 }));
                            successToast(`${product.name} added to cart!`);
                          } catch (error) {
                            errorToast('Failed to add item to cart');
                          }
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                      New
                    </Badge>
                    {index < 3 && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                        <Zap className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 w-8 h-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </Button>
                </div>

                {/* Enhanced Content */}
                <div className="p-4 lg:p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars()}
                    </div>
                    <span className="text-sm text-gray-400">(4.5)</span>
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400/50 bg-green-500/10">
                      Verified
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                    {product.admins?.business_name || 'Beta shop Seller'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-white">
                        {formatPrice(product.customer_price)}
                      </span>
                    </div>
                    <Badge 
                      variant={product.stock_quantity > 0 ? "default" : "destructive"}
                      className={product.stock_quantity > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                    >
                      {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            onClick={handleLoadMore}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-2xl px-8 py-6 h-auto text-lg transition-all duration-300 hover:scale-105 font-semibold"
          >
            Load More Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ModernProductsGrid;