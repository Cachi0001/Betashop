const ordersService = require('../services/orders.service');
const { validationResult } = require('express-validator');

const createOrder = async (req, res) => {
  try {
    console.log('🛒 ORDERS CONTROLLER - Create order request:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ ORDERS CONTROLLER - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const orderData = req.body;
    const order = await ordersService.createOrder(orderData);

    console.log('✅ ORDERS CONTROLLER - Order created successfully:', order.id);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('❌ ORDERS CONTROLLER - Create order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('🔍 ORDERS CONTROLLER - Get order request:', orderId);
    
    const order = await ordersService.getOrderById(orderId);

    console.log('✅ ORDERS CONTROLLER - Order retrieved successfully');
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('❌ ORDERS CONTROLLER - Get order error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to get order'
    });
  }
};

const getOrders = async (req, res) => {
  try {
    console.log('🔍 ORDERS CONTROLLER - Get orders request');
    console.log('🔍 ORDERS CONTROLLER - Query params:', req.query);
    console.log('🔍 ORDERS CONTROLLER - User context:', req.user);
    console.log('🔍 ORDERS CONTROLLER - Headers:', req.headers.authorization ? 'Token present' : 'No token');
    
    const filters = {
      status: req.query.status,
      payment_status: req.query.payment_status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    let result;
    
    // If user is an admin, get orders for their products
    if (req.user && req.user.id) {
      console.log('🔍 ORDERS CONTROLLER - Getting orders for admin:', req.user.id);
      result = await ordersService.getOrdersByAdmin(req.user.id, filters);
    } 
    // If customer email is provided, get orders for that customer
    else if (req.query.customer_email) {
      console.log('🔍 ORDERS CONTROLLER - Getting orders for customer:', req.query.customer_email);
      result = await ordersService.getOrdersByCustomer(req.query.customer_email, filters);
    } 
    else {
      return res.status(400).json({
        success: false,
        error: 'Admin authentication or customer email required'
      });
    }

    console.log('✅ ORDERS CONTROLLER - Orders retrieved successfully:', result.orders?.length || 0);
    res.json({
      success: true,
      data: {
        orders: result.orders,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.count,
          pages: Math.ceil(result.count / filters.limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ ORDERS CONTROLLER - Get orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get orders'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log('🔄 ORDERS CONTROLLER - Update order status request:', orderId, 'to', status);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      });
    }

    const order = await ordersService.updateOrderStatus(orderId, req.user.id, status);

    console.log('✅ ORDERS CONTROLLER - Order status updated successfully');
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('❌ ORDERS CONTROLLER - Update order status error:', error);
    const statusCode = error.message.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to update order status'
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    console.log('📊 ORDERS CONTROLLER - Get order stats request');
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      });
    }

    // Get basic stats for the admin
    const { orders } = await ordersService.getOrdersByAdmin(req.user.id, { limit: 1000 });
    
    const stats = {
      total_orders: orders.length,
      pending_orders: orders.filter(o => o.order_status === 'pending').length,
      processing_orders: orders.filter(o => o.order_status === 'processing').length,
      completed_orders: orders.filter(o => o.order_status === 'delivered').length,
      total_revenue: orders
        .filter(o => o.payment_status === 'successful')
        .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
      recent_orders: orders.slice(0, 5) // Last 5 orders
    };

    console.log('✅ ORDERS CONTROLLER - Order stats retrieved successfully');
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('❌ ORDERS CONTROLLER - Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get order stats'
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrderStats
};