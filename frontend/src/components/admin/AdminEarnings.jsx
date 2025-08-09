import { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import { API_BASE } from '../../lib/apiBase';

 

function AdminEarnings() {

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    completedEarnings: 0,
    totalOrders: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch orders to calculate earnings
      const ordersResponse = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const ordersData = await ordersResponse.json();
      
      if (ordersData.success && ordersData.data.orders) {
        const orders = ordersData.data.orders;
        
        // Calculate earnings from successful orders
        const completedOrders = orders.filter(order => order.payment_status === 'successful');
        const pendingOrders = orders.filter(order => order.payment_status === 'pending');
        
        const completedEarnings = completedOrders.reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || 0);
        }, 0);
        
        const pendingEarnings = pendingOrders.reduce((sum, order) => {
          return sum + parseFloat(order.total_amount || 0);
        }, 0);
        
        const totalEarnings = completedEarnings + pendingEarnings;
        
        // Create recent transactions from orders
        const recentTransactions = orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          .map(order => ({
            id: order.id,
            order_number: order.order_number || order.id.substring(0, 8),
            customer_name: order.customer_name,
            amount: order.total_amount,
            status: order.payment_status,
            created_at: order.created_at,
            items: order.order_items || []
          }));
        
        setEarnings({
          totalEarnings,
          pendingEarnings,
          completedEarnings,
          totalOrders: orders.length,
          recentTransactions
        });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(earnings.totalEarnings)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From {earnings.totalOrders} orders
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(earnings.pendingEarnings)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting payment
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(earnings.completedEarnings)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Successfully paid
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnings.totalOrders}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Direct Payment System</h3>
              <p className="text-blue-700 text-sm">
                You receive payments directly from customers through Paystack. No payout requests needed - 
                funds are automatically transferred to your connected bank account after successful transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={fetchEarnings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.recentTransactions.length > 0 ? (
              earnings.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Order #{transaction.order_number}</h4>
                      <Badge 
                        variant={transaction.status === 'successful' ? 'default' : 'secondary'}
                        className={transaction.status === 'successful' ? 'bg-green-100 text-green-800' : 
                                 transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800'}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Customer: {transaction.customer_name} • {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.status === 'successful' ? 'Paid' : 
                       transaction.status === 'pending' ? 'Pending' : 'Failed'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No transactions found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminEarnings;