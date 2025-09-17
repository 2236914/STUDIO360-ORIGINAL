const { supabase } = require('./supabaseClient');
const { getAccount, listAccounts, COA } = require('../api/bookkeeping/coa');

async function upsertAccount({ code, title, type }) {
  if (!supabase) return String(code || '');
  // Try to insert; on conflict (unique on account_code) update title/type
  const payload = { account_code: String(code || ''), account_title: String(title || ''), account_type: type || 'asset' };
  try {
    const { error } = await supabase.from('accounts').upsert(payload, { onConflict: 'account_code' });
    if (error) throw error;
  } catch (_) { /* ignore */ }
  return String(code || '');
}

async function insertJournal({ date, reference, remarks, lines }) {
  if (!supabase) return null;
  const rows = (lines || []).map((ln) => {
    const acc = getAccount(String(ln.code));
    return {
      date,
      account_title_particulars: acc.title || (ln.description || ''),
      reference: reference || null,
      debit: Number(ln.debit || 0),
      credit: Number(ln.credit || 0),
    };
  });
  if (rows.length) {
    const { error } = await supabase.from('general_journal').insert(rows);
    if (error) throw error;
  }
  // After journal insert, refresh derived general_ledger (best-effort)
  try { await refreshGeneralLedger(); } catch (_) {}
  return true;
}

// Removed: upsertLedgerDelta; ledger is now a read-only view derived from journals

async function insertCashReceipt({ date, invoice_no, source, reference, cash_debit, remarks }) {
  if (!supabase) return null;
  const payload = {
    date,
    invoice_no: invoice_no || null,
    source: source || null,
    reference: reference || null,
    dr_cash: Number(cash_debit || 0),
    dr_fees: 0,
    dr_returns: 0,
    cr_sales: 0,
    cr_income: 0,
    cr_ar: 0,
    remarks: remarks || null,
  };
  const { data, error } = await supabase.from('cash_receipt_journal').insert(payload).select('id').single();
  if (error) throw error;
  try { await refreshGeneralLedger(); } catch (_) {}
  return data.id;
}

async function insertCashReceiptDetails(receiptId, details) {
  // Map detail codes into the single cash_receipt_journal row by updating columns
  if (!supabase || !receiptId || !Array.isArray(details)) return null;
  let delta = { dr_fees: 0, dr_returns: 0, cr_sales: 0, cr_income: 0, cr_ar: 0 };
  for (const d of details) {
    const code = String(d.code);
    const debit = Number(d.debit || 0);
    const credit = Number(d.credit || 0);
    if (code === '510') delta.dr_fees += debit; // Platform Fees
    else if (code === '401') {
      if (debit > 0) delta.dr_returns += debit; // Sales Returns
      if (credit > 0) delta.cr_sales += credit; // Net Sales
    }
    else if (code === '402') delta.cr_income += credit; // Other Income
    else if (code === '103') delta.cr_ar += credit; // AR
  }
  const { error } = await supabase.from('cash_receipt_journal').update(delta).eq('id', receiptId);
  if (error) throw error;
  try { await refreshGeneralLedger(); } catch (_) {}
  return true;
}

async function insertCashDisbursement({ date, voucher_no, payee, reference, cash_credit, remarks }) {
  if (!supabase) return null;
  const payload = {
    date,
    payee_particulars: payee || '',
    reference: reference || voucher_no || null,
    cr_cash: Number(cash_credit || 0),
    dr_materials: 0,
    dr_supplies: 0,
    dr_rent: 0,
    dr_utilities: 0,
    dr_advertising: 0,
    dr_delivery: 0,
    dr_taxes_licenses: 0,
    dr_misc: 0,
    remarks: remarks || null,
  };
  const { data, error } = await supabase.from('cash_disbursement_book').insert(payload).select('id').single();
  if (error) throw error;
  try { await refreshGeneralLedger(); } catch (_) {}
  return data.id;
}

async function insertCashDisbursementDetails(disbursementId, details) {
  if (!supabase || !disbursementId || !Array.isArray(details)) return null;
  const delta = { dr_materials: 0, dr_supplies: 0, dr_rent: 0, dr_utilities: 0, dr_advertising: 0, dr_delivery: 0, dr_taxes_licenses: 0, dr_misc: 0 };
  for (const d of details) {
    const code = String(d.code);
    const debit = Number(d.debit || 0);
    if (code === '501') delta.dr_materials += debit;
    else if (code === '502') delta.dr_supplies += debit;
    else if (code === '503') delta.dr_rent += debit;
    else if (code === '505') delta.dr_advertising += debit;
    else if (code === '506') delta.dr_delivery += debit;
    else if (code === '507') delta.dr_taxes_licenses += debit;
    else if (code === '508') delta.dr_misc += debit;
  }
  const { error } = await supabase.from('cash_disbursement_book').update(delta).eq('id', disbursementId);
  if (error) throw error;
  try { await refreshGeneralLedger(); } catch (_) {}
  return true;
}

module.exports = {
  upsertAccount,
  insertJournal,
  insertCashReceipt,
  insertCashReceiptDetails,
  insertCashDisbursement,
  insertCashDisbursementDetails,
};

// --- Reads against new schema ---
async function getJournalEntries({ page = 1, limit = 100 } = {}) {
  if (!supabase) return { entries: [], pagination: { page, limit, total: 0, totalPages: 1 } };
  const offset = (page - 1) * limit;
  const { data: rows, error, count } = await supabase
    .from('general_journal')
    .select('id, date, account_title_particulars, reference, debit, credit', { count: 'exact' })
    .order('date', { ascending: true })
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  // Group into entries by date+reference
  const map = new Map();
  for (const r of rows || []) {
    const key = `${r.date}||${r.reference || ''}`;
    if (!map.has(key)) map.set(key, { id: key, date: r.date, ref: r.reference || null, particulars: '', lines: [] });
    map.get(key).lines.push({ code: null, description: r.account_title_particulars || '', debit: Number(r.debit || 0), credit: Number(r.credit || 0) });
  }
  const entries = Array.from(map.values());
  const total = typeof count === 'number' ? count : (rows || []).length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { entries, pagination: { page, limit, total, totalPages } };
}

async function getLedgerSummary() {
  if (!supabase) return { summary: [] };
  // Prefer view if available; otherwise support existing table schema
  // 1) Try presentation view directly
  try {
    const { data: rowsView, error: errView } = await supabase
      .from('v_ledger_presented')
      .select('account_title, debit, credit, balance_side, balance');
    if (errView) throw errView;
    const out = (rowsView || []).map(r => {
      let code = '';
      try {
        const title = String(r.account_title || '').trim();
        const entries = Object.values(require('../api/bookkeeping/coa').COA);
        const found = entries.find(a => a.title === title);
        if (found) code = found.code;
      } catch (_) {}
      return {
        code,
        accountTitle: r.account_title,
        debit: Number(r.debit || 0),
        credit: Number(r.credit || 0),
        balance: Number(r.balance || 0),
        balanceSide: String(r.balance_side || 'debit')
      };
    });
    return { summary: out };
  } catch (_) {
    // 2) Fallback: support table `general_ledger` (no DB changes required)
    // Try to fetch with balance_side present; if not, compute from COA
    try {
      const { data: rowsWithSide, error: e1 } = await supabase
        .from('general_ledger')
        .select('account_code, account_title, debit, credit, balance_side, balance');
      if (e1) throw e1;
      const out = (rowsWithSide || []).map(r => {
        const code = String(r.account_code || '').trim();
        return {
          code,
          accountTitle: r.account_title,
          debit: Number(r.debit || 0),
          credit: Number(r.credit || 0),
          balance: Number(r.balance || 0),
          balanceSide: String(r.balance_side || ((getAccount(code).normal) || 'debit'))
        };
      });
      return { summary: out };
    } catch (_) {
      // 3) Minimal schema: account_code, account_title, debit, credit -> compute balance and side
      const { data: rowsBasic, error: e2 } = await supabase
        .from('general_ledger')
        .select('account_code, account_title, debit, credit');
      if (e2) throw e2;
      const out = (rowsBasic || []).map(r => {
        const code = String(r.account_code || '').trim();
        let accountTitle = r.account_title || '';
        let normal = 'debit';
        try {
          const acc = getAccount(code);
          accountTitle = acc.title || accountTitle;
          normal = acc.normal || 'debit';
        } catch (_) {}
        const debit = Math.abs(Number(r.debit || 0));
        const credit = Math.abs(Number(r.credit || 0));
        const balance = normal === 'debit' ? (debit - credit) : (credit - debit);
        return { code, accountTitle, debit, credit, balance, balanceSide: normal };
      });
      return { summary: out };
    }
  }
}

function isDbReady() { return !!supabase; }

module.exports.getJournalEntries = getJournalEntries;
module.exports.getLedgerSummary = getLedgerSummary;
module.exports.isDbReady = isDbReady;

// --- Additional read helpers for hydration ---
async function getCashReceiptsAll() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cash_receipt_journal')
    .select('id, date, invoice_no, source, reference, dr_cash, dr_fees, dr_returns, cr_sales, cr_income, cr_ar, remarks')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function getCashDisbursementsAll() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cash_disbursement_book')
    .select('id, date, payee_particulars, reference, cr_cash, dr_materials, dr_supplies, dr_rent, dr_utilities, dr_advertising, dr_delivery, dr_taxes_licenses, dr_misc, remarks')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
}

module.exports.getCashReceiptsAll = getCashReceiptsAll;
module.exports.getCashDisbursementsAll = getCashDisbursementsAll;

// --- Full ledger (summary + entries) derived from DB general_journal ---
async function getLedgerFullFromDb() {
  if (!supabase) return { summary: [], ledger: [], accounts: listAccounts() };
  // 1) Summary comes from DB ledger view/table via existing helper
  const { summary: summaryFromDb } = await getLedgerSummary();
  // 2) Details come from general_journal grouped by COA title mapping
  const { data: rows, error } = await supabase
    .from('general_journal')
    .select('id, date, account_title_particulars, reference, debit, credit')
    .order('date', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw error;
  const accountsMap = new Map(Object.entries(COA).map(([code, acc]) => [String(acc.title), { code: String(code), normal: acc.normal, title: acc.title }]));
  const byCode = new Map();
  for (const r of rows || []) {
    const title = String(r.account_title_particulars || '').trim();
    const accInfo = accountsMap.get(title) || { code: '', normal: 'debit', title };
    const code = accInfo.code;
    const normal = accInfo.normal || 'debit';
    if (!byCode.has(code)) byCode.set(code, { code, accountTitle: accInfo.title, normal, entries: [] });
    const entryDebit = Math.abs(Number(r.debit || 0));
    const entryCredit = Math.abs(Number(r.credit || 0));
    byCode.get(code).entries.push({
      date: r.date,
      description: title,
      reference: r.reference || null,
      debit: entryDebit,
      credit: entryCredit,
    });
  }
  // 3) Merge: iterate summary as source of truth for totals/balance; attach & compute running balance on details
  const ledger = [];
  const summary = Array.isArray(summaryFromDb) ? summaryFromDb : [];
  for (const s of summary) {
    const code = String(s.code || '');
    const normal = String(s.balanceSide || (getAccount(code).normal || 'debit'));
    const accountTitle = s.accountTitle || (getAccount(code).title || '');
    const rec = { code, accountTitle, normal, totals: { debit: Number(s.debit || 0), credit: Number(s.credit || 0) }, entries: [] };
    const entries = (byCode.get(code)?.entries || []).slice();
    entries.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    let bal = 0;
    for (const e of entries) {
      bal += (normal === 'debit' ? (e.debit - e.credit) : (e.credit - e.debit));
      e.balance = bal;
      e.accountCode = code;
      e.accountTitle = accountTitle;
    }
    rec.entries = entries;
    ledger.push(rec);
  }
  // Also include any codes present in details but missing from summary (unlikely), computing totals on the fly
  for (const [code, info] of byCode.entries()) {
    if (summary.find((s) => String(s.code || '') === String(code))) continue;
    const acc = getAccount(code);
    const normal = acc.normal || 'debit';
    let totD = 0, totC = 0, bal = 0;
    const entries = info.entries.sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))).map((e) => {
      totD += Number(e.debit || 0);
      totC += Number(e.credit || 0);
      bal += (normal === 'debit' ? (Number(e.debit || 0) - Number(e.credit || 0)) : (Number(e.credit || 0) - Number(e.debit || 0)));
      return { ...e, balance: bal, accountCode: code, accountTitle: acc.title || info.accountTitle };
    });
    ledger.push({ code, accountTitle: acc.title || info.accountTitle, normal, totals: { debit: totD, credit: totC }, entries });
  }
  // Sort ledger by code for stable output
  ledger.sort((a, b) => String(a.code).localeCompare(String(b.code)));
  return { summary, ledger, accounts: listAccounts() };
}

module.exports.getLedgerFullFromDb = getLedgerFullFromDb;

// --- Maintenance: refresh derived general_ledger table in DB ---
async function refreshGeneralLedger() {
  if (!supabase) return false;
  // Supabase-js doesn't support invoking arbitrary SQL directly; use postgres RPC via rest if exposed.
  // Here, we try a PostgREST RPC on function name; if not available, fallback to a no-op.
  try {
    const { error } = await supabase.rpc('refresh_general_ledger');
    if (error) throw error;
    return true;
  } catch (_) {
    // Fallback manual rebuild: aggregate from general_journal and populate general_ledger
    try {
      // Fetch journal rows
      const { data: gjRows, error: gjErr } = await supabase
        .from('general_journal')
        .select('account_title_particulars, debit, credit');
      if (gjErr) throw gjErr;
      if (!Array.isArray(gjRows)) return false;
      const agg = new Map();
      for (const r of gjRows) {
        const title = String(r.account_title_particulars || '').trim();
        if (!title) continue;
        if (!agg.has(title)) agg.set(title, { title, debit: 0, credit: 0 });
        const rec = agg.get(title);
        rec.debit += Math.abs(Number(r.debit || 0));
        rec.credit += Math.abs(Number(r.credit || 0));
      }
      // Load accounts for type / code mapping
      const { data: acctRows } = await supabase.from('accounts').select('account_code, account_title, account_type');
      const acctIndex = new Map();
      for (const a of acctRows || []) {
        acctIndex.set(String(a.account_title).toLowerCase(), a);
      }
      // Clear existing ledger rows (derived dataset)
      await supabase.from('general_ledger').delete().neq('id', 0); // delete all rows
      const batch = [];
      for (const { title, debit, credit } of agg.values()) {
        const acc = acctIndex.get(title.toLowerCase());
        const account_code = acc?.account_code || '';
        const account_type = acc?.account_type || '';
        const balance = (account_type === 'asset' || account_type === 'expense') ? (debit - credit) : (credit - debit);
        batch.push({ account_code, account_title: title, debit: Number(debit.toFixed(2)), credit: Number(credit.toFixed(2)), balance: Number(balance.toFixed(2)) });
      }
      if (batch.length) {
        // Insert in chunks to avoid payload limits
        const chunkSize = 500;
        for (let i = 0; i < batch.length; i += chunkSize) {
          const slice = batch.slice(i, i + chunkSize);
          const { error: insErr } = await supabase.from('general_ledger').insert(slice);
          if (insErr) throw insErr;
        }
      }
      return true;
    } catch (e2) {
      return false;
    }
  }
}

module.exports.refreshGeneralLedger = refreshGeneralLedger;
