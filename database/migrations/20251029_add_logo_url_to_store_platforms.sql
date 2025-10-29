-- Add logo_url column to store_platforms if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'store_platforms' 
      AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.store_platforms
      ADD COLUMN logo_url TEXT DEFAULT '';
  END IF;
END $$;
