import { useState } from 'react';
import { Provider } from 'react-redux';
import store from './store/store';
import ModernHeader from './components/ModernHeader';
import EnhancedAnimatedBackground from './components/EnhancedAnimatedBackground';
import CinematicHeroSection from './components/CinematicHeroSection';
import ModernProductsGrid from './components/ModernProductsGrid';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductQuickView from './components/ProductQuickView';
import './App.css';

function ModernLandingPagePreview() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Mock products with real images
  const mockProducts = [
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      description: 'Premium noise-canceling headphones with advanced audio technology and superior sound quality',
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
      description: 'Next-generation tablet with AI-powered features and stunning 4K display',
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
      description: 'High-performance gaming laptop with RTX 4080 graphics and RGB lighting',
      customer_price: 250000,
      admin_price: 240000,
      images: ['https://images.unsplash.com/photo-1599924315512-3dbfd0c2379a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 5,
      rating: 4.7,
      admins: { business_name: 'Gaming World' },
      featured: true
    },
    {
      id: '4',
      name: 'Smartphone Pro Max',
      description: 'Latest flagship smartphone with advanced camera system and 5G connectivity',
      customer_price: 120000,
      admin_price: 115000,
      images: ['https://images.unsplash.com/photo-1572532350840-f682a3cf9dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 12,
      rating: 4.6,
      admins: { business_name: 'Mobile Zone' },
      featured: false
    },
    {
      id: '5',
      name: 'Wireless Earbuds Pro',
      description: 'Premium wireless earbuds with active noise cancellation and wireless charging',
      customer_price: 35000,
      admin_price: 32000,
      images: ['https://images.unsplash.com/photo-1627691673558-cf76f304f273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 20,
      rating: 4.5,
      admins: { business_name: 'Audio Pro' },
      featured: false
    },
    {
      id: '6',
      name: 'Smart Watch Series X',
      description: 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life',
      customer_price: 65000,
      admin_price: 60000,
      images: ['https://images.unsplash.com/photo-1599924315512-3dbfd0c2379a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 10,
      rating: 4.4,
      admins: { business_name: 'Wearable Tech' },
      featured: false
    },
    {
      id: '7',
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design',
      customer_price: 25000,
      admin_price: 22000,
      images: ['https://images.unsplash.com/photo-1572532350840-f682a3cf9dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 18,
      rating: 4.3,
      admins: { business_name: 'Sound Systems' },
      featured: false
    },
    {
      id: '8',
      name: 'Wireless Mouse Pro',
      description: 'Ergonomic wireless mouse with precision tracking and RGB lighting',
      customer_price: 15000,
      admin_price: 13000,
      images: ['https://images.unsplash.com/photo-1627691673558-cf76f304f273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85'],
      stock_quantity: 25,
      rating: 4.2,
      admins: { business_name: 'PC Accessories' },
      featured: false
    }
  ];

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleRetry = () => {
    console.log('Retry loading products');
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
        <EnhancedAnimatedBackground />
        <ModernHeader onSearch={handleSearch} onMenuClick={handleMenuClick} />
        <main className="relative z-10">
          <CinematicHeroSection
            products={mockProducts}
            loading={false}
            onProductSelect={handleProductSelect}
          />
          <ModernProductsGrid
            products={mockProducts}
            loading={false}
            error={null}
            onProductSelect={handleProductSelect}
            onRetry={handleRetry}
          />
        </main>
        <Footer />
        <CartDrawer />
        <ProductQuickView
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => {
            setIsQuickViewOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </Provider>
  );
}

export default ModernLandingPagePreview;