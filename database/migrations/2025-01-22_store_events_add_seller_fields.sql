-- Add seller information fields to existing store_events table
-- Run this migration if you already have the store_events table

BEGIN;

-- Add seller, booth, and focus columns to store_events table
ALTER TABLE public.store_events 
ADD COLUMN IF NOT EXISTS seller TEXT,
ADD COLUMN IF NOT EXISTS booth TEXT,
ADD COLUMN IF NOT EXISTS focus TEXT;

COMMIT;

