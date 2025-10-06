-- Shop Management Seed Data
-- This file contains sample data for testing the shop functionality
BEGIN;

-- Insert sample shop info (replace with actual user_id from your user_model table)
-- Note: You'll need to replace the user_id with an actual UUID from your user_model table
INSERT INTO public.shop_info (
  user_id, 
  shop_name, 
  email, 
  phone_number, 
  shop_category,
  street_address, 
  barangay, 
  city, 
  province, 
  zip_code
) VALUES (
  (SELECT id FROM public.user_model LIMIT 1), -- Replace with actual user_id
  'Kitsch Studio',
  'hello@kitschstudio.com',
  '+63 912 345 6789',
  'Fashion & Accessories',
  '123 Rizal Street',
  'Poblacion',
  'Quezon City',
  'Metro Manila',
  '1100'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample shipping settings
INSERT INTO public.shipping_settings (
  user_id,
  enable_free_shipping,
  minimum_order_amount
) VALUES (
  (SELECT id FROM public.user_model LIMIT 1), -- Replace with actual user_id
  true,
  2000.00
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample couriers
INSERT INTO public.couriers (user_id, name, is_active) VALUES
((SELECT id FROM public.user_model LIMIT 1), 'JNT Express', true),
((SELECT id FROM public.user_model LIMIT 1), 'SPX', true),
((SELECT id FROM public.user_model LIMIT 1), 'LBC', false)
ON CONFLICT DO NOTHING;

-- Insert sample regional shipping rates
INSERT INTO public.regional_shipping_rates (courier_id, region_name, region_description, price, is_active) VALUES
((SELECT id FROM public.couriers WHERE name = 'JNT Express' LIMIT 1), 'Metro Manila', 'National Capital Region', 120.00, true),
((SELECT id FROM public.couriers WHERE name = 'JNT Express' LIMIT 1), 'Luzon', 'Outside Metro Manila', 150.00, true),
((SELECT id FROM public.couriers WHERE name = 'JNT Express' LIMIT 1), 'Visayas', 'Central Philippines', 180.00, false),
((SELECT id FROM public.couriers WHERE name = 'JNT Express' LIMIT 1), 'Mindanao', 'Southern Philippines', 200.00, false),
((SELECT id FROM public.couriers WHERE name = 'JNT Express' LIMIT 1), 'Island Provinces', 'Remote islands (Palawan, Batanes, etc.)', 250.00, false),
((SELECT id FROM public.couriers WHERE name = 'SPX' LIMIT 1), 'Metro Manila', 'National Capital Region', 100.00, true),
((SELECT id FROM public.couriers WHERE name = 'SPX' LIMIT 1), 'Luzon', 'Outside Metro Manila', 130.00, true),
((SELECT id FROM public.couriers WHERE name = 'SPX' LIMIT 1), 'Visayas', 'Central Philippines', 160.00, true),
((SELECT id FROM public.couriers WHERE name = 'SPX' LIMIT 1), 'Mindanao', 'Southern Philippines', 180.00, true),
((SELECT id FROM public.couriers WHERE name = 'LBC' LIMIT 1), 'Metro Manila', 'National Capital Region', 140.00, false),
((SELECT id FROM public.couriers WHERE name = 'LBC' LIMIT 1), 'Luzon', 'Outside Metro Manila', 170.00, false),
((SELECT id FROM public.couriers WHERE name = 'LBC' LIMIT 1), 'Visayas', 'Central Philippines', 200.00, false),
((SELECT id FROM public.couriers WHERE name = 'LBC' LIMIT 1), 'Mindanao', 'Southern Philippines', 230.00, false),
((SELECT id FROM public.couriers WHERE name = 'LBC' LIMIT 1), 'Island Provinces', 'Remote islands (Palawan, Batanes, etc.)', 300.00, false)
ON CONFLICT (courier_id, region_name) DO NOTHING;

COMMIT;
