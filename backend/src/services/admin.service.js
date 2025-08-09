const { supabaseAdmin } = require('../config/database.config');

const getAdminProfile = async (adminId) => {
  try {
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, email, full_name, phone, business_name, business_type, address, is_verified, created_at')
      .eq('id', adminId)
      .single();

    if (error) throw error;
    return admin;
  } catch (error) {
    throw new Error(`Failed to get admin profile: ${error.message}`);
  }
};

const updateAdminProfile = async (adminId, updateData) => {
  try {
    const allowedFields = ['full_name', 'phone', 'business_name', 'business_type', 'address'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    filteredData.updated_at = new Date().toISOString();

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .update(filteredData)
      .eq('id', adminId)
      .select('id, email, full_name, phone, business_name, business_type, address, is_verified')
      .single();

    if (error) throw error;
    return admin;
  } catch (error) {
    throw new Error(`Failed to update admin profile: ${error.message}`);
  }
};

const getAdminAnalytics = async (adminId) => {
  try {
    // Get total sales
    const { data: salesData, error: salesError } = await supabaseAdmin
      .from('order_items')
      .select('admin_price, quantity')
      .eq('admin_id', adminId);

    if (salesError) throw salesError;

    const totalSales = salesData.reduce((sum, item) => sum + (item.admin_price * item.quantity), 0);

    // Get total transfers
    const { data: transfersData, error: transfersError } = await supabaseAdmin
      .from('transfers')
      .select('amount, status')
      .eq('admin_id', adminId);

    if (transfersError) throw transfersError;

    const totalTransfers = transfersData
      .filter(transfer => transfer.status === 'success')
      .reduce((sum, transfer) => sum + transfer.amount, 0);

    const pendingTransfers = transfersData
      .filter(transfer => transfer.status === 'pending')
      .reduce((sum, transfer) => sum + transfer.amount, 0);

    // Get product count
    const { count: productCount, error: productError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', adminId)
      .eq('status', 'active');

    if (productError) throw productError;

    return {
      total_sales: totalSales,
      total_transfers: totalTransfers,
      pending_transfers: pendingTransfers,
      product_count: productCount || 0
    };
  } catch (error) {
    throw new Error(`Failed to get admin analytics: ${error.message}`);
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  getAdminAnalytics
};

