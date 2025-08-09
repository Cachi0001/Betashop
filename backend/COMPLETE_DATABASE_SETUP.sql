-- COMPLETE E-COMMERCE DATABASE SETUP
-- Run this ONCE in your Supabase SQL Editor
-- This replaces all other SQL files

-- =====================================================
-- 1. CREATE ORDERS TABLE WITH ALL REQUIRED COLUMNS
-- =====================================================

-- Drop existing orders table if it has issues
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table with correct structure
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(255) NOT NULL DEFAULT ('ORD-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || LPAD((RANDOM() * 999)::int::text, 3, '0')),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address JSONB NOT NULL DEFAULT '{}',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed')),
  order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE ORDER ITEMS TABLE
-- =====================================================

-- Drop existing order_items table if it exists
DROP TABLE IF EXISTS order_items CASCADE;

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ADD WHATSAPP SUPPORT TO ADMINS
-- =====================================================

ALTER TABLE admins ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_admin_id ON order_items(admin_id);

-- =====================================================
-- 5. CREATE TRIGGERS FOR AUTO-UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. FIX EXISTING TABLES (if they exist but are missing columns)
-- =====================================================

-- Add missing columns to existing order_items table if it exists
DO $$ 
BEGIN
    -- Check if order_items table exists but is missing total_price column
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
        -- Add total_price column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'total_price') THEN
            ALTER TABLE order_items ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0);
            -- Update existing records to calculate total_price
            UPDATE order_items SET total_price = unit_price * quantity WHERE total_price = 0;
        END IF;
        
        -- Add unit_price column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'unit_price') THEN
            ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0);
        END IF;
        
        -- Add quantity column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'quantity') THEN
            ALTER TABLE order_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0);
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. VERIFY SETUP
-- =====================================================

-- Test insert to verify everything works
DO $$
DECLARE
    test_order_id UUID;
    test_admin_id UUID;
    test_product_id UUID;
BEGIN
    -- Get first admin and product for testing
    SELECT id INTO test_admin_id FROM admins LIMIT 1;
    SELECT id INTO test_product_id FROM products LIMIT 1;
    
    -- Only run test if we have admin and product
    IF test_admin_id IS NOT NULL AND test_product_id IS NOT NULL THEN
        -- Insert test order
        INSERT INTO orders (
          customer_name, 
          customer_email, 
          customer_phone, 
          customer_address, 
          total_amount, 
          payment_reference
        ) VALUES (
          'Test Customer',
          'test@example.com',
          '+2348012345678',
          '{"street": "123 Test St", "city": "Lagos", "state": "Lagos", "country": "Nigeria"}',
          1000.00,
          'test_ref_' || EXTRACT(EPOCH FROM NOW())::bigint
        ) RETURNING id INTO test_order_id;
        
        -- Insert test order item
        INSERT INTO order_items (
          order_id,
          product_id,
          admin_id,
          quantity,
          unit_price,
          total_price
        ) VALUES (
          test_order_id,
          test_product_id,
          test_admin_id,
          2,
          500.00,
          1000.00
        );
        
        -- Clean up test records
        DELETE FROM order_items WHERE order_id = test_order_id;
        DELETE FROM orders WHERE id = test_order_id;
        
        RAISE NOTICE '✅ Test completed successfully - both orders and order_items tables work!';
    ELSE
        RAISE NOTICE '⚠️ Skipping test - no admin or product found for testing';
    END IF;
END $$;

-- Show final structure
SELECT 'ORDERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

SELECT 'ORDER_ITEMS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

SELECT '✅ DATABASE SETUP COMPLETE!' as result;