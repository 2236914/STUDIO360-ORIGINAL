-- Seed FAQ Data for Kitsch Studio
-- This file seeds the store_faqs and store_faq_chatbot_items tables with real client FAQs

BEGIN;

-- Insert into store_faqs table
INSERT INTO public.store_faqs (user_id, question, answer, display_order, is_active, created_at, updated_at)
VALUES 
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What are your shipping options?', 'We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days. We also offer same-day delivery for Metro Manila orders placed before 2 PM.', 1, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'How do I track my order?', 'You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team. You can also use our chatbot to get instant tracking information by providing your order number and email.', 2, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What is your return policy?', 'We accept returns within 7 days of delivery. Items must be in original condition with tags attached. Please contact our support team to initiate a return. Refunds will be processed within 3-5 business days after we receive the returned item.', 3, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, GCash, PayMaya, and bank transfers. All payments are processed securely through our payment partners.', 4, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'Do you offer bulk discounts?', 'Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items. We also have special packages for events, corporate orders, and resellers.', 5, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'How can I contact customer support?', 'You can reach us through our live chat widget, email at kitschstudioofficial@gmail.com, or WhatsApp. Our support team is available Monday to Friday, 9 AM to 6 PM. For urgent matters, use our live chat for faster response.', 6, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What are your customer support hours?', 'Our customer support is available Monday to Friday, 9 AM to 6 PM (Philippine Standard Time). Our online store is open 24/7 for orders. Processing and shipping happen during business days.', 7, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'Do you ship internationally?', 'Currently, we only ship within the Philippines. We are working on international shipping options and will announce them soon. Follow our social media for updates on international shipping availability.', 8, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert into store_faq_chatbot_items table (for chatbot-specific use)
INSERT INTO public.store_faq_chatbot_items (user_id, question, answer, display_order, is_active, created_at, updated_at)
VALUES 
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What are your shipping options?', 'We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days. We also offer same-day delivery for Metro Manila orders placed before 2 PM.', 1, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'How do I track my order?', 'You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team. You can also use our chatbot to get instant tracking information by providing your order number and email.', 2, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What is your return policy?', 'We accept returns within 7 days of delivery. Items must be in original condition with tags attached. Please contact our support team to initiate a return. Refunds will be processed within 3-5 business days after we receive the returned item.', 3, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, GCash, PayMaya, and bank transfers. All payments are processed securely through our payment partners.', 4, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'Do you offer bulk discounts?', 'Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items. We also have special packages for events, corporate orders, and resellers.', 5, true, NOW(), NOW()),
  ('bf9df707-b8dc-4351-ae67-95c2c5b6e01c', 'How can I contact customer support?', 'You can reach us through our live chat widget, email at support@kitschstudio.com, or WhatsApp. Our support team is available Monday to Friday, 9 AM to 6 PM. For urgent matters, use our live chat for faster response.', 6, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMIT;

