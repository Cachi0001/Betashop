const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// All admin routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/profile', adminController.getProfile);
router.put('/profile', adminController.updateProfile);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

