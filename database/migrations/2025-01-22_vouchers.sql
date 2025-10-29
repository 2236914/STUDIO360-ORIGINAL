-- Vouchers/Discount Codes Management Migration
-- This migration creates tables for voucher/coupon management
BEGIN;

-- ============================================
-- VOUCHERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Voucher Information
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Voucher Type
  type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'
  
  -- Discount Value
  discount_value DECIMAL(10,2), -- Percentage (e.g., 10 for 10%) or Fixed Amount (e.g., 100.00)
  min_purchase_amount DECIMAL(10,2) DEFAULT 0.00,
  max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts
  
  -- Usage Limits
  usage_limit INTEGER, -- Total number of times the voucher can be used (NULL = unlimited)
  usage_count INTEGER DEFAULT 0, -- Current usage count
  usage_limit_per_user INTEGER DEFAULT 1, -- How many times one user can use it
  
  -- Validity Period
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'expired', 'used'
  is_active BOOLEAN DEFAULT true,
  
  -- Buy X Get Y Configuration (when type = 'buy_x_get_y')
  buy_quantity INTEGER, -- Buy X items
  get_quantity INTEGER, -- Get Y items free/discounted
  buy_product_ids JSONB, -- Array of product IDs that qualify for "buy"
  get_product_ids JSONB, -- Array of product IDs that can be gotten free
  
  -- Restrictions
  applicable_product_ids JSONB, -- Array of product IDs this voucher applies to (NULL = all products)
  applicable_category_ids JSONB, -- Array of category IDs this voucher applies to
  excluded_product_ids JSONB, -- Products that cannot use this voucher
  minimum_items_count INTEGER, -- Minimum number of items in cart
  
  -- Customer Restrictions
  customer_eligibility TEXT DEFAULT 'all', -- 'all', 'new', 'returning', 'specific'
  eligible_customer_ids JSONB, -- Specific customer IDs if eligibility is 'specific'
  
  -- Additional Settings
  combine_with_other_vouchers BOOLEAN DEFAULT false,
  applies_to_shipping BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  UNIQUE(user_id, code)
);

-- ============================================
-- VOUCHER USAGE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Customer Information
  customer_id UUID, -- Customer who used the voucher
  customer_email TEXT,
  
  -- Order Reference
  order_id UUID, -- Reference to orders table
  order_total DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  
  -- Usage Timestamp
  used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB -- Additional info about the usage
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_vouchers_user_id ON public.vouchers (user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers (code);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers (status);
CREATE INDEX IF NOT EXISTS idx_vouchers_type ON public.vouchers (type);
CREATE INDEX IF NOT EXISTS idx_vouchers_start_date ON public.vouchers (start_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_end_date ON public.vouchers (end_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_deleted_at ON public.vouchers (deleted_at);

CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher_id ON public.voucher_usage (voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user_id ON public.voucher_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_customer_id ON public.voucher_usage (customer_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order_id ON public.voucher_usage (order_id);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_vouchers_updated_at 
    BEFORE UPDATE ON public.vouchers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Vouchers Policies
CREATE POLICY "Users can view own vouchers" ON public.vouchers
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own vouchers" ON public.vouchers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vouchers" ON public.vouchers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vouchers" ON public.vouchers
    FOR DELETE USING (auth.uid() = user_id);

-- Voucher Usage Policies
CREATE POLICY "Users can view own voucher usage" ON public.voucher_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert voucher usage" ON public.voucher_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTION TO AUTO-UPDATE STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_voucher_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update status to expired if past end date
    IF NEW.end_date IS NOT NULL AND NEW.end_date < NOW() AND NEW.status NOT IN ('expired', 'inactive') THEN
        NEW.status = 'expired';
        NEW.is_active = false;
    END IF;
    
    -- Auto-update status to used if usage limit reached
    IF NEW.usage_limit IS NOT NULL AND NEW.usage_count >= NEW.usage_limit AND NEW.status = 'active' THEN
        NEW.status = 'used';
        NEW.is_active = false;
    END IF;
    
    -- Auto-activate if within validity period and not manually set to inactive
    IF NEW.start_date <= NOW() AND 
       (NEW.end_date IS NULL OR NEW.end_date > NOW()) AND 
       NEW.status = 'inactive' AND 
       NEW.is_active = true THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_voucher_status
    BEFORE INSERT OR UPDATE OF end_date, usage_count, is_active
    ON public.vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_status();

-- ============================================
-- CREATE FUNCTION TO INCREMENT USAGE COUNT
-- ============================================

CREATE OR REPLACE FUNCTION increment_voucher_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the usage count when a voucher is used
    UPDATE public.vouchers
    SET usage_count = usage_count + 1
    WHERE id = NEW.voucher_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_voucher_usage
    AFTER INSERT ON public.voucher_usage
    FOR EACH ROW
    EXECUTE FUNCTION increment_voucher_usage();

-- ============================================
-- CREATE FUNCTION TO VALIDATE VOUCHER CODE
-- ============================================

CREATE OR REPLACE FUNCTION validate_voucher(
    p_user_id UUID,
    p_code TEXT,
    p_customer_id UUID DEFAULT NULL,
    p_cart_total DECIMAL DEFAULT 0
)
RETURNS TABLE (
    is_valid BOOLEAN,
    voucher_id UUID,
    discount_amount DECIMAL,
    message TEXT
) AS $$
DECLARE
    v_voucher RECORD;
    v_user_usage_count INTEGER;
    v_discount DECIMAL;
BEGIN
    -- Get voucher
    SELECT * INTO v_voucher
    FROM public.vouchers
    WHERE user_id = p_user_id 
    AND code = p_code 
    AND deleted_at IS NULL
    LIMIT 1;
    
    -- Check if voucher exists
    IF v_voucher IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Invalid voucher code';
        RETURN;
    END IF;
    
    -- Check if voucher is active
    IF v_voucher.status != 'active' OR v_voucher.is_active = false THEN
        RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'Voucher is not active';
        RETURN;
    END IF;
    
    -- Check validity period
    IF v_voucher.start_date > NOW() THEN
        RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'Voucher not yet valid';
        RETURN;
    END IF;
    
    IF v_voucher.end_date IS NOT NULL AND v_voucher.end_date < NOW() THEN
        RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'Voucher has expired';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF v_voucher.usage_limit IS NOT NULL AND v_voucher.usage_count >= v_voucher.usage_limit THEN
        RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'Voucher usage limit reached';
        RETURN;
    END IF;
    
    -- Check per-user usage limit
    IF p_customer_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_usage_count
        FROM public.voucher_usage
        WHERE voucher_id = v_voucher.id AND customer_id = p_customer_id;
        
        IF v_user_usage_count >= v_voucher.usage_limit_per_user THEN
            RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'You have already used this voucher';
            RETURN;
        END IF;
    END IF;
    
    -- Check minimum purchase amount
    IF v_voucher.min_purchase_amount > p_cart_total THEN
        RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 
            'Minimum purchase amount of ₱' || v_voucher.min_purchase_amount || ' required';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF v_voucher.type = 'percentage' THEN
        v_discount := (p_cart_total * v_voucher.discount_value / 100);
        IF v_voucher.max_discount_amount IS NOT NULL AND v_discount > v_voucher.max_discount_amount THEN
            v_discount := v_voucher.max_discount_amount;
        END IF;
    ELSIF v_voucher.type = 'fixed_amount' THEN
        v_discount := v_voucher.discount_value;
        IF v_discount > p_cart_total THEN
            v_discount := p_cart_total;
        END IF;
    ELSE
        v_discount := 0;
    END IF;
    
    -- Voucher is valid
    RETURN QUERY SELECT true, v_voucher.id, v_discount, 'Voucher is valid';
END;
$$ LANGUAGE plpgsql;

COMMIT;

