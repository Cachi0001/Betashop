require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');

async function checkOrders() {
  try {
    console.log('🔍 Checking orders in database...');
    
    // Check all orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log('📋 Total orders in database:', orders?.length || 0);
    
    if (orders && orders.length > 0) {
      console.log('\n📦 Orders:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ID: ${order.id.substring(0, 8)}...`);
        console.log(`      Customer: ${order.customer_name}`);
        console.log(`      Email: ${order.customer_email}`);
        console.log(`      Total: ₦${order.total_amount}`);
        console.log(`      Payment: ${order.payment_status}`);
        console.log(`      Status: ${order.order_status}`);
        console.log(`      Created: ${order.created_at}`);
        console.log('');
      });
    }
    
    // Check order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*');
    
    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      return;
    }
    
    console.log('📦 Total order items in database:', orderItems?.length || 0);
    
    if (orderItems && orderItems.length > 0) {
      console.log('\n🛒 Order Items:');
      orderItems.forEach((item, index) => {
        console.log(`   ${index + 1}. Order: ${item.order_id.substring(0, 8)}...`);
        console.log(`      Product: ${item.product_id.substring(0, 8)}...`);
        console.log(`      Admin: ${item.admin_id.substring(0, 8)}...`);
        console.log(`      Quantity: ${item.quantity}`);
        console.log(`      Price: ₦${item.total_price}`);
        console.log('');
      });
    }
    
    // Check for specific admin
    const adminId = '75bfeeb0-501a-480f-89e1-df41522a2845'; // simple@example.com
    console.log(`\n🔍 Checking orders for admin: ${adminId}`);
    
    const { data: adminOrders, error: adminOrdersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items!inner (
          *,
          products (
            id,
            name,
            slug,
            images,
            customer_price
          )
        )
      `)
      .eq('order_items.admin_id', adminId);
    
    if (adminOrdersError) {
      console.error('❌ Error fetching admin orders:', adminOrdersError);
      return;
    }
    
    console.log('📋 Orders for this admin:', adminOrders?.length || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkOrders();