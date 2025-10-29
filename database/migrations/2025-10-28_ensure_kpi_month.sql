-- Ensure KPI month row exists for a given date
-- Adds a small helper function expected by application triggers or inserts.

BEGIN;

CREATE OR REPLACE FUNCTION public.ensure_kpi_month(d date)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.kpi_stats(month_key)
  VALUES (date_trunc('month', d)::date)
  ON CONFLICT (month_key) DO NOTHING;
END;
$$;

COMMIT;
