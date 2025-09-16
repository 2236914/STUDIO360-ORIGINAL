const { supabase } = require('./supabaseClient');
const { getAccount } = require('../api/bookkeeping/coa');

async function upsertAccount({ code, title }) {
  // New schema has no accounts table; keep as no-op for compatibility.
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
  // Read from unified view (general_ledger is now a view alias)
  const { data: rows, error } = await supabase
    .from('general_ledger')
    .select('account_title, debit, credit, balance_side, balance');
  if (error) throw error;
  const out = (rows || []).map(r => {
    // Try to map title back to COA code
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
}

function isDbReady() { return !!supabase; }

module.exports.getJournalEntries = getJournalEntries;
module.exports.getLedgerSummary = getLedgerSummary;
module.exports.isDbReady = isDbReady;
