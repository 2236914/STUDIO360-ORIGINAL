-- System Announcements Migration
-- This migration creates tables for system-wide announcements (admin updates/security/maintenance notifications)
BEGIN;

-- ============================================
-- SYSTEM_ANNOUNCEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Announcement Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Classification
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'maintenance', 'security'
  
  -- Visibility & Expiry
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID NOT NULL, -- References user who created it (admin)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON public.system_announcements (is_active);
CREATE INDEX IF NOT EXISTS idx_system_announcements_type ON public.system_announcements (type);
CREATE INDEX IF NOT EXISTS idx_system_announcements_expires ON public.system_announcements (expires_at);
CREATE INDEX IF NOT EXISTS idx_system_announcements_created ON public.system_announcements (created_at DESC);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_system_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_announcements_updated_at 
BEFORE UPDATE ON public.system_announcements 
FOR EACH ROW EXECUTE FUNCTION update_system_announcements_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Allow anyone to view active announcements that haven't expired
CREATE POLICY "Active announcements are viewable by all" 
ON public.system_announcements 
FOR SELECT 
USING (
  is_active = true AND 
  (expires_at IS NULL OR expires_at > NOW())
);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage announcements" 
ON public.system_announcements 
FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM public.user_model WHERE role = 'admin'
))
WITH CHECK (auth.uid() IN (
  SELECT id FROM public.user_model WHERE role = 'admin'
));

COMMIT;

