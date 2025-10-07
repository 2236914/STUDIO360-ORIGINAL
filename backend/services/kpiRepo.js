// KPI persistence disabled: backing table removed from Supabase.
// This module is kept as a stub to avoid import errors.

function firstOfMonth(d = new Date()) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${y}-${mm}-01`;
}

async function getMonth() {
  return { data: null, error: new Error('KPI persistence disabled') };
}

async function snapshot() {
  return { error: new Error('KPI persistence disabled') };
}

async function accumulate() {
  return { error: new Error('KPI persistence disabled') };
}

module.exports = { firstOfMonth, getMonth, snapshot, accumulate };
