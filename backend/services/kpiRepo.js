const { supabase } = require('./supabaseClient');

function firstOfMonth(d = new Date()) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1; // 1-12
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${y}-${mm}-01`;
}

async function ensureRow(monthKey) {
  if (!supabase) return null;
  return supabase.from('kpi_stats').upsert({ month_key: monthKey }).select('*').single();
}

async function getMonth(monthKey = firstOfMonth()) {
  if (!supabase) return { data: null, error: new Error('supabase not configured') };
  const { data, error } = await supabase.from('kpi_stats').select('*').eq('month_key', monthKey).maybeSingle();
  return { data, error };
}

async function snapshot(stats, monthKey = firstOfMonth()) {
  if (!supabase) return { error: new Error('supabase not configured') };
  await ensureRow(monthKey);
  const payload = {
    transactions_processed: Number(stats.processed || 0),
    docs_count: Number(stats.docsCount || 0),
    time_saved_minutes: Number(stats.timeSavedMinutes || 0),
    cost_savings: Number(stats.costSavings || 0),
    accuracy_rate: typeof stats.accuracyRate === 'number' ? stats.accuracyRate : null,
    last_calculated_at: new Date().toISOString(),
  };
  return supabase.from('kpi_stats').update(payload).eq('month_key', monthKey);
}

async function accumulate(delta, monthKey = firstOfMonth()) {
  if (!supabase) return { error: new Error('supabase not configured') };
  await ensureRow(monthKey);
  // Fetch current, then apply additive update values
  const { data: cur } = await getMonth(monthKey);
  const prev = cur || {};
  const next = {
    transactions_processed: Number(prev.transactions_processed || 0) + Number(delta.processed || 0),
    docs_count: Number(prev.docs_count || 0) + Number(delta.docsCount || 0),
    time_saved_minutes: Number(prev.time_saved_minutes || 0) + Number(delta.timeSavedMinutes || 0),
    cost_savings: Number(prev.cost_savings || 0) + Number(delta.costSavings || 0),
    accuracy_rate: typeof delta.accuracyRate === 'number' ? delta.accuracyRate : (prev.accuracy_rate ?? null),
    last_calculated_at: new Date().toISOString(),
  };
  return supabase.from('kpi_stats').update(next).eq('month_key', monthKey);
}

module.exports = { firstOfMonth, getMonth, snapshot, accumulate };
