const { supabaseAdmin } = require('../config/database.config');

const createPaymentTransaction = async (orderData, orderItems) => {
  try {
    const transactions = [];

    for (const item of orderItems) {
      const adminEarnings = item.admin_price * item.quantity;
      const platformCommission = (item.customer_price - item.admin_price) * item.quantity;
      const totalAmount = item.customer_price * item.quantity;

      const transaction = {
        order_id: orderData.id,
        admin_id: item.admin_id,
        product_id: item.product_id,
        transaction_type: 'sale',
        amount: totalAmount,
        admin_earnings: adminEarnings,
        platform_commission: platformCommission,
        status: 'pending',
        paystack_reference: orderData.payment_reference
      };

      transactions.push(transaction);
    }

    const { data: createdTransactions, error } = await supabaseAdmin
      .from('payment_transactions')
      .insert(transactions)
      .select();

    if (error) throw error;
    return createdTransactions;
  } catch (error) {
    throw new Error(`Failed to create payment transactions: ${error.message}`);
  }
};

const updateTransactionStatus = async (paymentReference, status) => {
  try {
    const { data: transactions, error } = await supabaseAdmin
      .from('payment_transactions')
      .update({ 
        status: status,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('paystack_reference', paymentReference)
      .select();

    if (error) throw error;
    return transactions;
  } catch (error) {
    throw new Error(`Failed to update transaction status: ${error.message}`);
  }
};

const getAdminEarnings = async (adminId, filters = {}) => {
  try {
    let query = supabaseAdmin
      .from('payment_transactions')
      .select(`
        *,
        orders(order_number, customer_name, created_at),
        products(name, images)
      `)
      .eq('admin_id', adminId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data: transactions, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get summary
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('admin_earnings_summary')
      .select('*')
      .eq('admin_id', adminId)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      throw summaryError;
    }

    return {
      transactions,
      summary: summary || {
        total_sales: 0,
        total_earnings: 0,
        total_commission_paid: 0,
        pending_earnings: 0,
        completed_transfers: 0
      }
    };
  } catch (error) {
    throw new Error(`Failed to get admin earnings: ${error.message}`);
  }
};

const processAdminPayouts = async (adminId) => {
  try {
    // Get pending transactions for admin
    const { data: pendingTransactions, error: fetchError } = await supabaseAdmin
      .from('payment_transactions')
      .select('*')
      .eq('admin_id', adminId)
      .eq('status', 'pending');

    if (fetchError) throw fetchError;

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return { message: 'No pending transactions to process' };
    }

    // Calculate total payout amount
    const totalPayout = pendingTransactions.reduce((sum, transaction) => {
      return sum + parseFloat(transaction.admin_earnings);
    }, 0);

    // Get admin bank details
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('bank_details, paystack_recipient_code')
      .eq('id', adminId)
      .single();

    if (adminError) throw adminError;

    // Here you would integrate with Paystack to create transfer
    // For now, we'll simulate the transfer creation
    const transferReference = `TRF_${Date.now()}_${adminId.substring(0, 8)}`;

    // Update transactions as completed
    const { error: updateError } = await supabaseAdmin
      .from('payment_transactions')
      .update({ 
        status: 'completed',
        transfer_reference: transferReference,
        processed_at: new Date().toISOString()
      })
      .eq('admin_id', adminId)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    return {
      message: 'Payout processed successfully',
      amount: totalPayout,
      transfer_reference: transferReference,
      transactions_count: pendingTransactions.length
    };
  } catch (error) {
    throw new Error(`Failed to process admin payouts: ${error.message}`);
  }
};

const getLocationBasedProducts = async (filters = {}) => {
  try {
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        categories(name, slug),
        admins(business_name, address)
      `)
      .eq('status', 'active');

    if (filters.city) {
      query = query.ilike('location->>city', `%${filters.city}%`);
    }

    if (filters.state) {
      query = query.ilike('location->>state', `%${filters.state}%`);
    }

    const { data: products, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return products;
  } catch (error) {
    throw new Error(`Failed to get location-based products: ${error.message}`);
  }
};

module.exports = {
  createPaymentTransaction,
  updateTransactionStatus,
  getAdminEarnings,
  processAdminPayouts,
  getLocationBasedProducts
};