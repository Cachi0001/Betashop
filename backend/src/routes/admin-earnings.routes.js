const express = require('express');
const router = express.Router();
const adminEarningsController = require('../controllers/admin-earnings.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin earnings and transactions
router.get('/earnings', adminEarningsController.getAdminEarnings);

// Process pending payouts for admin
router.post('/payouts', adminEarningsController.processPayouts);

// Get location-based products (public endpoint, remove auth for this one)
router.get('/products/location', adminEarningsController.getLocationBasedProducts);

module.exports = router;