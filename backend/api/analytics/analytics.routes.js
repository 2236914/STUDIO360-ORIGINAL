/**
 * Analytics Routes
 * Provides read-only analytics derived from the Book of Accounts (DB), without changing bookkeeping logic.
 */

const express = require('express');
const router = express.Router();

const { getCashReceiptsAll, isDbReady } = require('../../services/bookkeepingRepo');
const cache = require('../../services/analyticsCache');
const { supabase } = require('../../services/supabaseClient');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

function monthIndexFromDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.getMonth(); // 0..11
}

function normStr(s = '') {
  return String(s || '').toLowerCase();
}

function detectChannel(row) {
  // 1) Explicit source mapping if present
  const src = normStr(row?.source || '');
  if (src) {
    // Normalize common variants
    if (['shopee', 'spx', 'sp'].some((k) => src.includes(k))) return 'SHOPEE';
    if (['tiktok', 'tik tok', 'tiktok shop', 'tiktokshop', 'tt'].some((k) => src.includes(k))) return 'TIKTOK';
    if (['360', 'studio360', 'studio 360', 'walk-in', 'walk in', 'offline', 'in-store', 'instore'].some((k) => src.includes(k))) return '360';
  }
  // 2) Fallback: mine other text fields
  const base = `${row?.remarks || ''} ${row?.reference || ''} ${row?.invoice_no || ''}`;
  const s = normStr(base);
  if (s.includes('shopee')) return 'SHOPEE';
  if (s.includes('tiktok')) return 'TIKTOK';
  if (s.includes('360') || s.includes('studio360') || s.includes('studio 360') || s.includes('walk-in') || s.includes('offline')) return '360';
  return null; // unclassified
}

// GET /api/analytics/sales?year=YYYY
router.get('/sales', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    // Try DB first
    let receipts = [];
    let usedCache = false;
    let dbTried = false;
    let dbOk = false;
    if (isDbReady()) {
      dbTried = true;
      try {
        receipts = await getCashReceiptsAll();
        dbOk = Array.isArray(receipts);
      } catch (_) {
        receipts = [];
        dbOk = false;
      }
    }

  const CHANNELS = ['360', 'SHOPEE', 'TIKTOK'];
  const months = Array.from({ length: 12 }, (_, i) => i); // 0..11

  const makeZeroes = () => Array.from({ length: 12 }, () => 0);
  const seriesMap = new Map(CHANNELS.map((c) => [c, makeZeroes()]));
  const prevSeriesMap = new Map(CHANNELS.map((c) => [c, makeZeroes()]));

  let totalThisYear = 0;
  let totalPrevYear = 0;

    for (const r of receipts || []) {
      const idx = monthIndexFromDate(r.date);
      if (idx == null) continue;
      const y = new Date(r.date).getFullYear();
      const ch = detectChannel(r);
      // Use Net Sales credited in CRJ; fallback to 0 if missing
      const netSales = Number(r?.cr_sales || 0);
      if (y === year) {
        if (ch && seriesMap.has(ch)) {
          seriesMap.get(ch)[idx] += netSales;
        }
        totalThisYear += netSales;
      } else if (y === year - 1) {
        if (ch && prevSeriesMap.has(ch) && idx != null) {
          prevSeriesMap.get(ch)[idx] += netSales;
        }
        totalPrevYear += netSales;
      }
    }

    // Month-aligned YoY based on CRJ series by default
    const monthHasData = months.map((m) => {
      const sum = (seriesMap.get('360')[m] + seriesMap.get('SHOPEE')[m] + seriesMap.get('TIKTOK')[m]);
      return Number(sum) > 0;
    });
    const alignedThis = months.reduce((acc, m) => acc + (monthHasData[m] ? (seriesMap.get('360')[m] + seriesMap.get('SHOPEE')[m] + seriesMap.get('TIKTOK')[m]) : 0), 0);
    const alignedPrev = months.reduce((acc, m) => acc + (monthHasData[m] ? (prevSeriesMap.get('360')[m] + prevSeriesMap.get('SHOPEE')[m] + prevSeriesMap.get('TIKTOK')[m]) : 0), 0);
    let yoy = null;
    let yoySource = 'crj';
    if (alignedPrev > 0) {
      yoy = (alignedThis - alignedPrev) / alignedPrev;
    } else if (totalPrevYear > 0) {
      // fallback to full-year totals if alignment has no baseline
      yoy = (totalThisYear - totalPrevYear) / totalPrevYear;
    } else {
      yoy = null; // no baseline
    }

    // Accuracy pass: if possible, compute YoY from general_journal Sales Revenue (account_title_particulars = 'Sales Revenue')
    if (supabase && dbOk) {
      try {
        const { data: gj, error: gjErr } = await supabase
          .from('general_journal')
          .select('date, account_title_particulars, debit, credit');
        if (!gjErr && Array.isArray(gj)) {
          const thisByM = Array(12).fill(0);
          const prevByM = Array(12).fill(0);
          for (const r of gj) {
            const title = String(r.account_title_particulars || '').trim().toLowerCase();
            if (title !== 'sales revenue') continue;
            const d = new Date(r.date);
            if (Number.isNaN(d.getTime())) continue;
            const m = d.getMonth();
            const y = d.getFullYear();
            const val = Number(r.credit || 0) - Number(r.debit || 0);
            if (y === year) thisByM[m] += val;
            else if (y === year - 1) prevByM[m] += val;
          }
          const active = thisByM.map((v) => Number(v) > 0);
          const aThis = thisByM.reduce((s, v, i) => s + (active[i] ? v : 0), 0);
          const aPrev = prevByM.reduce((s, v, i) => s + (active[i] ? v : 0), 0);
          if (aPrev > 0) {
            yoy = (aThis - aPrev) / aPrev;
            yoySource = 'general_journal';
          }
        }
      } catch (_) { /* ignore */ }
    }

    let payload = {
      year,
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      series: {
        '360': seriesMap.get('360'),
        'Shopee': seriesMap.get('SHOPEE'),
        'TikTok Shop': seriesMap.get('TIKTOK'),
      },
      yoy,
      yoySource,
      lastUpdated: new Date().toISOString(),
    };
    // Determine if payload has any data
    const hasAny = Object.values(payload.series).some((arr) => (arr || []).some((v) => Number(v) > 0));
  payload.hasData = hasAny;
  if (!hasAny) payload.yoy = null; // no baseline; ensure UI shows n/a

    // If empty and DB unavailable, attempt year-specific cache only (avoid cross-year leakage)
    if (!hasAny && (!dbTried || !dbOk)) {
      const cached = cache.readSales(year);
      if (cached && cached.series && Object.values(cached.series).some((arr) => (arr || []).some((v) => Number(v) > 0))) {
        payload = { ...payload, ...cached, year: year, hasData: true };
        usedCache = true;
      }
    }

    // Persist latest good snapshot for this year only when there is data
    try {
      if (payload.hasData && !usedCache) {
        cache.writeSales(year, payload);
      }
    } catch (_) {}

    return res.json({ success: true, data: payload, source: usedCache ? 'cache' : (dbTried ? 'db' : 'none') });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

// Optional: POST /api/analytics/sales/forecast { channel: 'Shopee'|'TikTok Shop'|'360', year: 2025 }
router.post('/sales/forecast', async (req, res) => {
  try {
    if (!isDbReady()) return res.status(503).json({ success: false, message: 'Database not configured' });
    const { channel = '360', year = new Date().getFullYear() } = req.body || {};
    const receipts = await getCashReceiptsAll();
    const months = Array.from({ length: 12 }, () => 0);
    for (const r of receipts || []) {
      const y = new Date(r.date).getFullYear();
      if (y !== Number(year)) continue;
      const ch = detectChannel(r);
      if ((channel === 'Shopee' && ch !== 'SHOPEE') || (channel === 'TikTok Shop' && ch !== 'TIKTOK') || (channel === '360' && ch !== '360')) continue;
      const mi = monthIndexFromDate(r.date);
      if (mi == null) continue;
      months[mi] += Number(r?.cr_sales || 0);
    }

    // Resolve Python executable similar to ai.routes resolve pattern (fallback to 'python')
    const pythonCandidates = [
      process.env.PYTHON_PATH,
      path.join(process.cwd(), 'python', '.venv', 'Scripts', 'python.exe'),
      'python',
      'py',
    ].filter(Boolean);
    const script = path.join(process.cwd(), 'backend', 'python', 'forecast_sales.py');
    if (!fs.existsSync(script)) return res.status(500).json({ success: false, message: 'forecast_sales.py missing' });

    function tryRunPython(i) {
      if (i >= pythonCandidates.length) return res.status(500).json({ success: false, message: 'No Python interpreter found' });
      const exe = pythonCandidates[i];
      const p = spawn(exe, [script], { stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
      p.stdout.on('data', (d) => { out += d.toString(); });
      p.stderr.on('data', (d) => { err += d.toString(); });
      p.on('error', () => tryRunPython(i + 1));
      p.on('close', (code) => {
        if (code !== 0 && !out) return tryRunPython(i + 1);
        try {
          const json = JSON.parse(out || '{}');
          if (json.error) return res.json({ success: true, data: { channel, year, forecast: [], info: json.error } });
          return res.json({ success: true, data: { channel, year, forecast: json.forecast, dates: json.dates } });
        } catch (_) {
          return res.status(500).json({ success: false, message: err || 'Forecast failed' });
        }
      });
      p.stdin.write(JSON.stringify({ series: months, year }));
      p.stdin.end();
    }

    tryRunPython(0);
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Maintenance: DELETE /api/analytics/sales/cache?year=YYYY
router.delete('/sales/cache', async (req, res) => {
  try {
    const year = parseInt(req.query.year || '0', 10);
    const fs = require('fs');
    const path = require('path');
  const p = path.join(__dirname, '..', '..', 'data', 'analytics', `sales-${year}.json`);
    if (year && fs.existsSync(p)) fs.unlinkSync(p);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Health: GET /api/analytics/forecast/ready -> { ready: boolean, impl: 'prophet'|'fbprophet'|null }
router.get('/forecast/ready', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
  const script = path.join(__dirname, '..', '..', 'python', 'forecast_sales.py');
    if (!fs.existsSync(script)) return res.json({ success: true, data: { ready: false, impl: null } });
    // Probe by running with empty payload to see if it prints an error about prophet
    const { spawn } = require('child_process');
  const candidates = [process.env.PYTHON_PATH, path.join(__dirname, '..', '..', 'python', '.venv', 'Scripts', 'python.exe'), 'python', 'py'].filter(Boolean);
    function tryOne(i) {
      if (i >= candidates.length) return res.json({ success: true, data: { ready: false, impl: null } });
      const p = spawn(candidates[i], [script], { stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '';
      p.stdout.on('data', (d) => { out += d.toString(); });
      p.on('error', () => tryOne(i + 1));
      p.on('close', () => {
        try {
          const j = JSON.parse(out || '{}');
          if (j && j.error && String(j.error).toLowerCase().includes('prophet not installed')) {
            return res.json({ success: true, data: { ready: false, impl: null } });
          }
          return res.json({ success: true, data: { ready: true, impl: 'prophet' } });
        } catch (_) {
          return res.json({ success: true, data: { ready: false, impl: null } });
        }
      });
      p.stdin.write('{}');
      p.stdin.end();
    }
    tryOne(0);
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/analytics/profit?year=YYYY
// Computes monthly Sales (Revenue) and Expenses from general_journal when available, else approximates from CRJ (sales) and CDB (expenses)
router.get('/profit', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    let months = Array.from({ length: 12 }, (_, i) => i);
    let sales = Array(12).fill(0);
    let expenses = Array(12).fill(0);
    let source = 'journal';

    const canDb = !!supabase;
    if (!canDb) {
      // fallback to cache
      const cached = cache.readProfit(year);
      if (cached) return res.json({ success: true, data: { year, months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], sales: cached.sales||[], expenses: cached.expenses||[], source: 'cache', lastUpdated: cached.savedAt } });
      return res.json({ success: true, data: { year, months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], sales, expenses, source: 'none', lastUpdated: new Date().toISOString() } });
    }

    // Prefer general_journal: Sales = credit - debit where account_title_particulars='Sales Revenue'
    // Expenses: sum debit - credit for accounts known as expenses from COA mapping
    const { COA } = require('../bookkeeping/coa');
    const expenseTitles = new Set(Object.values(COA).filter(a => a.type === 'expense').map(a => a.title.toLowerCase()));

    // Load general_journal rows
    const { data: gj, error: gjErr } = await supabase
      .from('general_journal')
      .select('date, account_title_particulars, debit, credit')
      .order('date', { ascending: true });
    if (!gjErr && Array.isArray(gj)) {
      for (const r of gj) {
        const d = new Date(r.date);
        if (Number.isNaN(d.getTime())) continue;
        const y = d.getFullYear();
        if (y !== year) continue;
        const m = d.getMonth();
        const title = String(r.account_title_particulars || '').trim().toLowerCase();
        const debit = Number(r.debit || 0);
        const credit = Number(r.credit || 0);
        if (title === 'sales revenue') sales[m] += (credit - debit);
        else if (expenseTitles.has(title)) expenses[m] += (debit - credit);
      }
    } else {
      source = 'crj_cdb';
    }

    // If still all zeros (e.g., journal not populated), approximate: 
    // sales from cash_receipt_journal.cr_sales; expenses from cash_disbursement_book debit columns sum
    const noSales = sales.every((v) => v === 0);
    const noExp = expenses.every((v) => v === 0);
    if (noSales || noExp) {
      try {
        const { data: crj } = await supabase
          .from('cash_receipt_journal')
          .select('date, cr_sales');
        for (const r of crj || []) {
          const d = new Date(r.date);
          if (d.getFullYear() !== year) continue;
          const m = d.getMonth();
          sales[m] += Number(r.cr_sales || 0);
        }
      } catch (_) {}
      try {
        const { data: cdb } = await supabase
          .from('cash_disbursement_book')
          .select('date, dr_materials, dr_supplies, dr_rent, dr_utilities, dr_advertising, dr_delivery, dr_taxes_licenses, dr_misc');
        for (const r of cdb || []) {
          const d = new Date(r.date);
          if (d.getFullYear() !== year) continue;
          const m = d.getMonth();
          const sum = ['dr_materials','dr_supplies','dr_rent','dr_utilities','dr_advertising','dr_delivery','dr_taxes_licenses','dr_misc']
            .reduce((s,k)=> s + Number(r[k] || 0), 0);
          expenses[m] += sum;
        }
      } catch (_) {}
    }

    const payload = {
      year,
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      sales: sales.map((v) => Number(v) || 0),
      expenses: expenses.map((v) => Number(v) || 0),
      source,
      lastUpdated: new Date().toISOString(),
    };
    try { cache.writeProfit(year, payload); } catch (_) {}
    return res.json({ success: true, data: payload });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Lightweight cache helpers to persist charts even without a database
// GET /api/analytics/sales/cache?year=YYYY -> returns cached sales snapshot for the year if available
router.get('/sales/cache', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const cached = cache.readSales(year);
    if (!cached) return res.json({ success: true, data: null });
    return res.json({ success: true, data: cached });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/analytics/sales/cache { year, months, series, yoy?, yoySource?, lastUpdated? }
router.post('/sales/cache', async (req, res) => {
  try {
    const body = req.body || {};
    const year = parseInt(body.year || new Date().getFullYear(), 10);
    const months = Array.isArray(body.months) ? body.months : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const series = body.series || {};
    const seriesSafe = {
      '360': Array.isArray(series['360']) ? series['360'].map((v)=>Number(v)||0) : Array(12).fill(0),
      'Shopee': Array.isArray(series['Shopee']) ? series['Shopee'].map((v)=>Number(v)||0) : Array(12).fill(0),
      'TikTok Shop': Array.isArray(series['TikTok Shop']) ? series['TikTok Shop'].map((v)=>Number(v)||0) : Array(12).fill(0),
    };
    const hasAny = Object.values(seriesSafe).some((arr)=> (arr||[]).some((v)=> Number(v)>0));
    const payload = {
      year,
      months,
      series: seriesSafe,
      yoy: typeof body.yoy === 'number' ? body.yoy : null,
      yoySource: body.yoySource || 'cache',
      lastUpdated: body.lastUpdated || new Date().toISOString(),
      hasData: hasAny,
    };
    cache.writeSales(year, payload);
    return res.json({ success: true, data: payload });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/analytics/profit/cache?year=YYYY
router.get('/profit/cache', async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const cached = cache.readProfit(year);
    if (!cached) return res.json({ success: true, data: null });
    return res.json({ success: true, data: cached });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/analytics/profit/cache { year, months, sales, expenses, source? }
router.post('/profit/cache', async (req, res) => {
  try {
    const body = req.body || {};
    const year = parseInt(body.year || new Date().getFullYear(), 10);
    const months = Array.isArray(body.months) ? body.months : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const sales = Array.isArray(body.sales) ? body.sales.map((v)=>Number(v)||0) : Array(12).fill(0);
    const expenses = Array.isArray(body.expenses) ? body.expenses.map((v)=>Number(v)||0) : Array(12).fill(0);
    const payload = {
      year,
      months,
      sales,
      expenses,
      source: body.source || 'cache',
      lastUpdated: body.lastUpdated || new Date().toISOString(),
    };
    cache.writeProfit(year, payload);
    return res.json({ success: true, data: payload });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});
