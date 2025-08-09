import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import ProductForm from './ProductForm';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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
      const response = await fetch('http://localhost:3000/api/products', {
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

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list
      } else {
        alert('Failed to delete product: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
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
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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