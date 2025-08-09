/**
 * Bookkeeping Routes
 * Handles bookkeeping and accounting endpoints
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with real DB later)
const store = {
  journal: [], // { id, date, ref, entries: [{ account, description, type: 'debit'|'credit', amount }] }
  ledger: [], // { id, date, account, description, type, amount, balance }
  cashReceipts: [], // { id, date, invoiceNumber, description, netSales, feesAndCharges, cash, withholdingTax, ownersCapital, loansPayable }
  cashDisbursements: [], // { id, date, checkNo, payee, description, amount, account }
};

function ok(res, payload) {
  return res.json({ success: true, ...payload });
}
function bad(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
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
  ok(res, {
    message: 'Journal retrieved',
    data: {
      journal: data,
      pagination: {
        page,
        limit,
        total: store.journal.length,
        totalPages: Math.ceil(store.journal.length / limit) || 1,
      }
    }
  });
});

/**
 * @route   POST /api/bookkeeping/journal
 * @desc    Add entry to general journal
 * @access  Private
 */
router.post('/journal', (req, res) => {
  const { date, ref, entries } = req.body || {};
  if (!date || !Array.isArray(entries) || entries.length < 2) {
    return bad(res, 'Invalid journal entry: require date and at least 2 entries');
  }
  const id = store.journal.length + 1;
  const entry = { id, date, ref: ref || `GJ${String(id).padStart(2, '0')}`, entries };
  store.journal.push(entry);
  ok(res, { message: 'Journal entry added', data: { entry } });
});

/**
 * @route   GET /api/bookkeeping/ledger
 * @desc    Get general ledger
 * @access  Private
 */
router.get('/ledger', (req, res) => {
  ok(res, {
    message: 'Ledger retrieved',
    data: {
      ledger: store.ledger,
      accounts: Array.from(new Set(store.ledger.map((e) => e.account))).map((name, idx) => ({ id: `acc_${idx + 1}`, name })),
    }
  });
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
  ok(res, { message: 'Cash receipts retrieved', data: { receipts: store.cashReceipts } });
});

/**
 * @route   POST /api/bookkeeping/cash-receipts
 * @desc    Add cash receipt entry
 * @access  Private
 */
router.post('/cash-receipts', (req, res) => {
  const { date, invoiceNumber, description, netSales = 0, feesAndCharges = 0, cash = 0, withholdingTax = 0, ownersCapital = 0, loansPayable = 0 } = req.body || {};
  if (!date || !description) return bad(res, 'Invalid cash receipt: date and description required');
  const id = store.cashReceipts.length + 1;
  const entry = { id, date, invoiceNumber: invoiceNumber || '', description, netSales, feesAndCharges, cash, withholdingTax, ownersCapital, loansPayable };
  store.cashReceipts.push(entry);
  ok(res, { message: 'Cash receipt entry added', data: { entry } });
});

/**
 * @route   GET /api/bookkeeping/cash-disbursements
 * @desc    Get cash disbursement book
 * @access  Private
 */
router.get('/cash-disbursements', (req, res) => {
  ok(res, { message: 'Cash disbursements retrieved', data: { disbursements: store.cashDisbursements } });
});

/**
 * @route   POST /api/bookkeeping/cash-disbursements
 * @desc    Add cash disbursement entry
 * @access  Private
 */
router.post('/cash-disbursements', (req, res) => {
  const { date, checkNo, payee, description, amount = 0, account } = req.body || {};
  if (!date || !payee || !description) return bad(res, 'Invalid cash disbursement: date, payee, description required');
  const id = store.cashDisbursements.length + 1;
  const entry = { id, date, checkNo: checkNo || '', payee, description, amount, account: account || '' };
  store.cashDisbursements.push(entry);
  ok(res, { message: 'Cash disbursement entry added', data: { entry } });
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
  // TODO: Implement accounts retrieval
  res.json({
    success: true,
    message: 'Accounts endpoint - to be implemented',
    data: {
      accounts: [
        {
          id: 'acc_001',
          code: '1000',
          name: 'Cash',
          type: 'asset',
          balance: 0
        },
        {
          id: 'acc_002',
          code: '2000',
          name: 'Accounts Payable',
          type: 'liability',
          balance: 0
        }
      ]
    }
  });
});

module.exports = router; 