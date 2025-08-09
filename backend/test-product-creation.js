// Test script to debug product creation
const { supabaseAdmin } = require('./src/config/database.config');

async function testProductCreation() {
  console.log('🧪 Testing product creation...');
  
  try {
    // First, let's check if the products table exists and its structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(1);
    
    console.log('📋 Products table query result:', tableInfo);
    console.log('📋 Products table error:', tableError);
    
    // Test creating a simple product
    const testProduct = {
      admin_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      category_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      admin_price: 100.00,
      customer_price: 107.50,
      stock_quantity: 10,
      attributes: {},
      images: [],
      location: {
        street: 'Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      status: 'active'
    };
    
    console.log('🧪 Attempting to insert test product:', JSON.stringify(testProduct, null, 2));
    
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    console.log('✅ Insert result:', JSON.stringify(insertResult, null, 2));
    console.log('❌ Insert error:', insertError);
    
    // Clean up - delete the test product if it was created
    if (insertResult && insertResult.id) {
      await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', insertResult.id);
      console.log('🧹 Test product cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testProductCreation();