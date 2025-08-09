require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');

async function checkProductsAdmin() {
  try {
    console.log('🔍 Checking products and their admins...');
    
    // Get all products with admin info
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        admin_id,
        stock_quantity,
        customer_price,
        admins (
          id,
          email,
          business_name
        )
      `);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    console.log('📦 Total products:', products?.length || 0);
    
    if (products && products.length > 0) {
      console.log('\n📦 Products and their admins:');
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Product ID: ${product.id.substring(0, 8)}...`);
        console.log(`      Admin ID: ${product.admin_id.substring(0, 8)}...`);
        console.log(`      Admin Email: ${product.admins?.email || 'Unknown'}`);
        console.log(`      Business: ${product.admins?.business_name || 'Unknown'}`);
        console.log(`      Stock: ${product.stock_quantity}`);
        console.log(`      Price: ₦${product.customer_price}`);
        console.log('');
      });
    }
    
    // Check which admin we're testing with
    const testAdminId = '75bfeeb0-501a-480f-89e1-df41522a2845';
    const { data: testAdmin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', testAdminId)
      .single();
    
    if (adminError) {
      console.error('❌ Error fetching test admin:', adminError);
      return;
    }
    
    console.log('👤 Test admin details:');
    console.log(`   Email: ${testAdmin.email}`);
    console.log(`   Business: ${testAdmin.business_name}`);
    console.log(`   ID: ${testAdmin.id}`);
    
    // Check if test admin has any products
    const adminProducts = products.filter(p => p.admin_id === testAdminId);
    console.log(`\n📦 Products owned by test admin: ${adminProducts.length}`);
    
    if (adminProducts.length === 0) {
      console.log('⚠️ Test admin has no products. This is why no orders are showing.');
      console.log('💡 Solution: Either create products for this admin or test with an admin who has products.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductsAdmin();