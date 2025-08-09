require('dotenv').config();

async function testAuthDebug() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'onyemechicaleb4@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful');
    console.log('🔍 Token (first 50 chars):', token.substring(0, 50));
    
    console.log('\n📋 Making orders API request with detailed headers...');
    const ordersResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      }
    });
    
    console.log('📋 Response status:', ordersResponse.status);
    console.log('📋 Response headers:', Object.fromEntries(ordersResponse.headers.entries()));
    
    const ordersData = await ordersResponse.json();
    console.log('📋 Response body:', JSON.stringify(ordersData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthDebug();