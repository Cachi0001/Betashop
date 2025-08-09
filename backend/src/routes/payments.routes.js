const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { body } = require('express-validator');

// Validation middleware for payment initialization
const validatePaymentInitialization = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('customer_email')
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('customer_phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('customer_address')
    .isObject()
    .withMessage('Customer address is required'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required')
];

// Validation middleware for cart validation
const validateCartItems = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.product_id')
    .isUUID()
    .withMessage('Valid product ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
];

// Public routes
router.post('/initialize', validatePaymentInitialization, paymentsController.initializePayment);
router.post('/validate-cart', validateCartItems, paymentsController.validateCart);
router.get('/verify/:reference', paymentsController.verifyPayment);
router.get('/status/:reference', paymentsController.getPaymentStatus);
router.post('/webhook', paymentsController.handleWebhook);

module.exports = router;

