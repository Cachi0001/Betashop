const cloudinaryService = require('../services/cloudinary.service');
const fs = require('fs').promises;
const path = require('path');

const uploadImage = async (req, res) => {
  try {
    console.log('📸 UPLOAD CONTROLLER - Single image upload request');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('📸 UPLOAD CONTROLLER - File received:', req.file.filename);

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(req.file, 'products');
    
    console.log('✅ UPLOAD CONTROLLER - Image uploaded to Cloudinary:', result.url);

    // Clean up temporary file
    try {
      await fs.unlink(req.file.path);
      console.log('🧹 UPLOAD CONTROLLER - Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ UPLOAD CONTROLLER - Failed to cleanup temp file:', cleanupError.message);
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('❌ UPLOAD CONTROLLER - Image upload error:', error);
    
    // Clean up temporary file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('⚠️ UPLOAD CONTROLLER - Failed to cleanup temp file after error:', cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Image upload failed'
    });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    console.log('📸 UPLOAD CONTROLLER - Multiple images upload request');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    console.log('📸 UPLOAD CONTROLLER - Files received:', req.files.length);

    // Upload all images to Cloudinary
    const results = await cloudinaryService.uploadMultipleImages(req.files, 'products');
    
    console.log('✅ UPLOAD CONTROLLER - All images uploaded to Cloudinary');

    // Clean up temporary files
    const cleanupPromises = req.files.map(file => 
      fs.unlink(file.path).catch(err => 
        console.warn('⚠️ UPLOAD CONTROLLER - Failed to cleanup temp file:', err.message)
      )
    );
    await Promise.all(cleanupPromises);
    console.log('🧹 UPLOAD CONTROLLER - All temporary files cleaned up');

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: results.map(result => ({
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height
        }))
      }
    });
  } catch (error) {
    console.error('❌ UPLOAD CONTROLLER - Multiple images upload error:', error);
    
    // Clean up temporary files on error
    if (req.files) {
      const cleanupPromises = req.files.map(file => 
        fs.unlink(file.path).catch(err => 
          console.warn('⚠️ UPLOAD CONTROLLER - Failed to cleanup temp file after error:', err.message)
        )
      );
      await Promise.all(cleanupPromises);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Images upload failed'
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    console.log('🗑️ UPLOAD CONTROLLER - Delete image request:', publicId);
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    const result = await cloudinaryService.deleteImage(publicId);
    
    console.log('✅ UPLOAD CONTROLLER - Image deleted from Cloudinary');

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ UPLOAD CONTROLLER - Image deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Image deletion failed'
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage
};