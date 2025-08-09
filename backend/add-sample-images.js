require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');

async function addSampleImages() {
  console.log('📸 Adding sample images to products...');

  try {
    // Get all products
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, images');

    if (error) {
      throw error;
    }

    console.log('Found', products.length, 'products');

    // Sample images from Unsplash (free to use)
    const sampleImages = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&crop=center', // iPhone
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop&crop=center', // Tech product
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop&crop=center'  // Laptop/tech
    ];

    // Update each product with a sample image
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageUrl = sampleImages[i % sampleImages.length];

      console.log(`Updating ${product.name} with image: ${imageUrl}`);

      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ 
          images: [imageUrl]
        })
        .eq('id', product.id);

      if (updateError) {
        console.error('Error updating product:', product.name, updateError);
      } else {
        console.log('✅ Updated:', product.name);
      }
    }

    console.log('🎉 Sample images added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample images:', error);
  }
}

// Run the script
addSampleImages();