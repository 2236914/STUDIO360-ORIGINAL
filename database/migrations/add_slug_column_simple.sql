-- Simple SQL to add slug column to existing inventory_products table
-- Run this in your Supabase SQL editor

-- Step 1: Add slug column
ALTER TABLE public.inventory_products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_inventory_products_slug 
ON public.inventory_products (slug);

-- Step 3: Add unique constraint (user_id, slug)
-- Note: You may need to fix duplicates first if any exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'inventory_products_user_id_slug_key'
  ) THEN
    ALTER TABLE public.inventory_products 
    ADD CONSTRAINT inventory_products_user_id_slug_key 
    UNIQUE (user_id, slug);
  END IF;
END $$;

-- Step 4: Generate slugs for existing products from their names
UPDATE public.inventory_products
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Step 5: Fix any duplicate slugs by appending numbers
DO $$
DECLARE
  product_rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  -- Handle duplicates per user
  FOR product_rec IN 
    SELECT id, user_id, slug,
           ROW_NUMBER() OVER (PARTITION BY user_id, slug ORDER BY id) as rn
    FROM public.inventory_products
    WHERE slug IS NOT NULL
  LOOP
    IF product_rec.rn > 1 THEN
      counter := product_rec.rn - 1;
      new_slug := product_rec.slug || '-' || counter;
      
      -- Make sure the new slug is unique
      WHILE EXISTS (
        SELECT 1 
        FROM public.inventory_products 
        WHERE user_id = product_rec.user_id 
        AND slug = new_slug 
        AND id != product_rec.id
      ) LOOP
        counter := counter + 1;
        new_slug := product_rec.slug || '-' || counter;
      END LOOP;
      
      UPDATE public.inventory_products 
      SET slug = new_slug 
      WHERE id = product_rec.id;
    END IF;
  END LOOP;
END $$;

