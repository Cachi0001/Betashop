const categoriesService = require('../services/categories.service');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoriesService.getCategories();
    
    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.getCategoryById(id);
    
    res.status(200).json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoriesService.updateCategory(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoriesService.deleteCategory(id);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

