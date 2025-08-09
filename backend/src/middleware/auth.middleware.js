const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const authenticateToken = async (req, res, next) => {
  console.log('🔐 AUTH - Authenticate token started');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 AUTH - Auth header:', authHeader ? 'Present' : 'Missing');
  console.log('🔐 AUTH - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ AUTH - No token provided');
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ AUTH - Token decoded successfully:', JSON.stringify(decoded, null, 2));
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ AUTH - Token verification failed:', error.message);
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    console.log('👤 ADMIN CHECK - Checking admin access for user ID:', req.user.id);
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.user.id)
      .single();

    console.log('👤 ADMIN CHECK - Database query result:', admin ? 'Admin found' : 'No admin found');
    console.log('👤 ADMIN CHECK - Database error:', error);

    if (error || !admin) {
      console.log('❌ ADMIN CHECK - Admin access denied');
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    console.log('✅ ADMIN CHECK - Admin access granted for:', admin.business_name);
    req.admin = admin;
    next();
  } catch (error) {
    console.log('💥 ADMIN CHECK - Server error:', error.message);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { authenticateToken, requireAdmin };

