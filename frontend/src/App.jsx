import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import store from './store/store';
import ModernHeader from './components/ModernHeader';
import CinematicHeroSection from './components/CinematicHeroSection';
import ModernProductsGrid from './components/ModernProductsGrid';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProductQuickView from './components/ProductQuickView';
import EnhancedAnimatedBackground from './components/EnhancedAnimatedBackground';
import AdminRegistration from './components/AdminRegistration';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentCallback from './components/PaymentCallback';
import { Toaster } from './components/ui/toaster';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from './store/productsThunks';
import './App.css';
import { API_BASE } from './lib/apiBase';

 

function MainProductsPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Debug products state
  useEffect(() => {
    console.log('🛍️ APP - Products state updated:', {
      productsCount: products?.length || 0,
      loading,
      error,
      products: products?.slice(0, 2) // Log first 2 products for debugging
    });
  }, [products, loading, error]);



  useEffect(() => {
    console.log('🚀 APP - Fetching products on mount');
    dispatch(fetchProducts({ limit: 12 }));
    
    // Auto-refresh products every 30 seconds for real-time stock updates
    const interval = setInterval(() => {
      console.log('🔄 APP - Auto-refreshing products');
      dispatch(fetchProducts({ limit: 12 }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

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
    dispatch(fetchProducts({ limit: 12 }));
  };

  // Use API products only
  const displayProducts = products;

  // Debug function
  const debugProducts = () => {
    console.log('🐛 DEBUG - Current Redux state:', {
      products,
      productsLength: products?.length,
      loading,
      error,
      firstProduct: products?.[0]
    });
    
    // Test direct API call
    fetch(`${API_BASE}/products?_t=` + Date.now())
      .then(r => r.json())
      .then(data => {
        console.log('🐛 DEBUG - Direct API call result:', data);
        console.log('🐛 DEBUG - Products in API response:', data.data?.products?.length || 0);
      })
      .catch(err => console.log('🐛 DEBUG - Direct API call error:', err));
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
      <EnhancedAnimatedBackground />
      <ModernHeader onSearch={handleSearch} onMenuClick={handleMenuClick} />
      <main className="relative z-10">
        {/* Debug Button - Remove in production */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={debugProducts}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            style={{ fontSize: '12px' }}
          >
            Debug Products
          </button>
        </div>
        
        <CinematicHeroSection
          products={displayProducts}
          loading={loading}
          onProductSelect={handleProductSelect}
        />
        <ModernProductsGrid
          products={displayProducts}
          loading={loading}
          error={error}
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
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainProductsPage />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/owner/register" element={<AdminRegistration />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </Provider>
  );
}

export default App;