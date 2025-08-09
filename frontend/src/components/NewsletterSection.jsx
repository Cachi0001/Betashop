import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, Gift, Zap, ArrowRight, CheckCircle } from 'lucide-react';

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: 'Exclusive Deals',
      description: 'Get early access to sales and special discounts'
    },
    {
      icon: Zap,
      title: 'New Arrivals',
      description: 'Be the first to know about latest products'
    },
    {
      icon: Mail,
      title: 'Weekly Updates',
      description: 'Curated content and shopping inspiration'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
                <Mail className="w-4 h-4 mr-2" />
                Stay Connected
              </Badge>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Join Our
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Community</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Subscribe to our newsletter and never miss out on exclusive deals, new product launches, and insider shopping tips.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Newsletter Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                {!isSubscribed ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6"
                      >
                        Subscribe
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Successfully Subscribed!</h3>
                    <p className="text-gray-600">Thank you for joining our community. Check your email for a welcome message.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Main Card */}
              <Card className="h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full" />
                    <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-lg rotate-45" />
                    <div className="absolute bottom-20 left-20 w-12 h-12 border-2 border-white rounded-full" />
                    <div className="absolute bottom-32 right-10 w-8 h-8 bg-white rounded-full opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white text-center">
                    <div className="mb-8">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Join 50,000+ Happy Subscribers</h3>
                      <p className="text-white/90 text-lg">
                        Get exclusive access to deals, new arrivals, and insider shopping tips delivered straight to your inbox.
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">50K+</div>
                        <div className="text-sm text-white/80">Subscribers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">98%</div>
                        <div className="text-sm text-white/80">Satisfaction</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">24/7</div>
                        <div className="text-sm text-white/80">Support</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-6 right-6 w-4 h-4 bg-white rounded-full animate-pulse" />
                  <div className="absolute bottom-6 left-6 w-3 h-3 bg-white rounded-full animate-bounce" />
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 blur-xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;