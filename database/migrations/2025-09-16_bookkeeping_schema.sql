BEGIN;

-- Accounts master
CREATE TABLE IF NOT EXISTS public.accounts (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_title TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense'))
);

-- Journal entries (header)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  entry_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entry_date DATE NOT NULL,
  reference TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal details (lines)
CREATE TABLE IF NOT EXISTS public.journal_details (
  entry_id BIGINT NOT NULL REFERENCES public.journal_entries(entry_id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  account_code TEXT NOT NULL REFERENCES public.accounts(account_code) ON UPDATE CASCADE,
  description TEXT,
  debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (entry_id, line_no)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_details_account ON public.journal_details(account_code);

-- Cash receipts
CREATE TABLE IF NOT EXISTS public.cash_receipts (
  receipt_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  receipt_date DATE NOT NULL,
  invoice_no TEXT,
  source TEXT,
  reference TEXT,
  cash_debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cash_receipt_details (
  receipt_id BIGINT NOT NULL REFERENCES public.cash_receipts(receipt_id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  account_code TEXT NOT NULL REFERENCES public.accounts(account_code) ON UPDATE CASCADE,
  debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (receipt_id, line_no)
);

-- Cash disbursements
CREATE TABLE IF NOT EXISTS public.cash_disbursements (
  disbursement_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  disbursement_date DATE NOT NULL,
  voucher_no TEXT,
  payee TEXT,
  reference TEXT,
  cash_credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cash_disbursement_details (
  disbursement_id BIGINT NOT NULL REFERENCES public.cash_disbursements(disbursement_id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  account_code TEXT NOT NULL REFERENCES public.accounts(account_code) ON UPDATE CASCADE,
  debit NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit NUMERIC(18,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (disbursement_id, line_no)
);

COMMIT;
