/**
 * Bookkeeping Routes
 * Handles bookkeeping and accounting endpoints
 */

const express = require('express');
const router = express.Router();
const { COA, getAccount, listAccounts } = require('./coa');

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

/**
 * @route   GET /api/bookkeeping/journal
 * @desc    Get general journal
 * @access  Private
 */
router.get('/journal', (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '100', 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = store.journal.slice(start, end);
  ok(res, { message: 'Journal retrieved', data: { journal: data, pagination: { page, limit, total: store.journal.length, totalPages: Math.ceil(store.journal.length / limit) || 1 } } });
});

/**
 * @route   POST /api/bookkeeping/journal
 * @desc    Add entry to general journal
 * @access  Private
 */
router.post('/journal', (req, res) => {
  const { date, ref, particulars, lines } = req.body || {};
  if (!date || !Array.isArray(lines) || lines.length < 2) return bad(res, 'Provide date and at least 2 lines');
  // Idempotency: same ref -> return existing
  if (ref) {
    const existing = findJournalByRef(ref);
    if (existing) return ok(res, { message: 'Journal entry exists', data: { entry: existing, duplicate: true } });
  }
  // Validate lines: each requires code, debit or credit amount
  let totalDr = 0, totalCr = 0;
  const normLines = lines.map((ln) => {
    const acc = getAccount(ln.code);
    const debit = Number(ln.debit || 0);
    const credit = Number(ln.credit || 0);
    if (debit < 0 || credit < 0) throw new Error('Amounts must be positive');
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
  const entry = { id, date, ref: ref || `GJ${String(id).padStart(4, '0')}`, particulars: particulars || '', lines: normLines };
  store.journal.push(entry);
  ok(res, { message: 'Journal entry added', data: { entry } });
});

/**
 * @route   GET /api/bookkeeping/ledger
 * @desc    Get general ledger
 * @access  Private
 */
router.get('/ledger', (req, res) => {
  // Build ledger by aggregating journal lines per account code, with running balance (normal side)
  const byCode = new Map(); // code -> { code,title,normal,entries:[{date,description,reference,debit,credit,balance,accountCode,accountTitle}], totals:{debit,credit} }
  for (const j of store.journal) {
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
  // Compute running balances by account and build summary
  const ledger = [];
  const summary = [];
  for (const rec of Array.from(byCode.values()).sort((a,b)=>a.code.localeCompare(b.code))) {
    let bal = 0;
    for (const e of rec.entries.sort((a,b)=> (a.date||'').localeCompare(b.date||''))) {
      bal += (rec.normal === 'debit' ? (e.debit - e.credit) : (e.credit - e.debit));
      e.balance = bal;
    }
    const closingBalance = rec.normal === 'debit' ? (rec.totals.debit - rec.totals.credit) : (rec.totals.credit - rec.totals.debit);
    const balanceSide = rec.normal; // side where balance rests by nature
    ledger.push({ code: rec.code, accountTitle: rec.title, normal: rec.normal, totals: rec.totals, entries: rec.entries });
    summary.push({ code: rec.code, accountTitle: rec.title, debit: rec.totals.debit, credit: rec.totals.credit, balance: closingBalance, balanceSide });
  }
  const mode = String(req.query.mode || '').toLowerCase();
  const summaryOnly = req.query.summary === '1' || mode === 'summary';
  if (summaryOnly) {
    return ok(res, { message: 'Ledger summary', data: { summary, accounts: listAccounts() } });
  }
  ok(res, { message: 'Ledger aggregated', data: { ledger, summary, accounts: listAccounts() } });
});

// Convenience endpoint for totals-only general ledger (no daily entries)
router.get('/ledger/summary', (req, res) => {
  req.query.summary = '1';
  return router.handle({ ...req, method: 'GET', url: '/ledger' }, res);
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
 * @route   POST /api/bookkeeping/cash-receipts
 * @desc    Add cash receipt entry
 * @access  Private
 */
// Cash Receipt Journal schema (columns given):
// Date | OR/Reference No. | Customer/Source | CashBank/eWallet (DEBIT) | Fees & Charges (DEBIT)
// | Sales Returns/Refunds (DEBIT) | Net Sales (CREDIT) | Other Income (CREDIT) | Accounts Receivable (CREDIT) | Remarks/Note
router.post('/cash-receipts', (req, res) => {
  const { date, referenceNo, customer, cashDebit = 0, feesChargesDebit = 0, salesReturnsDebit = 0, netSalesCredit = 0, otherIncomeCredit = 0, arCredit = 0, ownersCapitalCredit = 0, remarks } = req.body || {};
  if (!date) return bad(res, 'Date is required');
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
router.post('/cash-disbursements', (req, res) => {
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
  if (entry.advertisingDebit) lines.push({ code: '505', debit: entry.advertisingDebit, credit: 0, description: 'Advertising / Marketing' });
  if (entry.deliveryDebit) lines.push({ code: '506', debit: entry.deliveryDebit, credit: 0, description: 'Delivery / Transportation' });
  if (entry.taxesDebit) lines.push({ code: '507', debit: entry.taxesDebit, credit: 0, description: 'Taxes & Licenses' });
  if (entry.miscDebit) lines.push({ code: '508', debit: entry.miscDebit, credit: 0, description: 'Miscellaneous Expense' });
  if (entry.cashCredit) lines.push({ code: '101', debit: 0, credit: entry.cashCredit, description: 'Cash/Bank/eWallet' });
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