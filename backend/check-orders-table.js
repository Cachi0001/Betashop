require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrdersTable() {
  console.log('🔍 Checking orders table structure...');
  
  try {
    // Try to select from orders table to see if it exists
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Orders table error:', error.message);
      
      if (error.message.includes('does not exist')) {
        console.log('📝 Orders table does not exist. Creating it...');
        
        // Create the orders table
        const { error: createError } = await supabase.rpc('exec', {
          sql: `
            CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              customer_name VARCHAR(255) NOT NULL,
              customer_email VARCHAR(255) NOT NULL,
              customer_phone VARCHAR(20) NOT NULL,
              customer_address JSONB NOT NULL,
              total_amount DECIMAL(10,2) NOT NULL,
              payment_reference VARCHAR(255) UNIQUE NOT NULL,
              payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed')),
              order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
        
        if (createError) {
          console.log('❌ Failed to create orders table:', createError.message);
        } else {
          console.log('✅ Orders table created successfully');
        }
      }
    } else {
      console.log('✅ Orders table exists and is accessible');
      console.log('📊 Sample data:', data);
    }
    
    // Check if customer_address column exists by trying to insert a test record
    console.log('🔍 Testing customer_address column...');
    
    const testOrder = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+2348012345678',
      customer_address: {
        street: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      total_amount: 1000.00,
      payment_reference: 'test_ref_' + Date.now()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      
      if (insertError.message.includes('customer_address')) {
        console.log('📝 customer_address column missing. Need to run database migration.');
      }
    } else {
      console.log('✅ Insert test successful. Schema is correct.');
      console.log('📊 Test order created:', insertData.id);
      
      // Clean up test order
      await supabase.from('orders').delete().eq('id', insertData.id);
      console.log('🧹 Test order cleaned up');
    }
    
  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
  }
}

checkOrdersTable();