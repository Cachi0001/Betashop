import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Package, RotateCcw } from 'lucide-react';
import ProductForm from './ProductForm';
import { API_BASE } from '../../lib/apiBase';

 

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [showArchived]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const adminData = localStorage.getItem('admin');
      
      if (!token || !adminData) {
        setError('Authentication required');
        return;
      }

      const admin = JSON.parse(adminData);
      
      // Fetch all products and filter by admin ID
      const url = new URL(`${API_BASE}/products`);
      if (showArchived) url.searchParams.set('include_archived', 'true');
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter products by current admin
        const adminProducts = (data.data.products || []).filter(
          product => product.admin_id === admin.id
        );
        setProducts(adminProducts);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreProduct = async (productId, productName) => {
    if (!confirm(`Restore archived product "${productName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/${productId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Product restored successfully!');
        fetchProducts();
      } else {
        alert('Failed to restore product: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error restoring product: ' + e.message);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to archive "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'Product archived successfully!');
        fetchProducts(); // Refresh the list
      } else {
        alert('Failed to archive product: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error archiving product: ' + err.message);
    }
  };

  if (loading) return (
    <Card><CardContent className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading products...</p>
    </CardContent></Card>
  );

  if (error) return (
    <Card><CardContent className="p-8 text-center">
      <p className="text-red-600">{error}</p>
      <Button onClick={fetchProducts} className="mt-4">Retry</Button>
    </CardContent></Card>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Management
        </CardTitle>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Show archived
          </label>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products found</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">₦{product.customer_price}</Badge>
                    <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                      {product.stock_quantity} in stock
                    </Badge>
                    {product.is_deleted && (
                      <Badge variant="destructive">Archived</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!product.is_deleted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  )}
                  {!product.is_deleted ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRestoreProduct(product.id, product.name)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
      />
    </Card>
  );
}

export default ProductManagement;