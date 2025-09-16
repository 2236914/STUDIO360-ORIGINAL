-- View to present ledger summary exactly like the app
-- Groups from general_journal and applies normal-side rules by account title
-- You can extend the CASE for more accounts or switch to a lookup table

create or replace view public.v_ledger_presented as
with sums as (
  select
    trim(gj.account_title_particulars) as account_title,
    sum(coalesce(gj.debit,0)) as debit_sum,
    sum(coalesce(gj.credit,0)) as credit_sum
  from public.general_journal gj
  group by trim(gj.account_title_particulars)
)
select
  s.account_title,
  -- depict totals as positive numbers
  abs(s.debit_sum) as debit,
  abs(s.credit_sum) as credit,
  -- infer normal side from known titles; extend as needed
  case
    when s.account_title in (
      'Cash on Hand',
      'Cash in Bank',
      'Accounts Receivable',
      'Inventory (Merchandise)',
      'Prepaid Expenses',
      'Tools & Equipment',
      'Store Fixtures & Furniture',
      'Withholding Tax Receivable',
      'Platform Fees & Charges',
      'Supplies Expense',
      'Rent Expense',
      'Utilities Expense',
      'Advertising & Promotion',
      'Transportation/Delivery',
      'Taxes & Licenses',
      'Miscellaneous Expense',
      'Depreciation Expense'
    ) then 'debit'
    else 'credit'
  end as balance_side,
  case
    when s.account_title in (
      'Cash on Hand',
      'Cash in Bank',
      'Accounts Receivable',
      'Inventory (Merchandise)',
      'Prepaid Expenses',
      'Tools & Equipment',
      'Store Fixtures & Furniture',
      'Withholding Tax Receivable',
      'Platform Fees & Charges',
      'Supplies Expense',
      'Rent Expense',
      'Utilities Expense',
      'Advertising & Promotion',
      'Transportation/Delivery',
      'Taxes & Licenses',
      'Miscellaneous Expense',
      'Depreciation Expense'
    ) then (abs(s.debit_sum) - abs(s.credit_sum))
    else (abs(s.credit_sum) - abs(s.debit_sum))
  end as balance
from sums s
order by s.account_title;
