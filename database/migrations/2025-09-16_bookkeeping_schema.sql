BEGIN;

-- Drop old tables if they exist (this will delete all data!)
DROP TABLE IF EXISTS public.cash_disbursement_book CASCADE;
DROP TABLE IF EXISTS public.general_journal CASCADE;
DROP TABLE IF EXISTS public.general_ledger CASCADE;
DROP TABLE IF EXISTS public.cash_receipt_journal CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;

-- Chart of Accounts
CREATE TABLE public.accounts (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_code VARCHAR(20) UNIQUE,
  account_title VARCHAR(255) NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense'))
);

-- General Journal
CREATE TABLE public.general_journal (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  account_title_particulars VARCHAR(255) NOT NULL,
  reference VARCHAR(50),
  debit NUMERIC(12,2) DEFAULT 0.00,
  credit NUMERIC(12,2) DEFAULT 0.00
);

-- Cash Receipt Journal
CREATE TABLE public.cash_receipt_journal (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  invoice_no VARCHAR(50),
  source VARCHAR(255),
  reference VARCHAR(50),
  dr_cash NUMERIC(12,2) DEFAULT 0.00,
  dr_fees NUMERIC(12,2) DEFAULT 0.00,
  dr_returns NUMERIC(12,2) DEFAULT 0.00,
  cr_sales NUMERIC(12,2) DEFAULT 0.00,
  cr_income NUMERIC(12,2) DEFAULT 0.00,
  cr_ar NUMERIC(12,2) DEFAULT 0.00,
  remarks TEXT
);

-- Cash Disbursement Book
CREATE TABLE public.cash_disbursement_book (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  payee_particulars VARCHAR(255) NOT NULL,
  reference VARCHAR(50),
  cr_cash NUMERIC(12,2) DEFAULT 0.00,
  dr_materials NUMERIC(12,2) DEFAULT 0.00,
  dr_supplies NUMERIC(12,2) DEFAULT 0.00,
  dr_rent NUMERIC(12,2) DEFAULT 0.00,
  dr_utilities NUMERIC(12,2) DEFAULT 0.00,
  dr_advertising NUMERIC(12,2) DEFAULT 0.00,
  dr_delivery NUMERIC(12,2) DEFAULT 0.00,
  dr_taxes_licenses NUMERIC(12,2) DEFAULT 0.00,
  dr_misc NUMERIC(12,2) DEFAULT 0.00,
  remarks TEXT
);

-- General Ledger
CREATE TABLE public.general_ledger (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_code VARCHAR(50),
  account_title VARCHAR(255) NOT NULL,
  debit NUMERIC(12,2) DEFAULT 0.00,
  credit NUMERIC(12,2) DEFAULT 0.00,
  balance NUMERIC(12,2) DEFAULT 0.00
);

-- Indexes
CREATE INDEX idx_gj_date ON public.general_journal (date);
CREATE INDEX idx_gj_account ON public.general_journal (account_title_particulars);

CREATE INDEX idx_crj_date ON public.cash_receipt_journal (date);
CREATE INDEX idx_cdb_date ON public.cash_disbursement_book (date);

COMMIT;
