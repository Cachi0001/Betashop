require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    const email = 'onyemechicaleb4@gmail.com';
    const newPassword = 'password123';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the admin password
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .update({ password_hash: hashedPassword })
      .eq('email', email)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }
    
    console.log('✅ Password updated successfully for:', email);
    console.log('   New password: password123');
    
    // Test login
    console.log('\n🔐 Testing login...');
    const fetch = (await import('node-fetch')).default;
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: newPassword
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetAdminPassword();