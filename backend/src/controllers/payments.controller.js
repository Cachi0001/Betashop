const paymentsService = require('../services/payments.service');
const transfersService = require('../services/transfers.service');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const initializePayment = async (req, res, next) => {
  try {
    console.log('💳 PAYMENTS CONTROLLER - Initialize payment request:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ PAYMENTS CONTROLLER - Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const result = await paymentsService.initializePayment(req.body);
    
    console.log('✅ PAYMENTS CONTROLLER - Payment initialized successfully:', result.reference);
    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ PAYMENTS CONTROLLER - Initialize payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment initialization failed'
    });
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;
    console.log('🔍 PAYMENTS CONTROLLER - Verify payment request:', reference);
    
    const result = await paymentsService.verifyPayment(reference);
    
    if (result.success) {
      console.log('✅ PAYMENTS CONTROLLER - Payment verified successfully:', reference);
      
      // Initiate transfers to admins (if transfers service is available)
      try {
        if (transfersService && transfersService.initiateTransfers) {
          await transfersService.initiateTransfers(result.order.id);
          console.log('✅ PAYMENTS CONTROLLER - Transfers initiated for order:', result.order.id);
        }
      } catch (transferError) {
        console.error('❌ PAYMENTS CONTROLLER - Transfer initiation failed:', transferError);
        // Don't fail the payment verification if transfers fail
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: result
      });
    } else {
      console.log('❌ PAYMENTS CONTROLLER - Payment verification failed:', result.message);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ PAYMENTS CONTROLLER - Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment verification failed'
    });
  }
};

const handleWebhook = async (req, res, next) => {
  try {
    console.log('🔔 PAYMENTS CONTROLLER - Webhook received:', req.body?.event);
    // Verify Paystack webhook signature
    const signature = req.headers['x-paystack-signature'];
    if (!signature || !req.rawBody) {
      console.warn('⚠️ PAYMENTS CONTROLLER - Missing signature or raw body');
      return res.status(401).json({ success: false, error: 'Invalid webhook' });
    }

    const expected = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest('hex');

    if (expected !== signature) {
      console.warn('⚠️ PAYMENTS CONTROLLER - Invalid webhook signature');
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const event = req.body;
    const result = await paymentsService.handlePaystackWebhook(event);
    
    console.log('✅ PAYMENTS CONTROLLER - Webhook processed:', result.message);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('❌ PAYMENTS CONTROLLER - Webhook handling error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Webhook handling failed'
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('🔍 PAYMENTS CONTROLLER - Get payment status request:', reference);
    
    const status = await paymentsService.getPaymentStatus(reference);
    
    console.log('✅ PAYMENTS CONTROLLER - Payment status retrieved:', status.payment_status);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ PAYMENTS CONTROLLER - Get payment status error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to get payment status'
    });
  }
};

const validateCart = async (req, res) => {
  try {
    console.log('🛒 PAYMENTS CONTROLLER - Validate cart request:', req.body.items?.length || 0, 'items');
    
    const validation = await paymentsService.validateCartForPayment(req.body.items || []);
    
    if (validation.valid) {
      console.log('✅ PAYMENTS CONTROLLER - Cart validation successful');
      res.json({
        success: true,
        message: 'Cart is valid for checkout',
        data: {
          valid: true,
          items: validation.validated_items,
          total_amount: validation.total_amount
        }
      });
    } else {
      console.log('❌ PAYMENTS CONTROLLER - Cart validation failed:', validation.errors?.length || 0, 'errors');
      res.status(400).json({
        success: false,
        message: validation.message,
        data: {
          valid: false,
          errors: validation.errors
        }
      });
    }
  } catch (error) {
    console.error('❌ PAYMENTS CONTROLLER - Cart validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Cart validation failed'
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  validateCart
};

