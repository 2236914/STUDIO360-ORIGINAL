-- Create welcome popup storage for storefronts
-- Safe to run multiple times

create table if not exists public.store_welcome_popup (
  user_id uuid primary key,
  enabled boolean not null default false,
  title text,
  subtitle text,
  updated_at timestamptz not null default now()
);

-- Ensure updated_at updates on change (for Postgres 14+, use trigger)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_store_welcome_popup_set_updated_at'
  ) then
    create or replace function public.set_updated_at()
    returns trigger as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$ language plpgsql;

    create trigger trg_store_welcome_popup_set_updated_at
    before update on public.store_welcome_popup
    for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Enable RLS and add simple policies consistent with per-user rows
alter table public.store_welcome_popup enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'store_welcome_popup' and policyname = 'store_welcome_popup_select_own'
  ) then
    create policy store_welcome_popup_select_own
      on public.store_welcome_popup
      for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'store_welcome_popup' and policyname = 'store_welcome_popup_upsert_own'
  ) then
    create policy store_welcome_popup_upsert_own
      on public.store_welcome_popup
      for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'store_welcome_popup' and policyname = 'store_welcome_popup_update_own'
  ) then
    create policy store_welcome_popup_update_own
      on public.store_welcome_popup
      for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;


