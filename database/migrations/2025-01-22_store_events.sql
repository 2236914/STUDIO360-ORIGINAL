-- Store Events Migration
-- This migration creates tables for Store Events management
BEGIN;

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.store_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Event details
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  description TEXT,
  link TEXT,
  
  -- Seller information
  seller TEXT,
  booth TEXT,
  focus TEXT,
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_store_events_user_id ON public.store_events (user_id);
CREATE INDEX IF NOT EXISTS idx_store_events_date ON public.store_events (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_store_events_active ON public.store_events (is_active);

-- ============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_store_events_updated_at 
BEFORE UPDATE ON public.store_events 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.store_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Allow users to view their own events
CREATE POLICY "Users can view own events" 
ON public.store_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own events
CREATE POLICY "Users can insert own events" 
ON public.store_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own events
CREATE POLICY "Users can update own events" 
ON public.store_events 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own events
CREATE POLICY "Users can delete own events" 
ON public.store_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow public to view active events (for storefront display)
CREATE POLICY "Public can view active events" 
ON public.store_events 
FOR SELECT 
USING (is_active = true);

COMMIT;
