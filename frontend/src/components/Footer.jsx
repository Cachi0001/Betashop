import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    'Shop': [
      'All Products',
      'Electronics',
      'Fashion',
      'Home & Decor',
      'Gaming',
      'New Arrivals',
      'Best Sellers'
    ],
    'Support': [
      'Help Center',
      'Contact Us',
      'Shipping Info',
      'Returns',
      'Size Guide',
      'Track Order',
      'FAQ'
    ],
    'Company': [
      'About Us',
      'Careers',
      'Press',
      'Blog',
      'Partnerships',
      'Investors',
      'Sustainability'
    ],
    'Legal': [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
      'Accessibility',
      'Security',
      'Compliance'
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/Caleb0533', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="bg-slate-900 text-white relative z-10">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-3 lg:space-y-6 mb-6 lg:mb-0">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shop Naija
              </h2>
              <p className="text-gray-400 mt-3 leading-relaxed">
                Experience the future of online shopping with our innovative Shop Naija platform. 
                Discover, explore, and shop Nigerian products like never before.
              </p>
            </div>

            {/* Contact Info - Horizontal on Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:space-y-3 lg:block">
              <div className="flex items-center gap-2 text-gray-400 text-xs lg:text-base">
                <Mail className="w-3 h-3 lg:w-5 lg:h-5 text-purple-400 flex-shrink-0" />
                <span className="break-all text-xs lg:text-sm">hello@shopnaija.com</span>
              </div>
              <a 
                href="https://wa.me/2348158025887" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-xs lg:text-base"
              >
                <Phone className="w-3 h-3 lg:w-5 lg:h-5 text-purple-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">+234 815 802 5887</span>
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-xs lg:text-base">
                <MapPin className="w-3 h-3 lg:w-5 lg:h-5 text-purple-400 flex-shrink-0" />
                <span className="text-xs lg:text-sm">Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 lg:gap-3 justify-center sm:justify-start">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-7 h-7 lg:w-10 lg:h-10 p-0 bg-slate-800 hover:bg-purple-600 transition-colors duration-300"
                    aria-label={social.label}
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <IconComponent className="w-3 h-3 lg:w-5 lg:h-5" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-2 lg:space-y-4">
              <h3 className="text-sm lg:text-lg font-semibold text-white">{title}</h3>
              <ul className="space-y-1 lg:space-y-2">
                {links.slice(0, 4).map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-xs lg:text-sm block py-0.5"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 lg:gap-4">
          <div className="text-gray-400 text-xs lg:text-sm text-center sm:text-left">
            © 2024 Shop Naija. All rights reserved. Built with ❤️ in Nigeria.
          </div>
          
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-1 lg:gap-4 text-xs lg:text-sm text-gray-400">
              <span>Modern Tech</span>
              <span>•</span>
              <span>Secure</span>
              <span>•</span>
              <span>Fast Delivery</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="w-7 h-7 lg:w-10 lg:h-10 p-0 bg-slate-800 hover:bg-purple-600 transition-colors duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3 h-3 lg:w-5 lg:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;