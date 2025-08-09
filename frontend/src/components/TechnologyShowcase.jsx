import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Box, Zap, ShieldCheck, Sparkles, ArrowRight, Play } from 'lucide-react';

function TechnologyShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const features = [
    {
      icon: Box,
      title: 'Product Gallery View',
      description: 'Browse and examine products from multiple angles with our advanced image gallery technology.',
      color: 'from-purple-500 to-blue-500',
      stats: '99.9% Accuracy'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Lightning-fast image loading with optimized performance for seamless browsing experience.',
      color: 'from-yellow-500 to-orange-500',
      stats: '<0.5s Load Time'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Shopping',
      description: 'Advanced encryption and secure payment processing to protect your personal information.',
      color: 'from-green-500 to-emerald-500',
      stats: '256-bit SSL'
    },
    {
      icon: Sparkles,
      title: 'AI Recommendations',
      description: 'Smart product suggestions powered by machine learning algorithms tailored to your preferences.',
      color: 'from-pink-500 to-purple-500',
      stats: '95% Match Rate'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

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
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-white/10 border-white/20 text-white backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Cutting-Edge Technology
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            The Future of
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Shopping</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience shopping like never before with our revolutionary Beta shop platform
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isActive = index === activeFeature;
              
              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-500 border-0 ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-lg shadow-2xl scale-105' 
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/15'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {feature.stats}
                          </Badge>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Side - 3D Demo */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Main Demo Card */}
              <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Product Demo</h3>
                    <Button size="sm" variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Demo
                    </Button>
                  </div>
                  
                  <div className="flex-1 bg-gradient-to-br from-white/5 to-transparent rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Demo Content */}
                    <div className="text-center text-white">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center shadow-2xl`}>
                        {React.createElement(features[activeFeature].icon, { className: "w-10 h-10 text-white" })}
                      </div>
                      <h4 className="text-xl font-semibold mb-2">{features[activeFeature].title}</h4>
                      <p className="text-gray-300 text-sm max-w-xs mx-auto">
                        Interactive demonstration of our {features[activeFeature].title.toLowerCase()} technology
                      </p>
                    </div>

                    {/* Animated Elements */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="absolute top-1/2 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex gap-2 mt-6">
                    {features.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          index === activeFeature ? 'bg-purple-400 flex-1' : 'bg-white/20 w-8'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-2xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl">
            Experience the Technology
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default TechnologyShowcase;