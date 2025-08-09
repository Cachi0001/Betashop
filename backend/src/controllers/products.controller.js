const productsService = require('../services/products.service');
const cloudinaryService = require('../services/cloudinary.service');

const createProduct = async (req, res, next) => {
  try {
    console.log('🚀 PRODUCT CONTROLLER - Create product started');
    console.log('🚀 PRODUCT CONTROLLER - User ID:', req.user.id);
    console.log('🚀 PRODUCT CONTROLLER - Request body:', JSON.stringify(req.body, null, 2));
    
    const product = await productsService.createProduct(req.user.id, req.body);
    
    console.log('✅ PRODUCT CONTROLLER - Product created successfully:', JSON.stringify(product, null, 2));
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.log('❌ PRODUCT CONTROLLER - Error creating product:', error.message);
    console.log('❌ PRODUCT CONTROLLER - Error stack:', error.stack);
    next(error);
  }
};

const recalcAllPrices = async (req, res, next) => {
  try {
    const result = await productsService.recalcAllPrices();
    res.status(200).json({ success: true, message: `Recalculated prices for ${result.updated} product(s)`, data: result });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category_id, search } = req.query;
    const filters = { category_id, search };
    
    const result = await productsService.getProducts(filters, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        products: result.products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          pages: Math.ceil(result.count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productsService.getProductById(id);
    
    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productsService.updateProduct(id, req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productsService.deleteProduct(id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    console.log('📸 PRODUCTS CONTROLLER - Uploading images for product:', id);
    console.log('📸 PRODUCTS CONTROLLER - Files received:', req.files.length);

    const cloudinaryService = require('../services/cloudinary.service');
    const images = await cloudinaryService.uploadMultipleImages(req.files, 'products');
    
    console.log('📸 PRODUCTS CONTROLLER - Images uploaded to Cloudinary:', images.length);

    // Update product with new images
    const updatedProduct = await productsService.updateProduct(id, req.user.id, { images });
    
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: { 
        images,
        product: updatedProduct
      }
    });
  } catch (error) {
    console.error('❌ PRODUCTS CONTROLLER - Image upload error:', error);
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  recalcAllPrices,
};

