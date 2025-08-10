// Test script to verify frontend API configuration
import { API_BASE } from './src/lib/apiBase.js';

console.log('🔧 Frontend API Configuration Test');
console.log('=====================================');
console.log(`API_BASE: ${API_BASE}`);
console.log('');

// Check if the API_BASE is correctly set
if (API_BASE === 'https://betashop-backend.vercel.app/api') {
    console.log('✅ Frontend is correctly configured to use deployed backend');
} else if (API_BASE.includes('localhost')) {
    console.log('❌ Frontend is still configured for local development');
    console.log('   Update VITE_API_BASE_URL in .env file');
} else {
    console.log('⚠️  Frontend is configured for a different backend URL');
}

console.log('');
console.log('Expected Configuration:');
console.log('  VITE_API_BASE_URL=https://betashop-backend.vercel.app/api');
console.log('');
console.log('Current Configuration:');
console.log(`  VITE_API_BASE_URL=${process.env.VITE_API_BASE_URL || 'not set'}`);