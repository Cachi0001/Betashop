const paystackConfig = require('../config/paystack.config');
const { supabaseAdmin } = require('../config/database.config');

const initiateTransfers = async (orderId) => {
  try {
    // Get order items grouped by admin
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        *,
        admins!inner(id, paystack_recipient_code, business_name, bank_details),
        orders!inner(order_number)
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Group items by admin
    const adminGroups = {};
    orderItems.forEach(item => {
      const adminId = item.admin_id;
      if (!adminGroups[adminId]) {
        adminGroups[adminId] = {
          admin: item.admins,
          order_number: item.orders.order_number,
          total_amount: 0,
          items: []
        };
      }
      // Use snapshot price stored on order_items
      const adminUnit = Number(item.admin_unit_price || 0);
      const qty = Number(item.quantity || 0);
      adminGroups[adminId].total_amount += adminUnit * qty;
      adminGroups[adminId].items.push(item);
    });

    // Initiate transfers for each admin
    const transferResults = [];
    for (const adminId in adminGroups) {
      const group = adminGroups[adminId];
      
      try {
        // Ensure recipient exists; create if missing
        let recipientCode = group.admin.paystack_recipient_code;
        if (!recipientCode) {
          const bank = group.admin.bank_details || {};
          if (!bank.account_number || !bank.bank_code) {
            throw new Error('Missing bank details for admin');
          }
          const recipientResp = await paystackConfig.createTransferRecipient({
            type: 'nuban',
            name: group.admin.business_name || 'Store Admin',
            account_number: String(bank.account_number),
            bank_code: String(bank.bank_code),
            currency: 'NGN'
          });
          if (!recipientResp.status || !recipientResp.data?.recipient_code) {
            throw new Error('Failed to create transfer recipient');
          }
          recipientCode = recipientResp.data.recipient_code;
          // Persist on admin record
          await supabaseAdmin
            .from('admins')
            .update({ paystack_recipient_code: recipientCode })
            .eq('id', adminId);
        }

        const transferData = {
          source: 'balance',
          amount: group.total_amount * 100, // Convert to kobo
          recipient: recipientCode,
          reason: `Product sale payout - Order #${group.order_number}`,
          currency: 'NGN'
        };

        const transfer = await paystackConfig.initiateTransfer(transferData);

        // Save transfer record
        const { data: transferRecord, error: transferError } = await supabaseAdmin
          .from('transfers')
          .insert({
            order_id: orderId,
            admin_id: adminId,
            amount: group.total_amount,
            paystack_transfer_id: transfer.data.id,
            transfer_reference: transfer.data.reference,
            status: 'pending'
          })
          .select()
          .single();

        if (transferError) throw transferError;

        transferResults.push({
          admin_id: adminId,
          business_name: group.admin.business_name,
          amount: group.total_amount,
          transfer_id: transfer.data.id,
          status: 'initiated'
        });
      } catch (error) {
        console.error(`Transfer failed for admin ${adminId}:`, error);
        transferResults.push({
          admin_id: adminId,
          business_name: group.admin.business_name,
          amount: group.total_amount,
          status: 'failed',
          error: error.message
        });
      }
    }

    return transferResults;
  } catch (error) {
    throw new Error(`Transfer initiation failed: ${error.message}`);
  }
};

const getTransferHistory = async (adminId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { data: transfers, error } = await supabaseAdmin
      .from('transfers')
      .select(`
        *,
        orders!inner(order_number, customer_name)
      `)
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return transfers;
  } catch (error) {
    throw new Error(`Failed to get transfer history: ${error.message}`);
  }
};

module.exports = {
  initiateTransfers,
  getTransferHistory
};

