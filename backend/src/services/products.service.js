const { supabaseAdmin } = require("../config/database.config");
const { generateSlug, calculateCustomerPrice, calculatePlatformCommission } = require("../utils/helpers");

// Recalculate customer_price for all products using current pricing helper
const recalcAllPrices = async () => {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, admin_price, customer_price");
    if (error) throw error;
    if (!products || products.length === 0) return { updated: 0 };

    let updated = 0;
    for (const p of products) {
      const newCustomer = calculateCustomerPrice(p.admin_price);
      if (newCustomer !== p.customer_price) {
        const { error: upErr } = await supabaseAdmin
          .from("products")
          .update({ customer_price: newCustomer })
          .eq("id", p.id);
        if (upErr) throw upErr;
        updated += 1;
      }
    }
    return { updated };
  } catch (e) {
    throw new Error(`Failed to recalc prices: ${e.message}`);
  }
};

const restoreProduct = async (productId, adminId) => {
  try {
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("admin_id, is_deleted")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) throw new Error("Product not found or unauthorized");
    if (existingProduct.admin_id !== adminId) throw new Error("Unauthorized to restore this product");
    if (existingProduct.is_deleted !== true) {
      return { message: "Product is not archived" };
    }

    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", productId);

    if (error) throw error;
    return { message: "Product restored successfully" };
  } catch (error) {
    throw new Error(`Failed to restore product: ${error.message}`);
  }
};

const createProduct = async (adminId, productData) => {
  try {
    console.log('🔧 PRODUCTS SERVICE - Create product started');
    console.log('🔧 PRODUCTS SERVICE - Admin ID:', adminId);
    console.log('🔧 PRODUCTS SERVICE - Product data received:', JSON.stringify(productData, null, 2));
    
    const slug = generateSlug(productData.name);
    const customerPrice = calculateCustomerPrice(productData.admin_price);
    const platformCommission = calculatePlatformCommission(customerPrice, productData.admin_price);

    console.log('🔧 PRODUCTS SERVICE - Generated slug:', slug);
    console.log('🔧 PRODUCTS SERVICE - Calculated customer price:', customerPrice);
    console.log('🔧 PRODUCTS SERVICE - Platform commission:', platformCommission);

    // Get admin's default location if not provided
    let productLocation = productData.location;
    console.log('🔧 PRODUCTS SERVICE - Initial location from request:', JSON.stringify(productLocation, null, 2));
    
    if (!productLocation || !productLocation.city || !productLocation.state) {
      console.log('🔧 PRODUCTS SERVICE - Location incomplete, fetching admin address...');
      
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('admins')
        .select('address')
        .eq('id', adminId)
        .single();
      
      console.log('🔧 PRODUCTS SERVICE - Admin data query result:', JSON.stringify(adminData, null, 2));
      console.log('🔧 PRODUCTS SERVICE - Admin query error:', adminError);
      
      if (!adminError && adminData?.address) {
        productLocation = adminData.address;
        console.log('🔧 PRODUCTS SERVICE - Using admin address as location:', JSON.stringify(productLocation, null, 2));
      }
    }

    const newProduct = {
      admin_id: adminId,
      name: productData.name,
      slug: slug,
      description: productData.description,
      category_id: productData.category_id,
      admin_price: productData.admin_price,
      customer_price: customerPrice,
      stock_quantity: productData.stock_quantity,
      attributes: productData.attributes || {},
      images: productData.images || [],
      model_3d_url: productData.model_3d_url || null,
    };


    // Only add location if it exists and has data - make it completely optional for now
    if (productLocation && (productLocation.city || productLocation.state)) {
      try {
        newProduct.location = productLocation;
      } catch (locationError) {
        console.log('⚠️ PRODUCTS SERVICE - Location field not supported, skipping:', locationError.message);
        // Continue without location if database doesn't support it yet
      }
    }

    console.log('🔧 PRODUCTS SERVICE - Final product object to insert:', JSON.stringify(newProduct, null, 2));

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    console.log('🔧 PRODUCTS SERVICE - Database insert result:', JSON.stringify(product, null, 2));
    console.log('🔧 PRODUCTS SERVICE - Database insert error:', error);

    if (error) {
      console.log('❌ PRODUCTS SERVICE - Database error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log('✅ PRODUCTS SERVICE - Product created successfully');
    return product;
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

const getProductById = async (productId) => {
  try {
    // First check if product exists
    const { data: checkResult, error: checkError } = await supabaseAdmin
      .from("products")
      .select("id, is_deleted")
      .eq("id", productId)
      .single();

    if (checkError) throw checkError;
    if (!checkResult) {
      throw new Error('Product not found');
    }
    if (checkResult.is_deleted === true) {
      throw new Error('Product not found');
    }

    // If product exists, get full details
    const { data: productDetails, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        categories(name, slug),
        admins(business_name, address)
      `)
      .eq("id", productId)
      .eq("is_deleted", false);

    if (error) throw error;
    if (!productDetails || productDetails.length === 0) {
      throw new Error('Product not found');
    }
    
    const product = productDetails[0];
    return product;
  } catch (error) {
    if (error.message === 'Product not found') {
      throw error;
    }
    throw new Error(`Failed to get product: ${error.message}`);
  }
};

const getProducts = async (filters, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    let query = supabaseAdmin.from("products").select(`
      *,
      categories(name, slug),
      admins(business_name, address)
    `, { count: "exact" });

    // Exclude soft-deleted products by default unless explicitly included
    if (!filters?.include_archived) {
      query = query.eq("is_deleted", false);
    }

    if (filters.admin_id) {
      query = query.eq("admin_id", filters.admin_id);
    }
    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data: products, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { products, count };
  } catch (error) {
    throw new Error(`Failed to get products: ${error.message}`);
  }
};

const updateProduct = async (productId, adminId, updateData) => {
  try {
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("admin_id, admin_price")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) throw new Error("Product not found or unauthorized");
    if (existingProduct.admin_id !== adminId) throw new Error("Unauthorized to update this product");

    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    if (updateData.admin_price && updateData.admin_price !== existingProduct.admin_price) {
      updateData.customer_price = calculateCustomerPrice(updateData.admin_price);
    }

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return product;
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

const deleteProduct = async (productId, adminId) => {
  try {
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("admin_id, is_deleted")
      .eq("id", productId)
      .single();

    if (fetchError || !existingProduct) throw new Error("Product not found or unauthorized");
    if (existingProduct.admin_id !== adminId) throw new Error("Unauthorized to delete this product");
    if (existingProduct.is_deleted === true) {
      return { message: "Product already archived" };
    }

    // Soft delete: mark as deleted and set timestamp
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) throw error;
    return { message: "Product archived successfully" };
  } catch (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

module.exports = {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  restoreProduct,
  recalcAllPrices,
};

