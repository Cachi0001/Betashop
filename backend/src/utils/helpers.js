const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Platform fee constants
const PLATFORM_BASE_FEE = 5000; // ₦5,000 base fee
const PLATFORM_PERCENTAGE = 0.07; // 7%

const calculateCustomerPrice = (adminPrice) => {
  // Customer pays admin price + base fee + percentage of admin price
  const percentageFee = Math.round(Number(adminPrice) * PLATFORM_PERCENTAGE);
  return Math.round(Number(adminPrice) + PLATFORM_BASE_FEE + percentageFee);
};

const calculatePlatformCommission = (customerPrice, adminPrice) => {
  // Platform commission equals base fee + percentage of admin price
  return Math.round(Number(customerPrice) - Number(adminPrice));
};

const calculatePlatformFeeBreakdown = (adminPrice) => {
  const percentageFee = Math.round(Number(adminPrice) * PLATFORM_PERCENTAGE);
  return {
    baseFee: PLATFORM_BASE_FEE,
    percentageFee,
    totalPlatformFee: PLATFORM_BASE_FEE + percentageFee,
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

module.exports = {
  generateOrderNumber,
  generateSlug,
  calculateCustomerPrice,
  calculatePlatformCommission,
  calculatePlatformFeeBreakdown,
  PLATFORM_BASE_FEE,
  PLATFORM_PERCENTAGE,
  formatCurrency,
  generateSecureToken,
  paginate
};

