import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { 
  Star, 
  ShoppingCart, 
  ChevronDown,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';

function CinematicHeroSection({ products, loading }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Hero background image
  const heroBackgroundUrl = "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBncmFkaWVudCUyMGRpZ2l0YWx8ZW58MHwwfHxwdXJwbGV8MTc1NDU2MTA5OHww&ixlib=rb-4.1.0&q=85";

  // Quality shoe/sneaker and clothing products with random prices (20 products)
  const qualityProducts = [
    {
      id: 'hero-1',
      name: 'Premium Air Jordan Retro',
      description: 'Experience the legendary comfort and style of authentic Air Jordan sneakers. Premium leather construction with iconic design.',
      customer_price: 89500 + Math.floor(Math.random() * 20000),
      images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.8,
      admins: { business_name: 'Elite Sneaker Store' }
    },
    {
      id: 'hero-2', 
      name: 'Designer Denim Jacket',
      description: 'Crafted from premium denim with contemporary styling. Perfect for layering and making a fashion statement.',
      customer_price: 45750 + Math.floor(Math.random() * 15000),
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.7,
      admins: { business_name: 'Fashion Forward' }
    },
    {
      id: 'hero-3',
      name: 'Classic White Sneakers',
      description: 'Timeless white leather sneakers that complement any outfit. Comfortable, durable, and effortlessly stylish.',
      customer_price: 67200 + Math.floor(Math.random() * 18000),
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.9,
      admins: { business_name: 'Urban Kicks' }
    },
    {
      id: 'hero-4',
      name: 'Luxury Hoodie',
      description: 'Premium cotton blend hoodie with modern fit. Soft, comfortable, and perfect for casual luxury styling.',
      customer_price: 38900 + Math.floor(Math.random() * 12000),
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.6,
      admins: { business_name: 'Comfort Couture' }
    },
    {
      id: 'hero-5',
      name: 'Running Performance Shoes',
      description: 'Advanced athletic footwear designed for peak performance. Lightweight, breathable, and engineered for comfort.',
      customer_price: 72800 + Math.floor(Math.random() * 22000),
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.8,
      admins: { business_name: 'Athletic Pro' }
    },
    {
      id: 'hero-6',
      name: 'Vintage Leather Jacket',
      description: 'Authentic vintage-style leather jacket with premium craftsmanship. A timeless piece that adds edge to any wardrobe.',
      customer_price: 95600 + Math.floor(Math.random() * 25000),
      images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.9,
      admins: { business_name: 'Vintage Vibes' }
    },
    {
      id: 'hero-7',
      name: 'High-Top Basketball Shoes',
      description: 'Professional basketball shoes with superior ankle support and court-ready performance technology.',
      customer_price: 78900 + Math.floor(Math.random() * 19000),
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.7,
      admins: { business_name: 'Court Kings' }
    },
    {
      id: 'hero-8',
      name: 'Casual Cotton T-Shirt',
      description: 'Premium organic cotton t-shirt with perfect fit and breathable fabric for everyday comfort.',
      customer_price: 15900 + Math.floor(Math.random() * 8000),
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.5,
      admins: { business_name: 'Essential Wear' }
    },
    {
      id: 'hero-9',
      name: 'Slip-On Canvas Shoes',
      description: 'Comfortable canvas slip-on shoes perfect for casual outings and relaxed styling.',
      customer_price: 32400 + Math.floor(Math.random() * 12000),
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.4,
      admins: { business_name: 'Casual Steps' }
    },
    {
      id: 'hero-10',
      name: 'Wool Blend Sweater',
      description: 'Cozy wool blend sweater with classic design, perfect for cooler weather and sophisticated looks.',
      customer_price: 52800 + Math.floor(Math.random() * 16000),
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.8,
      admins: { business_name: 'Cozy Threads' }
    },
    {
      id: 'hero-11',
      name: 'Trail Running Shoes',
      description: 'Rugged trail running shoes with advanced grip technology and weather-resistant materials.',
      customer_price: 84600 + Math.floor(Math.random() * 21000),
      images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.9,
      admins: { business_name: 'Trail Masters' }
    },
    {
      id: 'hero-12',
      name: 'Formal Dress Shirt',
      description: 'Crisp formal dress shirt with premium cotton fabric and tailored fit for professional occasions.',
      customer_price: 28700 + Math.floor(Math.random() * 11000),
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.6,
      admins: { business_name: 'Professional Attire' }
    },
    {
      id: 'hero-13',
      name: 'Retro Skateboard Shoes',
      description: 'Classic skateboard shoes with durable construction and iconic street style design.',
      customer_price: 41200 + Math.floor(Math.random() * 14000),
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.5,
      admins: { business_name: 'Skate Culture' }
    },
    {
      id: 'hero-14',
      name: 'Bomber Jacket',
      description: 'Stylish bomber jacket with modern cut and premium materials, perfect for urban fashion.',
      customer_price: 67300 + Math.floor(Math.random() * 18000),
      images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.7,
      admins: { business_name: 'Urban Style' }
    },
    {
      id: 'hero-15',
      name: 'Minimalist Sneakers',
      description: 'Clean minimalist sneakers with premium leather and understated elegance for versatile styling.',
      customer_price: 59800 + Math.floor(Math.random() * 17000),
      images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.8,
      admins: { business_name: 'Minimal Kicks' }
    },
    {
      id: 'hero-16',
      name: 'Cargo Pants',
      description: 'Functional cargo pants with multiple pockets and durable fabric for utility and style.',
      customer_price: 43500 + Math.floor(Math.random() * 15000),
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.4,
      admins: { business_name: 'Utility Wear' }
    },
    {
      id: 'hero-17',
      name: 'Cross-Training Shoes',
      description: 'Versatile cross-training shoes designed for multiple workout activities with superior support.',
      customer_price: 76400 + Math.floor(Math.random() * 20000),
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&crop=center'],
      category: 'Sneakers',
      rating: 4.6,
      admins: { business_name: 'Fitness Gear' }
    },
    {
      id: 'hero-18',
      name: 'Flannel Shirt',
      description: 'Comfortable flannel shirt with classic plaid pattern, perfect for casual and layered looks.',
      customer_price: 34800 + Math.floor(Math.random() * 13000),
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.5,
      admins: { business_name: 'Casual Classics' }
    },
    {
      id: 'hero-19',
      name: 'Designer Loafers',
      description: 'Elegant leather loafers with sophisticated design, perfect for business casual and formal wear.',
      customer_price: 89200 + Math.floor(Math.random() * 23000),
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop&crop=center'],
      category: 'Shoes',
      rating: 4.9,
      admins: { business_name: 'Luxury Footwear' }
    },
    {
      id: 'hero-20',
      name: 'Track Suit Set',
      description: 'Complete track suit set with matching jacket and pants, combining comfort with athletic style.',
      customer_price: 58600 + Math.floor(Math.random() * 17000),
      images: ['https://images.unsplash.com/photo-1506629905607-d405b7a30db5?w=800&h=800&fit=crop&crop=center'],
      category: 'Clothing',
      rating: 4.7,
      admins: { business_name: 'Athletic Wear' }
    }
  ];

  useEffect(() => {
    // Use quality products instead of props, select 10 random ones for more variety
    const shuffled = [...qualityProducts].sort(() => 0.5 - Math.random());
    setFeaturedProducts(shuffled.slice(0, 10));
  }, []);

  useEffect(() => {
    if (featuredProducts.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length, isAutoPlaying]);

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
      <section className="relative min-h-screen flex items-center justify-center z-10 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900/50 to-pink-900/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-8 w-32 bg-slate-700/50" />
              <Skeleton className="h-16 w-full bg-slate-700/50" />
              <Skeleton className="h-6 w-3/4 bg-slate-700/50" />
              <Skeleton className="h-12 w-48 bg-slate-700/50" />
            </div>
            <Skeleton className="aspect-square w-full bg-slate-700/50 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProducts.length) return null;

  const currentProduct = featuredProducts[currentIndex];

  return (
    <section className="relative min-h-screen flex items-center justify-center z-10 overflow-hidden pt-16">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroBackgroundUrl}
          alt="Abstract gradient technology background by Milad Fakurian on Unsplash"
          className="w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-slate-900/40 to-pink-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
      </div>

      {/* Floating Decorative Elements - Responsive positioning */}
      <div className="absolute top-20 sm:top-20 right-4 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-32 sm:bottom-32 left-4 sm:left-16 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/3 sm:top-1/2 left-1/6 sm:left-1/4 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-xl animate-pulse delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Mobile Layout - Integrated Design */}
        <div className="lg:hidden flex flex-col items-center justify-center min-h-screen py-12">
          {/* Integrated Product Card with Overlay Content */}
          <div className="relative w-full max-w-sm mx-auto">
            <Card className="bg-slate-800/60 backdrop-blur-xl border border-purple-500/20 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square">
                  {currentProduct.images && currentProduct.images.length > 0 ? (
                    <img
                      src={typeof currentProduct.images[0] === 'string' 
                        ? currentProduct.images[0] 
                        : currentProduct.images[0].url}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <ShoppingCart className="w-24 h-24 text-gray-500" />
                    </div>
                  )}
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-slate-800/80 backdrop-blur-sm border-purple-400/50 text-purple-400 px-2 py-1 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium Collection
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg text-xs">
                      New
                    </Badge>
                  </div>
                  
                  {/* Bottom Seller Info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
                      <p className="text-white text-sm font-medium">
                        {currentProduct.admins?.business_name || 'Shop Naija Seller'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs">Verified Seller</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section - Directly attached to image */}
                <div className="p-4 space-y-3 bg-gradient-to-b from-slate-800/90 to-slate-900/95 backdrop-blur-sm">
                  {/* Title and Rating */}
                  <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-white leading-tight">
                      <span className="block text-xs font-normal text-gray-400 mb-1">Discover</span>
                      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {currentProduct.name}
                      </span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center">
                        {renderStars()}
                      </div>
                      <span className="text-gray-400 text-xs">(4.8)</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Best Seller
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-300 leading-relaxed text-center">
                    {currentProduct.description?.substring(0, 100) + '...' || 'Premium quality product from verified sellers.'}
                  </p>

                  {/* Price and Status */}
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(currentProduct.customer_price)}
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-500/10 text-xs px-2 py-1">
                        <Zap className="w-3 h-3 mr-1" />
                        In Stock
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400/50 bg-blue-500/10 text-xs px-2 py-1">
                        Fast Delivery
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-xs">Free shipping included</div>
                  </div>

                  {/* Product Indicators */}
                  <div className="flex gap-2 justify-center pt-2">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsAutoPlaying(false);
                          setTimeout(() => setIsAutoPlaying(true), 10000);
                        }}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === currentIndex 
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-8' 
                            : 'bg-gray-600 hover:bg-gray-500 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Layout - Two Columns */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-screen py-0">
          {/* Left Content */}
          <div className="space-y-8 text-left">
            <div className="flex justify-start">
              <Badge variant="outline" className="bg-slate-800/80 backdrop-blur-sm border-purple-400/50 text-purple-400 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Collection
              </Badge>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl xl:text-7xl font-bold text-white leading-tight">
                <span className="block text-2xl xl:text-3xl font-normal text-gray-300 mb-2">
                  Discover
                </span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent break-words">
                  {currentProduct.name}
                </span>
              </h1>
              
              <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
                <div className="flex items-center">
                  {renderStars()}
                </div>
                <span className="text-gray-400 text-lg">(4.8)</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm">
                  <Award className="w-3 h-3 mr-1" />
                  Best Seller
                </Badge>
              </div>
              
              <p className="text-xl xl:text-2xl text-gray-300 leading-relaxed max-w-lg">
                {currentProduct.description || 'Experience premium quality with advanced technology from our verified Nigerian sellers.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6 justify-start">
                <div className="text-left">
                  <div className="text-6xl font-bold text-white">
                    {formatPrice(currentProduct.customer_price)}
                  </div>
                  <div className="text-gray-400 text-sm">Free shipping included</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-500/10 text-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50 bg-blue-500/10 text-sm">
                    Fast Delivery
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-start">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`h-3 rounded-full transition-all duration-500 ${
                    index === currentIndex 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-12' 
                      : 'bg-gray-600 hover:bg-gray-500 w-3'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Product Showcase */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Product Card */}
              <Card className="h-full bg-slate-800/60 backdrop-blur-xl border border-purple-500/20 shadow-2xl overflow-hidden group hover:shadow-purple-500/20 transition-all duration-700">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full">
                    {currentProduct.images && currentProduct.images.length > 0 ? (
                      <img
                        src={typeof currentProduct.images[0] === 'string' 
                          ? currentProduct.images[0] 
                          : currentProduct.images[0].url}
                        alt={currentProduct.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <ShoppingCart className="w-24 h-24 text-gray-500" />
                      </div>
                    )}
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                        New
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                        <p className="text-white text-sm font-medium">
                          {currentProduct.admins?.business_name || 'Shop Naija Seller'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs">Verified Seller</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Decorative Elements - Mobile responsive */}
              <div className="absolute -top-4 sm:-top-8 -right-4 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 w-14 h-14 sm:w-28 sm:h-28 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/4 -right-2 sm:-right-4 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse delay-2000" />
            </div>

            {/* Side Products Preview - Hidden on mobile to prevent overflow */}
            <div className="hidden xl:flex absolute -right-24 top-1/2 -translate-y-1/2 flex-col gap-4">
              {featuredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-500 ${
                    index === currentIndex 
                      ? 'border-purple-400 scale-110 shadow-lg shadow-purple-500/30' 
                      : 'border-slate-600 hover:border-slate-500 hover:scale-105'
                  }`}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={typeof product.images[0] === 'string' 
                        ? product.images[0] 
                        : product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-gray-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator - Mobile responsive with purple theme */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-center z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollToProducts}
          className="text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-500/30 shadow-lg backdrop-blur-sm animate-bounce transition-all duration-300 rounded-lg px-4 py-2 h-auto flex items-center gap-2"
        >
          <span className="text-xs sm:text-sm font-medium">Explore Products</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </section>
  );
}

export default CinematicHeroSection;