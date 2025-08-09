// Test script to check admin access
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('./src/config/database.config');
require('dotenv').config();

async function testAdminAccess() {
  console.log('🧪 Testing admin access...');
  
  try {
    // First, let's see if we can connect to the database
    const { data: adminCount, error: countError } = await supabaseAdmin
      .from('admins')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total admins in database:', adminCount);
    console.log('📊 Database connection error:', countError);
    
    // Get a sample admin
    const { data: sampleAdmin, error: sampleError } = await supabaseAdmin
      .from('admins')
      .select('id, email, business_name, created_at')
      .limit(1);
    
    console.log('👤 Sample admin:', sampleAdmin);
    console.log('👤 Sample admin error:', sampleError);
    
    if (sampleAdmin && sampleAdmin.length > 0) {
      const admin = sampleAdmin[0];
      
      // Test token generation for this admin
      const testToken = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('🎫 Generated test token for admin:', admin.email);
      console.log('🎫 Token preview:', testToken.substring(0, 50) + '...');
      
      // Test token verification
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('📋 Decoded token:', JSON.stringify(decoded, null, 2));
      
      // Test admin lookup with decoded ID
      const { data: foundAdmin, error: lookupError } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('id', decoded.id)
        .single();
      
      console.log('🔍 Admin lookup result:', foundAdmin ? 'Found' : 'Not found');
      console.log('🔍 Admin lookup error:', lookupError);
      
      if (foundAdmin) {
        console.log('✅ Complete authentication flow test PASSED');
        console.log('👤 Found admin:', {
          id: foundAdmin.id,
          email: foundAdmin.email,
          business_name: foundAdmin.business_name
        });
      } else {
        console.log('❌ Admin lookup failed');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testAdminAccess();