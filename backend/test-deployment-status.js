require('dotenv').config();
const axios = require('axios');

async function testDeploymentStatus() {
  try {
    console.log('🔍 Testing Backend Deployment Status...\n');

    const API_BASE = 'https://betashop-backend.vercel.app/api';
    
    // Test 1: Check if the backend is responding
    console.log('1. Testing backend accessibility...');
    try {
      const response = await axios.get(`${API_BASE}/categories`, { timeout: 10000 });
      console.log('✅ Backend is accessible');
      console.log(`   Response time: ${response.headers['x-response-time'] || 'N/A'}`);
    } catch (error) {
      console.log('❌ Backend is not accessible');
      console.log(`   Error: ${error.message}`);
      return;
    }

    // Test 2: Check CORS headers in detail
    console.log('\n2. Checking CORS configuration...');
    try {
      const corsResponse = await axios.options(`${API_BASE}/products`, {
        headers: {
          'Origin': 'https://betashop-navy.vercel.app',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Cache-Control, Pragma, Authorization'
        },
        timeout: 10000
      });
      
      const allowHeaders = corsResponse.headers['access-control-allow-headers'];
      console.log('✅ CORS preflight response received');
      console.log(`   Allowed headers: ${allowHeaders}`);
      
      // Check each header individually
      const requiredHeaders = ['Cache-Control', 'Pragma', 'Authorization'];
      requiredHeaders.forEach(header => {
        if (allowHeaders && allowHeaders.includes(header)) {
          console.log(`   ✅ ${header}: Allowed`);
        } else {
          console.log(`   ❌ ${header}: NOT Allowed`);
        }
      });
      
    } catch (error) {
      console.log('❌ CORS preflight failed');
      console.log(`   Error: ${error.message}`);
    }

    // Test 3: Simulate the exact frontend request
    console.log('\n3. Simulating frontend request...');
    try {
      const frontendRequest = await axios.get(`${API_BASE}/products`, {
        params: {
          limit: 12,
          _t: Date.now()
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });
      
      console.log('✅ Frontend-style request successful');
      console.log(`   Products returned: ${frontendRequest.data.data.products.length}`);
      
    } catch (error) {
      console.log('❌ Frontend-style request failed');
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
      }
    }

    console.log('\n📋 Deployment Status Summary:');
    console.log('   Backend URL: https://betashop-backend.vercel.app');
    console.log('   Frontend URL: https://betashop-navy.vercel.app');
    console.log('   Issue: Pragma header not allowed in CORS');
    console.log('   Solution: Backend needs to be redeployed with updated CORS config');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
  }
}

testDeploymentStatus();