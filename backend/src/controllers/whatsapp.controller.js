const whatsappService = require('../services/whatsapp.service');
const { validationResult } = require('express-validator');

const generateOrderWhatsAppLink = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('📱 WHATSAPP CONTROLLER - Generate order WhatsApp link request:', orderId);
    
    const result = await whatsappService.generateWhatsAppLink(orderId);
    
    console.log('✅ WHATSAPP CONTROLLER - WhatsApp links generated successfully');
    res.json({
      success: true,
      message: 'WhatsApp links generated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ WHATSAPP CONTROLLER - Generate WhatsApp link error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to generate WhatsApp link'
    });
  }
};

const generateQuickWhatsAppLink = async (req, res) => {
  try {
    console.log('📱 WHATSAPP CONTROLLER - Generate quick WhatsApp link request');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ WHATSAPP CONTROLLER - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { phone_number, message } = req.body;
    const result = whatsappService.generateQuickWhatsAppLink(phone_number, message);
    
    console.log('✅ WHATSAPP CONTROLLER - Quick WhatsApp link generated successfully');
    res.json({
      success: true,
      message: 'WhatsApp link generated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ WHATSAPP CONTROLLER - Generate quick WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate WhatsApp link'
    });
  }
};

const updateAdminWhatsAppNumber = async (req, res) => {
  try {
    console.log('📱 WHATSAPP CONTROLLER - Update admin WhatsApp number request');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ WHATSAPP CONTROLLER - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      });
    }

    const { whatsapp_number } = req.body;
    const result = await whatsappService.updateAdminWhatsAppNumber(req.user.id, whatsapp_number);
    
    console.log('✅ WHATSAPP CONTROLLER - Admin WhatsApp number updated successfully');
    res.json({
      success: true,
      message: 'WhatsApp number updated successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ WHATSAPP CONTROLLER - Update admin WhatsApp number error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update WhatsApp number'
    });
  }
};

const getAdminWhatsAppNumber = async (req, res) => {
  try {
    console.log('📱 WHATSAPP CONTROLLER - Get admin WhatsApp number request');
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Admin authentication required'
      });
    }

    const result = await whatsappService.getAdminWhatsAppNumber(req.user.id);
    
    console.log('✅ WHATSAPP CONTROLLER - Admin WhatsApp number retrieved successfully');
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ WHATSAPP CONTROLLER - Get admin WhatsApp number error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to get WhatsApp number'
    });
  }
};

const createCustomWhatsAppLink = async (req, res) => {
  try {
    console.log('📱 WHATSAPP CONTROLLER - Create custom WhatsApp link request');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ WHATSAPP CONTROLLER - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { phone_number, message_template, data } = req.body;
    
    // Create custom message from template
    const customMessage = whatsappService.createCustomMessage(message_template, data);
    
    // Generate WhatsApp link
    const result = whatsappService.generateQuickWhatsAppLink(phone_number, customMessage);
    
    console.log('✅ WHATSAPP CONTROLLER - Custom WhatsApp link created successfully');
    res.json({
      success: true,
      message: 'Custom WhatsApp link created successfully',
      data: {
        ...result,
        custom_message: customMessage
      }
    });
  } catch (error) {
    console.error('❌ WHATSAPP CONTROLLER - Create custom WhatsApp link error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create custom WhatsApp link'
    });
  }
};

module.exports = {
  generateOrderWhatsAppLink,
  generateQuickWhatsAppLink,
  updateAdminWhatsAppNumber,
  getAdminWhatsAppNumber,
  createCustomWhatsAppLink
};