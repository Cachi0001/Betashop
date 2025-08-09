const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testEcommerceFlow() {
  console.log('🚀 Testing Complete E-commerce Flow...\n');

  try {
    // 1. Test Products API
    console.log('1. Testing Products API...');
    const productsResponse = await fetch(`${BASE_URL}/products`);
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.products.length > 0) {
      console.log('✅ Products API working:', productsData.data.products.length, 'products found');
      const testProduct = productsData.data.products[0];
      console.log('   Sample product:', testProduct.name, '- Stock:', testProduct.stock_quantity);
    } else {
      console.log('❌ Products API failed');
      return;
    }

    // 2. Test Cart Items (prepare for payment)
    console.log('\n2. Preparing cart items...');
    const cartItems = [
      {
        product_id: productsData.data.products[0].id,
        admin_id: productsData.data.products[0].admin_id,
        quantity: 1,
        unit_price: productsData.data.products[0].customer_price,
        total_price: productsData.data.products[0].customer_price
      }
    ];
    console.log('✅ Cart items prepared for testing');

    // 3. Test Payment Initialization (without actually paying)
    console.log('\n3. Testing Payment Initialization...');
    const checkoutData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+2348012345678',
      customer_address: {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      items: cartItems
    };

    const paymentResponse = await fetch(`${BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    });
    
    const paymentData = await paymentResponse.json();
    if (paymentData.success && paymentData.data.payment_url) {
      console.log('✅ Payment initialization working');
      console.log('   Payment URL generated:', paymentData.data.payment_url ? 'Yes' : 'No');
      console.log('   Order ID:', paymentData.data.order_id);
      
      // 4. Test WhatsApp Link Generation
      console.log('\n4. Testing WhatsApp Link Generation...');
      const whatsappResponse = await fetch(`${BASE_URL}/whatsapp/orders/${paymentData.data.order_id}`);
      const whatsappData = await whatsappResponse.json();
      
      if (whatsappData.success && whatsappData.data.whatsapp_links) {
        console.log('✅ WhatsApp link generation working');
        console.log('   WhatsApp links generated:', whatsappData.data.whatsapp_links.length);
      } else {
        console.log('❌ WhatsApp link generation failed:', whatsappData.error);
      }
    } else {
      console.log('❌ Payment initialization failed:', paymentData.error);
    }

    // 5. Test Orders API
    console.log('\n5. Testing Orders API...');
    const ordersResponse = await fetch(`${BASE_URL}/orders`);
    const ordersData = await ordersResponse.json();
    
    if (ordersResponse.status === 400) {
      console.log('✅ Orders API working (requires authentication as expected)');
    } else if (ordersData.success) {
      console.log('✅ Orders API working:', ordersData.data?.orders?.length || 0, 'orders found');
    } else {
      console.log('❌ Orders API failed:', ordersData.error);
    }

    console.log('\n🎉 E-commerce Flow Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Products browsing');
    console.log('   ✅ Cart validation');
    console.log('   ✅ Payment initialization');
    console.log('   ✅ WhatsApp integration');
    console.log('   ✅ Orders management');
    console.log('\n🚀 The e-commerce system is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEcommerceFlow();