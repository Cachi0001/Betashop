import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

function DashboardStats() {
  const [stats, setStats] = useState([
    {
      title: 'Total Products',
      value: '0',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Orders',
      value: '0',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Revenue',
      value: '₦0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Customers',
      value: '0',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const adminData = localStorage.getItem('admin');
      
      if (!token || !adminData) {
        console.log('No auth data found');
        return;
      }

      const admin = JSON.parse(adminData);
      console.log('📊 DASHBOARD STATS - Fetching stats for admin:', admin.id);
      
      // Fetch ALL products first, then filter by admin
      const productsResponse = await fetch('http://localhost:3000/api/products');
      const productsData = await productsResponse.json();
      
      console.log('📊 DASHBOARD STATS - All products:', productsData.data?.products?.length || 0);
      
      // Filter products by current admin
      const allProducts = productsData.success ? productsData.data.products || [] : [];
      const adminProducts = allProducts.filter(product => product.admin_id === admin.id);
      
      console.log('📊 DASHBOARD STATS - Admin products:', adminProducts.length);
      
      // Fetch admin's orders
      let totalOrders = 0;
      let totalRevenue = 0;
      let uniqueCustomers = 0;
      
      try {
        const ordersResponse = await fetch('http://localhost:3000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const ordersData = await ordersResponse.json();
        
        if (ordersData.success && ordersData.data.orders) {
          const orders = ordersData.data.orders;
          totalOrders = orders.length;
          
          // Calculate actual revenue from successful orders
          totalRevenue = orders
            .filter(order => order.payment_status === 'successful')
            .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
          
          // Count unique customers
          const customerEmails = new Set(orders.map(order => order.customer_email));
          uniqueCustomers = customerEmails.size;
        }
      } catch (orderError) {
        console.log('📊 DASHBOARD STATS - Orders fetch failed:', orderError.message);
      }

      setStats([
        {
          title: 'Total Products',
          value: adminProducts.length.toString(),
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Total Orders',
          value: totalOrders.toString(),
          icon: ShoppingCart,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Total Revenue',
          value: `₦${totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          title: 'Customers',
          value: uniqueCustomers.toString(),
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        }
      ]);
    } catch (error) {
      console.error('❌ DASHBOARD STATS - Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;