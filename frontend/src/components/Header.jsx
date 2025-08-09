import { useState } from 'react';
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
import { ShoppingCart, Search, Menu, Home, Phone, MessageCircle, Twitter } from 'lucide-react';
import MobileMenu from './MobileMenu';
import '../App.css';

function Header({ onSearch, onMenuClick }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <header className="bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Beta shop
              </h1>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-purple-600 hover:bg-purple-700`}
                    href="/"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={`${navigationMenuTriggerStyle()} text-white bg-purple-600 hover:bg-purple-700`}
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
                    className={`${navigationMenuTriggerStyle()} text-white bg-purple-600 hover:bg-purple-700`}
                    href="https://twitter.com/Caleb0533"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:bg-slate-700 focus:border-purple-500 transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700"
                >
                  <Search className="w-4 h-4 text-purple-600" />
                </Button>
              </form>
            </div>

            {/* Cart */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartClick}
                className="relative hover:bg-slate-800"
              >
                <ShoppingCart className="w-5 h-5 text-purple-400" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-purple-600 to-pink-600 border-0"
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

export default Header;