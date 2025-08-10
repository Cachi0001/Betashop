// Test script to verify frontend API configuration
const fs = require('fs');
const path = require('path');

console.log('🔧 Frontend API Configuration Test');
console.log('=====================================');

// Read the .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';
let apiBaseUrl = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file content:');
  console.log(envContent);
  
  // Extract VITE_API_BASE_URL
  const match = envContent.match(/VITE_API_BASE_URL\s*=\s*(.+)/);
  if (match) {
    apiBaseUrl = match[1].trim();
  }
} catch (error) {
  console.log('❌ Could not read .env file:', error.message);
  process.exit(1);
}

console.log('');
console.log('🔍 Configuration Analysis:');
console.log(`Current API URL: ${apiBaseUrl}`);

// Check if the configuration is correct
if (apiBaseUrl === 'https://betashop-backend.vercel.app/api') {
  console.log('✅ Frontend is correctly configured to use deployed backend');
  console.log('   Ready for production deployment!');
} else if (apiBaseUrl.includes('localhost')) {
  console.log('❌ Frontend is still configured for local development');
  console.log('   This will cause API calls to fail in production');
} else if (apiBaseUrl.includes('betashop-backend')) {
  console.log('✅ Frontend is configured for deployed backend');
  console.log(`   Using: ${apiBaseUrl}`);
} else {
  console.log('⚠️  Frontend is configured for a different backend URL');
  console.log(`   Current: ${apiBaseUrl}`);
}

console.log('');
console.log('📋 Expected Configuration:');
console.log('  VITE_API_BASE_URL=https://betashop-backend.vercel.app/api');
console.log('');
console.log('📋 Current Configuration:');
console.log(`  VITE_API_BASE_URL=${apiBaseUrl}`);

console.log('');
if (apiBaseUrl === 'https://betashop-backend.vercel.app/api') {
  console.log('🚀 Next Step: Deploy frontend to apply this configuration');
  console.log('   Command: vercel --prod');
} else {
  console.log('🔧 Next Step: Update .env file with correct backend URL');
}