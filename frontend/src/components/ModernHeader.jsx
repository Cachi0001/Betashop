import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCart } from '../store/cartSlice';
import { searchProducts } from '../store/productsThunks';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from './ui/navigation-menu';
import { ShoppingCart, Search, Menu, Home, Phone, Store, Package, MessageCircle, Twitter } from 'lucide-react';
import MobileMenu from './MobileMenu';

function ModernHeader({ onSearch, onMenuClick }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchProducts(searchQuery.trim()));
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  const handleCartClick = () => {
    dispatch(toggleCart());
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-700/50' 
          : 'bg-slate-900/90 backdrop-blur-lg border-b border-slate-800/50'
      }`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 via-transparent to-slate-900/5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="lg:hidden hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg lg:text-xl font-bold text-white">
                  Beta shop
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-purple-500/30 rounded-lg`}
                    href="/"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-purple-500/30 rounded-lg`}
                    href="/"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-purple-500/30 rounded-lg`}
                    href="https://wa.me/2348158025887"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-purple-500/30 rounded-lg`}
                    href="https://twitter.com/shopnaija"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 bg-slate-800/80 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-400 focus:bg-slate-700/80 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all duration-300 h-10 rounded-lg"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all duration-300 rounded-md"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Enhanced Cart */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartClick}
                className="relative hover:bg-slate-800/60 transition-all duration-300 group text-slate-300 hover:text-white rounded-lg border border-transparent hover:border-slate-700/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300" />
                <ShoppingCart className="w-5 h-5 text-amber-400 relative z-10" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-amber-500 to-orange-600 border-0 shadow-lg text-white font-semibold"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}

export default ModernHeader;