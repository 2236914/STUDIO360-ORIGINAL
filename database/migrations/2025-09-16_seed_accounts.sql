-- Seed Chart of Accounts into public.accounts (idempotent upsert)
BEGIN;

-- Ensure accounts table exists (created by earlier migration)
-- Upsert accounts based on account_code

INSERT INTO public.accounts (account_code, account_title, account_type)
VALUES
  ('101','Cash on Hand','asset'),
  ('102','Cash in Bank','asset'),
  ('103','Accounts Receivable','asset'),
  ('104','Inventory (Merchandise)','asset'),
  ('105','Prepaid Expenses','asset'),
  ('106','Tools & Equipment','asset'),
  ('107','Store Fixtures & Furniture','asset'),
  ('108','Accumulated Depreciation','asset'), -- contra-asset stored as asset type; presentation handles normal side
  ('109','Withholding Tax Receivable','asset'),
  ('201','Accounts Payable','liability'),
  ('202','Loans Payable','liability'),
  ('301','Owner''s Capital','equity'),
  ('302','Owner''s Drawings','equity'),
  ('401','Sales Revenue','revenue'),
  ('402','Other Income','revenue'),
  ('501','Purchases (COGS)','expense'),
  ('502','Supplies Expense','expense'),
  ('503','Rent Expense','expense'),
  ('504','Utilities Expense','expense'),
  ('505','Advertising & Promotion','expense'),
  ('506','Transportation/Delivery','expense'),
  ('507','Taxes & Licenses','expense'),
  ('508','Miscellaneous Expense','expense'),
  ('509','Depreciation Expense','expense'),
  ('510','Platform Fees & Charges','expense')
ON CONFLICT (account_code) DO UPDATE
SET account_title = EXCLUDED.account_title,
    account_type = EXCLUDED.account_type;

COMMIT;
