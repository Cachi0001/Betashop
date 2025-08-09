import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, Sparkles, Zap, Box, Store } from 'lucide-react';
import Product3DViewer from './Product3DViewer';

function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Aurora Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-4 h-4 bg-purple-400 rounded-full blur-sm opacity-60" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-6 h-6 bg-blue-400 rounded-full blur-sm opacity-40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <div className="w-3 h-3 bg-pink-400 rounded-full blur-sm opacity-50" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Nigerian Shopping Experience
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Shop Naija
                </span>
                <br />
                <span className="font-light">Reimagined</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Experience Nigerian products like never before. Discover authentic local goods and explore every detail with our modern shopping platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl">
                  Explore Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                Watch Demo
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <Box className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Product Gallery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Real-time Rendering</span>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Showcase */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Glass Card */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl">
                <div className="p-8 h-full">
                  <div className="h-full bg-gradient-to-br from-white/5 to-transparent rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <Box className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <h3 className="text-xl font-semibold mb-2">Product Preview</h3>
                      <p className="text-gray-300">Interactive product gallery</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

export default HeroSection;