-- kpi_stats table for monthly KPI snapshots (safe create)
create table if not exists public.kpi_stats (
  month_key date primary key,
  transactions_processed bigint default 0 not null,
  docs_count bigint default 0 not null,
  time_saved_minutes bigint default 0 not null,
  cost_savings numeric(18,2) default 0 not null,
  accuracy_rate numeric(5,2),
  last_calculated_at timestamptz default now()
);

-- helpful index (redundant with PK but explicit for clarity)
create index if not exists idx_kpi_stats_month_key on public.kpi_stats (month_key);
