const admin = require('../config/firebase.config');

const sendNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

const sendOrderNotification = async (customerToken, orderData) => {
  try {
    const title = 'Order Update';
    const body = `Your order #${orderData.order_number} has been ${orderData.status}`;
    const data = {
      order_id: orderData.id,
      order_number: orderData.order_number,
      status: orderData.status
    };

    return await sendNotification(customerToken, title, body, data);
  } catch (error) {
    throw new Error(`Failed to send order notification: ${error.message}`);
  }
};

const sendPaymentNotification = async (adminToken, paymentData) => {
  try {
    const title = 'Payment Received';
    const body = `You received a payment of ₦${paymentData.amount.toLocaleString()}`;
    const data = {
      payment_id: paymentData.id,
      amount: paymentData.amount.toString(),
      order_number: paymentData.order_number
    };

    return await sendNotification(adminToken, title, body, data);
  } catch (error) {
    throw new Error(`Failed to send payment notification: ${error.message}`);
  }
};

module.exports = {
  sendNotification,
  sendOrderNotification,
  sendPaymentNotification
};

