const express = require('express');
const router = express.Router();
const multer = require('multer');
const productsController = require('../controllers/products.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { validate, productSchema } = require('../middleware/validation.middleware');

// Configure multer for file uploads (memory storage for serverless compatibility)
// Vercel serverless functions have a read-only filesystem, so we cannot write to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit (adjust as needed)
});

// Public routes
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);

// Test endpoint without authentication (REMOVE IN PRODUCTION) - MUST BE BEFORE AUTH MIDDLEWARE
router.post('/test-create', validate(productSchema), async (req, res) => {
  try {
    console.log('🧪 TEST CREATE - Request body:', JSON.stringify(req.body, null, 2));
    
    res.json({
      success: true,
      message: 'Test endpoint reached successfully - validation passed!',
      data: { 
        received: req.body,
        note: 'This confirms the API and validation are working'
      }
    });
  } catch (error) {
    console.log('🧪 TEST CREATE - Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test admin lookup endpoint
router.post('/test-admin', async (req, res) => {
  try {
    const { supabaseAdmin } = require('../config/database.config');
    const testUserId = 'a710b964-3bab-457e-86a7-858d6ce09554'; // From the logs
    
    console.log('🧪 ADMIN TEST - Looking up admin with ID:', testUserId);
    
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    console.log('🧪 ADMIN TEST - Admin found:', !!admin);
    console.log('🧪 ADMIN TEST - Error:', error);
    
    res.json({
      success: true,
      message: 'Admin lookup test completed',
      data: {
        adminFound: !!admin,
        adminEmail: admin?.email,
        adminBusinessName: admin?.business_name,
        error: error?.message
      }
    });
  } catch (error) {
    console.log('🧪 ADMIN TEST - Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Protected routes (require admin authentication)
router.use(authenticateToken);
router.use(requireAdmin);

// Admin maintenance: recalculate customer_price for all products
router.post('/recalc-prices', productsController.recalcAllPrices);

router.post('/', validate(productSchema), productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);
router.post('/:id/restore', productsController.restoreProduct);
router.post('/:id/images', upload.array('images', 5), productsController.uploadProductImages);

module.exports = router;

