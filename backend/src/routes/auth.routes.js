const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, adminRegistrationSchema, adminLoginSchema, bankDetailsSchema } = require('../middleware/validation.middleware');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.post('/owner-register', validate(adminRegistrationSchema), authController.register);
router.post('/login', validate(adminLoginSchema), authController.login);

router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, requireAdmin, authController.getProfile);
router.put('/bank-details', authenticateToken, requireAdmin, validate(bankDetailsSchema), authController.updateBankDetails);

// Test endpoint to check token validity
router.get('/test-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;

