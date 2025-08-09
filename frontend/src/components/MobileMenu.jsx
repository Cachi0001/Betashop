import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Home, 
  Phone, 
  Mail, 
  ShoppingBag,
  User,
  X,
  MessageCircle,
  Twitter
} from 'lucide-react';

function MobileMenu({ isOpen, onClose }) {
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/2348158025887' },
    { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/Caleb0533' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 bg-slate-900/95 backdrop-blur-lg border-0 shadow-2xl border-r border-slate-700">
        <SheetHeader className="text-left pb-6 px-2">
          <SheetTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Shop Naija
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3 px-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-11 text-left bg-purple-600 hover:bg-purple-700 transition-colors text-white"
                onClick={() => {
                  // Handle navigation
                  if (item.href.startsWith('http')) {
                    window.open(item.href, '_blank');
                  } else {
                    console.log(`Navigate to ${item.href}`);
                  }
                  onClose();
                }}
              >
                <IconComponent className="w-4 h-4 mr-3 text-purple-400" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>

        <Separator className="my-6 bg-slate-700" />

        <div className="space-y-4 px-2">
          <div className="text-sm text-gray-400">
            <p className="font-medium mb-3 text-gray-300">Get in touch</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <a href="https://wa.me/2348158025887" target="_blank" rel="noopener noreferrer" className="text-xs break-all hover:text-purple-400">
                  WhatsApp: +234 815 802 5887
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <a href="https://twitter.com/shopnaija" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-purple-400">
                  @shopnaija
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileMenu;