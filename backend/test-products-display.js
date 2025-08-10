const { supabaseAdmin } = require('./src/config/database.config');

async function testProductsDisplay() {
  try {
    console.log('🔍 Testing products display...');
    
    // Check if there are any products in the database
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(name, slug),
        admins(business_name, address)
      `)
      .eq('is_deleted', false)
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log('📊 Products found:', products.length);
    
    if (products.length === 0) {
      console.log('⚠️ No products found in database');
      
      // Check if there are any products at all (including deleted)
      const { data: allProducts, error: allError } = await supabaseAdmin
        .from('products')
        .select('id, name, is_deleted')
        .limit(10);
      
      if (allError) {
        console.error('❌ Error checking all products:', allError);
      } else {
        console.log('📊 Total products (including deleted):', allProducts.length);
        allProducts.forEach(p => {
          console.log(`  - ${p.name} (deleted: ${p.is_deleted})`);
        });
      }
    } else {
      console.log('✅ Products found:');
      products.forEach(product => {
        console.log(`  - ${product.name}`);
        console.log(`    Admin Price: ₦${product.admin_price}`);
        console.log(`    Customer Price: ₦${product.customer_price}`);
        console.log(`    Images: ${product.images ? product.images.length : 0}`);
        console.log(`    Stock: ${product.stock_quantity}`);
        console.log(`    Business: ${product.admins?.business_name || 'Unknown'}`);
        console.log('');
      });
    }
    
    // Test the API endpoint
    console.log('🌐 Testing API endpoint...');
    const API_BASE = process.env.NODE_ENV === 'production' 
      ? 'https://your-production-url.com/api'
      : 'http://localhost:3000/api';
    
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response:', JSON.stringify(data, null, 2));
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductsDisplay();