const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Combined middleware for admin authentication
const authenticateAdmin = [authenticateToken, requireAdmin];
const { body, param, query } = require('express-validator');

// Validation middleware for creating orders
const validateCreateOrder = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Customer name must be between 2 and 255 characters'),
  
  body('customer_email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('customer_phone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  
  body('customer_address')
    .isObject()
    .withMessage('Customer address must be an object')
    .custom((value) => {
      if (!value.city || !value.state || !value.country) {
        throw new Error('Address must include city, state, and country');
      }
      return true;
    }),
  
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('payment_reference')
    .notEmpty()
    .withMessage('Payment reference is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Payment reference must be between 5 and 255 characters'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  
  body('items.*.admin_id')
    .isUUID()
    .withMessage('Valid admin ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('items.*.total_price')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number')
];

// Validation middleware for updating order status
const validateUpdateOrderStatus = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required'),
  
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

// Validation middleware for getting order by ID
const validateGetOrder = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required')
];

// Routes

// POST /api/orders - Create a new order (public endpoint for checkout)
router.post('/', validateCreateOrder, ordersController.createOrder);

// GET /api/orders - Get orders (admin: their orders, customer: with email query)
router.get('/', authenticateToken, ordersController.getOrders);

// GET /api/orders/stats - Get order statistics for admin
router.get('/stats', authenticateAdmin, ordersController.getOrderStats);

// GET /api/orders/:orderId - Get specific order by ID
router.get('/:orderId', validateGetOrder, ordersController.getOrderById);

// PUT /api/orders/:orderId/status - Update order status (admin only)
router.put('/:orderId/status', authenticateAdmin, validateUpdateOrderStatus, ordersController.updateOrderStatus);

module.exports = router;