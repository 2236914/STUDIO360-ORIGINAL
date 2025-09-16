-- View to present ledger summary exactly like the app
-- Groups from general_journal and derives normal-side via accounts.account_type
-- Assets & Expenses => debit-normal; Liabilities, Equity, Revenue => credit-normal

create or replace view public.v_ledger_presented as
with sums as (
  select
    trim(gj.account_title_particulars) as account_title,
    sum(coalesce(gj.debit,0)) as debit_sum,
    sum(coalesce(gj.credit,0)) as credit_sum
  from public.general_journal gj
  group by trim(gj.account_title_particulars)
), typed as (
  select
    s.account_title,
    s.debit_sum,
    s.credit_sum,
    a.account_type
  from sums s
  left join public.accounts a
    on lower(a.account_title) = lower(s.account_title)
)
select
  t.account_title,
  -- depict totals as positive numbers
  abs(t.debit_sum) as debit,
  abs(t.credit_sum) as credit,
  -- infer normal side from accounts.account_type when available; default to credit-normal
  case when coalesce(t.account_type,'') in ('asset','expense') then 'debit' else 'credit' end as balance_side,
  case when coalesce(t.account_type,'') in ('asset','expense')
       then (abs(t.debit_sum) - abs(t.credit_sum))
       else (abs(t.credit_sum) - abs(t.debit_sum))
  end as balance
from typed t
order by t.account_title;
