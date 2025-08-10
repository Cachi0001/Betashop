require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');

// Sample product images from Unsplash (these are real URLs that will work)
const sampleImages = {
  phone: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop'
  ],
  laptop: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop'
  ],
  headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'
  ],
  watch: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&h=800&fit=crop'
  ]
};

async function addSampleProducts() {
  console.log('🛍️ Adding sample products with images...');
  
  try {
    // First, get an admin ID to assign products to
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, business_name')
      .limit(1);
    
    if (adminError || !admins || admins.length === 0) {
      console.log('❌ No admin found. Please create an admin first.');
      return;
    }
    
    const adminId = admins[0].id;
    console.log('👤 Using admin:', admins[0].business_name);
    
    // Get a category ID
    const { data: categories, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(1);
    
    if (categoryError || !categories || categories.length === 0) {
      console.log('❌ No category found. Please create a category first.');
      return;
    }
    
    const categoryId = categories[0].id;
    console.log('📂 Using category:', categories[0].name);
    
    // Helper function to calculate customer price with new structure
    const calculateCustomerPrice = (adminPrice) => {
      return adminPrice + 5000 + Math.round(adminPrice * 0.07);
    };

    // Sample products with images using new pricing structure
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip. Perfect for photography and gaming.',
        admin_price: 850000,
        customer_price: calculateCustomerPrice(850000), // ₦5,000 + 7% = ₦914,500
        stock_quantity: 15,
        images: sampleImages.phone,
        admin_id: adminId,
        category_id: categoryId,
        slug: 'iphone-15-pro-max'
      },
      {
        name: 'MacBook Pro 16-inch',
        description: 'Powerful laptop with M3 Pro chip, perfect for professionals and creators.',
        admin_price: 1200000,
        customer_price: calculateCustomerPrice(1200000), // ₦5,000 + 7% = ₦1,289,000
        stock_quantity: 8,
        images: sampleImages.laptop,
        admin_id: adminId,
        category_id: categoryId,
        slug: 'macbook-pro-16-inch'
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise-canceling headphones with exceptional sound quality.',
        admin_price: 180000,
        customer_price: calculateCustomerPrice(180000), // ₦5,000 + 7% = ₦197,600
        stock_quantity: 25,
        images: sampleImages.headphones,
        admin_id: adminId,
        category_id: categoryId,
        slug: 'sony-wh-1000xm5-headphones'
      },
      {
        name: 'Apple Watch Series 9',
        description: 'Advanced smartwatch with health monitoring and fitness tracking.',
        admin_price: 220000,
        customer_price: calculateCustomerPrice(220000), // ₦5,000 + 7% = ₦240,400
        stock_quantity: 12,
        images: sampleImages.watch,
        admin_id: adminId,
        category_id: categoryId,
        slug: 'apple-watch-series-9'
      }
    ];
    
    // Delete existing products first
    console.log('🧹 Cleaning up existing products...');
    await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new products
    console.log('📦 Inserting new products...');
    const { data: insertedProducts, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(products)
      .select();
    
    if (insertError) {
      console.log('❌ Error inserting products:', insertError.message);
      return;
    }
    
    console.log('✅ Successfully added', insertedProducts.length, 'products with images!');
    
    insertedProducts.forEach(product => {
      console.log(`📱 ${product.name} - ₦${product.customer_price?.toLocaleString()} - ${product.images?.length || 0} images`);
    });
    
    console.log('\n🎉 Sample products with images are ready!');
    console.log('🌐 Visit http://localhost:5173 to see them in action');
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

addSampleProducts();