const paymentTrackingService = require('../services/payment-tracking.service');

const getAdminEarnings = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { status, startDate, endDate } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const earnings = await paymentTrackingService.getAdminEarnings(adminId, filters);
    
    res.status(200).json({
      success: true,
      data: earnings
    });
  } catch (error) {
    next(error);
  }
};

const processPayouts = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    
    const result = await paymentTrackingService.processAdminPayouts(adminId);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        amount: result.amount,
        transfer_reference: result.transfer_reference,
        transactions_count: result.transactions_count
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLocationBasedProducts = async (req, res, next) => {
  try {
    const { city, state } = req.query;
    
    const filters = {};
    if (city) filters.city = city;
    if (state) filters.state = state;

    const products = await paymentTrackingService.getLocationBasedProducts(filters);
    
    res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminEarnings,
  processPayouts,
  getLocationBasedProducts
};