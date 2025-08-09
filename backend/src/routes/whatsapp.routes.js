const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Combined middleware for admin authentication
const authenticateAdmin = [authenticateToken, requireAdmin];
const { body, param } = require('express-validator');

// Validation middleware for generating quick WhatsApp link
const validateQuickWhatsAppLink = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Validation middleware for updating admin WhatsApp number
const validateUpdateWhatsAppNumber = [
  body('whatsapp_number')
    .notEmpty()
    .withMessage('WhatsApp number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid WhatsApp number is required')
];

// Validation middleware for custom WhatsApp link
const validateCustomWhatsAppLink = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Valid phone number is required'),
  
  body('message_template')
    .notEmpty()
    .withMessage('Message template is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message template must be between 1 and 1000 characters'),
  
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

// Validation middleware for order ID
const validateOrderId = [
  param('orderId')
    .isUUID()
    .withMessage('Valid order ID is required')
];

// Routes

// GET /api/whatsapp/orders/:orderId - Generate WhatsApp link for order (public)
router.get('/orders/:orderId', validateOrderId, whatsappController.generateOrderWhatsAppLink);

// POST /api/whatsapp/quick - Generate quick WhatsApp link (public)
router.post('/quick', validateQuickWhatsAppLink, whatsappController.generateQuickWhatsAppLink);

// POST /api/whatsapp/custom - Create custom WhatsApp link with template (public)
router.post('/custom', validateCustomWhatsAppLink, whatsappController.createCustomWhatsAppLink);

// GET /api/whatsapp/admin/number - Get admin's WhatsApp number (admin only)
router.get('/admin/number', authenticateAdmin, whatsappController.getAdminWhatsAppNumber);

// PUT /api/whatsapp/admin/number - Update admin's WhatsApp number (admin only)
router.put('/admin/number', authenticateAdmin, validateUpdateWhatsAppNumber, whatsappController.updateAdminWhatsAppNumber);

module.exports = router;