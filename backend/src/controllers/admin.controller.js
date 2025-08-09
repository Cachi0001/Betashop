const adminService = require('../services/admin.service');

const getProfile = async (req, res, next) => {
  try {
    const admin = await adminService.getAdminProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { admin }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const admin = await adminService.updateAdminProfile(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin }
    });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAdminAnalytics(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAnalytics
};

