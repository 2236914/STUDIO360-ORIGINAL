-- Fix voucher validation to be case-insensitive and handle reveal flow
-- This migration updates the validate_voucher function

BEGIN;

-- Drop and recreate the function with case-insensitive code matching
DROP FUNCTION IF EXISTS validate_voucher(UUID, TEXT, UUID, DECIMAL);

CREATE OR REPLACE FUNCTION validate_voucher(
    p_user_id UUID,
    p_code TEXT,
    p_customer_id UUID DEFAULT NULL,
    p_cart_total DECIMAL DEFAULT 0,
    p_skip_min_amount_check BOOLEAN DEFAULT false
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
    -- Get voucher with case-insensitive matching
    SELECT * INTO v_voucher
    FROM public.vouchers
    WHERE user_id = p_user_id 
    AND UPPER(TRIM(code)) = UPPER(TRIM(p_code))
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
        
        IF v_voucher.usage_limit_per_user IS NOT NULL AND v_user_usage_count >= v_voucher.usage_limit_per_user THEN
            RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 'You have already used this voucher';
            RETURN;
        END IF;
    END IF;
    
    -- Check minimum purchase amount (skip during reveal/initial validation)
    IF NOT p_skip_min_amount_check AND v_voucher.min_purchase_amount IS NOT NULL AND v_voucher.min_purchase_amount > 0 THEN
        IF v_voucher.min_purchase_amount > p_cart_total THEN
            RETURN QUERY SELECT false, v_voucher.id, 0::DECIMAL, 
                'Minimum purchase amount of ₱' || v_voucher.min_purchase_amount || ' required';
            RETURN;
        END IF;
    END IF;
    
    -- Calculate discount (using cart_total if provided, otherwise just return 0 for reveal)
    IF p_cart_total > 0 THEN
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
    ELSE
        -- For reveal flow, just indicate it's valid (discount will be calculated later)
        v_discount := 0;
    END IF;
    
    -- Voucher is valid
    RETURN QUERY SELECT true, v_voucher.id, v_discount, 'Voucher is valid';
END;
$$ LANGUAGE plpgsql;

COMMIT;

