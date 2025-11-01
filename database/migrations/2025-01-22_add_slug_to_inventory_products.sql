-- Add slug column to inventory_products table if it doesn't exist
-- This enables products to be accessed by URL-friendly slugs

BEGIN;

-- Add slug column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inventory_products' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.inventory_products 
    ADD COLUMN slug TEXT;
    
    -- Create index for slug lookups
    CREATE INDEX IF NOT EXISTS idx_inventory_products_slug 
    ON public.inventory_products (slug);
    
    -- Create unique constraint for user_id + slug combination
    -- First, check if unique constraint already exists
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_constraint 
      WHERE conname = 'inventory_products_user_id_slug_key'
    ) THEN
      ALTER TABLE public.inventory_products 
      ADD CONSTRAINT inventory_products_user_id_slug_key 
      UNIQUE (user_id, slug);
    END IF;
    
    -- Generate slugs for existing products based on their names
    -- This will create URL-friendly slugs from product names
    UPDATE public.inventory_products
    SET slug = LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ))
    WHERE slug IS NULL OR slug = '';
    
    -- Handle any potential duplicates by appending a number using a function
    CREATE OR REPLACE FUNCTION fix_duplicate_slugs()
    RETURNS void AS $$
    DECLARE
      product_rec RECORD;
      counter INTEGER;
      new_slug TEXT;
    BEGIN
      FOR product_rec IN 
        SELECT id, user_id, name, slug 
        FROM public.inventory_products 
        WHERE slug IN (
          SELECT slug 
          FROM public.inventory_products 
          GROUP BY user_id, slug 
          HAVING COUNT(*) > 1
        )
      LOOP
        counter := 1;
        new_slug := product_rec.slug;
        
        -- Keep incrementing until we find a unique slug
        WHILE EXISTS (
          SELECT 1 
          FROM public.inventory_products 
          WHERE user_id = product_rec.user_id 
          AND slug = new_slug 
          AND id != product_rec.id
        ) LOOP
          new_slug := product_rec.slug || '-' || counter;
          counter := counter + 1;
        END LOOP;
        
        UPDATE public.inventory_products 
        SET slug = new_slug 
        WHERE id = product_rec.id;
      END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Execute the function to fix duplicates
    PERFORM fix_duplicate_slugs();
    
    -- Drop the temporary function
    DROP FUNCTION IF EXISTS fix_duplicate_slugs();
  END IF;
END $$;

COMMIT;

