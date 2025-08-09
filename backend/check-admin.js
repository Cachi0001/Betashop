require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking existing admins...');
    
    // Check existing admins
    const { data: admins, error: fetchError } = await supabaseAdmin
      .from('admins')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching admins:', fetchError);
      return;
    }
    
    console.log('📋 Found', admins?.length || 0, 'admins');
    
    if (admins && admins.length > 0) {
      console.log('👤 Existing admins:');
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} - ${admin.business_name || 'No business name'}`);
      });
    } else {
      console.log('🆕 No admins found. Creating default admin...');
      
      // Create default admin
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const { data: newAdmin, error: createError } = await supabaseAdmin
        .from('admins')
        .insert({
          email: 'admin@example.com',
          password_hash: hashedPassword,
          full_name: 'Test Admin',
          business_name: 'Test Business',
          whatsapp_number: '+2348123456789',
          address: {
            street: '123 Test Street',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria'
          },
          is_verified: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }
      
      console.log('✅ Default admin created successfully!');
      console.log('   Email: admin@example.com');
      console.log('   Password: password123');
    }
    
    // Test login
    console.log('\n🔐 Testing admin login...');
    const fetch = (await import('node-fetch')).default;
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful!');
      console.log('   Token:', loginData.data.token.substring(0, 20) + '...');
      
      // Test orders API
      console.log('\n📋 Testing orders API...');
      const ordersResponse = await fetch('http://localhost:3000/api/orders', {
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const ordersData = await ordersResponse.json();
      if (ordersData.success) {
        console.log('✅ Orders API working:', ordersData.data?.orders?.length || 0, 'orders found');
      } else {
        console.log('❌ Orders API failed:', ordersData.error);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndCreateAdmin();