// Test search functionality
const axios = require('axios');

async function testSearchFunctionality() {
  try {
    console.log('🔍 Testing Search Functionality...\n');

    const API_BASE = 'https://betashop-backend.vercel.app/api';
    
    // Test 1: Search for products without search query (should return all)
    console.log('1. Testing products endpoint without search...');
    try {
      const response = await axios.get(`${API_BASE}/products`, {
        params: { limit: 5 },
        timeout: 10000
      });
      
      const products = response.data.data.products;
      console.log(`✅ Found ${products.length} products without search`);
      
      if (products.length > 0) {
        console.log(`   Sample product: "${products[0].name}"`);
      }
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.message);
      return;
    }

    // Test 2: Search with a common term
    console.log('\n2. Testing search with common terms...');
    const searchTerms = ['shoes', 'sandals', 'black', 'brown', 'cover'];
    
    for (const term of searchTerms) {
      try {
        const response = await axios.get(`${API_BASE}/products`, {
          params: { 
            search: term,
            limit: 10 
          },
          timeout: 10000
        });
        
        const products = response.data.data.products;
        console.log(`   Search "${term}": ${products.length} results`);
        
        if (products.length > 0) {
          const sampleProduct = products[0];
          console.log(`     Sample: "${sampleProduct.name}"`);
        }
      } catch (error) {
        console.log(`   Search "${term}": Failed - ${error.message}`);
      }
    }

    // Test 3: Search with specific product names from our generator
    console.log('\n3. Testing search with specific terms...');
    const specificTerms = ['slip', 'comfort', 'easy', 'traditional'];
    
    for (const term of specificTerms) {
      try {
        const response = await axios.get(`${API_BASE}/products`, {
          params: { 
            search: term,
            limit: 10 
          },
          timeout: 10000
        });
        
        const products = response.data.data.products;
        console.log(`   Search "${term}": ${products.length} results`);
        
        // Show matching products
        products.forEach((product, index) => {
          if (index < 2) { // Show first 2 results
            console.log(`     ${index + 1}. "${product.name}"`);
          }
        });
      } catch (error) {
        console.log(`   Search "${term}": Failed - ${error.message}`);
      }
    }

    // Test 4: Test empty search
    console.log('\n4. Testing empty search...');
    try {
      const response = await axios.get(`${API_BASE}/products`, {
        params: { 
          search: '',
          limit: 5 
        },
        timeout: 10000
      });
      
      const products = response.data.data.products;
      console.log(`✅ Empty search returned ${products.length} products (should return all)`);
    } catch (error) {
      console.log('❌ Empty search failed:', error.message);
    }

    console.log('\n📋 Search Functionality Summary:');
    console.log('   Backend endpoint: /api/products?search=query');
    console.log('   Search fields: product name and description');
    console.log('   Search type: Case-insensitive partial match');
    console.log('   Frontend: ModernHeader dispatches searchProducts thunk');

  } catch (error) {
    console.error('\n❌ Search test failed:');
    console.error('Error:', error.message);
  }
}

testSearchFunctionality();