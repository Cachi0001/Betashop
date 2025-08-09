const { supabaseAdmin } = require("../config/database.config");

const checkStockAvailability = async (productId, requestedQuantity) => {
  try {
    console.log('📦 STOCK SERVICE - Checking stock availability:', productId, requestedQuantity);
    
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (error || !product) {
      throw new Error('Product not found');
    }

    const available = product.stock_quantity >= requestedQuantity;
    
    console.log('📦 STOCK SERVICE - Stock check result:', {
      product_id: productId,
      available_stock: product.stock_quantity,
      requested: requestedQuantity,
      available: available
    });

    return {
      product_id: productId,
      product_name: product.name,
      available_stock: product.stock_quantity,
      requested_quantity: requestedQuantity,
      available: available,
      shortage: available ? 0 : requestedQuantity - product.stock_quantity
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Stock check failed:', error);
    throw new Error(`Stock check failed: ${error.message}`);
  }
};

const checkMultipleStockAvailability = async (items) => {
  try {
    console.log('📦 STOCK SERVICE - Checking multiple stock availability:', items.length);
    
    const stockChecks = await Promise.all(
      items.map(item => checkStockAvailability(item.product_id, item.quantity))
    );

    const allAvailable = stockChecks.every(check => check.available);
    const unavailableItems = stockChecks.filter(check => !check.available);

    console.log('📦 STOCK SERVICE - Multiple stock check result:', {
      total_items: items.length,
      all_available: allAvailable,
      unavailable_count: unavailableItems.length
    });

    return {
      all_available: allAvailable,
      stock_checks: stockChecks,
      unavailable_items: unavailableItems
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Multiple stock check failed:', error);
    throw new Error(`Multiple stock check failed: ${error.message}`);
  }
};

const updateStock = async (productId, newQuantity, reason = 'manual_update') => {
  try {
    console.log('📦 STOCK SERVICE - Updating stock:', productId, newQuantity, reason);
    
    // Get current stock for logging
    const { data: currentProduct, error: getCurrentError } = await supabaseAdmin
      .from("products")
      .select("stock_quantity, name")
      .eq("id", productId)
      .single();

    if (getCurrentError || !currentProduct) {
      throw new Error('Product not found');
    }

    const previousQuantity = currentProduct.stock_quantity;

    // Update stock
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from("products")
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log stock change (you can create a stock_history table for this)
    console.log('📦 STOCK SERVICE - Stock updated:', {
      product_id: productId,
      product_name: currentProduct.name,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      change: newQuantity - previousQuantity,
      reason: reason
    });

    return {
      product_id: productId,
      product_name: currentProduct.name,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
      change: newQuantity - previousQuantity
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Stock update failed:', error);
    throw new Error(`Stock update failed: ${error.message}`);
  }
};

const reduceStock = async (productId, quantity, reason = 'sale') => {
  try {
    console.log('📦 STOCK SERVICE - Reducing stock:', productId, quantity, reason);
    
    // Get current stock with row locking
    const { data: product, error: getError } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (getError || !product) {
      throw new Error('Product not found');
    }

    // Check if sufficient stock is available
    if (product.stock_quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock_quantity}, Requested: ${quantity}`);
    }

    const newQuantity = product.stock_quantity - quantity;

    // Update stock with optimistic locking
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from("products")
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .eq("stock_quantity", product.stock_quantity) // Optimistic locking
      .select()
      .single();

    if (updateError || !updatedProduct) {
      throw new Error('Failed to reduce stock. Stock may have changed by another transaction.');
    }

    console.log('📦 STOCK SERVICE - Stock reduced successfully:', {
      product_id: productId,
      product_name: product.name,
      quantity_reduced: quantity,
      previous_stock: product.stock_quantity,
      new_stock: newQuantity,
      reason: reason
    });

    return {
      product_id: productId,
      product_name: product.name,
      quantity_reduced: quantity,
      previous_stock: product.stock_quantity,
      new_stock: newQuantity
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Stock reduction failed:', error);
    throw error;
  }
};

const reduceMultipleStock = async (items, reason = 'order_fulfillment') => {
  try {
    console.log('📦 STOCK SERVICE - Reducing multiple stock:', items.length, reason);
    
    const reductions = [];
    const failures = [];

    for (const item of items) {
      try {
        const reduction = await reduceStock(item.product_id, item.quantity, reason);
        reductions.push(reduction);
      } catch (error) {
        console.error('❌ STOCK SERVICE - Failed to reduce stock for product:', item.product_id, error.message);
        failures.push({
          product_id: item.product_id,
          quantity: item.quantity,
          error: error.message
        });
      }
    }

    if (failures.length > 0) {
      // If any reductions failed, we might want to rollback successful ones
      console.error('❌ STOCK SERVICE - Some stock reductions failed:', failures);
      throw new Error(`Failed to reduce stock for ${failures.length} products`);
    }

    console.log('✅ STOCK SERVICE - All stock reductions successful:', reductions.length);
    return reductions;
  } catch (error) {
    console.error('❌ STOCK SERVICE - Multiple stock reduction failed:', error);
    throw error;
  }
};

const restoreStock = async (productId, quantity, reason = 'order_cancellation') => {
  try {
    console.log('📦 STOCK SERVICE - Restoring stock:', productId, quantity, reason);
    
    const { data: product, error: getError } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (getError || !product) {
      throw new Error('Product not found');
    }

    const newQuantity = product.stock_quantity + quantity;

    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from("products")
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log('📦 STOCK SERVICE - Stock restored successfully:', {
      product_id: productId,
      product_name: product.name,
      quantity_restored: quantity,
      previous_stock: product.stock_quantity,
      new_stock: newQuantity,
      reason: reason
    });

    return {
      product_id: productId,
      product_name: product.name,
      quantity_restored: quantity,
      previous_stock: product.stock_quantity,
      new_stock: newQuantity
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Stock restoration failed:', error);
    throw new Error(`Stock restoration failed: ${error.message}`);
  }
};

const getLowStockProducts = async (adminId, threshold = 5) => {
  try {
    console.log('📦 STOCK SERVICE - Getting low stock products for admin:', adminId, 'threshold:', threshold);
    
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity, customer_price")
      .eq("admin_id", adminId)
      .lte("stock_quantity", threshold)
      .order("stock_quantity", { ascending: true });

    if (error) {
      throw error;
    }

    console.log('📦 STOCK SERVICE - Found low stock products:', products?.length || 0);
    return products || [];
  } catch (error) {
    console.error('❌ STOCK SERVICE - Get low stock products failed:', error);
    throw new Error(`Failed to get low stock products: ${error.message}`);
  }
};

const getStockStatus = async (productId) => {
  try {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (error || !product) {
      throw new Error('Product not found');
    }

    let status = 'in_stock';
    if (product.stock_quantity === 0) {
      status = 'out_of_stock';
    } else if (product.stock_quantity <= 5) {
      status = 'low_stock';
    }

    return {
      product_id: productId,
      product_name: product.name,
      stock_quantity: product.stock_quantity,
      status: status
    };
  } catch (error) {
    console.error('❌ STOCK SERVICE - Get stock status failed:', error);
    throw new Error(`Failed to get stock status: ${error.message}`);
  }
};

module.exports = {
  checkStockAvailability,
  checkMultipleStockAvailability,
  updateStock,
  reduceStock,
  reduceMultipleStock,
  restoreStock,
  getLowStockProducts,
  getStockStatus
};