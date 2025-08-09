const { supabaseAdmin } = require("../config/database.config");

// Generate a unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-8)}-${random}`;
};

const createOrder = async (orderData) => {
  try {
    console.log('🛒 ORDERS SERVICE - Creating order:', JSON.stringify(orderData, null, 2));
    
    // Generate order number if not provided
    const orderNumber = orderData.order_number || generateOrderNumber();
    
    // Start a transaction
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        total_amount: orderData.total_amount,
        payment_reference: orderData.payment_reference,
        payment_status: orderData.payment_status || 'pending',
        order_status: orderData.order_status || 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ ORDERS SERVICE - Error creating order:', orderError);
      throw orderError;
    }

    console.log('✅ ORDERS SERVICE - Order created:', order.id);

    // Create order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        admin_id: item.admin_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        admin_unit_price: item.admin_unit_price,
        total_price: item.total_price
      }));

      const { data: items, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('❌ ORDERS SERVICE - Error creating order items:', itemsError);
        // Rollback order creation
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      console.log('✅ ORDERS SERVICE - Order items created:', items.length);
      order.items = items;
    }

    return order;
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Create order failed:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

const getOrderById = async (orderId, userContext = null) => {
  try {
    console.log('🔍 ORDERS SERVICE - Getting order:', orderId);
    
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            slug,
            images,
            customer_price
          ),
          admins (
            id,
            business_name,
            whatsapp_number
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error('❌ ORDERS SERVICE - Error getting order:', error);
      throw error;
    }

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('✅ ORDERS SERVICE - Order retrieved:', order.id);
    return order;
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Get order failed:', error);
    throw new Error(`Failed to get order: ${error.message}`);
  }
};

const getOrdersByAdmin = async (adminId, filters = {}) => {
  try {
    console.log('🔍 ORDERS SERVICE - Getting orders for admin:', adminId);
    
    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items!inner (
          *,
          products (
            id,
            name,
            slug,
            images,
            customer_price
          )
        )
      `)
      .eq("order_items.admin_id", adminId);

    // Apply filters
    if (filters.status) {
      query = query.eq("order_status", filters.status);
    }
    
    if (filters.payment_status) {
      query = query.eq("payment_status", filters.payment_status);
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('❌ ORDERS SERVICE - Error getting admin orders:', error);
      throw error;
    }

    console.log('✅ ORDERS SERVICE - Retrieved', orders?.length || 0, 'orders for admin');
    return { orders: orders || [], count };
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Get admin orders failed:', error);
    throw new Error(`Failed to get orders: ${error.message}`);
  }
};

const getOrdersByCustomer = async (customerEmail, filters = {}) => {
  try {
    console.log('🔍 ORDERS SERVICE - Getting orders for customer:', customerEmail);
    
    let query = supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            slug,
            images,
            customer_price
          ),
          admins (
            id,
            business_name,
            whatsapp_number
          )
        )
      `)
      .eq("customer_email", customerEmail);

    // Apply filters
    if (filters.status) {
      query = query.eq("order_status", filters.status);
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('❌ ORDERS SERVICE - Error getting customer orders:', error);
      throw error;
    }

    console.log('✅ ORDERS SERVICE - Retrieved', orders?.length || 0, 'orders for customer');
    return { orders: orders || [], count };
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Get customer orders failed:', error);
    throw new Error(`Failed to get orders: ${error.message}`);
  }
};

const updateOrderStatus = async (orderId, adminId, newStatus) => {
  try {
    console.log('🔄 ORDERS SERVICE - Updating order status:', orderId, 'to', newStatus);
    
    // First verify the admin has permission to update this order
    const { data: orderItems, error: checkError } = await supabaseAdmin
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("admin_id", adminId);

    if (checkError || !orderItems || orderItems.length === 0) {
      throw new Error('Unauthorized to update this order');
    }

    // Update the order status
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ 
        order_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error('❌ ORDERS SERVICE - Error updating order status:', error);
      throw error;
    }

    console.log('✅ ORDERS SERVICE - Order status updated:', order.id);
    return order;
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Update order status failed:', error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

const updatePaymentStatus = async (paymentReference, paymentStatus, paymentData = {}) => {
  try {
    console.log('💳 ORDERS SERVICE - Updating payment status:', paymentReference, 'to', paymentStatus);
    
    const updateData = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    // If payment is successful, update order status to processing
    if (paymentStatus === 'successful') {
      updateData.order_status = 'processing';
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("payment_reference", paymentReference)
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            stock_quantity
          ),
          admins (
            id,
            business_name,
            whatsapp_number
          )
        )
      `)
      .single();

    if (error) {
      console.error('❌ ORDERS SERVICE - Error updating payment status:', error);
      throw error;
    }

    if (!order) {
      throw new Error('Order not found for payment reference');
    }

    console.log('✅ ORDERS SERVICE - Payment status updated:', order.id);
    return order;
  } catch (error) {
    console.error('❌ ORDERS SERVICE - Update payment status failed:', error);
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByAdmin,
  getOrdersByCustomer,
  updateOrderStatus,
  updatePaymentStatus
};