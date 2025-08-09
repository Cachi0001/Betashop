require('dotenv').config();

async function testOrdersAPI() {
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
    
    console.log('\n📋 Testing orders API...');
    const ordersResponse = await fetch('http://localhost:3000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const ordersData = await ordersResponse.json();
    console.log('📋 Orders API Response:', JSON.stringify(ordersData, null, 2));
    
    if (ordersData.success) {
      console.log('✅ Orders API working:', ordersData.data?.orders?.length || 0, 'orders found');
      
      if (ordersData.data.orders && ordersData.data.orders.length > 0) {
        console.log('\n📦 Order Details:');
        ordersData.data.orders.forEach((order, index) => {
          console.log(`\n   Order ${index + 1}:`);
          console.log(`   ID: ${order.id}`);
          console.log(`   Customer: ${order.customer_name}`);
          console.log(`   Email: ${order.customer_email}`);
          console.log(`   Total: ₦${order.total_amount}`);
          console.log(`   Payment Status: ${order.payment_status}`);
          console.log(`   Order Status: ${order.order_status}`);
          console.log(`   Items: ${order.order_items?.length || 0}`);
          console.log(`   Created: ${order.created_at}`);
        });
      }
    } else {
      console.log('❌ Orders API failed:', ordersData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrdersAPI();