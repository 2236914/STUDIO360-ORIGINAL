/**
 * Bookkeeping Routes
 * Handles bookkeeping and accounting endpoints
 */

const express = require('express');
const router = express.Router();
const { COA, getAccount, listAccounts } = require('./coa');
const {
  upsertAccount,
  insertJournal,
  insertCashReceipt,
  insertCashReceiptDetails,
  insertCashDisbursement,
  insertCashDisbursementDetails,
  getJournalEntries,
  getLedgerSummary,
  isDbReady,
  getCashReceiptsAll,
  getCashDisbursementsAll,
  getLedgerFullFromDb,
  refreshGeneralLedger,
} = require('../../services/bookkeepingRepo');

// In-memory storage (replace with DB later)
// journal: {id,date,ref,particulars, lines:[{code,account,description,debit,credit}]}
// ledger is computed on demand from journal lines (account-by-account running balance)
// receipts/disbursements are stored in normalized forms aligned to your columns
const store = {
  journal: [],
  receipts: [], // cash receipts journal entries
  disbursements: [], // cash disbursement journal entries
};

function resetStore() {
  store.journal.length = 0;
  store.ledger.length = 0;
  store.cashReceipts.length = 0;
  store.cashDisbursements.length = 0;
}

function ok(res, payload) {
  return res.json({ success: true, ...payload });
}
function bad(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

// ---- Helpers: idempotency & hashing for duplicate detection ----
function normalizeLine(ln) {
  return {
    code: String(ln.code),
    description: (ln.description || '').trim(),
    debit: Number(ln.debit || 0),
    credit: Number(ln.credit || 0),
  };
}
function hashLines(lines = []) {
  const norm = (lines || [])
    .map(normalizeLine)
    // For idempotency, only code and amounts should determine identity; ignore description text.
    .map((ln) => ({ code: String(ln.code), debit: Number(ln.debit || 0), credit: Number(ln.credit || 0) }));
  // Sort by code, debit, credit for stable signature
  norm.sort((a, b) => a.code.localeCompare(b.code) || a.debit - b.debit || a.credit - b.credit);
  return JSON.stringify(norm);
}
function findJournalByRef(ref) {
  if (!ref) return null;
  return store.journal.find((e) => String(e.ref) === String(ref)) || null;
}
function findJournalDuplicateByLines(date, lines) {
  const sig = hashLines(lines);
  return store.journal.find((e) => e.date === date && hashLines(e.lines) === sig) || null;
}

// Cash receipts idempotency helpers
function receiptSignature({ date, referenceNo, customer, cashDebit, feesChargesDebit, salesReturnsDebit, netSalesCredit, otherIncomeCredit, arCredit, ownersCapitalCredit }) {
  return JSON.stringify({
    date: String(date || ''),
    ref: String(referenceNo || ''),
    customer: String(customer || ''),
    cashDebit: Number(cashDebit || 0),
    feesChargesDebit: Number(feesChargesDebit || 0),
    salesReturnsDebit: Number(salesReturnsDebit || 0),
    netSalesCredit: Number(netSalesCredit || 0),
    otherIncomeCredit: Number(otherIncomeCredit || 0),
    arCredit: Number(arCredit || 0),
    ownersCapitalCredit: Number(ownersCapitalCredit || 0),
  });
}
function findReceiptDuplicate(payload) {
  const sig = receiptSignature(payload);
  return store.receipts.find(r => receiptSignature(r) === sig) || null;
}

// --- Startup hydration: load in-memory books from DB if empty ---
(async () => {
  try {
    if (!isDbReady()) return;
    // Hydrate journal from general_journal (grouped by date+reference)
    const { entries } = await getJournalEntries({ page: 1, limit: 10000 });
    if (Array.isArray(entries) && store.journal.length === 0) {
      for (const e of entries) {
        const id = store.journal.length + 1;
        const lines = (e.lines||[]).map(ln => {
          const desc = String(ln.description || '').trim();
          let code = '';
          try {
            const found = listAccounts().find(a => a.title === desc);
            if (found) code = found.code;
          } catch (_) {}
          return { code, description: desc, debit: Number(ln.debit||0), credit: Number(ln.credit||0) };
        });
        store.journal.push({ id, date: e.date, ref: e.ref || `GJ${String(id).padStart(4,'0')}`, particulars: e.particulars || '', lines });
      }
    }
    // Hydrate cash receipts
    const receipts = await getCashReceiptsAll();
    if (Array.isArray(receipts) && store.receipts.length === 0) {
      for (const r of receipts) {
        const id = store.receipts.length + 1;
        store.receipts.push({
          id,
          date: r.date,
          referenceNo: r.reference || '',
          customer: r.source || '',
          cashDebit: Number(r.dr_cash || r.dr_cashbank || 0),
          feesChargesDebit: Number(r.dr_fees || 0),
          salesReturnsDebit: Number(r.dr_returns || 0),
          netSalesCredit: Number(r.cr_sales || 0),
          otherIncomeCredit: Number(r.cr_income || 0),
          arCredit: Number(r.cr_ar || 0),
          ownersCapitalCredit: 0,
          remarks: r.remarks || ''
        });
      }
    }
    // Hydrate cash disbursements
    const disb = await getCashDisbursementsAll();
    if (Array.isArray(disb) && store.disbursements.length === 0) {
      for (const d of disb) {
        const id = store.disbursements.length + 1;
        store.disbursements.push({
          id,
          date: d.date,
          referenceNo: d.reference || '',
          payee: d.payee_particulars || '',
          cashCredit: Number(d.cr_cash || 0),
          purchasesDebit: Number(d.dr_materials || 0),
          suppliesDebit: Number(d.dr_supplies || 0),
          rentDebit: Number(d.dr_rent || 0),
          advertisingDebit: Number(d.dr_advertising || 0),
          deliveryDebit: Number(d.dr_delivery || 0),
          taxesDebit: Number(d.dr_taxes_licenses || 0),
          miscDebit: Number(d.dr_misc || 0),
          remarks: d.remarks || ''
        });
      }
    }
  } catch (e) {
    // non-fatal
  }
})();

/**
 * @route   GET /api/bookkeeping/journal
 * @desc    Get general journal (supports filters: from, to, month, year)
 * @access  Private
 */
router.get('/journal', async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '100', 10);
  const from = req.query.from || null;
  const to = req.query.to || null;
  const month = req.query.month != null ? parseInt(req.query.month, 10) : null;
  const year = req.query.year != null ? parseInt(req.query.year, 10) : null;

  // If DB is available, prefer DB reads with filters
  if (isDbReady()) {
    try {
      const { entries, pagination } = await getJournalEntries({ page, limit, from, to, month, year });
      return ok(res, { message: 'Journal retrieved (DB)', data: { journal: entries, pagination } });
    } catch (e) {
      // fall back to memory below
    }
  }

  // Filter in-memory store by date if provided
  const inRange = (d) => {
    try {
      if (!from && !to && month == null && year == null) return true;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return false;
      if (from && new Date(from) > dt) return false;
      if (to && new Date(to) < dt) return false;
      if (month != null) {
        if ((dt.getUTCMonth() + 1) !== month) return false;
      }
      if (year != null) {
        if (dt.getUTCFullYear() !== year) return false;
      }
      return true;
    } catch (_) { return true; }
  };
  const filtered = store.journal.filter((e) => inRange(e.date));
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = filtered.slice(start, end);
  ok(res, { message: 'Journal retrieved (memory)', data: { journal: data, pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) || 1 } } });
});

/**
 * @route   POST /api/bookkeeping/journal/bulk
 * @desc    Bulk add entries to general journal
 * @access  Private
 */
router.post('/journal/bulk', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.entries) ? req.body.entries : []);
  if (!items.length) return bad(res, 'Provide an array of journal entries');
  const results = [];
  for (const it of items) {
    const { date, ref, particulars, lines } = it || {};
    if (!date || !Array.isArray(lines) || lines.length < 2) {
      results.push({ ok: false, ref: ref || null, error: 'Invalid entry (date and at least 2 lines required)' });
      continue;
    }
    // Validate: debits == credits
    let dr = 0, cr = 0;
    for (const ln of lines) { dr += Number(ln.debit || 0); cr += Number(ln.credit || 0); }
    if (Math.abs(dr - cr) > 0.005) {
      results.push({ ok: false, ref: ref || null, error: 'Not balanced' });
      continue;
    }
    // Reuse POST /journal logic by calling insertJournal when DB, else push to memory
    const normLines = (lines || []).map((ln) => ({
      code: getAccount(ln.code).code,
      description: ln.description || '',
      debit: Number(ln.debit || 0),
      credit: Number(ln.credit || 0),
    }));
    try {
      if (isDbReady()) {
        const codes = Array.from(new Set(normLines.map((l) => String(l.code))));
        for (const c of codes) { const acc = getAccount(c); await upsertAccount({ code: acc.code, title: acc.title, type: acc.type }); }
        await insertJournal({ date, reference: ref || null, remarks: particulars || '', lines: normLines });
      }
      const id = store.journal.length + 1;
      const entry = { id, date, ref: ref || `GJ${String(id).padStart(4,'0')}`, particulars: particulars || '', lines: normLines };
      store.journal.push(entry);
      results.push({ ok: true, ref: entry.ref });
    } catch (e) {
      results.push({ ok: false, ref: ref || null, error: e && e.message ? e.message : String(e) });
    }
  }
  ok(res, { message: 'Bulk journal processed', data: { results } });
});

/**
 * @route   PUT /api/bookkeeping/journal/by-ref/:ref
 * @desc    Update an existing journal entry by reference (replace lines)
 * @access  Private
 */
router.put('/journal/by-ref/:ref', async (req, res) => {
  const ref = String(req.params.ref || '').trim();
  const { date, particulars, lines } = req.body || {};
  if (!ref) return bad(res, 'Reference is required');
  if (!date || !Array.isArray(lines) || lines.length < 2) return bad(res, 'Provide date and at least 2 lines');
  let dr = 0, cr = 0;
  for (const ln of lines) { dr += Number(ln.debit || 0); cr += Number(ln.credit || 0); }
  if (Math.abs(dr - cr) > 0.005) return bad(res, 'Journal not balanced: debits must equal credits');

  const target = findJournalByRef(ref);
  if (!target) return bad(res, 'Reference not found', 404);
  const normLines = (lines || []).map((ln) => ({ code: getAccount(ln.code).code, description: ln.description || '', debit: Number(ln.debit || 0), credit: Number(ln.credit || 0) }));
  // Update memory first for responsiveness
  target.date = date;
  target.particulars = particulars || '';
  target.lines = normLines;

  if (isDbReady()) {
    try {
      const { updateJournalByRef } = require('../../services/bookkeepingRepo');
      await updateJournalByRef({ ref, date, remarks: target.particulars, lines: normLines });
    } catch (e) {
      // keep memory updated; surface warning
      return res.json({ success: true, message: 'Journal updated (memory). DB update failed', warning: String(e && e.message ? e.message : e), data: { entry: target } });
    }
  }
  ok(res, { message: 'Journal updated', data: { entry: target } });
});

/**
 * @route   POST /api/bookkeeping/journal
 * @desc    Add entry to general journal
 * @access  Private
 */
router.post('/journal', async (req, res) => {
  const { date, ref, particulars, lines } = req.body || {};
  if (!date || !Array.isArray(lines) || lines.length < 2) return bad(res, 'Provide date and at least 2 lines');
  // Idempotency: same ref -> return existing
  if (ref) {
    const existing = findJournalByRef(ref);
    if (existing) return ok(res, { message: 'Journal entry exists', data: { entry: existing, duplicate: true } });
  }
  // Pre-validate lines: ensure amounts are non-negative before normalization
  for (const ln of lines) {
    const d = Number(ln.debit || 0);
    const c = Number(ln.credit || 0);
    if (d < 0 || c < 0) return bad(res, 'Amounts must be positive');
  }
  // Validate lines: each requires code, debit or credit amount
  let totalDr = 0, totalCr = 0;
  const normLines = lines.map((ln) => {
    const acc = getAccount(ln.code);
    const debit = Number(ln.debit || 0);
    const credit = Number(ln.credit || 0);
    // Safety: already validated above; keep guard to ensure invariants
    if (debit < 0 || credit < 0) return bad(res, 'Amounts must be positive');
    totalDr += debit; totalCr += credit;
    return {
      code: acc.code,
      account: acc.title,
      description: ln.description || '',
      debit,
      credit,
      ref: ln.ref || null,
    };
  });
  if (Math.abs(totalDr - totalCr) > 0.005) return bad(res, 'Journal not balanced: debits must equal credits');
  // Idempotency: same date and identical lines -> return existing
  const dupByLines = findJournalDuplicateByLines(date, normLines);
  if (dupByLines) return ok(res, { message: 'Journal entry (duplicate by lines) exists', data: { entry: dupByLines, duplicate: true } });
  const id = store.journal.length + 1;
  const entry = { id, date, ref: ref || `GJ${String(id).padStart(4,'0')}`, particulars: particulars || '', lines: normLines };

  // If DB is configured, attempt to persist and only commit to in-memory on success to keep consistency
  if (isDbReady()) {
    try {
      const codes = Array.from(new Set(normLines.map((l) => String(l.code))));
      for (const c of codes) { const acc = getAccount(c); await upsertAccount({ code: acc.code, title: acc.title, type: acc.type }); }
      await insertJournal({ date, reference: entry.ref, remarks: entry.particulars, lines: normLines });
      // Refresh ledger after successful journal insert
      try { await refreshGeneralLedger(); } catch (_) {}
    } catch (e) {
      // If DB persistence fails (missing functions/migrations or runtime DB errors),
      // fall back to in-memory store but surface a helpful warning so the caller
      // can retry after fixing DB migrations. This avoids hard 500s during local
      // testing while keeping the error visible.
      console.warn('Journal DB persistence failed, falling back to memory. Error:', e && e.message ? e.message : e);
      store.journal.push(entry);
      return res.json({ success: true, message: 'Journal entry added (memory only). DB persistence failed', warning: String(e && e.message ? e.message : e), data: { entry } });
    }
    // Persisted to DB; now add to in-memory store for fast reads
    store.journal.push(entry);
    return ok(res, { message: 'Journal entry added (DB)', data: { entry } });
  }

  // DB not ready: fall back to in-memory only
  store.journal.push(entry);
  ok(res, { message: 'Journal entry added (memory)', data: { entry } });
});

/**
 * @route   GET /api/bookkeeping/ledger
 * @desc    Get general ledger
 * @access  Private
 */
router.get('/ledger', async (req, res) => {
  const mode = String(req.query.mode || '').toLowerCase();
  const summaryOnly = req.query.summary === '1' || mode === 'summary';
  const from = req.query.from || null;
  const to = req.query.to || null;
  const month = req.query.month != null ? parseInt(req.query.month, 10) : null;
  const year = req.query.year != null ? parseInt(req.query.year, 10) : null;
  // Prefer DB-derived ledger if available, fallback to in-memory aggregation
  if (isDbReady()) {
    try {
      const full = await getLedgerFullFromDb({ from, to, month, year });
      const hasDbData = Array.isArray(full?.summary) && full.summary.length > 0;
      if (hasDbData) {
        if (summaryOnly) return ok(res, { message: 'Ledger summary (DB)', data: { summary: full.summary, accounts: full.accounts } });
        return ok(res, { message: 'Ledger aggregated (DB)', data: full });
      }
      // If DB returned empty but we have in-memory journal lines, fall through to legacy aggregation
      if (!hasDbData && store.journal.length === 0) {
        // Truly no data anywhere
        if (summaryOnly) return ok(res, { message: 'Ledger summary (empty)', data: { summary: [], accounts: listAccounts() } });
        return ok(res, { message: 'Ledger aggregated (empty)', data: { ledger: [], summary: [], accounts: listAccounts() } });
      }
    } catch (_) {
      // fall through to in-memory
    }
  }
  // In-memory aggregation from store.journal
  // Filter journal by date first if filters provided
  const inRange = (d) => {
    try {
      if (!from && !to && month == null && year == null) return true;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return false;
      if (from && new Date(from) > dt) return false;
      if (to && new Date(to) < dt) return false;
      if (month != null && (dt.getUTCMonth() + 1) !== month) return false;
      if (year != null && dt.getUTCFullYear() !== year) return false;
      return true;
    } catch (_) { return true; }
  };
  const sourceJournal = store.journal.filter((e) => inRange(e.date));
  const byCode = new Map();
  for (const j of sourceJournal) {
    for (const ln of j.lines) {
      const acc = getAccount(ln.code);
      if (!byCode.has(acc.code)) byCode.set(acc.code, { code: acc.code, title: acc.title, normal: acc.normal, entries: [], totals: { debit: 0, credit: 0 } });
      const rec = byCode.get(acc.code);
      rec.totals.debit += ln.debit; rec.totals.credit += ln.credit;
      rec.entries.push({
        date: j.date,
        description: ln.description || (j.particulars || ''),
        reference: ln.ref || j.ref,
        debit: ln.debit,
        credit: ln.credit,
        accountCode: acc.code,
        accountTitle: acc.title,
      });
    }
  }
  const ledger = [];
  const summary = [];
  for (const rec of Array.from(byCode.values()).sort((a,b)=>a.code.localeCompare(b.code))) {
    let bal = 0;
    for (const e of rec.entries.sort((a,b)=> (a.date||'').localeCompare(b.date||''))) {
      bal += (rec.normal === 'debit' ? (e.debit - e.credit) : (e.credit - e.debit));
      e.balance = bal;
    }
    const closingBalance = rec.normal === 'debit' ? (rec.totals.debit - rec.totals.credit) : (rec.totals.credit - rec.totals.debit);
    const balanceSide = rec.normal;
    ledger.push({ code: rec.code, accountTitle: rec.title, normal: rec.normal, totals: rec.totals, entries: rec.entries });
    summary.push({ code: rec.code, accountTitle: rec.title, debit: rec.totals.debit, credit: rec.totals.credit, balance: closingBalance, balanceSide });
  }
  if (summaryOnly) return ok(res, { message: 'Ledger summary (memory)', data: { summary, accounts: listAccounts() } });
  ok(res, { message: 'Ledger aggregated (memory)', data: { ledger, summary, accounts: listAccounts() } });
});

// Convenience endpoint for totals-only general ledger (no daily entries)
router.get('/ledger/summary', (req, res) => {
  req.query.summary = '1';
  return router.handle({ ...req, method: 'GET', url: '/ledger' }, res);
});

/**
 * @route   GET /api/bookkeeping/ledger/full
 * @desc    Get full ledger with date filters (alias of /ledger without summary)
 * @access  Private
 */
router.get('/ledger/full', (req, res) => {
  req.query.summary = '0';
  return router.handle({ ...req, method: 'GET', url: '/ledger' }, res);
});

/**
 * @route   GET /api/bookkeeping/reports/export
 * @desc    Export journal or ledger as CSV (filters supported)
 * @access  Private
 */
router.get('/reports/export', async (req, res) => {
  const type = String(req.query.type || 'journal');
  const format = String(req.query.format || 'csv');
  if (format !== 'csv') return bad(res, 'Only CSV export is supported for now', 400);
  const from = req.query.from || null;
  const to = req.query.to || null;
  const month = req.query.month != null ? parseInt(req.query.month, 10) : null;
  const year = req.query.year != null ? parseInt(req.query.year, 10) : null;

  const yyyymm = () => {
    if (year && month) return `${year}-${String(month).padStart(2,'0')}`;
    if (from || to) return `${from || 'start'}_to_${to || 'end'}`;
    return 'all';
  };

  let rows = [];
  if (type === 'journal') {
    // Reuse GET /journal path
    try {
      const page = 1, limit = 100000;
      if (isDbReady()) {
        const { entries } = await getJournalEntries({ page, limit, from, to, month, year });
        rows = entries;
      } else {
        const inRange = (d) => {
          try {
            if (!from && !to && month == null && year == null) return true;
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return false;
            if (from && new Date(from) > dt) return false;
            if (to && new Date(to) < dt) return false;
            if (month != null && (dt.getUTCMonth() + 1) !== month) return false;
            if (year != null && dt.getUTCFullYear() !== year) return false;
            return true;
          } catch (_) { return true; }
        };
        rows = store.journal.filter(j => inRange(j.date));
      }
    } catch (_) { rows = []; }
    // Build CSV
    const header = ['date','ref','account_code','account_title','description','debit','credit'];
    const lines = [header.join(',')];
    for (const e of rows) {
      for (const ln of e.lines || []) {
        const acc = getAccount(ln.code);
        const rec = [e.date, (e.ref||'').replace(/,/g,' '), acc.code, (acc.title||'').replace(/,/g,' '), (ln.description||'').replace(/,/g,' '), Number(ln.debit||0).toFixed(2), Number(ln.credit||0).toFixed(2)];
        lines.push(rec.join(','));
      }
    }
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="journal_${yyyymm()}.csv"`);
    return res.status(200).send(csv);
  }
  if (type === 'ledger') {
    try {
      if (isDbReady()) {
        const full = await getLedgerFullFromDb({ from, to, month, year });
        rows = full?.ledger || [];
      } else {
        // Use in-memory aggregation with filters
        req.query.summary = '0';
        const r = await new Promise((resolve) => {
          const fakeRes = { json: (j) => resolve(j) };
          router.handle({ ...req, method: 'GET', url: '/ledger' }, fakeRes);
        });
        rows = r?.data?.ledger || [];
      }
    } catch (_) { rows = []; }
    const header = ['account_code','account_title','entry_date','reference','description','debit','credit','running_balance'];
    const lines = [header.join(',')];
    for (const acc of rows) {
      for (const e of acc.entries || []) {
        const rec = [acc.code, (acc.accountTitle||'').replace(/,/g,' '), e.date, (e.reference||'').replace(/,/g,' '), (e.description||'').replace(/,/g,' '), Number(e.debit||0).toFixed(2), Number(e.credit||0).toFixed(2), Number(e.balance||0).toFixed(2)];
        lines.push(rec.join(','));
      }
    }
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ledger_${yyyymm()}.csv"`);
    return res.status(200).send(csv);
  }
  return bad(res, 'Unknown type for export', 400);
});

/**
 * @route   GET /api/bookkeeping/exists
 * @desc    Check whether a reference exists in journal/receipts/disbursements (memory or DB)
 * @access  Private
 */
router.get('/exists', async (req, res) => {
  const ref = String(req.query.ref || '').trim();
  if (!ref) return bad(res, 'Provide ref query parameter', 400);
  try {
    // Check in-memory stores first
    const inJournal = findJournalByRef(ref) || store.journal.find((e) => String(e.ref) === ref);
    const inReceipts = store.receipts.find((r) => String(r.referenceNo || r.reference || '') === ref);
    const inDisb = store.disbursements.find((d) => String(d.referenceNo || d.reference || '') === ref);
    if (inJournal || inReceipts || inDisb) return ok(res, { message: 'Reference found (memory)', data: { exists: true } });

    // If DB available, perform lightweight checks
    if (isDbReady()) {
      try {
        const { entries } = await getJournalEntries({ page: 1, limit: 10000 });
        if (Array.isArray(entries) && entries.find((e) => String(e.ref) === ref)) return ok(res, { message: 'Reference found (db)', data: { exists: true } });
        const receipts = await getCashReceiptsAll();
        if (Array.isArray(receipts) && receipts.find((r) => String(r.reference || r.referenceNo || '') === ref)) return ok(res, { message: 'Reference found (db)', data: { exists: true } });
        const disb = await getCashDisbursementsAll();
        if (Array.isArray(disb) && disb.find((d) => String(d.reference || d.referenceNo || '') === ref)) return ok(res, { message: 'Reference found (db)', data: { exists: true } });
      } catch (e) {
        // ignore DB read errors and fall through to not found
      }
    }

    return ok(res, { message: 'Reference not found', data: { exists: false } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e && e.message ? e.message : String(e) });
  }
});

/**
 * @route   POST /api/bookkeeping/ledger
 * @desc    Add ledger entry
 * @access  Private
 */
router.post('/ledger', (req, res) => {
  const { date, account, description, type, amount } = req.body || {};
  if (!date || !account || !type || typeof amount !== 'number') {
    return bad(res, 'Invalid ledger entry: date, account, type, amount are required');
  }
  const id = store.ledger.length + 1;
  const lastBalance = store.ledger.length ? store.ledger[store.ledger.length - 1].balance || 0 : 0;
  const delta = type === 'debit' ? amount : -amount;
  const balance = lastBalance + delta;
  const entry = { id, date, account, description: description || '', type, amount, balance };
  store.ledger.push(entry);
  ok(res, { message: 'Ledger entry added', data: { entry } });
});

/**
 * @route   POST /api/bookkeeping/transactions
 * @desc    Add new transaction
 * @access  Private
 */
router.post('/transactions', (req, res) => {
  // TODO: Implement transaction creation
  res.json({
    success: true,
    message: 'Transaction creation endpoint - to be implemented',
    data: {
      transaction: {
        id: 'txn_123',
        date: new Date().toISOString(),
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category
      }
    }
  });
});

/**
 * @route   GET /api/bookkeeping/cash-receipts
 * @desc    Get cash receipt journal
 * @access  Private
 */
router.get('/cash-receipts', (req, res) => {
  ok(res, { message: 'Cash receipts retrieved', data: { receipts: store.receipts } });
});

/**
 * @route   GET /api/bookkeeping/quarterly-sales
 * @desc    Get quarterly sales totals for tax calculation
 * @access  Private
 */
router.get('/quarterly-sales', async (req, res) => {
  try {
    const { quarter = 1, year = 2025 } = req.query;
    
    // Get all cash receipts from database
    const receipts = await getCashReceiptsAll();
    
    // Filter by quarter
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterEnd = new Date(year, quarter * 3, 0);
    
    const quarterlyReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      return receiptDate >= quarterStart && receiptDate <= quarterEnd;
    });
    
    // Calculate total sales (cr_sales column)
    const totalSales = quarterlyReceipts.reduce((sum, receipt) => {
      return sum + (receipt.cr_sales || 0);
    }, 0);
    
    // Calculate total cash received (dr_cash column)
    const totalCash = quarterlyReceipts.reduce((sum, receipt) => {
      return sum + (receipt.dr_cash || 0);
    }, 0);
    
    // Calculate total fees
    const totalFees = quarterlyReceipts.reduce((sum, receipt) => {
      return sum + (receipt.dr_fees || 0);
    }, 0);
    
    ok(res, { 
      message: 'Quarterly sales retrieved', 
      data: { 
        quarter: parseInt(quarter),
        year: parseInt(year),
        totalSales,
        totalCash,
        totalFees,
        receiptCount: quarterlyReceipts.length,
        receipts: quarterlyReceipts
      } 
    });
  } catch (error) {
    console.error('Error getting quarterly sales:', error);
    res.status(500).json({ success: false, message: 'Error retrieving quarterly sales', error: error.message });
  }
});

/**
 * @route   POST /api/bookkeeping/cash-receipts
 * @desc    Add cash receipt entry
 * @access  Private
 */
// Cash Receipt Journal schema (columns given):
// Date | OR/Reference No. | Customer/Source | CashBank/eWallet (DEBIT) | Fees & Charges (DEBIT)
// | Sales Returns/Refunds (DEBIT) | Net Sales (CREDIT) | Other Income (CREDIT) | Accounts Receivable (CREDIT) | Remarks/Note
router.post('/cash-receipts', async (req, res) => {
  const { date, referenceNo, customer, cashDebit = 0, feesChargesDebit = 0, salesReturnsDebit = 0, netSalesCredit = 0, otherIncomeCredit = 0, arCredit = 0, ownersCapitalCredit = 0, remarks } = req.body || {};
  if (!date) return bad(res, 'Date is required');
  // Idempotency: avoid duplicate receipts with identical signature
  const dup = findReceiptDuplicate({ date, referenceNo, customer, cashDebit, feesChargesDebit, salesReturnsDebit, netSalesCredit, otherIncomeCredit, arCredit, ownersCapitalCredit });
  if (dup) {
    return ok(res, { message: 'Cash receipt duplicate', data: { entry: dup, duplicate: true } });
  }
  const id = store.receipts.length + 1;
  const entry = { id, date, referenceNo: referenceNo || '', customer: customer || '', cashDebit: Number(cashDebit)||0, feesChargesDebit: Number(feesChargesDebit)||0, salesReturnsDebit: Number(salesReturnsDebit)||0, netSalesCredit: Number(netSalesCredit)||0, otherIncomeCredit: Number(otherIncomeCredit)||0, arCredit: Number(arCredit)||0, ownersCapitalCredit: Number(ownersCapitalCredit)||0, remarks: remarks || '' };
  store.receipts.push(entry);
  // Also push balanced journal lines
  const lines = [];
  if (entry.cashDebit) lines.push({ code: '101', debit: entry.cashDebit, credit: 0, description: 'Cash received' });
  if (entry.feesChargesDebit) lines.push({ code: '510', debit: entry.feesChargesDebit, credit: 0, description: 'Platform Fees & Charges' });
  if (entry.salesReturnsDebit) lines.push({ code: '401', debit: entry.salesReturnsDebit, credit: 0, description: 'Sales Returns/Refunds' });
  if (entry.netSalesCredit) lines.push({ code: '401', debit: 0, credit: entry.netSalesCredit, description: 'Net Sales' });
  if (entry.otherIncomeCredit) lines.push({ code: '402', debit: 0, credit: entry.otherIncomeCredit, description: 'Other Income' });
  if (entry.arCredit) lines.push({ code: '103', debit: 0, credit: entry.arCredit, description: 'Accounts Receivable' });
  if (entry.ownersCapitalCredit) lines.push({ code: '301', debit: 0, credit: entry.ownersCapitalCredit, description: "Owner's Capital" });
  let postedToJournal = false;
  if (lines.length >= 2) {
    const refToUse = referenceNo || `CRJ${String(id).padStart(4, '0')}`;
    // Journal idempotency: skip if same ref or identical lines on same date already recorded
  const existsByRef = findJournalByRef(refToUse);
  const existsByLines = findJournalDuplicateByLines(date, lines);
  // Also guard against identical lines recorded on any date to avoid double-posting
  const sig = hashLines(lines);
  const existsByLinesAnyDate = store.journal.find((e) => hashLines(e.lines) === sig) || null;
    if (!existsByRef && !existsByLines && !existsByLinesAnyDate) {
      const idj = store.journal.length + 1;
      store.journal.push({ id: idj, date, ref: refToUse, particulars: customer || 'Cash Receipt', lines });
      postedToJournal = true;
    }
  }
  // Persist cash receipt + details to Supabase when DB is available. If DB persistence fails, return an error so caller can retry.
  if (isDbReady()) {
    try {
      const rid = await insertCashReceipt({ date, invoice_no: null, source: customer || '', reference: referenceNo || null, cash_debit: entry.cashDebit || 0, remarks: entry.remarks || '' });
      if (rid) {
        const details = [];
        if (entry.feesChargesDebit) details.push({ code: '510', debit: entry.feesChargesDebit, credit: 0 });
        if (entry.salesReturnsDebit) details.push({ code: '401', debit: entry.salesReturnsDebit, credit: 0 });
        if (entry.netSalesCredit) details.push({ code: '401', debit: 0, credit: entry.netSalesCredit });
        if (entry.otherIncomeCredit) details.push({ code: '402', debit: 0, credit: entry.otherIncomeCredit });
        if (entry.arCredit) details.push({ code: '103', debit: 0, credit: entry.arCredit });
        if (entry.ownersCapitalCredit) details.push({ code: '301', debit: 0, credit: entry.ownersCapitalCredit });
        if (details.length) await insertCashReceiptDetails(rid, details);
      }
      // Journaling handled by insertCashReceiptDetails helper — no-op here to avoid duplicates
      // ensure referenced accounts exist
      const codes = ['101','510','401','402','103','301'];
      for (const c of codes) { const acc = getAccount(c); await upsertAccount({ code: acc.code, title: acc.title, type: acc.type }); }
      // Refresh ledger after successful persistence
      try { await refreshGeneralLedger(); } catch (_) {}
    } catch (e) {
      console.warn('Cash receipt DB persistence failed, falling back to memory. Error:', e && e.message ? e.message : e);
      return res.json({ success: true, message: 'Cash receipt added (memory only). DB persistence failed', warning: String(e && e.message ? e.message : e), data: { entry } });
    }
  }
  ok(res, { message: 'Cash receipt entry added', data: { entry } });
});

/**
 * @route   GET /api/bookkeeping/cash-disbursements
 * @desc    Get cash disbursement book
 * @access  Private
 */
router.get('/cash-disbursements', (req, res) => {
  ok(res, { message: 'Cash disbursements retrieved', data: { disbursements: store.disbursements } });
});

/**
 * @route   POST /api/bookkeeping/cash-disbursements
 * @desc    Add cash disbursement entry
 * @access  Private
 */
// Cash Disbursement Journal schema (columns given):
// Date | Voucher/Ref No. | Payee/Particulars | Cash/Bank/eWallet (CREDIT) | Purchases–Materials (DEBIT)
// | Supplies Expense (DEBIT) | Rent Expense (DEBIT) | Advertising/Marketing (DEBIT) | Delivery/Transportation (DEBIT) | Taxes & Licenses (DEBIT) | Miscellaneous Expense (DEBIT) | Remarks/Notes
router.post('/cash-disbursements', async (req, res) => {
  const { date, referenceNo, payee, remarks, cashCredit = 0, purchasesDebit = 0, suppliesDebit = 0, rentDebit = 0, advertisingDebit = 0, deliveryDebit = 0, taxesDebit = 0, miscDebit = 0 } = req.body || {};
  if (!date || !payee) return bad(res, 'Date and Payee are required');
  const id = store.disbursements.length + 1;
  // Generate system reference if not provided (CDB-001 style)
  const sysRef = `CDB-${String(id).padStart(3, '0')}`;
  const entry = { id, date, referenceNo: referenceNo || sysRef, payee, cashCredit: Number(cashCredit)||0, purchasesDebit: Number(purchasesDebit)||0, suppliesDebit: Number(suppliesDebit)||0, rentDebit: Number(rentDebit)||0, advertisingDebit: Number(advertisingDebit)||0, deliveryDebit: Number(deliveryDebit)||0, taxesDebit: Number(taxesDebit)||0, miscDebit: Number(miscDebit)||0, remarks: remarks || '' };
  store.disbursements.push(entry);
  // Post to journal
  const lines = [];
  if (entry.purchasesDebit) lines.push({ code: '501', debit: entry.purchasesDebit, credit: 0, description: 'Purchases – Materials' });
  if (entry.suppliesDebit) lines.push({ code: '502', debit: entry.suppliesDebit, credit: 0, description: 'Supplies Expense' });
  if (entry.rentDebit) lines.push({ code: '503', debit: entry.rentDebit, credit: 0, description: 'Rent Expense' });
  if (entry.advertisingDebit) lines.push({ code: '505', debit: entry.advertisingDebit, credit: 0, description: 'Advertising' });
  if (entry.deliveryDebit) lines.push({ code: '506', debit: entry.deliveryDebit, credit: 0, description: 'Transportation' });
  if (entry.taxesDebit) lines.push({ code: '507', debit: entry.taxesDebit, credit: 0, description: 'Taxes & Licenses' });
  if (entry.miscDebit) lines.push({ code: '508', debit: entry.miscDebit, credit: 0, description: 'Miscellaneous Expense' });
  if (entry.cashCredit) lines.push({ code: '101', debit: 0, credit: entry.cashCredit, description: 'Cash/Bank/eWallet' });
  let postedToJournal = false;
  if (lines.length >= 2) {
    const refToUse = entry.referenceNo || sysRef;
    const existsByRef = findJournalByRef(refToUse);
    const existsByLines = findJournalDuplicateByLines(date, lines);
    // Also consider duplicates regardless of date to avoid double-posting when dates differ between GJ and CDB
    const sig = hashLines(lines);
    const existsByLinesAnyDate = store.journal.find((e) => hashLines(e.lines) === sig) || null;
    // Extra guard: if a Journal entry already booked a cash outflow (code 101 credit) with same amount on the same date, skip auto-post
    const existsCashCreditSameDate = store.journal.find((e) =>
      e.date === date && Array.isArray(e.lines) && e.lines.some((ln) => String(ln.code) === '101' && Number(ln.credit || 0) === Number(entry.cashCredit || 0))
    ) || null;
    if (!existsByRef && !existsByLines && !existsByLinesAnyDate && !existsCashCreditSameDate) {
      const idj = store.journal.length + 1;
      store.journal.push({ id: idj, date, ref: refToUse, particulars: payee, lines });
      postedToJournal = true;
    }
  }
  // Persist cash disbursement + details to Supabase when DB is available. If DB persistence fails, return an error so caller can retry.
  if (isDbReady()) {
    try {
      const did = await insertCashDisbursement({ date, voucher_no: referenceNo || sysRef, payee, reference: entry.referenceNo || null, cash_credit: entry.cashCredit || 0, remarks: entry.remarks || '' });
      if (did) {
        const details = [];
        if (entry.purchasesDebit) details.push({ code: '501', debit: entry.purchasesDebit, credit: 0 });
        if (entry.suppliesDebit) details.push({ code: '502', debit: entry.suppliesDebit, credit: 0 });
        if (entry.rentDebit) details.push({ code: '503', debit: entry.rentDebit, credit: 0 });
        if (entry.advertisingDebit) details.push({ code: '505', debit: entry.advertisingDebit, credit: 0 });
        if (entry.deliveryDebit) details.push({ code: '506', debit: entry.deliveryDebit, credit: 0 });
        if (entry.taxesDebit) details.push({ code: '507', debit: entry.taxesDebit, credit: 0 });
        if (entry.miscDebit) details.push({ code: '508', debit: entry.miscDebit, credit: 0 });
        if (entry.cashCredit) details.push({ code: '101', debit: 0, credit: entry.cashCredit });
        if (details.length) await insertCashDisbursementDetails(did, details);
      }
      // Journaling handled by insertCashDisbursementDetails helper — no-op here to avoid duplicates
      // ensure referenced accounts exist
      const codes = ['501','502','503','505','506','507','508','101'];
      for (const c of codes) { const acc = getAccount(c); await upsertAccount({ code: acc.code, title: acc.title, type: acc.type }); }
      // Refresh ledger after successful persistence
      try { await refreshGeneralLedger(); } catch (_) {}
    } catch (e) {
      console.warn('Cash disbursement DB persistence failed, falling back to memory. Error:', e && e.message ? e.message : e);
      return res.json({ success: true, message: 'Cash disbursement added (memory only). DB persistence failed', warning: String(e && e.message ? e.message : e), data: { entry } });
    }
  }
  ok(res, { message: 'Cash disbursement entry added', data: { entry } });
});

/**
 * @route   POST /api/bookkeeping/cash-disbursements/reset
 * @desc    Reset (clear) all cash disbursement entries
 * @access  Private
 */
router.post('/cash-disbursements/reset', (req, res) => {
  store.disbursements.length = 0;
  ok(res, { message: 'Cash disbursement entries cleared', data: { disbursements: [] } });
});

/**
 * @route   GET /api/bookkeeping/reports
 * @desc    Get financial reports
 * @access  Private
 */
router.get('/reports', (req, res) => {
  // TODO: Implement reports generation
  res.json({
    success: true,
    message: 'Reports endpoint - to be implemented',
    data: {
      reports: {
        incomeStatement: {},
        balanceSheet: {},
        cashFlow: {},
        trialBalance: {}
      }
    }
  });
});

/**
 * @route   GET /api/bookkeeping/accounts
 * @desc    Get chart of accounts
 * @access  Private
 */
router.get('/accounts', (req, res) => {
  ok(res, { message: 'COA', data: { accounts: listAccounts() } });
});

/**
 * @route   POST /api/bookkeeping/reset
 * @desc    Reset all in-memory bookkeeping data (journal, ledger, receipts, disbursements)
 * @access  Private
 */
router.post('/reset', (req, res) => {
  store.journal.length = 0;
  store.receipts.length = 0;
  store.disbursements.length = 0;
  ok(res, { message: 'Bookkeeping data reset', data: { journal: [], receipts: [], disbursements: [] } });
});

module.exports = router; 

// Utility: force-persist in-memory journal entries into DB (ignore in-memory duplicate guard)
// This is intended as an admin/dev helper when DB migrations are applied after entries were written to memory.
async function flushMemoryToDb() {
  if (!isDbReady()) throw new Error('Database not configured');
  try {
    // Build set of refs already in DB
    const { entries: dbEntries } = await getJournalEntries({ page: 1, limit: 10000 });
    const dbRefs = new Set((dbEntries || []).map(e => String(e.ref || '').trim()).filter(Boolean));
    let persisted = 0;
    for (const e of store.journal) {
      const ref = String(e.ref || '').trim();
      if (ref && dbRefs.has(ref)) continue; // already in DB
      // Prepare normalized lines for DB insert
      const normLines = (e.lines || []).map((ln) => ({ code: ln.code, description: ln.description || '', debit: Number(ln.debit||0), credit: Number(ln.credit||0) }));
      // Ensure referenced accounts exist
      const codes = Array.from(new Set(normLines.map(l => String(l.code))));
      for (const c of codes) { try { const acc = getAccount(c); await upsertAccount({ code: acc.code, title: acc.title, type: acc.type }); } catch(_){} }
      // Attempt DB insert
      try {
        await insertJournal({ date: e.date, reference: ref || null, remarks: e.particulars || null, lines: normLines });
        persisted++;
      } catch (err) {
        // bubble up so caller can see which entry failed
        throw new Error(`Failed to persist ref=${ref} date=${e.date}: ${err && err.message ? err.message : err}`);
      }
    }
    // Refresh ledger after sync
    try { await refreshGeneralLedger(); } catch (_) {}
    return { persisted };
  } catch (e) {
    throw e;
  }
}

module.exports.flushMemoryToDb = flushMemoryToDb;

// --- Read-only DB endpoints (non-breaking) ---
// Expose Supabase-backed reads without altering existing routes.
router.get('/db/journal', async (req, res) => {
  try {
    if (!isDbReady()) return res.status(503).json({ success: false, message: 'Database not configured' });
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '100', 10);
    const data = await getJournalEntries({ page, limit });
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/db/ledger/summary', async (req, res) => {
  try {
    if (!isDbReady()) return res.status(503).json({ success: false, message: 'Database not configured' });
    const data = await getLedgerSummary();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Manual: refresh derived general_ledger table from general_journal
router.post('/db/ledger/refresh', async (req, res) => {
  try {
    if (!isDbReady()) return res.status(503).json({ success: false, message: 'Database not configured' });
    const okRefresh = await refreshGeneralLedger();
    return res.json({ success: okRefresh, message: okRefresh ? 'general_ledger refreshed' : 'refresh failed (function missing?)' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Manual: force-persist in-memory journal entries into DB (admin helper)
router.post('/db/flush-memory', async (req, res) => {
  try {
    if (!isDbReady()) return res.status(503).json({ success: false, message: 'Database not configured' });
    try {
      const result = await flushMemoryToDb();
      return res.json({ success: true, message: 'Flushed memory to DB', data: result });
    } catch (e) {
      return res.status(500).json({ success: false, message: e && e.message ? e.message : String(e) });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});