-- Create a function to refresh public.general_ledger from public.general_journal
-- Non-destructive to posting logic: journal remains the source of truth.

BEGIN;

CREATE OR REPLACE FUNCTION public.refresh_general_ledger()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear existing rows (derived table)
  DELETE FROM public.general_ledger;

  -- Recompute from journal + accounts mapping
  WITH sums AS (
    SELECT
      trim(gj.account_title_particulars) AS account_title,
      SUM(COALESCE(gj.debit, 0))  AS debit_sum,
      SUM(COALESCE(gj.credit, 0)) AS credit_sum
    FROM public.general_journal gj
    GROUP BY trim(gj.account_title_particulars)
  ), typed AS (
    SELECT
      s.account_title,
      s.debit_sum,
      s.credit_sum,
      a.account_code,
      a.account_type
    FROM sums s
    LEFT JOIN public.accounts a
      ON lower(a.account_title) = lower(s.account_title)
  )
  INSERT INTO public.general_ledger (account_code, account_title, debit, credit, balance)
  SELECT
    COALESCE(t.account_code, '') AS account_code,
    t.account_title,
    ABS(t.debit_sum) AS debit,
    ABS(t.credit_sum) AS credit,
    CASE WHEN COALESCE(t.account_type,'') IN ('asset','expense')
         THEN (ABS(t.debit_sum) - ABS(t.credit_sum))
         ELSE (ABS(t.credit_sum) - ABS(t.debit_sum))
    END AS balance
  FROM typed t;
END;
$$;

COMMIT;
