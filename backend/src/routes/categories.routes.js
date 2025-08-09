const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategoryById);

// Protected routes (require admin authentication)
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;

