-- Replace physical general_ledger table with a view aliasing v_ledger_presented
-- Safe to run multiple times

BEGIN;

-- Drop table if it exists (will cascade dependent views/constraints)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'general_ledger'
  ) THEN
    EXECUTE 'DROP TABLE IF EXISTS public.general_ledger CASCADE';
  END IF;
END $$;

-- Ensure the source presentation view exists (created in another migration)
-- Create or replace a forwarding view named general_ledger
CREATE OR REPLACE VIEW public.general_ledger AS
SELECT account_title,
       debit,
       credit,
       balance_side,
       balance
FROM public.v_ledger_presented;

COMMIT;
