import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowRight, Smartphone, Shirt, Home, Gamepad2, Camera, Headphones } from 'lucide-react';

function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Latest gadgets and tech',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1572532350840-f682a3cf9dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85',
      color: 'from-blue-500 to-purple-600',
      count: '2.5k+ items'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      description: 'Trendy clothing & accessories',
      icon: Shirt,
      image: 'https://images.unsplash.com/photo-1646508905261-d3bd7e9afed4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBhY2Nlc3NvcmllcyUyMHN0eWxlfGVufDB8MXx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85',
      color: 'from-pink-500 to-rose-600',
      count: '1.8k+ items'
    },
    {
      id: 'home',
      name: 'Home & Decor',
      description: 'Beautiful home essentials',
      icon: Home,
      image: 'https://images.unsplash.com/photo-1615402052294-a376393da320?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxob21lJTIwaW50ZXJpb3IlMjBmdXJuaXR1cmUlMjBkZWNvcnxlbnwwfDB8fHwxNzU0NDYyNjcyfDA&ixlib=rb-4.1.0&q=85',
      color: 'from-green-500 to-emerald-600',
      count: '950+ items'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Gaming gear & accessories',
      icon: Gamepad2,
      image: 'https://images.unsplash.com/photo-1599924315512-3dbfd0c2379a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85',
      color: 'from-purple-500 to-indigo-600',
      count: '750+ items'
    },
    {
      id: 'photography',
      name: 'Photography',
      description: 'Cameras & photo equipment',
      icon: Camera,
      image: 'https://images.unsplash.com/photo-1627691673558-cf76f304f273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85',
      color: 'from-orange-500 to-red-600',
      count: '420+ items'
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Speakers & headphones',
      icon: Headphones,
      image: 'https://images.unsplash.com/photo-1572532350840-f682a3cf9dc2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3AlMjBnYWRnZXRzfGVufDB8MHx8fDE3NTQ0NjI2NzJ8MA&ixlib=rb-4.1.0&q=85',
      color: 'from-teal-500 to-cyan-600',
      count: '680+ items'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Shop by
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Category</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our diverse collection of products across multiple categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-12">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isLarge = index === 0 || index === 1;

            return (
              <Card
                key={category.id}
                className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden ${isLarge ? 'md:col-span-1 lg:row-span-2' : ''
                  }`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CardContent className="p-0 relative h-48 sm:h-56 lg:h-64">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={`${category.name} - Daniele Luciani on Unsplash`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-4 lg:p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {category.count}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90 mb-4">{category.description}</p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className={`self-start bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900 transition-all duration-300 ${hoveredCategory === category.id ? 'translate-x-2' : ''
                        }`}
                    >
                      Explore
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-100">
            View All Categories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;