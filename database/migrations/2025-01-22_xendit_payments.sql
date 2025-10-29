-- ============================================
-- XENDIT PAYMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.xendit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Xendit Payment Details
  external_id TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('qrph', 'gcash', 'card')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  
  -- Order Reference
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Xendit Response Data
  xendit_data JSONB,
  
  -- Additional Fields
  description TEXT,
  customer_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_xendit_payments_user_id ON public.xendit_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_xendit_payments_external_id ON public.xendit_payments(external_id);
CREATE INDEX IF NOT EXISTS idx_xendit_payments_status ON public.xendit_payments(status);
CREATE INDEX IF NOT EXISTS idx_xendit_payments_order_id ON public.xendit_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_xendit_payments_created_at ON public.xendit_payments(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.xendit_payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can view their own payments" ON public.xendit_payments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert their own payments" ON public.xendit_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments
CREATE POLICY "Users can update their own payments" ON public.xendit_payments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_xendit_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_xendit_payments_updated_at
  BEFORE UPDATE ON public.xendit_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_xendit_payments_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.xendit_payments IS 'Stores Xendit payment transactions';
COMMENT ON COLUMN public.xendit_payments.external_id IS 'Unique external ID used by Xendit';
COMMENT ON COLUMN public.xendit_payments.payment_method IS 'Payment method: qrph, gcash, or card';
COMMENT ON COLUMN public.xendit_payments.status IS 'Payment status: pending, paid, failed, expired, cancelled';
COMMENT ON COLUMN public.xendit_payments.xendit_data IS 'Full response data from Xendit API';
COMMENT ON COLUMN public.xendit_payments.customer_data IS 'Customer information for the payment';
