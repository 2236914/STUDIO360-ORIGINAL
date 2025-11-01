-- Inventory Management Migration
-- This migration creates tables for product inventory management
BEGIN;

-- ============================================
-- INVENTORY PRODUCTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cost DECIMAL(10,2) DEFAULT 0.00,
  compare_at_price DECIMAL(10,2),
  
  -- Stock Management
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  stock_status TEXT DEFAULT 'in stock', -- 'in stock', 'low stock', 'out of stock'
  
  -- Product Details
  description TEXT,
  short_description TEXT,
  weight DECIMAL(10,2),
  weight_unit TEXT DEFAULT 'kg',
  dimensions JSONB, -- {length, width, height, unit}
  
  -- Images
  cover_image_url TEXT,
  images JSONB, -- Array of image URLs
  
  -- Status & Visibility
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'draft'
  is_featured BOOLEAN DEFAULT false,
  is_taxable BOOLEAN DEFAULT true,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  slug TEXT, -- URL-friendly identifier for storefront routing
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  
  UNIQUE(user_id, sku),
  UNIQUE(user_id, slug)
);

-- ============================================
-- PRODUCT VARIATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Variation Details
  name TEXT NOT NULL, -- e.g., "Size: Large, Color: Red"
  sku TEXT,
  barcode TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cost DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  
  -- Stock
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Variation Attributes
  attributes JSONB, -- {size: "L", color: "Red"}
  
  -- Images
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, sku)
);

-- ============================================
-- WHOLESALE PRICING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.wholesale_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Tier Details
  tier_name TEXT NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Calculated Price
  price_per_unit DECIMAL(10,2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);

-- ============================================
-- STOCK MOVEMENTS TABLE (History/Audit)
-- ============================================

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  
  -- Movement Details
  movement_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', 'damage'
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  
  -- Reference
  reference_type TEXT, -- 'order', 'manual', 'import'
  reference_id TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_inventory_products_user_id ON public.inventory_products (user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_sku ON public.inventory_products (sku);
CREATE INDEX IF NOT EXISTS idx_inventory_products_slug ON public.inventory_products (slug);
CREATE INDEX IF NOT EXISTS idx_inventory_products_category ON public.inventory_products (category);
CREATE INDEX IF NOT EXISTS idx_inventory_products_status ON public.inventory_products (status);
CREATE INDEX IF NOT EXISTS idx_inventory_products_stock_status ON public.inventory_products (stock_status);
CREATE INDEX IF NOT EXISTS idx_inventory_products_created_at ON public.inventory_products (created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_products_deleted_at ON public.inventory_products (deleted_at);

CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON public.product_variations (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_user_id ON public.product_variations (user_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_sku ON public.product_variations (sku);

CREATE INDEX IF NOT EXISTS idx_wholesale_pricing_product_id ON public.wholesale_pricing (product_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_pricing_user_id ON public.wholesale_pricing (user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_categories_user_id ON public.inventory_categories (user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON public.inventory_categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_slug ON public.inventory_categories (slug);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_user_id ON public.stock_movements (user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements (created_at);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_inventory_products_updated_at 
    BEFORE UPDATE ON public.inventory_products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variations_updated_at 
    BEFORE UPDATE ON public.product_variations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wholesale_pricing_updated_at 
    BEFORE UPDATE ON public.wholesale_pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_categories_updated_at 
    BEFORE UPDATE ON public.inventory_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Inventory Products Policies
CREATE POLICY "Users can view own products" ON public.inventory_products
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own products" ON public.inventory_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.inventory_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.inventory_products
    FOR DELETE USING (auth.uid() = user_id);

-- Product Variations Policies
CREATE POLICY "Users can view own variations" ON public.product_variations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own variations" ON public.product_variations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own variations" ON public.product_variations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own variations" ON public.product_variations
    FOR DELETE USING (auth.uid() = user_id);

-- Wholesale Pricing Policies
CREATE POLICY "Users can view own wholesale pricing" ON public.wholesale_pricing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wholesale pricing" ON public.wholesale_pricing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wholesale pricing" ON public.wholesale_pricing
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wholesale pricing" ON public.wholesale_pricing
    FOR DELETE USING (auth.uid() = user_id);

-- Inventory Categories Policies
CREATE POLICY "Users can view own categories" ON public.inventory_categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.inventory_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.inventory_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.inventory_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Stock Movements Policies
CREATE POLICY "Users can view own stock movements" ON public.stock_movements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock movements" ON public.stock_movements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREATE FUNCTION TO AUTO-UPDATE STOCK STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity = 0 THEN
        NEW.stock_status = 'out of stock';
    ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
        NEW.stock_status = 'low stock';
    ELSE
        NEW.stock_status = 'in stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_stock_status
    BEFORE INSERT OR UPDATE OF stock_quantity, low_stock_threshold
    ON public.inventory_products
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_status();

COMMIT;

