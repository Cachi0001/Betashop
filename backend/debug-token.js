require('dotenv').config();
const jwt = require('jsonwebtoken');

async function debugToken() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'simple@example.com',
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
    console.log('🔍 Token:', token.substring(0, 50) + '...');
    
    // Decode the token to see what's inside
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Decoded token:', JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Token decode error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugToken();