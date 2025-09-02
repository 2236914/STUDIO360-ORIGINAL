// Chart of Accounts based on the provided codes and meanings
// Each account has: code, title, type, normal ('debit'|'credit')

/** @typedef {{code:string,title:string,type:'asset'|'liability'|'equity'|'revenue'|'expense'|'contra-asset'|'contra-revenue',normal:'debit'|'credit'}} Account */

/** @type {Record<string, Account>} */
const COA = {
  // Assets
  '101': { code: '101', title: 'Cash on Hand', type: 'asset', normal: 'debit' },
  '102': { code: '102', title: 'Cash in Bank', type: 'asset', normal: 'debit' },
  '103': { code: '103', title: 'Accounts Receivable', type: 'asset', normal: 'debit' },
  '104': { code: '104', title: 'Inventory (Merchandise)', type: 'asset', normal: 'debit' },
  '105': { code: '105', title: 'Prepaid Expenses', type: 'asset', normal: 'debit' },
  '106': { code: '106', title: 'Tools & Equipment', type: 'asset', normal: 'debit' },
  '107': { code: '107', title: 'Store Fixtures & Furniture', type: 'asset', normal: 'debit' },
  '108': { code: '108', title: 'Accumulated Depreciation', type: 'contra-asset', normal: 'credit' },

  // Liabilities
  '201': { code: '201', title: 'Accounts Payable', type: 'liability', normal: 'credit' },
  '202': { code: '202', title: 'Loans Payable', type: 'liability', normal: 'credit' },

  // Equity
  '301': { code: '301', title: "Owner's Capital", type: 'equity', normal: 'credit' },
  '302': { code: '302', title: "Owner's Drawings", type: 'equity', normal: 'debit' },

  // Revenue
  '401': { code: '401', title: 'Sales Revenue', type: 'revenue', normal: 'credit' },
  '402': { code: '402', title: 'Other Income', type: 'revenue', normal: 'credit' },

  // Expenses
  '501': { code: '501', title: 'Purchases (COGS)', type: 'expense', normal: 'debit' },
  '502': { code: '502', title: 'Supplies Expense', type: 'expense', normal: 'debit' },
  '503': { code: '503', title: 'Rent Expense', type: 'expense', normal: 'debit' },
  '504': { code: '504', title: 'Utilities Expense', type: 'expense', normal: 'debit' },
  '505': { code: '505', title: 'Advertising & Promotion', type: 'expense', normal: 'debit' },
  '506': { code: '506', title: 'Transportation/Delivery', type: 'expense', normal: 'debit' },
  '507': { code: '507', title: 'Taxes & Licenses', type: 'expense', normal: 'debit' },
  '508': { code: '508', title: 'Miscellaneous Expense', type: 'expense', normal: 'debit' },
  '509': { code: '509', title: 'Depreciation Expense', type: 'expense', normal: 'debit' },
  '510': { code: '510', title: 'Platform Fees & Charges', type: 'expense', normal: 'debit' },
};

function getAccount(code) {
  const acc = COA[String(code)] || null;
  if (!acc) throw new Error(`Unknown account code: ${code}`);
  return acc;
}

function listAccounts() {
  return Object.values(COA).sort((a, b) => a.code.localeCompare(b.code));
}

module.exports = { COA, getAccount, listAccounts };
