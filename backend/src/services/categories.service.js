const { supabaseAdmin } = require('../config/database.config');
const { generateSlug } = require('../utils/helpers');

const createCategory = async (categoryData) => {
  try {
    const slug = generateSlug(categoryData.name);
    
    const newCategory = {
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || null,
      parent_id: categoryData.parent_id || null,
      attribute_schema: categoryData.attribute_schema || {}
    };

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert(newCategory)
      .select()
      .single();

    if (error) throw error;
    return category;
  } catch (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
};

const getCategories = async () => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return categories;
  } catch (error) {
    throw new Error(`Failed to get categories: ${error.message}`);
  }
};

const getCategoryById = async (categoryId) => {
  try {
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) throw error;
    return category;
  } catch (error) {
    throw new Error(`Failed to get category: ${error.message}`);
  }
};

const updateCategory = async (categoryId, updateData) => {
  try {
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return category;
  } catch (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

const deleteCategory = async (categoryId) => {
  try {
    // Check if category has products
    const { count: productCount, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) throw countError;
    if (productCount > 0) {
      throw new Error('Cannot delete category with existing products');
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return { message: 'Category deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

