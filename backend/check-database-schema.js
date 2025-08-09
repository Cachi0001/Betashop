// Script to check database schema
const { supabaseAdmin } = require('./src/config/database.config');

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');

  try {
    // Check if location column exists in products table
    const { data, error } = await supabaseAdmin.rpc('get_table_columns', {
      table_name: 'products'
    });

    if (error) {
      console.log('❌ Error getting table columns:', error);

      const { data: sampleData, error: sampleError } = await supabaseAdmin
        .from('products')
        .select('*')
        .limit(1);

      if (sampleData && sampleData.length > 0) {
        console.log('📋 Sample product structure:', Object.keys(sampleData[0]));
      } else {
        console.log('📋 No products found, checking with empty insert...');

        // Try an empty insert to see what columns are expected
        const { error: emptyInsertError } = await supabaseAdmin
          .from('products')
          .insert({});

        console.log('📋 Empty insert error (shows required columns):', emptyInsertError);
      }
    } else {
      console.log('📋 Table columns:', data);
    }

    // Check if admins table has address column
    const { data: adminSample, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, address')
      .limit(1);

    console.log('👤 Admin sample data:', adminSample);
    console.log('👤 Admin query error:', adminError);

    // Check categories table
    const { data: categoriesSample, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(1);

    console.log('📂 Categories sample:', categoriesSample);
    console.log('📂 Categories error:', categoriesError);

  } catch (error) {
    console.error('💥 Schema check failed:', error);
  }
}

// Run the check
checkDatabaseSchema();