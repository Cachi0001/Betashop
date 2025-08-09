// Test script to verify JWT token functionality
const jwt = require('jsonwebtoken');
require('dotenv').config();

function testTokenGeneration() {
    console.log('🧪 Testing JWT token generation and verification...');

    // Check if JWT_SECRET exists
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔑 JWT_SECRET preview:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'Missing');

    // Test token generation
    const testPayload = {
        id: '12345678-1234-1234-1234-123456789012',
        email: 'test@example.com',
        role: 'admin'
    };

    try {
        // Generate token
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ Token generated successfully');
        console.log('🎫 Token preview:', token.substring(0, 50) + '...');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified successfully');
        console.log('📋 Decoded payload:', JSON.stringify(decoded, null, 2));

        return true;
    } catch (error) {
        console.log('❌ Token test failed:', error.message);
        return false;
    }
}

// Run the test
testTokenGeneration();