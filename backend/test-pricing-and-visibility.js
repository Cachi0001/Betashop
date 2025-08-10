require('dotenv').config();
const axios = require('axios');

async function testPricingAndVisibility() {
    try {
        console.log('🚀 Testing Pricing Structure and Product Visibility...\n');

        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'onyemechicaleb40@gmail.com',
            password: '111111111'
        });
        const authToken = loginResponse.data.data.token;
        console.log('✅ Admin logged in successfully');

        // Step 2: Get categories
        console.log('\n2. Fetching categories...');
        const categoriesResponse = await axios.get('http://localhost:3000/api/categories');
        const categories = categoriesResponse.data.data.categories;
        const categoryId = categories[0].id;
        console.log(`✅ Found ${categories.length} categories`);

        // Step 3: Test pricing calculation with different admin prices
        console.log('\n3. Testing pricing structure...');
        const testPrices = [1000, 5000, 10000, 50000];

        for (const adminPrice of testPrices) {
            console.log(`\n   Testing admin_price: ₦${adminPrice}`);

            const productData = {
                name: `Test Product - ₦${adminPrice}`,
                description: `Testing pricing with admin price of ₦${adminPrice}`,
                category_id: categoryId,
                admin_price: adminPrice,
                stock_quantity: 10
            };

            const createResponse = await axios.post('http://localhost:3000/api/products', productData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const product = createResponse.data.data.product;
            const expectedCustomerPrice = adminPrice + 5000 + Math.round(adminPrice * 0.07);
            const actualCustomerPrice = product.customer_price;

            console.log(`   Admin Price: ₦${product.admin_price}`);
            console.log(`   Expected Customer Price: ₦${expectedCustomerPrice} (₦${adminPrice} + ₦5000 + ₦${Math.round(adminPrice * 0.07)})`);
            console.log(`   Actual Customer Price: ₦${actualCustomerPrice}`);
            console.log(`   Platform Fee: ₦${actualCustomerPrice - adminPrice}`);

            if (actualCustomerPrice === expectedCustomerPrice) {
                console.log('   ✅ Pricing calculation is CORRECT');
            } else {
                console.log('   ❌ Pricing calculation is INCORRECT');
            }

            // Clean up - delete the test product
            await axios.delete(`http://localhost:3000/api/products/${product.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        }

        // Step 4: Create a permanent test product for visibility testing
        console.log('\n4. Creating permanent test product for visibility...');
        const permanentProductData = {
            name: 'Visibility Test Product',
            description: 'This product tests customer visibility with new pricing structure',
            category_id: categoryId,
            admin_price: 15000,
            stock_quantity: 5
        };

        const permanentResponse = await axios.post('http://localhost:3000/api/products', permanentProductData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const permanentProduct = permanentResponse.data.data.product;

        console.log('✅ Permanent test product created:');
        console.log(`   ID: ${permanentProduct.id}`);
        console.log(`   Name: ${permanentProduct.name}`);
        console.log(`   Admin Price: ₦${permanentProduct.admin_price}`);
        console.log(`   Customer Price: ₦${permanentProduct.customer_price}`);
        console.log(`   Platform Fee: ₦${permanentProduct.customer_price - permanentProduct.admin_price}`);

        // Step 5: Test customer visibility (public endpoint)
        console.log('\n5. Testing customer visibility...');
        const publicProductsResponse = await axios.get('http://localhost:3000/api/products');
        const publicProducts = publicProductsResponse.data.data.products;

        console.log(`✅ Public products endpoint returned ${publicProducts.length} products`);

        const visibilityProduct = publicProducts.find(p => p.id === permanentProduct.id);
        if (visibilityProduct) {
            console.log('✅ Test product is visible to customers');
            console.log(`   Customer sees price: ₦${visibilityProduct.customer_price}`);
        } else {
            console.log('❌ Test product is NOT visible to customers');
        }

        // Step 6: Test individual product fetch
        console.log('\n6. Testing individual product fetch...');
        try {
            const individualResponse = await axios.get(`http://localhost:3000/api/products/${permanentProduct.id}`);
            const individualProduct = individualResponse.data.data.product;
            console.log('✅ Individual product fetch successful');
            console.log(`   Product: ${individualProduct.name}`);
            console.log(`   Price: ₦${individualProduct.customer_price}`);
        } catch (error) {
            console.log('❌ Individual product fetch failed:', error.response?.data?.error || error.message);
        }

        console.log('\n🎉 Pricing and visibility test completed!');
        console.log(`\n📝 Summary:`);
        console.log(`   - Pricing structure: ₦5,000 base fee + 7% of admin price`);
        console.log(`   - Test product ID: ${permanentProduct.id}`);
        console.log(`   - Customer price: ₦${permanentProduct.customer_price}`);
        console.log(`   - Platform fee: ₦${permanentProduct.customer_price - permanentProduct.admin_price}`);

    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testPricingAndVisibility();