-- Email Notification System Migration
-- This migration creates tables for email notifications, preferences, and templates
BEGIN;

-- ============================================
-- EMAIL NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Email Information
  notification_type TEXT NOT NULL, -- 'order_confirmation', 'order_status_update', 'new_order_alert', 'low_stock_alert', 'welcome', 'password_reset', 'verification'
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  
  -- Email Content
  email_body_html TEXT,
  email_body_text TEXT,
  
  -- Status & Tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional data (order_id, product_id, etc.)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON public.email_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications (notification_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications (status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON public.email_notifications (sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON public.email_notifications (recipient_email);

-- ============================================
-- EMAIL PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  order_confirmation BOOLEAN DEFAULT true,
  order_status_updates BOOLEAN DEFAULT true,
  new_order_alerts BOOLEAN DEFAULT true,
  low_stock_alerts BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  weekly_summary BOOLEAN DEFAULT true,
  
  -- Email Settings
  send_to_email TEXT, -- Default email or override
  notify_for_own_orders BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON public.email_preferences (user_id);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Template Information
  template_type TEXT NOT NULL, -- 'order_confirmation', 'order_status_update', 'new_order_alert', 'low_stock_alert', 'welcome', 'password_reset', 'verification'
  template_name TEXT NOT NULL,
  
  -- Template Content
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  
  -- Template Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Variables
  available_variables TEXT[], -- Array of available variables for this template type
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_type, template_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates (user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates (template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates (is_active);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_notifications
CREATE TRIGGER update_email_notifications_updated_at 
    BEFORE UPDATE ON public.email_notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_notification_updated_at();

-- Create trigger for email_preferences
CREATE TRIGGER update_email_preferences_updated_at 
    BEFORE UPDATE ON public.email_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_notification_updated_at();

-- Create trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON public.email_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_email_notification_updated_at();

COMMIT;

