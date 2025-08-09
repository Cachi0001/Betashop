const { supabaseAdmin } = require("../config/database.config");

const generateWhatsAppLink = async (orderId) => {
  try {
    console.log('📱 WHATSAPP SERVICE - Generating WhatsApp link for order:', orderId);
    
    // Get order details with admin information
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            customer_price
          ),
          admins (
            id,
            business_name,
            whatsapp_number,
            full_name
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    // Group items by admin to create separate WhatsApp links if needed
    const adminGroups = {};
    
    order.order_items.forEach(item => {
      const adminId = item.admin_id;
      if (!adminGroups[adminId]) {
        adminGroups[adminId] = {
          admin: item.admins,
          items: []
        };
      }
      adminGroups[adminId].items.push(item);
    });

    const whatsappLinks = [];

    // Create WhatsApp link for each admin
    for (const [adminId, group] of Object.entries(adminGroups)) {
      const admin = group.admin;
      const items = group.items;
      
      // Use admin's WhatsApp number or fallback to phone number
      let whatsappNumber = admin.whatsapp_number;
      
      // If no WhatsApp number, use a default store number or skip
      if (!whatsappNumber) {
        console.log('⚠️ WHATSAPP SERVICE - No WhatsApp number for admin:', adminId);
        whatsappNumber = process.env.DEFAULT_WHATSAPP_NUMBER || '+2348000000000';
      }

      // Clean the phone number (remove spaces, dashes, etc.)
      whatsappNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
      
      // Ensure it starts with country code
      if (!whatsappNumber.startsWith('+')) {
        if (whatsappNumber.startsWith('0')) {
          whatsappNumber = '+234' + whatsappNumber.substring(1);
        } else if (whatsappNumber.startsWith('234')) {
          whatsappNumber = '+' + whatsappNumber;
        } else {
          whatsappNumber = '+234' + whatsappNumber;
        }
      }

      // Create message content
      const message = createOrderMessage(order, items, admin);
      
      // Generate WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
      
      whatsappLinks.push({
        admin_id: adminId,
        admin_name: admin.business_name || admin.full_name,
        whatsapp_number: whatsappNumber,
        whatsapp_url: whatsappUrl,
        items: items.map(item => ({
          product_name: item.products.name,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      });

      console.log('📱 WHATSAPP SERVICE - WhatsApp link generated for admin:', admin.business_name);
    }

    console.log('✅ WHATSAPP SERVICE - Generated', whatsappLinks.length, 'WhatsApp links');
    return {
      order_id: orderId,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      whatsapp_links: whatsappLinks
    };
  } catch (error) {
    console.error('❌ WHATSAPP SERVICE - Generate WhatsApp link failed:', error);
    throw new Error(`Failed to generate WhatsApp link: ${error.message}`);
  }
};

const createOrderMessage = (order, items, admin) => {
  const businessName = admin.business_name || admin.full_name || 'Store';
  
  let message = `Hi ${businessName}! 👋\n\n`;
  message += `I just completed my order #${order.id.substring(0, 8)} on your store.\n\n`;
  
  message += `📦 *Order Details:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.products.name}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ₦${parseFloat(item.total_price).toLocaleString()}\n\n`;
  });
  
  const itemsTotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
  message += `💰 *Total for your items: ₦${itemsTotal.toLocaleString()}*\n\n`;
  
  message += `👤 *Customer Details:*\n`;
  message += `Name: ${order.customer_name}\n`;
  message += `Phone: ${order.customer_phone}\n`;
  message += `Email: ${order.customer_email}\n\n`;
  
  if (order.customer_address) {
    message += `📍 *Delivery Address:*\n`;
    const addr = order.customer_address;
    if (addr.street) message += `${addr.street}\n`;
    message += `${addr.city}, ${addr.state}\n`;
    message += `${addr.country}\n\n`;
  }
  
  message += `Please let me know about delivery arrangements and estimated delivery time. Thank you! 🙏`;
  
  return message;
};

const generateQuickWhatsAppLink = (phoneNumber, message) => {
  try {
    console.log('📱 WHATSAPP SERVICE - Generating quick WhatsApp link');
    
    // Clean the phone number
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure it starts with country code
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '+234' + cleanNumber.substring(1);
      } else if (cleanNumber.startsWith('234')) {
        cleanNumber = '+' + cleanNumber;
      } else {
        cleanNumber = '+234' + cleanNumber;
      }
    }

    const whatsappUrl = `https://wa.me/${cleanNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    console.log('✅ WHATSAPP SERVICE - Quick WhatsApp link generated');
    return {
      whatsapp_number: cleanNumber,
      whatsapp_url: whatsappUrl
    };
  } catch (error) {
    console.error('❌ WHATSAPP SERVICE - Generate quick WhatsApp link failed:', error);
    throw new Error(`Failed to generate WhatsApp link: ${error.message}`);
  }
};

const updateAdminWhatsAppNumber = async (adminId, whatsappNumber) => {
  try {
    console.log('📱 WHATSAPP SERVICE - Updating admin WhatsApp number:', adminId);
    
    // Clean the phone number
    let cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure it starts with country code
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '+234' + cleanNumber.substring(1);
      } else if (cleanNumber.startsWith('234')) {
        cleanNumber = '+' + cleanNumber;
      } else {
        cleanNumber = '+234' + cleanNumber;
      }
    }

    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .update({ whatsapp_number: cleanNumber })
      .eq("id", adminId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ WHATSAPP SERVICE - Admin WhatsApp number updated');
    return {
      admin_id: adminId,
      whatsapp_number: cleanNumber
    };
  } catch (error) {
    console.error('❌ WHATSAPP SERVICE - Update admin WhatsApp number failed:', error);
    throw new Error(`Failed to update WhatsApp number: ${error.message}`);
  }
};

const getAdminWhatsAppNumber = async (adminId) => {
  try {
    console.log('📱 WHATSAPP SERVICE - Getting admin WhatsApp number:', adminId);
    
    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("whatsapp_number, business_name, full_name")
      .eq("id", adminId)
      .single();

    if (error || !admin) {
      throw new Error('Admin not found');
    }

    console.log('✅ WHATSAPP SERVICE - Admin WhatsApp number retrieved');
    return {
      admin_id: adminId,
      admin_name: admin.business_name || admin.full_name,
      whatsapp_number: admin.whatsapp_number
    };
  } catch (error) {
    console.error('❌ WHATSAPP SERVICE - Get admin WhatsApp number failed:', error);
    throw new Error(`Failed to get WhatsApp number: ${error.message}`);
  }
};

const createCustomMessage = (template, data) => {
  try {
    let message = template;
    
    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `[${key.toUpperCase()}]`;
      message = message.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    
    return message;
  } catch (error) {
    console.error('❌ WHATSAPP SERVICE - Create custom message failed:', error);
    throw new Error(`Failed to create custom message: ${error.message}`);
  }
};

module.exports = {
  generateWhatsAppLink,
  generateQuickWhatsAppLink,
  updateAdminWhatsAppNumber,
  getAdminWhatsAppNumber,
  createCustomMessage
};