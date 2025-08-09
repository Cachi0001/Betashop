const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerAdmin(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin: result.admin,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: result.admin,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        admin: req.admin
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBankDetails = async (req, res, next) => {
  try {
    const admin = await authService.updateBankDetails(req.admin.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: {
        admin
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateBankDetails
};

