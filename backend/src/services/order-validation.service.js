const { supabaseAdmin } = require("../config/database.config");

const validateOrderItems = async (items) => {
  try {
    console.log('🔍 ORDER VALIDATION - Validating order items:', items.length);
    
    const validationResults = [];
    let totalAmount = 0;

    for (const item of items) {
      console.log('🔍 ORDER VALIDATION - Validating item:', item.product_id);
      
      // Get product details and current stock
      const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("id, name, admin_price, customer_price, stock_quantity, admin_id")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) {
        validationResults.push({
          product_id: item.product_id,
          valid: false,
          error: 'Product not found',
          requested_quantity: item.quantity
        });
        continue;
      }

      // Check if product belongs to the specified admin
      if (product.admin_id !== item.admin_id) {
        validationResults.push({
          product_id: item.product_id,
          valid: false,
          error: 'Product does not belong to specified admin',
          requested_quantity: item.quantity
        });
        continue;
      }

      // Check stock availability
      if (product.stock_quantity < item.quantity) {
        validationResults.push({
          product_id: item.product_id,
          valid: false,
          error: 'Insufficient stock',
          available_quantity: product.stock_quantity,
          requested_quantity: item.quantity,
          product_name: product.name
        });
        continue;
      }

      // Validate pricing
      const expectedUnitPrice = parseFloat(product.customer_price);
      const expectedAdminUnitPrice = parseFloat(product.admin_price);

      const providedUnitPrice = parseFloat(item.unit_price);
      const expectedTotalPrice = expectedUnitPrice * item.quantity;
      const providedTotalPrice = parseFloat(item.total_price);

      if (Math.abs(expectedUnitPrice - providedUnitPrice) > 0.01) {
        validationResults.push({
          product_id: item.product_id,
          valid: false,
          error: 'Price mismatch',
          expected_price: expectedUnitPrice,
          provided_price: providedUnitPrice,
          product_name: product.name
        });
        continue;
      }

      if (Math.abs(expectedTotalPrice - providedTotalPrice) > 0.01) {
        validationResults.push({
          product_id: item.product_id,
          valid: false,
          error: 'Total price calculation error',
          expected_total: expectedTotalPrice,
          provided_total: providedTotalPrice,
          product_name: product.name
        });
        continue;
      }

      // Item is valid
      validationResults.push({
        product_id: item.product_id,
        valid: true,
        product_name: product.name,
        unit_price: expectedUnitPrice,
        admin_unit_price: expectedAdminUnitPrice,
        quantity: item.quantity,
        total_price: expectedTotalPrice,
        available_stock: product.stock_quantity
      });

      totalAmount += expectedTotalPrice;
    }

    const allValid = validationResults.every(result => result.valid);
    const invalidItems = validationResults.filter(result => !result.valid);

    console.log('✅ ORDER VALIDATION - Validation complete:', {
      total_items: items.length,
      valid_items: validationResults.filter(r => r.valid).length,
      invalid_items: invalidItems.length,
      total_amount: totalAmount
    });

    return {
      valid: allValid,
      items: validationResults,
      invalid_items: invalidItems,
      total_amount: totalAmount,
      summary: {
        total_items: items.length,
        valid_items: validationResults.filter(r => r.valid).length,
        invalid_items: invalidItems.length
      }
    };
  } catch (error) {
    console.error('❌ ORDER VALIDATION - Validation failed:', error);
    throw new Error(`Order validation failed: ${error.message}`);
  }
};

const reserveStock = async (items) => {
  try {
    console.log('🔒 ORDER VALIDATION - Reserving stock for items:', items.length);
    
    const reservations = [];
    
    for (const item of items) {
      // Get current stock with row locking
      const { data: product, error: lockError } = await supabaseAdmin
        .from("products")
        .select("id, stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (lockError || !product) {
        throw new Error(`Failed to lock product ${item.product_id}`);
      }

      // Check if stock is still available
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
      }

      // Reserve stock by reducing quantity
      const newStock = product.stock_quantity - item.quantity;
      
      const { data: updatedProduct, error: updateError } = await supabaseAdmin
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.product_id)
        .eq("stock_quantity", product.stock_quantity) // Optimistic locking
        .select()
        .single();

      if (updateError || !updatedProduct) {
        throw new Error(`Failed to reserve stock for product ${item.product_id}. Stock may have changed.`);
      }

      reservations.push({
        product_id: item.product_id,
        reserved_quantity: item.quantity,
        previous_stock: product.stock_quantity,
        new_stock: newStock
      });

      console.log('🔒 ORDER VALIDATION - Stock reserved:', {
        product_id: item.product_id,
        quantity: item.quantity,
        new_stock: newStock
      });
    }

    console.log('✅ ORDER VALIDATION - All stock reserved successfully');
    return reservations;
  } catch (error) {
    console.error('❌ ORDER VALIDATION - Stock reservation failed:', error);
    throw error;
  }
};

const releaseStock = async (reservations) => {
  try {
    console.log('🔓 ORDER VALIDATION - Releasing stock reservations:', reservations.length);
    
    for (const reservation of reservations) {
      const { data: product, error: getError } = await supabaseAdmin
        .from("products")
        .select("stock_quantity")
        .eq("id", reservation.product_id)
        .single();

      if (getError || !product) {
        console.error('❌ ORDER VALIDATION - Failed to get product for stock release:', reservation.product_id);
        continue;
      }

      // Restore stock
      const restoredStock = product.stock_quantity + reservation.reserved_quantity;
      
      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({ stock_quantity: restoredStock })
        .eq("id", reservation.product_id);

      if (updateError) {
        console.error('❌ ORDER VALIDATION - Failed to release stock:', reservation.product_id, updateError);
      } else {
        console.log('🔓 ORDER VALIDATION - Stock released:', {
          product_id: reservation.product_id,
          quantity: reservation.reserved_quantity,
          restored_stock: restoredStock
        });
      }
    }

    console.log('✅ ORDER VALIDATION - Stock release complete');
  } catch (error) {
    console.error('❌ ORDER VALIDATION - Stock release failed:', error);
  }
};

const validateCartBeforeCheckout = async (cartItems) => {
  try {
    console.log('🛒 ORDER VALIDATION - Validating cart before checkout:', cartItems.length);
    
    const validation = await validateOrderItems(cartItems);
    
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.invalid_items,
        message: 'Cart validation failed. Please review your items.'
      };
    }

    return {
      valid: true,
      validated_items: validation.items.filter(item => item.valid),
      total_amount: validation.total_amount
    };
  } catch (error) {
    console.error('❌ ORDER VALIDATION - Cart validation failed:', error);
    throw new Error(`Cart validation failed: ${error.message}`);
  }
};

module.exports = {
  validateOrderItems,
  reserveStock,
  releaseStock,
  validateCartBeforeCheckout
};