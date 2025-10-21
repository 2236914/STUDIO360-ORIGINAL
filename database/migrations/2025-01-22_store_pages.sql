-- Store Pages Migration
-- This migration creates tables for Store Homepage, About Page, and Shipping/Returns pages
BEGIN;

-- ============================================
-- STORE HOMEPAGE TABLES
-- ============================================

-- Hero Section
CREATE TABLE IF NOT EXISTS public.store_hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  background_image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One hero section per user
);

-- Featured Products Section
CREATE TABLE IF NOT EXISTS public.store_featured_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Featured Products',
  description TEXT DEFAULT '',
  show_section BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Featured Product Items (links to inventory)
CREATE TABLE IF NOT EXISTS public.featured_product_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  product_id UUID, -- Reference to inventory product
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Section
CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Split Feature Section
CREATE TABLE IF NOT EXISTS public.store_split_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image_position TEXT DEFAULT 'left', -- 'left' or 'right'
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  show_section BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Coupon Section
CREATE TABLE IF NOT EXISTS public.store_coupon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  headline TEXT DEFAULT '',
  subtext TEXT DEFAULT '',
  button_text TEXT DEFAULT '',
  button_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Events Block
CREATE TABLE IF NOT EXISTS public.store_events_block (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  see_all_text TEXT DEFAULT '',
  see_all_link TEXT DEFAULT '',
  show_section BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Platform Links (social media, marketplace links)
CREATE TABLE IF NOT EXISTS public.store_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL, -- 'facebook', 'instagram', 'shopee', 'lazada', etc.
  platform_url TEXT NOT NULL,
  icon_name TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement Bar
CREATE TABLE IF NOT EXISTS public.store_announcement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  text TEXT DEFAULT '',
  icon TEXT DEFAULT 'mdi:information-outline',
  background_color TEXT DEFAULT '#1976d2',
  text_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- STORE ABOUT PAGE TABLES
-- ============================================

-- Shop Story Section
CREATE TABLE IF NOT EXISTS public.store_shop_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  email TEXT DEFAULT '',
  shop_hours TEXT DEFAULT '',
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Social Media Section
CREATE TABLE IF NOT EXISTS public.store_social_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Social Media Platform Links
CREATE TABLE IF NOT EXISTS public.store_social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'tiktok', etc.
  platform_url TEXT NOT NULL,
  icon_name TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STORE SHIPPING & RETURNS PAGE TABLES
-- ============================================

-- Local Shipping Section
CREATE TABLE IF NOT EXISTS public.store_local_shipping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- International Shipping Section
CREATE TABLE IF NOT EXISTS public.store_international_shipping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Shipping Rates Section
CREATE TABLE IF NOT EXISTS public.store_shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Return Policy Section
CREATE TABLE IF NOT EXISTS public.store_return_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- FAQ Section
CREATE TABLE IF NOT EXISTS public.store_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER SUPPORT SETTINGS
-- ============================================

-- WhatsApp Settings
CREATE TABLE IF NOT EXISTS public.store_whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  phone_number TEXT DEFAULT '',
  welcome_message TEXT DEFAULT '',
  business_hours TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Gmail Settings
CREATE TABLE IF NOT EXISTS public.store_gmail_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  email_address TEXT DEFAULT '',
  auto_reply TEXT DEFAULT '',
  signature TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- FAQ Chatbot Settings
CREATE TABLE IF NOT EXISTS public.store_faq_chatbot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  chatbot_name TEXT DEFAULT '',
  welcome_message TEXT DEFAULT '',
  fallback_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- FAQ Chatbot Questions
CREATE TABLE IF NOT EXISTS public.store_faq_chatbot_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_model(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_store_hero_user_id ON public.store_hero_section (user_id);
CREATE INDEX IF NOT EXISTS idx_store_featured_products_user_id ON public.store_featured_products (user_id);
CREATE INDEX IF NOT EXISTS idx_featured_product_items_user_id ON public.featured_product_items (user_id);
CREATE INDEX IF NOT EXISTS idx_store_categories_user_id ON public.store_categories (user_id);
CREATE INDEX IF NOT EXISTS idx_store_categories_active ON public.store_categories (is_active);
CREATE INDEX IF NOT EXISTS idx_store_split_feature_user_id ON public.store_split_feature (user_id);
CREATE INDEX IF NOT EXISTS idx_store_coupon_user_id ON public.store_coupon (user_id);
CREATE INDEX IF NOT EXISTS idx_store_events_block_user_id ON public.store_events_block (user_id);
CREATE INDEX IF NOT EXISTS idx_store_platforms_user_id ON public.store_platforms (user_id);
CREATE INDEX IF NOT EXISTS idx_store_platforms_active ON public.store_platforms (is_active);
CREATE INDEX IF NOT EXISTS idx_store_announcement_user_id ON public.store_announcement (user_id);
CREATE INDEX IF NOT EXISTS idx_store_shop_story_user_id ON public.store_shop_story (user_id);
CREATE INDEX IF NOT EXISTS idx_store_social_media_user_id ON public.store_social_media (user_id);
CREATE INDEX IF NOT EXISTS idx_store_social_platforms_user_id ON public.store_social_platforms (user_id);
CREATE INDEX IF NOT EXISTS idx_store_social_platforms_active ON public.store_social_platforms (is_active);
CREATE INDEX IF NOT EXISTS idx_store_local_shipping_user_id ON public.store_local_shipping (user_id);
CREATE INDEX IF NOT EXISTS idx_store_international_shipping_user_id ON public.store_international_shipping (user_id);
CREATE INDEX IF NOT EXISTS idx_store_shipping_rates_user_id ON public.store_shipping_rates (user_id);
CREATE INDEX IF NOT EXISTS idx_store_return_policy_user_id ON public.store_return_policy (user_id);
CREATE INDEX IF NOT EXISTS idx_store_faqs_user_id ON public.store_faqs (user_id);
CREATE INDEX IF NOT EXISTS idx_store_faqs_active ON public.store_faqs (is_active);
CREATE INDEX IF NOT EXISTS idx_store_whatsapp_user_id ON public.store_whatsapp_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_store_gmail_user_id ON public.store_gmail_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_store_faq_chatbot_user_id ON public.store_faq_chatbot_settings (user_id);
CREATE INDEX IF NOT EXISTS idx_store_faq_chatbot_items_user_id ON public.store_faq_chatbot_items (user_id);
CREATE INDEX IF NOT EXISTS idx_store_faq_chatbot_items_active ON public.store_faq_chatbot_items (is_active);

-- ============================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_store_hero_section_updated_at BEFORE UPDATE ON public.store_hero_section FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_featured_products_updated_at BEFORE UPDATE ON public.store_featured_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_featured_product_items_updated_at BEFORE UPDATE ON public.featured_product_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_categories_updated_at BEFORE UPDATE ON public.store_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_split_feature_updated_at BEFORE UPDATE ON public.store_split_feature FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_coupon_updated_at BEFORE UPDATE ON public.store_coupon FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_events_block_updated_at BEFORE UPDATE ON public.store_events_block FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_platforms_updated_at BEFORE UPDATE ON public.store_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_announcement_updated_at BEFORE UPDATE ON public.store_announcement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_shop_story_updated_at BEFORE UPDATE ON public.store_shop_story FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_social_media_updated_at BEFORE UPDATE ON public.store_social_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_social_platforms_updated_at BEFORE UPDATE ON public.store_social_platforms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_local_shipping_updated_at BEFORE UPDATE ON public.store_local_shipping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_international_shipping_updated_at BEFORE UPDATE ON public.store_international_shipping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_shipping_rates_updated_at BEFORE UPDATE ON public.store_shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_return_policy_updated_at BEFORE UPDATE ON public.store_return_policy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_faqs_updated_at BEFORE UPDATE ON public.store_faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_whatsapp_settings_updated_at BEFORE UPDATE ON public.store_whatsapp_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_gmail_settings_updated_at BEFORE UPDATE ON public.store_gmail_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_faq_chatbot_settings_updated_at BEFORE UPDATE ON public.store_faq_chatbot_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_faq_chatbot_items_updated_at BEFORE UPDATE ON public.store_faq_chatbot_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.store_hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_product_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_split_feature ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_coupon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_events_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_announcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_shop_story ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_social_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_local_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_international_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_return_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_gmail_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_faq_chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_faq_chatbot_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Hero Section Policies
CREATE POLICY "Users can view own hero section" ON public.store_hero_section FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hero section" ON public.store_hero_section FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hero section" ON public.store_hero_section FOR UPDATE USING (auth.uid() = user_id);

-- Featured Products Policies
CREATE POLICY "Users can view own featured products" ON public.store_featured_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own featured products" ON public.store_featured_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own featured products" ON public.store_featured_products FOR UPDATE USING (auth.uid() = user_id);

-- Featured Product Items Policies
CREATE POLICY "Users can view own featured product items" ON public.featured_product_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own featured product items" ON public.featured_product_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own featured product items" ON public.featured_product_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own featured product items" ON public.featured_product_items FOR DELETE USING (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can view own categories" ON public.store_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.store_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.store_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.store_categories FOR DELETE USING (auth.uid() = user_id);

-- Split Feature Policies
CREATE POLICY "Users can view own split feature" ON public.store_split_feature FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own split feature" ON public.store_split_feature FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own split feature" ON public.store_split_feature FOR UPDATE USING (auth.uid() = user_id);

-- Coupon Policies
CREATE POLICY "Users can view own coupon" ON public.store_coupon FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coupon" ON public.store_coupon FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coupon" ON public.store_coupon FOR UPDATE USING (auth.uid() = user_id);

-- Events Block Policies
CREATE POLICY "Users can view own events block" ON public.store_events_block FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events block" ON public.store_events_block FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events block" ON public.store_events_block FOR UPDATE USING (auth.uid() = user_id);

-- Platforms Policies
CREATE POLICY "Users can view own platforms" ON public.store_platforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own platforms" ON public.store_platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platforms" ON public.store_platforms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own platforms" ON public.store_platforms FOR DELETE USING (auth.uid() = user_id);

-- Announcement Policies
CREATE POLICY "Users can view own announcement" ON public.store_announcement FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own announcement" ON public.store_announcement FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own announcement" ON public.store_announcement FOR UPDATE USING (auth.uid() = user_id);

-- Shop Story Policies
CREATE POLICY "Users can view own shop story" ON public.store_shop_story FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shop story" ON public.store_shop_story FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shop story" ON public.store_shop_story FOR UPDATE USING (auth.uid() = user_id);

-- Social Media Policies
CREATE POLICY "Users can view own social media" ON public.store_social_media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social media" ON public.store_social_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social media" ON public.store_social_media FOR UPDATE USING (auth.uid() = user_id);

-- Social Platforms Policies
CREATE POLICY "Users can view own social platforms" ON public.store_social_platforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social platforms" ON public.store_social_platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social platforms" ON public.store_social_platforms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social platforms" ON public.store_social_platforms FOR DELETE USING (auth.uid() = user_id);

-- Local Shipping Policies
CREATE POLICY "Users can view own local shipping" ON public.store_local_shipping FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own local shipping" ON public.store_local_shipping FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own local shipping" ON public.store_local_shipping FOR UPDATE USING (auth.uid() = user_id);

-- International Shipping Policies
CREATE POLICY "Users can view own international shipping" ON public.store_international_shipping FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own international shipping" ON public.store_international_shipping FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own international shipping" ON public.store_international_shipping FOR UPDATE USING (auth.uid() = user_id);

-- Shipping Rates Policies
CREATE POLICY "Users can view own shipping rates" ON public.store_shipping_rates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shipping rates" ON public.store_shipping_rates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shipping rates" ON public.store_shipping_rates FOR UPDATE USING (auth.uid() = user_id);

-- Return Policy Policies
CREATE POLICY "Users can view own return policy" ON public.store_return_policy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own return policy" ON public.store_return_policy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own return policy" ON public.store_return_policy FOR UPDATE USING (auth.uid() = user_id);

-- FAQs Policies
CREATE POLICY "Users can view own faqs" ON public.store_faqs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own faqs" ON public.store_faqs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own faqs" ON public.store_faqs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own faqs" ON public.store_faqs FOR DELETE USING (auth.uid() = user_id);

-- WhatsApp Settings Policies
CREATE POLICY "Users can view own whatsapp settings" ON public.store_whatsapp_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own whatsapp settings" ON public.store_whatsapp_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own whatsapp settings" ON public.store_whatsapp_settings FOR UPDATE USING (auth.uid() = user_id);

-- Gmail Settings Policies
CREATE POLICY "Users can view own gmail settings" ON public.store_gmail_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gmail settings" ON public.store_gmail_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gmail settings" ON public.store_gmail_settings FOR UPDATE USING (auth.uid() = user_id);

-- FAQ Chatbot Settings Policies
CREATE POLICY "Users can view own faq chatbot settings" ON public.store_faq_chatbot_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own faq chatbot settings" ON public.store_faq_chatbot_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own faq chatbot settings" ON public.store_faq_chatbot_settings FOR UPDATE USING (auth.uid() = user_id);

-- FAQ Chatbot Items Policies
CREATE POLICY "Users can view own faq chatbot items" ON public.store_faq_chatbot_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own faq chatbot items" ON public.store_faq_chatbot_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own faq chatbot items" ON public.store_faq_chatbot_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own faq chatbot items" ON public.store_faq_chatbot_items FOR DELETE USING (auth.uid() = user_id);

COMMIT;

