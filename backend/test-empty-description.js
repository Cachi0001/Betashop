require('dotenv').config();
const axios = require('axios');

async function testEmptyDescription() {
  try {
    console.log('🧪 Testing empty description...\n');

    // Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'producttest@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.data.token;

    // Get categories
    const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
    const categories = categoriesResponse.data.data.categories;

    // Test with empty description
    const productData = {
      name: 'Test Product Empty Description',
      description: '', // Empty description
      category_id: categories[0].id,
      admin_price: 1000,
      stock_quantity: 5
    };

    const createResponse = await axios.post('http://localhost:3000/api/products', productData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Product created successfully with empty description!');
    console.log(`   Product ID: ${createResponse.data.data.product.id}`);
    console.log(`   Name: ${createResponse.data.data.product.name}`);
    console.log(`   Description: "${createResponse.data.data.product.description}"`);

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEmptyDescription();