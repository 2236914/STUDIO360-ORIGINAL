const { getLedgerFullFromDb, getLedgerSummary, isDbReady } = require('./bookkeepingRepo');
const { COA } = require('../api/bookkeeping/coa');

function groupByAccountType(summaryRows = []) {
  const result = { assets: [], liabilities: [], equity: [], revenue: [], expenses: [], contraAsset: [], contraRevenue: [] };
  for (const row of summaryRows) {
    const acc = COA[String(row.code)] || null;
    const type = acc?.type || null;
    if (type === 'asset') result.assets.push(row);
    else if (type === 'liability') result.liabilities.push(row);
    else if (type === 'equity') result.equity.push(row);
    else if (type === 'revenue') result.revenue.push(row);
    else if (type === 'expense') result.expenses.push(row);
    else if (type === 'contra-asset') result.contraAsset.push(row);
    else if (type === 'contra-revenue') result.contraRevenue.push(row);
  }
  return result;
}

function calcBalance(row) {
  // row has debit, credit, balanceSide
  if (!row) return 0;
  // Prefer provided balance if present
  if (typeof row.balance === 'number') return row.balance;
  return (Number(row.debit || 0) - Number(row.credit || 0));
}

async function loadSummary({ from = null, to = null, month = null, year = null } = {}) {
  if (isDbReady()) {
    try {
      const full = await getLedgerFullFromDb({ from, to, month, year });
      return full?.summary || [];
    } catch (_) {}
    try {
      const { summary } = await getLedgerSummary();
      return summary || [];
    } catch (_) {}
  }
  // If DB not ready, the API routes compute memory-based summary; callers should route through API in that case.
  return [];
}

async function computeIncomeStatement({ from = null, to = null, month = null, year = null } = {}) {
  const summary = await loadSummary({ from, to, month, year });
  const byType = groupByAccountType(summary);
  const totalRevenue = byType.revenue.reduce((s, r) => s + (r.balanceSide === 'credit' ? Number(r.balance || 0) : -(calcBalance(r))), 0)
    - byType.contraRevenue.reduce((s, r) => s + Math.abs(calcBalance(r)), 0);
  const totalExpenses = byType.expenses.reduce((s, r) => s + (r.balanceSide === 'debit' ? Number(r.balance || 0) : Math.abs(calcBalance(r))), 0);
  const grossProfit = totalRevenue; // no COGS split available beyond expenses bucket
  const netIncome = totalRevenue - totalExpenses;
  return {
    period: { from, to, month, year },
    totals: { revenue: totalRevenue, expenses: totalExpenses, grossProfit, netIncome },
    lines: {
      revenue: byType.revenue,
      expenses: byType.expenses,
      contraRevenue: byType.contraRevenue,
    },
  };
}

async function computeBalanceSheet({ asOf = null, month = null, year = null } = {}) {
  // Interpret asOf OR month/year
  const to = asOf || null;
  const summary = await loadSummary({ to, month, year });
  const byType = groupByAccountType(summary);
  const assets = byType.assets.map((r) => ({ ...r, amount: calcBalance(r) }))
    .concat(byType.contraAsset.map((r) => ({ ...r, amount: -Math.abs(calcBalance(r)) })));
  const liabilities = byType.liabilities.map((r) => ({ ...r, amount: -Math.abs(calcBalance(r)) }))
    .map((r) => ({ ...r, amount: Math.abs(r.amount) }));
  const equity = byType.equity.map((r) => ({ ...r, amount: -Math.abs(calcBalance(r)) }))
    .map((r) => ({ ...r, amount: Math.abs(r.amount) }));

  const totalAssets = assets.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalEquity = equity.reduce((s, r) => s + Number(r.amount || 0), 0);

  return {
    asOf: to || (month && year ? `${year}-${String(month).padStart(2, '0')}-01` : null),
    totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity },
    sections: { assets, liabilities, equity },
  };
}

async function computeTrialBalance({ asOf = null, month = null, year = null } = {}) {
  const to = asOf || null;
  const summary = await loadSummary({ to, month, year });
  const rows = summary.map((r) => {
    const bal = calcBalance(r);
    if ((r.balanceSide || '').toLowerCase() === 'debit') {
      return { code: r.code, accountTitle: r.accountTitle, debit: Math.abs(bal), credit: 0 };
    }
    return { code: r.code, accountTitle: r.accountTitle, debit: 0, credit: Math.abs(bal) };
  });
  const totalDebit = rows.reduce((s, r) => s + Number(r.debit || 0), 0);
  const totalCredit = rows.reduce((s, r) => s + Number(r.credit || 0), 0);
  return { asOf: to || (month && year ? `${year}-${String(month).padStart(2, '0')}-01` : null), rows, totals: { debit: totalDebit, credit: totalCredit } };
}

async function computeCashFlow({ from = null, to = null, method = 'indirect' } = {}) {
  // Simplified: approximate net cash flow as change in Cash accounts (101/102) over the period
  const periodA = await loadSummary({ to: from });
  const periodB = await loadSummary({ to });
  const cashCodes = ['101', '102'];
  const sumCash = (rows) => rows.filter((r) => cashCodes.includes(String(r.code))).reduce((s, r) => s + calcBalance(r), 0);
  const startCash = sumCash(periodA);
  const endCash = sumCash(periodB);
  const netChange = Number(endCash || 0) - Number(startCash || 0);
  return {
    period: { from, to },
    method,
    sections: {
      operating: netChange, // Without detailed adjustments, treat as total change
      investing: 0,
      financing: 0,
    },
    totals: { netChange, endingCash: endCash },
  };
}

module.exports = {
  computeIncomeStatement,
  computeBalanceSheet,
  computeCashFlow,
  computeTrialBalance,
};


