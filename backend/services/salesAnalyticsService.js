// Sales Analytics Aggregation & Forecast Service
// Derives consolidated monthly gross sales from:
// - General Journal (Net Sales credits, code 401 or account title contains 'Sales')
// - Cash Receipt Journal (cr_sales column)
// - Adjusts by platform fees (dr_fees) and returns (dr_returns)
// - Cash Disbursement Book (platform/other direct sales related expenses codes 505 advertising, 506 delivery, 507 taxes, 508 misc)
// Provides a clean time series for dashboard + a forecast stub (delegated to Python Prophet script if available).

const { supabase } = require('./supabaseClient');
const { isDbReady } = require('./bookkeepingRepo');
const path = require('path');
const { spawn } = require('child_process');

// Helper: safe parse date to YYYY-MM format
function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function fetchRaw() {
  if (!isDbReady()) return { journal: [], receipts: [], disbursements: [] };
  // Pull minimal columns needed
  const [gj, cr, cd] = await Promise.all([
    supabase.from('general_journal').select('date, account_title_particulars, debit, credit'),
    supabase.from('cash_receipt_journal').select('date, dr_fees, dr_returns, cr_sales, cr_income'),
    supabase.from('cash_disbursement_book').select('date, dr_advertising, dr_delivery, dr_taxes_licenses, dr_misc'),
  ]);
  return {
    journal: gj.data || [],
    receipts: cr.data || [],
    disbursements: cd.data || [],
  };
}

function aggregate(raw) {
  const map = new Map();
  function ensure(m) { if (!map.has(m)) map.set(m, { month: m, grossSales: 0, returns: 0, fees: 0, otherIncome: 0, salesNetJournal: 0, salesNetReceipts: 0, salesAdjExpenses: 0 }); return map.get(m); }

  // General Journal: derive sales credits
  for (const r of raw.journal) {
    const mk = monthKey(r.date); if (!mk) continue;
    const title = String(r.account_title_particulars || '').toLowerCase();
    const credit = Number(r.credit || 0); const debit = Number(r.debit || 0);
    // Treat credit to Sales accounts as gross/net sales depending on schema (just accumulate credits for now)
    if (title.includes('sales')) {
      const rec = ensure(mk);
      rec.salesNetJournal += credit; // Net or Gross depending on posting style
    }
  }

  // Cash Receipts: cr_sales is net sales inflow; dr_returns reduces; dr_fees is platform fees
  for (const r of raw.receipts) {
    const mk = monthKey(r.date); if (!mk) continue;
    const rec = ensure(mk);
    rec.salesNetReceipts += Number(r.cr_sales || 0);
    rec.returns += Number(r.dr_returns || 0);
    rec.fees += Number(r.dr_fees || 0);
    rec.otherIncome += Number(r.cr_income || 0);
  }

  // Disbursements: sales related operating expenses impact net margin but not gross; we include an adjustment bucket
  for (const r of raw.disbursements) {
    const mk = monthKey(r.date); if (!mk) continue;
    const rec = ensure(mk);
    rec.salesAdjExpenses += Number(r.dr_advertising || 0) + Number(r.dr_delivery || 0) + Number(r.dr_taxes_licenses || 0) + Number(r.dr_misc || 0);
  }

  // Compute grossSales heuristic: prioritize receipts net + returns + fees to approximate gross
  for (const rec of map.values()) {
    // If receipts net present, approximate gross = net + returns + fees
    if (rec.salesNetReceipts > 0) {
      rec.grossSales = rec.salesNetReceipts + rec.returns + rec.fees;
    } else if (rec.salesNetJournal > 0) {
      rec.grossSales = rec.salesNetJournal + rec.returns + rec.fees; // fallback
    } else {
      rec.grossSales = 0;
    }
  }

  const rows = Array.from(map.values()).sort((a,b)=> a.month.localeCompare(b.month));
  return rows;
}

async function getSalesAnalytics() {
  const raw = await fetchRaw();
  const agg = aggregate(raw);
  return { rows: agg };
}

// Forecast via Python Prophet script; we pass JSON payload (rows) and expect forecast rows.
async function getSalesForecast(limitMonths = 6) {
  const { rows } = await getSalesAnalytics();
  if (!rows.length) return { rows: [], forecast: [] };
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '..', 'python', 'sales_forecast.py');
    const proc = spawn('python', [scriptPath, JSON.stringify({ history: rows, limit: limitMonths })], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    proc.stdout.on('data', (d) => out += d.toString());
    proc.stderr.on('data', (d) => err += d.toString());
    proc.on('close', () => {
      try {
        const parsed = JSON.parse(out.trim());
        resolve({ rows, forecast: parsed.forecast || [], meta: parsed.meta || {}, stderr: err });
      } catch (e) {
        resolve({ rows, forecast: [], meta: { error: 'forecast_parse_failed', detail: e.message }, stderr: err });
      }
    });
  });
}

module.exports = { getSalesAnalytics, getSalesForecast };
