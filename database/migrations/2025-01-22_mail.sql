-- Mail & Support Tickets Management Migration
-- This migration creates tables for mail/support ticket management
BEGIN;

-- ============================================
-- MAIL TABLE (Support Tickets)
-- ============================================

CREATE TABLE IF NOT EXISTS public.mail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Email/Ticket Information
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_name TEXT,
  to_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Classification
  type TEXT DEFAULT 'received', -- 'received', 'sent', 'draft'
  source TEXT DEFAULT 'email', -- 'email', 'chatbot', 'form', 'manual'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Status & Labels
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed', 'spam'
  labels TEXT[] DEFAULT ARRAY['inbox']::TEXT[], -- Array of label IDs: inbox, sent, pending, resolved, spam, important
  
  -- Flags
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Store/Customer Context
  store_id TEXT,
  customer_id UUID,
  order_id UUID, -- Reference to related order if applicable
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::JSONB, -- Array of {name, url, size, type}
  
  -- Metadata
  metadata JSONB, -- Additional flexible data (e.g., chatbot context, form data)
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- MAIL REPLIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.mail_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mail_id UUID REFERENCES public.mail(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Reply Information
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Metadata
  is_from_customer BOOLEAN DEFAULT FALSE, -- TRUE if from customer, FALSE if from support
  attachments JSONB DEFAULT '[]'::JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAIL LABELS TABLE (Custom Labels)
-- ============================================

CREATE TABLE IF NOT EXISTS public.mail_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Label Information
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1877F2',
  icon TEXT,
  
  -- System vs Custom
  is_system BOOLEAN DEFAULT FALSE, -- TRUE for inbox, sent, spam, etc.
  
  -- Display Order
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- ============================================
-- MAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.mail_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Template Information
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Category
  category TEXT DEFAULT 'general', -- 'general', 'order_confirmation', 'shipping', 'support', 'marketing'
  
  -- Usage
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mail_user_id ON public.mail (user_id);
CREATE INDEX IF NOT EXISTS idx_mail_from_email ON public.mail (from_email);
CREATE INDEX IF NOT EXISTS idx_mail_to_email ON public.mail (to_email);
CREATE INDEX IF NOT EXISTS idx_mail_status ON public.mail (status);
CREATE INDEX IF NOT EXISTS idx_mail_type ON public.mail (type);
CREATE INDEX IF NOT EXISTS idx_mail_priority ON public.mail (priority);
CREATE INDEX IF NOT EXISTS idx_mail_is_read ON public.mail (is_read);
CREATE INDEX IF NOT EXISTS idx_mail_is_starred ON public.mail (is_starred);
CREATE INDEX IF NOT EXISTS idx_mail_labels ON public.mail USING GIN (labels);
CREATE INDEX IF NOT EXISTS idx_mail_received_at ON public.mail (received_at);
CREATE INDEX IF NOT EXISTS idx_mail_deleted_at ON public.mail (deleted_at);

CREATE INDEX IF NOT EXISTS idx_mail_replies_mail_id ON public.mail_replies (mail_id);
CREATE INDEX IF NOT EXISTS idx_mail_replies_user_id ON public.mail_replies (user_id);

CREATE INDEX IF NOT EXISTS idx_mail_labels_user_id ON public.mail_labels (user_id);

CREATE INDEX IF NOT EXISTS idx_mail_templates_user_id ON public.mail_templates (user_id);
CREATE INDEX IF NOT EXISTS idx_mail_templates_category ON public.mail_templates (category);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

DROP TRIGGER IF EXISTS update_mail_updated_at ON public.mail;
CREATE TRIGGER update_mail_updated_at 
    BEFORE UPDATE ON public.mail 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mail_replies_updated_at ON public.mail_replies;
CREATE TRIGGER update_mail_replies_updated_at 
    BEFORE UPDATE ON public.mail_replies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mail_labels_updated_at ON public.mail_labels;
CREATE TRIGGER update_mail_labels_updated_at 
    BEFORE UPDATE ON public.mail_labels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mail_templates_updated_at ON public.mail_templates;
CREATE TRIGGER update_mail_templates_updated_at 
    BEFORE UPDATE ON public.mail_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.mail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Mail Policies
DROP POLICY IF EXISTS "Users can view own mail" ON public.mail;
CREATE POLICY "Users can view own mail" ON public.mail
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own mail" ON public.mail;
CREATE POLICY "Users can insert own mail" ON public.mail
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mail" ON public.mail;
CREATE POLICY "Users can update own mail" ON public.mail
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mail" ON public.mail;
CREATE POLICY "Users can delete own mail" ON public.mail
    FOR DELETE USING (auth.uid() = user_id);

-- Mail Replies Policies
CREATE POLICY "Users can view own mail replies" ON public.mail_replies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert mail replies" ON public.mail_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mail replies" ON public.mail_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mail replies" ON public.mail_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Mail Labels Policies
CREATE POLICY "Users can view own labels" ON public.mail_labels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own labels" ON public.mail_labels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own labels" ON public.mail_labels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own labels" ON public.mail_labels
    FOR DELETE USING (auth.uid() = user_id);

-- Mail Templates Policies
CREATE POLICY "Users can view own templates" ON public.mail_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.mail_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.mail_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.mail_templates
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTION TO UPDATE READ STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_mail_read_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Set read_at timestamp when is_read changes to true
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_mail_read_status ON public.mail;
CREATE TRIGGER auto_update_mail_read_status
    BEFORE UPDATE OF is_read
    ON public.mail
    FOR EACH ROW
    EXECUTE FUNCTION update_mail_read_status();

-- ============================================
-- CREATE FUNCTION TO UPDATE RESOLVED STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_mail_resolved_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Set resolved_at timestamp when status changes to resolved or closed
    IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
        NEW.resolved_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_update_mail_resolved_status ON public.mail;
CREATE TRIGGER auto_update_mail_resolved_status
    BEFORE UPDATE OF status
    ON public.mail
    FOR EACH ROW
    EXECUTE FUNCTION update_mail_resolved_status();

-- ============================================
-- INSERT DEFAULT SYSTEM LABELS FOR EXISTING USERS
-- ============================================

-- Note: This will only work if there are existing users
-- For new users, you should create these labels on user creation

INSERT INTO public.mail_labels (user_id, name, color, is_system, display_order)
SELECT 
    id as user_id,
    label.name,
    label.color,
    TRUE as is_system,
    label.display_order
FROM public.user_model
CROSS JOIN (
    VALUES 
        ('inbox', '#1877F2', 1),
        ('sent', '#00A76F', 2),
        ('pending', '#FF8C00', 3),
        ('resolved', '#00A76F', 4),
        ('spam', '#FF3030', 5),
        ('important', '#FFC107', 6)
) AS label(name, color, display_order)
ON CONFLICT (user_id, name) DO NOTHING;

COMMIT;

