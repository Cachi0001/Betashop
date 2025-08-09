const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidPrice = (price) => {
  return typeof price === 'number' && price > 0;
};

const isValidQuantity = (quantity) => {
  return Number.isInteger(quantity) && quantity >= 0;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const validateBankDetails = (bankDetails) => {
  const required = ['account_name', 'account_number', 'bank_name', 'bank_code'];
  return required.every(field => bankDetails[field] && bankDetails[field].trim());
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidUUID,
  isValidPrice,
  isValidQuantity,
  sanitizeString,
  validateBankDetails
};

