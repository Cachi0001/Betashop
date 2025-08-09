import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
  ArrowRight, 
  Star, 
  ShoppingCart, 
  Eye, 
  ChevronDown,
  Sparkles,
  Play
} from 'lucide-react';
import { addToCart } from '../store/cartSlice';

function CinematicHero({ products, loading, onProductSelect }) {
  const dispatch = useDispatch();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Quality product data with high-resolution images
  const qualityProducts = [
    {
      id: 'hero-1',
      name: 'Premium Air Jordan Retro',
      description: 'Experience the legendary comfort and style of authentic Air Jordan sneakers. Premium leather construction with iconic design.',
      customer_price: 89500,
      images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      admins: { business_name: 'Elite Sneaker Store' }
    },
    {
      id: 'hero-2', 
      name: 'Designer Denim Jacket',
      description: 'Crafted from premium denim with contemporary styling. Perfect for layering and making a fashion statement.',
      customer_price: 45750,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      admins: { business_name: 'Fashion Forward' }
    },
    {
      id: 'hero-3',
      name: 'Classic White Sneakers',
      description: 'Timeless white leather sneakers that complement any outfit. Comfortable, durable, and effortlessly stylish.',
      customer_price: 67200,
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      admins: { business_name: 'Urban Kicks' }
    },
    {
      id: 'hero-4',
      name: 'Luxury Hoodie',
      description: 'Premium cotton blend hoodie with modern fit. Soft, comfortable, and perfect for casual luxury styling.',
      customer_price: 38900,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      admins: { business_name: 'Comfort Couture' }
    },
    {
      id: 'hero-5',
      name: 'Running Performance Shoes',
      description: 'Advanced athletic footwear designed for peak performance. Lightweight, breathable, and engineered for comfort.',
      customer_price: 72800,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      admins: { business_name: 'Athletic Pro' }
    }
  ];

  useEffect(() => {
    // Use quality products instead of props, select 3 random ones
    const shuffled = [...qualityProducts].sort(() => 0.5 - Math.random());
    setFeaturedProducts(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const renderStars = (rating = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show loading skeleton only if we don't have featured products yet
  if (loading && !featuredProducts.length) {
    return (
      <section className="relative min-h-screen flex items-center justify-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-8 w-32 bg-slate-700" />
              <Skeleton className="h-16 w-full bg-slate-700" />
              <Skeleton className="h-6 w-3/4 bg-slate-700" />
              <Skeleton className="h-12 w-48 bg-slate-700" />
            </div>
            <Skeleton className="aspect-square w-full bg-slate-700 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProducts.length) return null;

  const currentProduct = featuredProducts[currentIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-slate-800/80 backdrop-blur-sm border-purple-400/50 text-purple-400">
                <Sparkles className="w-4 h-4 mr-2" />
                Featured Product
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {currentProduct.name}
                </span>
              </h1>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars()}
                </div>
                <span className="text-gray-400">(4.5)</span>
              </div>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                {currentProduct.description || 'Premium quality product from our verified Nigerian sellers.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-baseline gap-4 justify-center lg:justify-start">
                <span className="text-4xl font-bold text-white">
                  {formatPrice(currentProduct.customer_price)}
                </span>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  In Stock
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl"
                  onClick={() => dispatch(addToCart({ product: currentProduct, quantity: 1 }))}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                  onClick={() => onProductSelect(currentProduct)}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Quick View
                </Button>
              </div>
            </div>

            {/* Product Indicators */}
            <div className="flex gap-2 justify-center lg:justify-start">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-purple-400 w-8' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Product Showcase */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Product Card */}
              <Card className="h-full bg-slate-800/80 backdrop-blur-lg border border-slate-700 shadow-2xl overflow-hidden">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full">
                    {currentProduct.images && currentProduct.images.length > 0 ? (
                      <img
                        src={typeof currentProduct.images[0] === 'string' 
                          ? currentProduct.images[0] 
                          : currentProduct.images[0].url}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <ShoppingCart className="w-24 h-24 text-gray-500" />
                      </div>
                    )}
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                        New
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white text-sm font-medium">
                          {currentProduct.admins?.business_name || 'Shop Naija Seller'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse delay-1000" />
            </div>

            {/* Side Products Preview */}
            <div className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 flex-col gap-4">
              {featuredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex 
                      ? 'border-purple-400 scale-110' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={typeof product.images[0] === 'string' 
                        ? product.images[0] 
                        : product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ width: '64px', height: '64px' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToProducts}
          className="text-gray-400 hover:text-white flex flex-col items-center gap-2 animate-bounce"
        >
          <span className="text-sm">Explore More</span>
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}

export default CinematicHero;