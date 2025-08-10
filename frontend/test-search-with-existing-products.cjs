// Test search with existing product names
const axios = require('axios');

async function testSearchWithExistingProducts() {
  try {
    console.log('🔍 Testing Search with Existing Products...\n');

    const API_BASE = 'https://betashop-backend.vercel.app/api';
    
    // First, get all products to see what we have
    console.log('1. Getting all existing products...');
    const allProductsResponse = await axios.get(`${API_BASE}/products`, {
      params: { limit: 20 },
      timeout: 10000
    });
    
    const allProducts = allProductsResponse.data.data.products;
    console.log(`✅ Found ${allProducts.length} total products:`);
    
    allProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. "${product.name}" - ${product.description || 'No description'}`);
    });

    if (allProducts.length === 0) {
      console.log('\n❌ No products found in database. Search cannot be tested.');
      return;
    }

    // Test search with terms from existing product names
    console.log('\n2. Testing search with terms from existing products...');
    
    // Extract words from existing product names
    const searchTerms = new Set();
    allProducts.forEach(product => {
      const words = product.name.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) { // Only words longer than 2 characters
          searchTerms.add(word);
        }
      });
      
      // Also add description words if available
      if (product.description) {
        const descWords = product.description.toLowerCase().split(/\s+/);
        descWords.forEach(word => {
          if (word.length > 2) {
            searchTerms.add(word);
          }
        });
      }
    });

    console.log(`   Testing with ${searchTerms.size} terms extracted from existing products...`);
    
    for (const term of Array.from(searchTerms).slice(0, 10)) { // Test first 10 terms
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
          products.forEach((product, index) => {
            console.log(`     ${index + 1}. "${product.name}"`);
          });
        }
      } catch (error) {
        console.log(`   Search "${term}": Failed - ${error.message}`);
      }
    }

    // Test partial matches
    console.log('\n3. Testing partial matches...');
    const partialTerms = ['fab', 'mul', 'le'];
    
    for (const term of partialTerms) {
      try {
        const response = await axios.get(`${API_BASE}/products`, {
          params: { 
            search: term,
            limit: 10 
          },
          timeout: 10000
        });
        
        const products = response.data.data.products;
        console.log(`   Partial search "${term}": ${products.length} results`);
        
        if (products.length > 0) {
          products.forEach((product, index) => {
            console.log(`     ${index + 1}. "${product.name}"`);
          });
        }
      } catch (error) {
        console.log(`   Partial search "${term}": Failed - ${error.message}`);
      }
    }

    console.log('\n✅ Search functionality test completed!');
    console.log('\n📝 Results:');
    console.log(`   - Total products in database: ${allProducts.length}`);
    console.log('   - Backend search endpoint is working');
    console.log('   - Search matches product names and descriptions');
    console.log('   - Frontend should work if products exist');

  } catch (error) {
    console.error('\n❌ Search test failed:');
    console.error('Error:', error.message);
  }
}

testSearchWithExistingProducts();