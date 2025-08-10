import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Package, ImageIcon, Shuffle } from 'lucide-react';
import { productToast, authErrorToast, networkErrorToast } from '../../utils/toast';
import { toast } from '../../hooks/use-toast';
import { API_BASE } from '../../lib/apiBase';

// African slip-on footwear name generator
const generateFootwearName = () => {
    const brands = ['Afro', 'Naija', 'Lagos', 'Kano', 'Eko', 'Sahel', 'Zuma', 'Baba', 'Mama', 'Royal'];
    const types = ['Cover Shoes', 'Slip-ons', 'Sandals', 'Slides', 'Flats', 'Mules', 'Clogs', 'Easy-wear', 'Comfort Shoes', 'Open-toe'];
    const styles = ['Classic', 'Traditional', 'Modern', 'Comfort', 'Soft', 'Easy', 'Light', 'Flexible', 'Breathable', 'Casual'];
    const colors = ['Black', 'Brown', 'Tan', 'Camel', 'Dark Brown', 'Light Brown', 'Natural', 'Chocolate', 'Coffee', 'Mahogany'];
    const materials = ['Leather', 'Suede', 'Canvas', 'Fabric', 'Woven', 'Soft-sole', 'Rubber-sole', 'Cork-sole'];
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    // Generate random number for uniqueness
    const randomNum = Math.floor(Math.random() * 99) + 1;
    
    // Different name patterns focused on African slip-on footwear
    const patterns = [
        `${brand} ${type}`,
        `${color} ${type}`,
        `${style} ${type}`,
        `${brand} ${color} ${type}`,
        `${material} ${type}`,
        `${style} ${color} ${type}`,
        `${brand} ${style} ${type}`,
        `${type} ${randomNum}`,
        `${color} ${material} ${type}`,
        `${brand} ${material} Slides`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
};

function ProductForm({ isOpen, onClose, onSuccess, editingProduct }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        admin_price: '',
        stock_quantity: '1',
        attributes: {},
        location: {
            street: '',
            city: '',
            state: '',
            country: 'Nigeria'
        }
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (editingProduct) {
                loadProductData();
            } else {
                loadAdminLocation();
                // Generate random footwear name for new products
                setFormData(prev => ({
                    ...prev,
                    name: generateFootwearName()
                }));
            }
            testToken(); // Test token when form opens
        }
    }, [isOpen, editingProduct]);

    const loadAdminLocation = () => {
        try {
            const adminData = localStorage.getItem('admin');
            if (adminData) {
                const admin = JSON.parse(adminData);
                if (admin.address) {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            street: admin.address.street || '',
                            city: admin.address.city || '',
                            state: admin.address.state || '',
                            country: admin.address.country || 'Nigeria'
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading admin location:', error);
        }
    };

    const loadProductData = () => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name || '',
                description: editingProduct.description || '',
                category_id: editingProduct.category_id ? String(editingProduct.category_id) : '',
                admin_price: editingProduct.admin_price?.toString() || '',
                stock_quantity: editingProduct.stock_quantity?.toString() || '',
                attributes: editingProduct.attributes || {},
                location: editingProduct.location || {
                    street: '',
                    city: '',
                    state: '',
                    country: 'Nigeria'
                }
            });
            setImages(editingProduct.images || []);
        }
    };

    // Set selected category when categories are loaded and we have an editing product
    useEffect(() => {
        if (editingProduct && categories.length > 0) {
            const category = categories.find(c => String(c.id) === String(editingProduct.category_id));
            setSelectedCategory(category || null);
        }
    }, [editingProduct, categories]);

    const testToken = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/auth/test-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('🧪 TOKEN TEST - Result:', data);
        } catch (error) {
            console.log('🧪 TOKEN TEST - Error:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/categories`);
            const data = await response.json();
            if (data.success) {
                const cats = data.data.categories || [];
                setCategories(cats);
                // Set default category to 'Fashion' when creating a new product
                if (!editingProduct && (!formData.category_id || formData.category_id === '')) {
                    const fashion = cats.find(c => String(c.name).toLowerCase() === 'fashion');
                    if (fashion) {
                        setFormData(prev => ({ ...prev, category_id: String(fashion.id) }));
                        setSelectedCategory(fashion);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        console.log('📸 PRODUCT FORM - Uploading', files.length, 'images...');
        setUploadingImages(true);
        
        // Show upload toast
        const uploadToast = toast({
            title: `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`,
            variant: "default",
            duration: 0, // Don't auto-dismiss
        });
        
        try {
            const uploadedImages = [];
            
            for (const file of files) {
                // Create FormData for the file
                const formData = new FormData();
                formData.append('image', file);
                
                console.log('📸 PRODUCT FORM - Uploading image:', file.name);
                
                // Upload to backend
                const response = await fetch(`${API_BASE}/upload/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    uploadedImages.push(data.data.url);
                    console.log('✅ PRODUCT FORM - Image uploaded:', data.data.url);
                } else {
                    console.error('❌ PRODUCT FORM - Image upload failed:', data.error);
                    productToast.uploadError(`${file.name}: ${data.error}`);
                }
            }
            
            if (uploadedImages.length > 0) {
                setImages(prev => [...prev, ...uploadedImages]);
                productToast.uploadSuccess(uploadedImages.length);
                console.log('✅ PRODUCT FORM - All images uploaded successfully');
            }
        } catch (error) {
            console.error('❌ PRODUCT FORM - Image upload error:', error);
            networkErrorToast('Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
            uploadToast.dismiss();
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const adminData = localStorage.getItem('admin');

            console.log('🎯 FRONTEND - Token exists:', !!token);
            console.log('🎯 FRONTEND - Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
            console.log('🎯 FRONTEND - Admin data exists:', !!adminData);
            
            if (adminData) {
                try {
                    const admin = JSON.parse(adminData);
                    console.log('🎯 FRONTEND - Admin info:', { id: admin.id, business_name: admin.business_name });
                } catch (e) {
                    console.log('🎯 FRONTEND - Error parsing admin data:', e);
                }
            }

            if (!token) {
                setError('Authentication required. Please log in again.');
                return;
            }

            // Create product data with images
            const productData = {
                ...formData,
                description: formData.description || '', // Ensure description is never undefined
                category_id: formData.category_id || undefined,
                admin_price: parseFloat(formData.admin_price),
                stock_quantity: parseInt(formData.stock_quantity),
                images: images, // Include uploaded images
                // Only include location if it has meaningful data
                location: (formData.location.city || formData.location.state) ? formData.location : undefined
            };

            console.log('🎯 FRONTEND - Product data being sent:', JSON.stringify(productData, null, 2));

            const url = editingProduct 
                ? `${API_BASE}/products/${editingProduct.id}`
                : `${API_BASE}/products`;
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            console.log('🎯 FRONTEND - Response status:', response.status);
            console.log('🎯 FRONTEND - Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('🎯 FRONTEND - Response data:', JSON.stringify(data, null, 2));

            if (data.success) {
                if (editingProduct) {
                    productToast.updated();
                } else {
                    productToast.created();
                }
                onSuccess();
                onClose();
                // Reset form with new random name
                setFormData({
                    name: generateFootwearName(), 
                    description: '', 
                    category_id: '', 
                    admin_price: '', 
                    stock_quantity: '1', 
                    attributes: {},
                    location: { street: '', city: '', state: '', country: 'Nigeria' }
                });
                setImages([]);
            } else {
                console.error('🎯 FRONTEND - Server error response:', data);
                
                // Handle authentication errors
                if (data.error === 'Admin access required' || data.error === 'Invalid token' || data.error === 'Access token required') {
                    authErrorToast('Authentication expired. Please log in again.');
                    // Clear invalid tokens
                    localStorage.removeItem('token');
                    localStorage.removeItem('admin');
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = '/admin/login';
                    }, 2000);
                } else {
                    if (editingProduct) {
                        productToast.updateError(data.error || 'Unknown error');
                    } else {
                        productToast.createError(data.error || 'Unknown error');
                    }
                }
            }
        } catch (err) {
            console.error('🎯 FRONTEND - Network/Parse error:', err);
            networkErrorToast('Error creating product: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Product Name *</label>
                            <div className="flex gap-2">
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    required
                                    className="flex-1"
                                />
                                {!editingProduct && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, name: generateFootwearName() }))}
                                        className="px-3"
                                        title="Generate new random name"
                                    >
                                        <Shuffle className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            {!editingProduct && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Random African slip-on footwear name generated. Click the shuffle button for a new one or edit manually.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <Select value={formData.category_id} onValueChange={(value) => {
                                const category = categories.find(c => String(c.id) === String(value));
                                setSelectedCategory(category || null);
                                setFormData(prev => ({ ...prev, category_id: value }));
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        {/* Size Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Size</label>
                            <Input
                                name="size"
                                value={formData.attributes?.size || ''}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        attributes: {
                                            ...prev.attributes,
                                            size: e.target.value
                                        }
                                    }));
                                }}
                                placeholder="Enter size (e.g., S, M, L, XL or dimensions)"
                            />
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">Product Location</h3>
                            <p className="text-sm text-gray-600">
                                This location will be shown to customers. By default, it uses your business address.
                            </p>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Street Address</label>
                                <Input
                                    name="street"
                                    value={formData.location.street}
                                    onChange={handleLocationChange}
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">City</label>
                                    <Input
                                        name="city"
                                        value={formData.location.city}
                                        onChange={handleLocationChange}
                                        placeholder="Enter city (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">State</label>
                                    <Input
                                        name="state"
                                        value={formData.location.state}
                                        onChange={handleLocationChange}
                                        placeholder="Enter state (optional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing and Inventory */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Your Price (₦) *</label>
                                <Input
                                    name="admin_price"
                                    type="number"
                                    value={formData.admin_price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {(() => {
                                    const admin = parseFloat(formData.admin_price || '0') || 0;
                                    const baseFee = 5000;
                                    const percentFee = Math.round(admin * 0.07);
                                    const customer = admin + baseFee + percentFee;
                                    return (
                                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                            <div>Platform fee: Base ₦{baseFee.toLocaleString()} + 7% (₦{percentFee.toLocaleString()}) = ₦{(baseFee + percentFee).toLocaleString()}</div>
                                            <div className="font-medium">Customer pays: ₦{customer.toLocaleString()}</div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                                <Input
                                    name="stock_quantity"
                                    type="number"
                                    value={formData.stock_quantity}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium">Product Images (Optional)</label>
                                {uploadingImages && (
                                    <span className="text-sm text-blue-600 flex items-center gap-1">
                                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                    </span>
                                )}
                            </div>
                            <label 
                                htmlFor="images" 
                                className="block border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                            >
                                <div className="text-center">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                    <div className="mt-4">
                                        <span className="text-base font-medium text-gray-900 group-hover:text-purple-700">
                                            Click to upload images
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB each</p>
                                </div>
                                <input
                                    id="images"
                                    name="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleImageUpload}
                                />
                            </label>

                            {/* Image Preview */}
                            {images.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                                {error.includes('Authentication') && (
                                    <div className="mt-2">
                                        <button 
                                            type="button"
                                            onClick={() => window.location.href = '/admin/login'}
                                            className="text-blue-600 underline text-sm"
                                        >
                                            Go to Login
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || uploadingImages || !formData.name || !formData.category_id || !formData.admin_price || !formData.stock_quantity}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? (editingProduct ? 'Updating Product...' : 'Creating Product...') : (editingProduct ? 'Update Product' : 'Create Product')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProductForm;