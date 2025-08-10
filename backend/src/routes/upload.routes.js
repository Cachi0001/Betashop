const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Configure multer for file uploads using memory storage (production-friendly)
const upload = multer({ 
  storage: multer.memoryStorage(), // Use memory storage instead of disk
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), uploadController.uploadImage);
router.post('/images', authenticateToken, requireAdmin, upload.array('images', 10), uploadController.uploadMultipleImages);
router.delete('/image/:publicId', authenticateToken, requireAdmin, uploadController.deleteImage);

module.exports = router;