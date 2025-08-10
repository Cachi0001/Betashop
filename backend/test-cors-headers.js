require('dotenv').config();
const axios = require('axios');

async function testCorsHeaders() {
    try {
        console.log('🔍 Testing CORS Headers Configuration...\n');

        const API_BASE = 'https://betashop-backend.vercel.app/api';

        // Test CORS preflight with the headers that the frontend is sending
        console.log('1. Testing CORS preflight with Cache-Control and Pragma headers...');

        try {
            const corsResponse = await axios.options(`${API_BASE}/products`, {
                headers: {
                    'Origin': 'https://betashop-navy.vercel.app',
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Cache-Control, Pragma'
                },
                timeout: 10000
            });

            const allowOrigin = corsResponse.headers['access-control-allow-origin'];
            const allowMethods = corsResponse.headers['access-control-allow-methods'];
            const allowHeaders = corsResponse.headers['access-control-allow-headers'];

            console.log('✅ CORS preflight successful');
            console.log(`   Allow-Origin: ${allowOrigin}`);
            console.log(`   Allow-Methods: ${allowMethods}`);
            console.log(`   Allow-Headers: ${allowHeaders}`);

            // Check if Pragma is included
            if (allowHeaders && allowHeaders.includes('Pragma')) {
                console.log('✅ Pragma header is allowed');
            } else {
                console.log('❌ Pragma header is NOT allowed');
                console.log('   This will cause CORS errors');
            }

            // Check if Cache-Control is included
            if (allowHeaders && allowHeaders.includes('Cache-Control')) {
                console.log('✅ Cache-Control header is allowed');
            } else {
                console.log('❌ Cache-Control header is NOT allowed');
            }

        } catch (error) {
            console.log('❌ CORS preflight failed');
            console.log(`   Error: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
            }
        }

        // Test actual API call with the problematic headers
        console.log('\n2. Testing actual API call with Cache-Control and Pragma headers...');

        try {
            const apiResponse = await axios.get(`${API_BASE}/products`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                timeout: 10000
            });

            console.log('✅ API call successful with cache headers');
            console.log(`   Products found: ${apiResponse.data.data.products.length}`);

        } catch (error) {
            console.log('❌ API call failed');
            console.log(`   Error: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
            }
        }

        console.log('\n🎯 Summary:');
        console.log('   Frontend URL: https://betashop-navy.vercel.app');
        console.log('   Backend URL: https://betashop-backend.vercel.app');
        console.log('   Headers being sent: Cache-Control, Pragma');
        console.log('   CORS should allow both headers for successful requests');

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('Error:', error.message);
    }
}

testCorsHeaders();