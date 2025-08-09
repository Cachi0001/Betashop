import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Star, ShoppingCart, Eye } from 'lucide-react';
import Product3DViewer from './Product3DViewer';
import ProductQuickView from './ProductQuickView';
import { fetchProducts } from '../store/productsThunks';
import { addToCart } from '../store/cartSlice';

function FeaturedProducts() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    // Fetch featured products on component mount
    dispatch(fetchProducts({ featured: true, limit: 6 }));
  }, [dispatch]);

  // Fallback mock data if API fails
  const mockProducts = [
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      description: 'Premium noise-canceling headphones with superior audio',
      customer_price: 45000,
      admin_price: 40000,
      images: ['https://images.unsplash.com/photo-1572532350840-f682a3cf9dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 15,
      rating: 4.8,
      admins: { business_name: 'TechStore Pro' },
      featured: true
    },
    {
      id: '2',
      name: 'Smart Tablet Ultra',
      description: 'Next-gen tablet with AI-powered features',
      customer_price: 85000,
      admin_price: 80000,
      images: ['https://images.unsplash.com/photo-1627691673558-cf76f304f273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 8,
      rating: 4.9,
      admins: { business_name: 'Digital Hub' },
      featured: true
    },
    {
      id: '3',
      name: 'Gaming Laptop Elite',
      description: 'High-performance gaming laptop with RTX graphics',
      customer_price: 250000,
      admin_price: 240000,
      images: ['https://images.unsplash.com/photo-1599924315512-3dbfd0c2379a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 5,
      rating: 4.7,
      admins: { business_name: 'Gaming World' },
      featured: true
    }
  ];

  const displayProducts = products.length > 0 ? products : mockProducts;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const computeDisplayPrice = (p) => {
    if (typeof p.customer_price === 'number' && !Number.isNaN(p.customer_price)) return p.customer_price;
    const admin = Number(p.admin_price) || 0;
    return admin + 5000 + Math.round(admin * 0.07);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Featured Collection
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Discover Our
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Best Sellers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked products that combine cutting-edge technology with exceptional design
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading featured products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load products: {error}</p>
            <Button 
              onClick={() => dispatch(fetchProducts({ featured: true, limit: 6 }))}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
            {displayProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm ${
                index === 1 ? 'lg:scale-105 lg:shadow-xl' : ''
              }`}
            >
              <CardContent className="p-0">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-t-xl">
                  <img
                    src={product.images[0]}
                    alt={`${product.name} - Daniele Luciani on Unsplash`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex-1 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setIsQuickViewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(addToCart({ product, quantity: 1 }));
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  {/* Badge */}
                  {product.featured && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({product.rating})</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(computeDisplayPrice(product))}
                      </span>
                      <p className="text-sm text-gray-500">{product.admins.business_name}</p>
                    </div>
                    <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl">
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Quick View Modal */}
        <ProductQuickView
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </section>
  );
}

export default FeaturedProducts;