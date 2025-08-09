import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
    Search,
    Filter,
    ShoppingCart,
    Package
} from 'lucide-react';
import { API_BASE } from '../lib/apiBase';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
        // Auto-refresh products every 30 seconds to get stock updates
        const interval = setInterval(fetchProducts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('🛍️ PRODUCTS PAGE - Fetching products...');
            
            const response = await fetch(`${API_BASE}/products`);
            const data = await response.json();
            
            console.log('🛍️ PRODUCTS PAGE - API response:', data);
            
            if (data.success) {
                const products = data.data.products || [];
                console.log('✅ PRODUCTS PAGE - Products loaded:', products.length);
                setProducts(products);
            } else {
                console.error('❌ PRODUCTS PAGE - Failed to fetch products:', data.error);
                setProducts([]);
            }
        } catch (error) {
            console.error('❌ PRODUCTS PAGE - Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Filter products based on search query
        if (query.trim() === '') {
            fetchProducts(); // Reset to all products
        } else {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
            setProducts(filtered);
        }
    };

    const handleMenuClick = () => {
        // TODO: Implement menu functionality
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header onSearch={handleSearch} onMenuClick={handleMenuClick} />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header onSearch={handleSearch} onMenuClick={handleMenuClick} />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Discover Amazing Products
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 opacity-90">
                            Experience seamless shopping with Beta shop
                        </p>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            <Package className="w-4 h-4 mr-2" />
                            {products.length} Products Available
                        </Badge>
                    </div>
                </div>
            </section>

            {/* Filters and Search */}
            <section className="py-8 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                            <Button variant="outline" size="sm">
                                Sort by: Featured
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCartOpen(true)}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Cart (0)
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {products.length === 0 ? (
                        <Card className="bg-gray-50">
                            <CardContent className="text-center py-16">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Products Available
                                </h3>
                                <p className="text-gray-600">
                                    Products will appear here once sellers start adding them.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <ProductGrid products={products} />
                    )}
                </div>
            </section>

            <Footer />
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}

export default ProductsPage;