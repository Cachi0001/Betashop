require('dotenv').config();
const axios = require('axios');

const API_BASE = 'https://betashop-backend.vercel.app/api';

async function testProductionDeployment() {
  try {
    console.log('🚀 Testing Production Deployment...');
    console.log(`📡 API Base URL: ${API_BASE}\n`);

    // Test 1: Check if API is accessible
    console.log('1. Testing API accessibility...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/categories`, {
        timeout: 10000
      });
      console.log('✅ API is accessible');
      console.log(`   Full response:`, JSON.stringify(healthResponse.data, null, 2));
      
      if (healthResponse.data && healthResponse.data.data && healthResponse.data.data.categories) {
        console.log(`   Categories found: ${healthResponse.data.data.categories.length}`);
      } else {
        console.log('   ⚠️  Response structure is different than expected');
      }
    } catch (error) {
      console.log('❌ API is not accessible');
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data).substring(0, 500)}...`);
      }
      return;
    }

    // Test 2: Test admin login
    console.log('\n2. Testing admin login...');
    let authToken = '';
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'onyemechicaleb40@gmail.com',
        password: '111111111'
      }, { timeout: 10000 });
      
      authToken = loginResponse.data.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Admin: ${loginResponse.data.data.admin.full_name}`);
    } catch (error) {
      console.log('❌ Admin login failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return;
    }

    // Test 3: Test product listing (public endpoint)
    console.log('\n3. Testing product listing...');
    try {
      const productsResponse = await axios.get(`${API_BASE}/products`, {
        timeout: 10000
      });
      const products = productsResponse.data.data.products;
      console.log('✅ Product listing successful');
      console.log(`   Products found: ${products.length}`);
      
      if (products.length > 0) {
        const sampleProduct = products[0];
        console.log(`   Sample product: ${sampleProduct.name}`);
        console.log(`   Customer price: ₦${sampleProduct.customer_price}`);
        console.log(`   Admin price: ₦${sampleProduct.admin_price || 'N/A'}`);
        
        // Verify pricing structure
        if (sampleProduct.admin_price && sampleProduct.customer_price) {
          const expectedCustomerPrice = sampleProduct.admin_price + 5000 + Math.round(sampleProduct.admin_price * 0.07);
          const isPricingCorrect = sampleProduct.customer_price === expectedCustomerPrice;
          console.log(`   Pricing structure: ${isPricingCorrect ? '✅ Correct' : '❌ Incorrect'}`);
          if (!isPricingCorrect) {
            console.log(`   Expected: ₦${expectedCustomerPrice}, Actual: ₦${sampleProduct.customer_price}`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Product listing failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }

    // Test 4: Test image upload (if admin login worked)
    if (authToken) {
      console.log('\n4. Testing image upload...');
      try {
        const FormData = require('form-data');
        
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
          filename: 'test-production.png',
          contentType: 'image/png'
        });

        const uploadResponse = await axios.post(`${API_BASE}/upload/image`, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          },
          timeout: 15000
        });

        console.log('✅ Image upload successful');
        console.log(`   Image URL: ${uploadResponse.data.data.url}`);
        
        // Clean up - delete the test image
        const publicId = uploadResponse.data.data.public_id;
        const encodedPublicId = encodeURIComponent(publicId);
        await axios.delete(`${API_BASE}/upload/image/${encodedPublicId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 10000
        });
        console.log('✅ Test image cleaned up');
        
      } catch (error) {
        console.log('❌ Image upload failed');
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 5: Test CORS headers
    console.log('\n5. Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${API_BASE}/products`, {
        headers: {
          'Origin': 'https://betashop-navy.vercel.app',
          'Access-Control-Request-Method': 'GET'
        },
        timeout: 10000
      });
      
      const allowOrigin = corsResponse.headers['access-control-allow-origin'];
      const allowMethods = corsResponse.headers['access-control-allow-methods'];
      
      console.log('✅ CORS preflight successful');
      console.log(`   Allow-Origin: ${allowOrigin}`);
      console.log(`   Allow-Methods: ${allowMethods}`);
    } catch (error) {
      console.log('❌ CORS preflight failed');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n🎉 Production deployment test completed!');
    console.log('\n📝 Summary:');
    console.log(`   Frontend URL: https://betashop-navy.vercel.app/`);
    console.log(`   API Base URL: ${API_BASE}`);
    console.log(`   Admin Login: /admin/login`);
    console.log(`   Admin Dashboard: /admin/dashboard`);
    console.log(`   Pricing Structure: ₦5,000 base fee + 7%`);

  } catch (error) {
    console.error('\n❌ Production test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

testProductionDeployment();