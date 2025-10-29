const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
  return json.data;
}

export async function getIncomeStatement(params = {}) {
  const url = new URL(`${API_BASE}/api/bookkeeping/reports/income-statement`);
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.append(k, v));
  return fetchJson(url.toString(), { credentials: 'include' });
}

export async function getBalanceSheet(params = {}) {
  const url = new URL(`${API_BASE}/api/bookkeeping/reports/balance-sheet`);
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.append(k, v));
  return fetchJson(url.toString(), { credentials: 'include' });
}

export async function getCashFlow(params = {}) {
  const url = new URL(`${API_BASE}/api/bookkeeping/reports/cash-flow`);
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.append(k, v));
  return fetchJson(url.toString(), { credentials: 'include' });
}

export async function getTrialBalance(params = {}) {
  const url = new URL(`${API_BASE}/api/bookkeeping/reports/trial-balance`);
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.append(k, v));
  return fetchJson(url.toString(), { credentials: 'include' });
}

export async function exportReport({ type, format, params = {} }) {
  const url = new URL(`${API_BASE}/api/bookkeeping/reports/export`);
  url.searchParams.set('type', type);
  url.searchParams.set('format', format);
  Object.entries(params).forEach(([k, v]) => (v != null && v !== '') && url.searchParams.append(k, v));
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  const href = URL.createObjectURL(blob);
  a.href = href;
  const filename = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `report.${format}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

export default {
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
  getTrialBalance,
  exportReport,
};


