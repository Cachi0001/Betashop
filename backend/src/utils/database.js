const { supabaseAdmin } = require("../config/database.config");

const createTables = async () => {
  try {
    // Admins Table
    await supabaseAdmin.from("admins").upsert({}).match({ id: null });
    // Categories Table
    await supabaseAdmin.from("categories").upsert({}).match({ id: null });
    // Products Table
    await supabaseAdmin.from("products").upsert({}).match({ id: null });
    // Orders Table
    await supabaseAdmin.from("orders").upsert({}).match({ id: null });
    // Order Items Table
    await supabaseAdmin.from("order_items").upsert({}).match({ id: null });
    // Transfers Table
    await supabaseAdmin.from("transfers").upsert({}).match({ id: null });

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

const checkConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin.from("admins").select("count").limit(1);
    if (error) throw error;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

module.exports = {
  createTables,
  checkConnection,
};

