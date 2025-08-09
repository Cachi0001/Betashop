const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/database.config');
const paystackConfig = require('../config/paystack.config');

const registerAdmin = async (adminData) => {
  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminData.password, saltRounds);

    let recipientCode = null;
    
    // Create Paystack transfer recipient if bank details provided
    if (adminData.bank_details && adminData.bank_details.account_number && adminData.bank_details.bank_code) {
      try {
        const recipient = await paystackConfig.createTransferRecipient({
          type: 'nuban',
          name: adminData.bank_details.account_name,
          account_number: adminData.bank_details.account_number,
          bank_code: adminData.bank_details.bank_code,
          currency: 'NGN'
        });
        recipientCode = recipient.data.recipient_code;
      } catch (paystackError) {
        console.warn('Paystack recipient creation failed:', paystackError.message);
        // Continue with registration even if Paystack fails
      }
    }

    // Prepare admin data for database - ensure bank_details is never null
    const newAdmin = {
      email: adminData.email,
      password_hash: passwordHash,
      full_name: adminData.full_name,
      phone: adminData.phone,
      business_name: adminData.business_name,
      business_type: adminData.business_type,
      address: adminData.address,
      bank_details: adminData.bank_details && Object.keys(adminData.bank_details).length > 0 
        ? adminData.bank_details 
        : { account_name: '', account_number: '', bank_name: '', bank_code: '' },
      paystack_recipient_code: recipientCode,
      is_verified: false
    };

    // Insert admin into database
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .insert(newAdmin)
      .select()
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    delete admin.password_hash;
    delete admin.bank_details;

    return { admin, token };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

const loginAdmin = async (email, password) => {
  try {
    // Find admin by email
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    delete admin.password_hash;
    delete admin.bank_details;

    return { admin, token };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

const updateBankDetails = async (adminId, bankDetails) => {
  try {
    // Create Paystack transfer recipient
    const recipient = await paystackConfig.createTransferRecipient({
      type: 'nuban',
      name: bankDetails.account_name,
      account_number: bankDetails.account_number,
      bank_code: bankDetails.bank_code,
      currency: 'NGN'
    });

    // Update admin bank details
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .update({
        bank_details: bankDetails,
        paystack_recipient_code: recipient.data.recipient_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;

    // Remove sensitive data
    delete admin.password_hash;
    delete admin.bank_details;

    return admin;
  } catch (error) {
    throw new Error(`Bank details update failed: ${error.message}`);
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  updateBankDetails
};

