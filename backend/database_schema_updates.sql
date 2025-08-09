-- Complete E-commerce Database Schema Updates
-- Run these commands in your Supabase SQL editor

-- Create orders table for tracking customer purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed')),
  order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table for tracking individual products in orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add WhatsApp number to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_admin_id ON order_items(admin_id);

-- Soft delete support for products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Helpful index for filtering out archived products
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);

-- Create updated_at trigger for orders table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add snapshot of admin price on order_items for payout accuracy
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS admin_unit_price DECIMAL(10,2);

-- Backfill existing rows where possible
UPDATE order_items oi
SET admin_unit_price = p.admin_price
FROM products p
WHERE oi.product_id = p.id AND oi.admin_unit_price IS NULL;

-- Optional: index for analytics/queries
CREATE INDEX IF NOT EXISTS idx_order_items_admin_unit_price ON order_items(admin_unit_price);

-- Add RLS (Row Level Security) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can only see their own orders
CREATE POLICY "Customers can view their own orders" ON orders
    FOR SELECT USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Admins can see orders containing their products
CREATE POLICY "Admins can view orders with their products" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM order_items oi 
            WHERE oi.order_id = orders.id 
            AND oi.admin_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Policy: Only authenticated users can insert orders
CREATE POLICY "Authenticated users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Admins can view order items for their products
CREATE POLICY "Admins can view their order items" ON order_items
    FOR SELECT USING (admin_id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Only authenticated users can insert order items
CREATE POLICY "Authenticated users can create order items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert sample data for testing (optional)
-- You can run this to test the schema
/*
INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, payment_reference) 
VALUES (
    'John Doe', 
    'john@example.com', 
    '+2348012345678', 
    '{"street": "123 Main St", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}',
    15000.00,
    'test_ref_' || gen_random_uuid()
);
*/