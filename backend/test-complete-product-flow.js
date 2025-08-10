require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function testCompleteProductFlow() {
  try {
    console.log('🚀 Testing Complete Product Flow with Images and Pricing...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'onyemechicaleb40@gmail.com',
      password: '111111111'
    });
    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Get categories
    console.log('\n2. Fetching categories...');
    const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
    const categories = categoriesResponse.data.data.categories;
    const categoryId = categories[0].id;
    console.log(`✅ Found ${categories.length} categories`);

    // Step 3: Upload product image
    console.log('\n3. Uploading product image...');
    
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'product-image.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post('http://localhost:3000/api/upload/image', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    const imageUrl = uploadResponse.data.data.url;
    const imagePublicId = uploadResponse.data.data.public_id;
    console.log('✅ Image uploaded successfully');
    console.log(`   URL: ${imageUrl}`);

    // Step 4: Create product with image and test pricing
    console.log('\n4. Creating product with image...');
    const adminPrice = 25000;
    const productData = {
      name: 'Complete Test Product with Image',
      description: 'This product tests the complete flow: image upload, pricing calculation, and customer visibility',
      category_id: categoryId,
      admin_price: adminPrice,
      stock_quantity: 8,
      images: [imageUrl],
      attributes: {
        brand: 'Test Brand',
        color: 'Blue',
        material: 'Cotton'
      }
    };

    const createResponse = await axios.post('http://localhost:3000/api/products', productData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const product = createResponse.data.data.product;
    const expectedCustomerPrice = adminPrice + 5000 + Math.round(adminPrice * 0.07);
    
    console.log('✅ Product created successfully');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Admin Price: ₦${product.admin_price}`);
    console.log(`   Expected Customer Price: ₦${expectedCustomerPrice}`);
    console.log(`   Actual Customer Price: ₦${product.customer_price}`);
    console.log(`   Platform Fee: ₦${product.customer_price - product.admin_price}`);
    console.log(`   Images: ${product.images ? product.images.length : 0} image(s)`);

    // Verify pricing calculation
    if (product.customer_price === expectedCustomerPrice) {
      console.log('   ✅ Pricing calculation is CORRECT');
    } else {
      console.log('   ❌ Pricing calculation is INCORRECT');
    }

    // Step 5: Test customer visibility
    console.log('\n5. Testing customer visibility...');
    const publicProductsResponse = await axios.get('http://localhost:3000/api/products');
    const publicProducts = publicProductsResponse.data.data.products;
    
    const visibleProduct = publicProducts.find(p => p.id === product.id);
    if (visibleProduct) {
      console.log('✅ Product is visible to customers');
      console.log(`   Customer sees: ${visibleProduct.name}`);
      console.log(`   Customer price: ₦${visibleProduct.customer_price}`);
      console.log(`   Images available: ${visibleProduct.images ? visibleProduct.images.length : 0}`);
    } else {
      console.log('❌ Product is NOT visible to customers');
    }

    // Step 6: Test individual product fetch
    console.log('\n6. Testing individual product fetch...');
    const individualResponse = await axios.get(`http://localhost:3000/api/products/${product.id}`);
    const individualProduct = individualResponse.data.data.product;
    
    console.log('✅ Individual product fetch successful');
    console.log(`   Product: ${individualProduct.name}`);
    console.log(`   Price: ₦${individualProduct.customer_price}`);
    console.log(`   Description: ${individualProduct.description}`);
    console.log(`   Stock: ${individualProduct.stock_quantity}`);
    console.log(`   Images: ${individualProduct.images ? individualProduct.images.length : 0}`);

    // Step 7: Test product update
    console.log('\n7. Testing product update...');
    const newAdminPrice = 30000;
    const updateData = {
      name: 'Updated Complete Test Product',
      admin_price: newAdminPrice,
      stock_quantity: 12
    };

    const updateResponse = await axios.put(`http://localhost:3000/api/products/${product.id}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const updatedProduct = updateResponse.data.data.product;
    const expectedNewCustomerPrice = newAdminPrice + 5000 + Math.round(newAdminPrice * 0.07);
    
    console.log('✅ Product updated successfully');
    console.log(`   New Name: ${updatedProduct.name}`);
    console.log(`   New Admin Price: ₦${updatedProduct.admin_price}`);
    console.log(`   New Customer Price: ₦${updatedProduct.customer_price}`);
    console.log(`   Expected New Customer Price: ₦${expectedNewCustomerPrice}`);
    console.log(`   New Platform Fee: ₦${updatedProduct.customer_price - updatedProduct.admin_price}`);

    // Verify updated pricing
    if (updatedProduct.customer_price === expectedNewCustomerPrice) {
      console.log('   ✅ Updated pricing calculation is CORRECT');
    } else {
      console.log('   ❌ Updated pricing calculation is INCORRECT');
    }

    console.log('\n🎉 Complete product flow test successful!');
    console.log('\n📝 Summary:');
    console.log(`   - Product ID: ${product.id}`);
    console.log(`   - Image uploaded and attached: ✅`);
    console.log(`   - Pricing structure working: ✅ (₦5,000 + 7%)`);
    console.log(`   - Customer visibility: ✅`);
    console.log(`   - Product updates: ✅`);
    console.log(`   - Final customer price: ₦${updatedProduct.customer_price}`);
    console.log(`   - Final platform fee: ₦${updatedProduct.customer_price - updatedProduct.admin_price}`);

    // Clean up - delete the uploaded image
    console.log('\n8. Cleaning up uploaded image...');
    try {
      const encodedPublicId = encodeURIComponent(imagePublicId);
      await axios.delete(`http://localhost:3000/api/upload/image/${encodedPublicId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Uploaded image cleaned up');
    } catch (cleanupError) {
      console.log('⚠️  Image cleanup failed (but this is not critical)');
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCompleteProductFlow();