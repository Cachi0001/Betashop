import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import DashboardHeader from './admin/DashboardHeader';
import DashboardStats from './admin/DashboardStats';
import ProductManagement from './admin/ProductManagement';
import ProductForm from './admin/ProductForm';
import AdminEarnings from './admin/AdminEarnings';
import OrdersManagement from './admin/OrdersManagement';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, BarChart3, Plus, DollarSign, MapPin, ShoppingCart } from 'lucide-react';

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const currentAdmin = authService.getCurrentAdmin();
    setAdmin(currentAdmin);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader admin={admin} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {admin?.full_name}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Product Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Add new products with location-based visibility, manage inventory, and update product information.
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Earnings & Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Track your earnings, view payment history, and request payouts directly to your bank account.
                  </p>
                  <Button variant="outline" className="w-full">View Earnings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="earnings">
            <AdminEarnings />
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Location-Based Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage your product locations and visibility. Products are automatically assigned your business location, 
                  but you can customize the location for each product during creation.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Your Business Location</h4>
                    <p className="text-blue-700">
                      {admin?.address ? 
                        `${admin.address.street ? admin.address.street + ', ' : ''}${admin.address.city}, ${admin.address.state}, ${admin.address.country}` :
                        'No business address set'
                      }
                    </p>
                  </div>
                  <Button variant="outline">Update Business Location</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          // Refresh the page or trigger a refresh in ProductManagement
          window.location.reload();
        }}
      />
    </div>
  );
}

export default AdminDashboard;