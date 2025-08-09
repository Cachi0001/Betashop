const paystackConfig = require('../config/paystack.config');
const { supabaseAdmin } = require('../config/database.config');
const { generateOrderNumber } = require('../utils/helpers');
const paymentTrackingService = require('./payment-tracking.service');
const ordersService = require('./orders.service');
const stockService = require('./stock.service');
const orderValidationService = require('./order-validation.service');

const initializePayment = async (cartData) => {
  try {
    console.log('💳 PAYMENTS SERVICE - Initializing payment:', JSON.stringify(cartData, null, 2));
    
    // Validate cart items and stock availability
    const validation = await orderValidationService.validateCartBeforeCheckout(cartData.items);
    
    if (!validation.valid) {
      throw new Error(`Cart validation failed: ${validation.message}`);
    }

    const orderNumber = generateOrderNumber();
    const totalAmount = validation.total_amount;

    console.log('💳 PAYMENTS SERVICE - Cart validated, total amount:', totalAmount);

    // Calculate platform commission as sum of (customer_price - admin_price) for each item
    const totalAmountKobo = Math.round(totalAmount * 100); // Convert to kobo
    let platformCommissionKobo = 0;
    let adminAmountKobo = 0;
    const itemsWithCommission = validation.validated_items.map(item => {
      const unitCustomerKobo = Math.round(Number(item.unit_price) * 100);
      const unitAdminKobo = Math.round(Number(item.admin_unit_price) * 100);
      const commissionPerUnitKobo = unitCustomerKobo - unitAdminKobo;
      const commissionKobo = commissionPerUnitKobo * Number(item.quantity);
      const itemTotalKobo = unitCustomerKobo * Number(item.quantity);
      platformCommissionKobo += commissionKobo;
      adminAmountKobo += (itemTotalKobo - commissionKobo);
      return {
        ...item,
        admin_unit_price: item.admin_unit_price,
        commission_per_unit_kobo: commissionPerUnitKobo,
        commission_kobo: commissionKobo,
        admin_amount_kobo: itemTotalKobo - commissionKobo,
        total_kobo: itemTotalKobo
      };
    });

    console.log('💰 PAYMENTS SERVICE - Commission calculation:', {
      totalAmount: totalAmount,
      totalAmountKobo: totalAmountKobo,
      platformCommissionKobo: platformCommissionKobo,
      adminAmountKobo: adminAmountKobo
    });

    // Determine if single-admin cart (to optionally use a static split)
    const adminIdsInCart = new Set(
      (cartData.items || []).map(ci => ci.admin_id).filter(Boolean)
    );
    const canUseStaticSplit = Boolean(process.env.PAYSTACK_SPLIT_CODE) && adminIdsInCart.size === 1;

    // Initialize Paystack payment; include split_code only for single-admin carts
    const paymentData = {
      email: cartData.customer_email,
      amount: totalAmountKobo,
      currency: 'NGN',
      reference: orderNumber,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
      metadata: {
        order_number: orderNumber,
        customer_name: cartData.customer_name,
        customer_phone: cartData.customer_phone,
        customer_address: cartData.customer_address,
        platform_commission: platformCommissionKobo,
        admin_amount: adminAmountKobo,
        items: itemsWithCommission.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          admin_unit_price: item.admin_unit_price,
          total_price: item.total_price,
          commission_per_unit_kobo: item.commission_per_unit_kobo,
          commission_kobo: item.commission_kobo,
          admin_id: cartData.items.find(ci => ci.product_id === item.product_id)?.admin_id
        }))
      }
    };

    if (canUseStaticSplit) {
      paymentData.split_code = process.env.PAYSTACK_SPLIT_CODE;
    }

    console.log('💳 PAYMENTS SERVICE - Initializing Paystack payment:', {
      email: paymentData.email,
      amount: paymentData.amount,
      reference: paymentData.reference
    });

    const response = await paystackConfig.initializePayment(paymentData);

    if (!response.status || !response.data) {
      throw new Error('Paystack initialization failed');
    }

    console.log('✅ PAYMENTS SERVICE - Paystack payment initialized:', response.data.reference);

    // Create pending order in database
    const orderData = {
      customer_name: cartData.customer_name,
      customer_email: cartData.customer_email,
      customer_phone: cartData.customer_phone,
      customer_address: cartData.customer_address,
      total_amount: totalAmount,
      payment_reference: response.data.reference,
      payment_status: 'pending',
      order_status: 'pending',
      items: validation.validated_items.map(item => ({
        product_id: item.product_id,
        admin_id: cartData.items.find(ci => ci.product_id === item.product_id)?.admin_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        admin_unit_price: item.admin_unit_price,
        total_price: item.total_price
      }))
    };

    const order = await ordersService.createOrder(orderData);

    console.log('✅ PAYMENTS SERVICE - Order created:', order.id);

    // Create per-item payment transactions for reconciliation
    try {
      await paymentTrackingService.createPaymentTransaction(
        { id: order.id, payment_reference: response.data.reference },
        orderData.items.map(i => ({
          admin_id: i.admin_id,
          product_id: i.product_id,
          quantity: i.quantity,
          admin_price: i.admin_unit_price,
          customer_price: i.unit_price
        }))
      );
    } catch (txErr) {
      console.error('⚠️ PAYMENTS SERVICE - Failed to create payment transactions:', txErr.message);
      // continue
    }

    return {
      order_id: order.id,
      order_number: orderNumber,
      payment_url: response.data.authorization_url,
      reference: response.data.reference,
      amount: totalAmount
    };
  } catch (error) {
    console.error('❌ PAYMENTS SERVICE - Payment initialization failed:', error);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

const verifyPayment = async (reference) => {
  try {
    console.log('🔍 PAYMENTS SERVICE - Verifying payment:', reference);
    
    const response = await paystackConfig.verifyPayment(reference);
    
    console.log('🔍 PAYMENTS SERVICE - Paystack verification response:', {
      status: response.data?.status,
      amount: response.data?.amount,
      reference: response.data?.reference
    });

    if (response.data.status === 'success') {
      // Update order payment status
      const order = await ordersService.updatePaymentStatus(reference, 'successful', response.data);
      
      if (!order) {
        throw new Error('Order not found for payment reference');
      }

      console.log('💳 PAYMENTS SERVICE - Payment successful, reducing stock for order:', order.id);

      // Reduce stock for all items in the order
      try {
        const stockReductions = await stockService.reduceMultipleStock(
          order.order_items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          })),
          'order_payment_success'
        );

        console.log('✅ PAYMENTS SERVICE - Stock reduced successfully:', stockReductions.length, 'items');
      } catch (stockError) {
        console.error('❌ PAYMENTS SERVICE - Stock reduction failed:', stockError);
        // Note: In a production system, you might want to handle this more gracefully
        // For now, we'll log the error but not fail the payment verification
      }

      // Update payment tracking transactions
      try {
        await paymentTrackingService.updateTransactionStatus(reference, 'completed');
      } catch (trackingError) {
        console.error('❌ PAYMENTS SERVICE - Payment tracking update failed:', trackingError);
        // Continue even if tracking fails
      }

      console.log('✅ PAYMENTS SERVICE - Payment verification successful:', order.id);
      return { 
        success: true, 
        order,
        message: 'Payment verified successfully'
      };
    } else {
      console.log('❌ PAYMENTS SERVICE - Payment verification failed:', response.data?.gateway_response);
      
      // Update order payment status to failed
      try {
        await ordersService.updatePaymentStatus(reference, 'failed', response.data);
      } catch (updateError) {
        console.error('❌ PAYMENTS SERVICE - Failed to update payment status to failed:', updateError);
      }

      return { 
        success: false, 
        message: response.data?.gateway_response || 'Payment verification failed'
      };
    }
  } catch (error) {
    console.error('❌ PAYMENTS SERVICE - Payment verification error:', error);
    
    // Try to update order status to failed
    try {
      await ordersService.updatePaymentStatus(reference, 'failed', { error: error.message });
    } catch (updateError) {
      console.error('❌ PAYMENTS SERVICE - Failed to update payment status after error:', updateError);
    }

    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

const handlePaystackWebhook = async (event) => {
  try {
    console.log('🔔 PAYMENTS SERVICE - Handling Paystack webhook:', event.event);
    
    switch (event.event) {
      case 'charge.success':
        console.log('🔔 PAYMENTS SERVICE - Processing successful charge webhook');
        const reference = event.data.reference;
        
        // Verify the payment to ensure it's legitimate
        const verification = await verifyPayment(reference);
        
        if (verification.success) {
          console.log('✅ PAYMENTS SERVICE - Webhook processed successfully for:', reference);
          return { success: true, message: 'Webhook processed successfully' };
        } else {
          console.log('❌ PAYMENTS SERVICE - Webhook verification failed for:', reference);
          return { success: false, message: 'Payment verification failed' };
        }
        
      case 'charge.failed':
        console.log('🔔 PAYMENTS SERVICE - Processing failed charge webhook');
        const failedReference = event.data.reference;
        
        try {
          await ordersService.updatePaymentStatus(failedReference, 'failed', event.data);
          console.log('✅ PAYMENTS SERVICE - Failed payment webhook processed for:', failedReference);
        } catch (error) {
          console.error('❌ PAYMENTS SERVICE - Failed to process failed payment webhook:', error);
        }
        
        return { success: true, message: 'Failed payment webhook processed' };
        
      default:
        console.log('🔔 PAYMENTS SERVICE - Unhandled webhook event:', event.event);
        return { success: true, message: 'Webhook event not handled' };
    }
  } catch (error) {
    console.error('❌ PAYMENTS SERVICE - Webhook handling failed:', error);
    throw new Error(`Webhook handling failed: ${error.message}`);
  }
};

const getPaymentStatus = async (reference) => {
  try {
    console.log('🔍 PAYMENTS SERVICE - Getting payment status:', reference);
    
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, order_status, total_amount, created_at')
      .eq('payment_reference', reference)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    console.log('✅ PAYMENTS SERVICE - Payment status retrieved:', order.payment_status);
    return {
      reference: reference,
      payment_status: order.payment_status,
      order_status: order.order_status,
      amount: order.total_amount,
      created_at: order.created_at
    };
  } catch (error) {
    console.error('❌ PAYMENTS SERVICE - Get payment status failed:', error);
    throw new Error(`Failed to get payment status: ${error.message}`);
  }
};

const validateCartForPayment = async (cartItems) => {
  try {
    console.log('🛒 PAYMENTS SERVICE - Validating cart for payment:', cartItems.length);
    
    const validation = await orderValidationService.validateCartBeforeCheckout(cartItems);
    
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        message: validation.message
      };
    }

    return {
      valid: true,
      validated_items: validation.validated_items,
      total_amount: validation.total_amount
    };
  } catch (error) {
    console.error('❌ PAYMENTS SERVICE - Cart validation failed:', error);
    throw new Error(`Cart validation failed: ${error.message}`);
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
  getPaymentStatus,
  validateCartForPayment
};

