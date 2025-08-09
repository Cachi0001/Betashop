require('dotenv').config();
const { supabaseAdmin } = require('./src/config/database.config');

async function setupInitialData() {
  try {
    console.log('Setting up initial data...');

    // Create categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        attribute_schema: {
          size: 'string'
        }
      },
      {
        name: 'Fashion',
        description: 'Clothing and accessories',
        attribute_schema: {
          size: 'string'
        }
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden items',
        attribute_schema: {
          size: 'string'
        }
      },
      {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        attribute_schema: {
          size: 'string'
        }
      }
    ];

    for (const category of categories) {
      const slug = category.name.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabaseAdmin
        .from('categories')
        .upsert({
          name: category.name,
          slug: slug,
          description: category.description,
          attribute_schema: category.attribute_schema
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`Error creating category ${category.name}:`, error);
      } else {
        console.log(`Created category: ${data.name}`);
      }
    }

    console.log('Initial data setup completed!');
  } catch (error) {
    console.error('Error setting up initial data:', error);
  }
}

setupInitialData();