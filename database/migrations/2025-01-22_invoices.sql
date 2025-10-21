-- Invoices Management Migration
-- This migration creates tables for invoice management
BEGIN;

-- ============================================
-- INVOICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Invoice Information
  invoice_number TEXT NOT NULL,
  invoice_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  
  -- Customer Information (From)
  invoice_from_name TEXT NOT NULL,
  invoice_from_company TEXT,
  invoice_from_address TEXT,
  invoice_from_phone TEXT,
  invoice_from_email TEXT,
  
  -- Customer Information (To)
  invoice_to_name TEXT NOT NULL,
  invoice_to_company TEXT,
  invoice_to_address TEXT,
  invoice_to_phone TEXT,
  invoice_to_email TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'paid', 'overdue', 'cancelled'
  sent INTEGER DEFAULT 0, -- Number of times sent
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping DECIMAL(10,2) DEFAULT 0.00,
  discount DECIMAL(10,2) DEFAULT 0.00,
  taxes DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Payment
  payment_terms TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  support_email TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  UNIQUE(user_id, invoice_number)
);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Item Details
  title TEXT NOT NULL,
  description TEXT,
  service TEXT, -- Service type/category
  
  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Display Order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICE PAYMENTS TABLE (Payment History)
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICE TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Template Details
  template_name TEXT NOT NULL,
  
  -- Default From Information
  default_from_name TEXT,
  default_from_company TEXT,
  default_from_address TEXT,
  default_from_phone TEXT,
  default_from_email TEXT,
  
  -- Template Settings
  default_payment_terms TEXT,
  default_notes TEXT,
  default_support_email TEXT,
  
  -- Styling
  logo_url TEXT,
  primary_color TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices (invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_to_email ON public.invoices (invoice_to_email);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices (deleted_at);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_user_id ON public.invoice_items (user_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON public.invoice_payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_user_id ON public.invoice_payments (user_id);

CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON public.invoice_templates (user_id);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON public.invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at 
    BEFORE UPDATE ON public.invoice_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at 
    BEFORE UPDATE ON public.invoice_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Invoices Policies
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON public.invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id);

-- Invoice Items Policies
CREATE POLICY "Users can view own invoice items" ON public.invoice_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice items" ON public.invoice_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoice items" ON public.invoice_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoice items" ON public.invoice_items
    FOR DELETE USING (auth.uid() = user_id);

-- Invoice Payments Policies
CREATE POLICY "Users can view own invoice payments" ON public.invoice_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice payments" ON public.invoice_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invoice Templates Policies
CREATE POLICY "Users can view own invoice templates" ON public.invoice_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice templates" ON public.invoice_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoice templates" ON public.invoice_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoice templates" ON public.invoice_templates
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTION TO AUTO-UPDATE STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-update status to overdue if past due date and not paid
    IF NEW.due_date < NOW() AND NEW.status NOT IN ('paid', 'cancelled') THEN
        NEW.status = 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_invoice_status
    BEFORE INSERT OR UPDATE OF due_date, status
    ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_status();

-- ============================================
-- CREATE FUNCTION TO GENERATE INVOICE NUMBER
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    max_invoice_num INTEGER;
    new_invoice_number TEXT;
    current_year TEXT;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the highest invoice number for this user in current year
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(invoice_number FROM 'INV-' || current_year || '-([0-9]+)') AS INTEGER)),
        0
    )
    INTO max_invoice_num
    FROM public.invoices
    WHERE user_id = user_uuid 
    AND invoice_number LIKE 'INV-' || current_year || '-%';
    
    -- Generate new invoice number: INV-YYYY-NNNN
    new_invoice_number := 'INV-' || current_year || '-' || LPAD((max_invoice_num + 1)::TEXT, 4, '0');
    
    RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

COMMIT;

