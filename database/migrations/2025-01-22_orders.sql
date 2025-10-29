-- Orders Management Migration
-- This migration creates tables for order management
BEGIN;

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Order Information
  order_number TEXT NOT NULL, -- e.g., #6001
  order_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_avatar_url TEXT,
  
  -- Shipping Address
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'Philippines',
  
  -- Billing Address (if different)
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  
  -- Order Status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled', 'refunded'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  fulfillment_status TEXT DEFAULT 'unfulfilled', -- 'unfulfilled', 'fulfilled', 'partially_fulfilled'
  
  -- Payment Information
  payment_method TEXT, -- 'credit_card', 'debit_card', 'cod', 'gcash', 'paymaya', etc.
  payment_reference TEXT,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping_fee DECIMAL(10,2) DEFAULT 0.00,
  tax DECIMAL(10,2) DEFAULT 0.00,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Shipping
  shipping_method TEXT,
  tracking_number TEXT,
  courier TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  UNIQUE(user_id, order_number)
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Product Reference
  product_id UUID, -- Can be NULL if product is deleted
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image_url TEXT,
  
  -- Variation Details
  variation_id UUID, -- Reference to product_variations if applicable
  variation_name TEXT, -- e.g., "Size: L, Color: Red"
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER STATUS HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Status Change
  previous_status TEXT,
  new_status TEXT NOT NULL,
  
  -- Details
  notes TEXT,
  changed_by TEXT, -- User who made the change
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER NOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Note Details
  note TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true, -- Internal notes vs customer-visible
  created_by TEXT, -- User who created the note
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER REFUNDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Refund Details
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT,
  refund_method TEXT, -- 'original_payment', 'store_credit', etc.
  refund_reference TEXT,
  
  -- Items Refunded
  refunded_items JSONB, -- Array of {item_id, quantity, amount}
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders (order_date);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON public.orders (deleted_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON public.order_items (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history (order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_user_id ON public.order_status_history (user_id);

CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes (order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_user_id ON public.order_notes (user_id);

CREATE INDEX IF NOT EXISTS idx_order_refunds_order_id ON public.order_refunds (order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_user_id ON public.order_refunds (user_id);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON public.order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_refunds_updated_at 
    BEFORE UPDATE ON public.order_refunds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- Order Items Policies
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order items" ON public.order_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order items" ON public.order_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own order items" ON public.order_items
    FOR DELETE USING (auth.uid() = user_id);

-- Order Status History Policies
CREATE POLICY "Users can view own order status history" ON public.order_status_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order status history" ON public.order_status_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Notes Policies
CREATE POLICY "Users can view own order notes" ON public.order_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order notes" ON public.order_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order notes" ON public.order_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own order notes" ON public.order_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Order Refunds Policies
CREATE POLICY "Users can view own order refunds" ON public.order_refunds
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order refunds" ON public.order_refunds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order refunds" ON public.order_refunds
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTION TO AUTO-LOG STATUS CHANGES
-- ============================================

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (
            order_id,
            user_id,
            previous_status,
            new_status,
            notes,
            created_at
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status,
            'Status changed automatically',
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_log_order_status_change
    AFTER UPDATE OF status
    ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- CREATE FUNCTION TO GENERATE ORDER NUMBER
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    max_order_num INTEGER;
    new_order_number TEXT;
BEGIN
    -- Get the highest order number for this user
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)),
        6000
    )
    INTO max_order_num
    FROM public.orders
    WHERE user_id = user_uuid;
    
    -- Generate new order number
    new_order_number := '#' || (max_order_num + 1)::TEXT;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

COMMIT;

