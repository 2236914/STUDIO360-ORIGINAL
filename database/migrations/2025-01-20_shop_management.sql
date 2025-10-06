-- Shop Management Tables Migration
-- This migration creates all tables needed for shop functionality
BEGIN;

-- Shop Information Table
CREATE TABLE IF NOT EXISTS public.shop_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  shop_category TEXT,
  profile_photo_url TEXT,
  street_address TEXT,
  barangay TEXT,
  city TEXT,
  province TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  UNIQUE(user_id) -- One shop per user
);

-- Shipping Settings Table
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enable_free_shipping BOOLEAN DEFAULT false,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One shipping setting per user
);

-- Couriers Table
CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Regional Shipping Rates Table
CREATE TABLE IF NOT EXISTS public.regional_shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id UUID REFERENCES public.couriers(id) ON DELETE CASCADE,
  region_name TEXT NOT NULL,
  region_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(courier_id, region_name) -- One rate per courier per region
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shop_info_user_id ON public.shop_info (user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_settings_user_id ON public.shipping_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON public.couriers (user_id);
CREATE INDEX IF NOT EXISTS idx_couriers_active ON public.couriers (is_active);
CREATE INDEX IF NOT EXISTS idx_regional_rates_courier_id ON public.regional_shipping_rates (courier_id);
CREATE INDEX IF NOT EXISTS idx_regional_rates_active ON public.regional_shipping_rates (is_active);

-- Create triggers for automatic updated_at timestamps
CREATE TRIGGER update_shop_info_updated_at 
    BEFORE UPDATE ON public.shop_info 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_settings_updated_at 
    BEFORE UPDATE ON public.shipping_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couriers_updated_at 
    BEFORE UPDATE ON public.couriers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_rates_updated_at 
    BEFORE UPDATE ON public.regional_shipping_rates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_shipping_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shop_info
CREATE POLICY "Users can view own shop info" ON public.shop_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shop info" ON public.shop_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shop info" ON public.shop_info
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for shipping_settings
CREATE POLICY "Users can view own shipping settings" ON public.shipping_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipping settings" ON public.shipping_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipping settings" ON public.shipping_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for couriers
CREATE POLICY "Users can view own couriers" ON public.couriers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own couriers" ON public.couriers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own couriers" ON public.couriers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own couriers" ON public.couriers
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for regional_shipping_rates
CREATE POLICY "Users can view own regional rates" ON public.regional_shipping_rates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.couriers 
            WHERE id = courier_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own regional rates" ON public.regional_shipping_rates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couriers 
            WHERE id = courier_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own regional rates" ON public.regional_shipping_rates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.couriers 
            WHERE id = courier_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own regional rates" ON public.regional_shipping_rates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.couriers 
            WHERE id = courier_id 
            AND user_id = auth.uid()
        )
    );

COMMIT;
