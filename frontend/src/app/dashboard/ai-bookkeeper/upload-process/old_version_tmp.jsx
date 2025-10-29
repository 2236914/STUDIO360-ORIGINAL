'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';

import axios from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/dashboard';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const steps = [
  {
    label: 'Data Input',
    description: 'Upload receipts, sales data, or Excel files',
    icon: 'eva:file-add-fill',
    content: {
      title: 'Upload Your Documents',
      description: 'Upload receipts, sales Excel files, or connect to e-commerce platforms',
      mockData: {
        files: [
          { name: 'receipt_001.jpg', type: 'Receipt', size: '2.3 MB' },
          { name: 'sales_data.xlsx', type: 'Excel', size: '1.8 MB' },
          { name: 'shopee_orders.csv', type: 'CSV', size: '0.9 MB' },
        ],
        platforms: ['Shopee', 'TikTok', 'Lazada']
      }
    }
  },
  {
    label: 'AI Recognition',
    description: 'AI processes and recognizes text from documents',
    icon: 'eva:smartphone-fill',
    content: {
      title: 'AI Text Recognition in Progress',
      description: 'Our AI is analyzing your documents and extracting transaction data',
      mockData: {
        progress: 75,
        extractedItems: [
          { text: 'Shopee Order #SP12345', confidence: 98, category: 'Online Sales' },
          { text: 'Phone Case Purchase', confidence: 95, category: 'Cost of Goods' },
          { text: 'Marketing Campaign', confidence: 87, category: 'Marketing Expenses' },
          { text: 'Office Supplies', confidence: 92, category: 'Operating Expenses' },
        ]
      }
    }
  },
  {
    label: 'User Confirmation',
    description: 'Review and confirm AI categorization results',
    icon: 'eva:checkmark-circle-2-fill',
    content: {
      title: 'Review AI Categorization',
      description: 'Please review and confirm the AI-categorized transactions',
      mockData: {
        transactions: [
          {
            id: 1,
            description: 'Shopee Order #SP12345-Phone Case',
            amount: 850,
            aiCategory: 'Online Sales Revenue',
            confidence: 98,
            suggested: true
          },
          {
            id: 2,
            description: 'Phone Case Inventory Purchase',
            amount: 300,
            aiCategory: 'Cost of Goods Sold',
            confidence: 95,
            suggested: true
          },
            {
            id: 3,
            description: 'Facebook Ads Campaign',
            amount: 1500,
            aiCategory: 'Marketing Expenses',
            confidence: 87,
            suggested: false
          },
          {
            id: 4,
            description: 'Office Supplies - Paper & Ink',
            amount: 250,
            aiCategory: 'Operating Expenses',
            confidence: 92,
            suggested: true
          }
        ]
      }
    }
  },
  {
    label: 'Data Transfer',
    description: 'Transfer confirmed data to book of accounts',
    icon: 'eva:arrow-forward-fill',
    content: {
      title: 'Transfer to Book of Accounts',
      description: 'Transferring confirmed transactions to your bookkeeping system',
      mockData: {
        transferred: 4,
        total: 4,
        categories: ['Online Sales Revenue', 'Cost of Goods Sold', 'Marketing Expenses', 'Operating Expenses']
      }
    }
  }
];

const CATEGORY_OPTIONS = [
  'Purchases - Materials',
  'Walk-in Sales',
  'Rent Expense',
  'Marketing Expenses',
  'Platform Fees',
  'Insurance',
  'Office Supplies',
  'Taxes & Licenses',
  'Transportation',
  'Professional Fees',
  'Other Income',
  'Miscellaneous Expense',
];

// Book of Accounts options
const BOOK_OPTIONS = [
  { value: 'cash-receipts', label: 'Cash Receipt Journal' },
  { value: 'cash-disbursements', label: 'Cash Disbursement Book' },
  { value: 'journal', label: 'General Journal' },
  { value: 'ledger', label: 'General Ledger' },
];

function inferBookFromCategory(category = '') { // kept for backward compatibility (no longer used for primary routing)
  const c = String(category).toLowerCase();
  const incomeLike = ['online sales', 'walk-in sales', 'sales', 'revenue', 'other income'];
  const expenseLike = ['expense', 'expenses', 'utilities', 'rent', 'insurance', 'office supplies', 'advertising', 'marketing', 'travel', 'professional fees', 'platform fees', 'cost of goods sold'];
  if (incomeLike.some(k => c.includes(k))) return 'cash-receipts';
  if (expenseLike.some(k => c.includes(k))) return 'cash-disbursements';
  return 'journal';
}

function classifyCategory(category = '') {
  const book = inferBookFromCategory(category);
  if (book === 'cash-receipts') return 'income';
  if (book === 'cash-disbursements') return 'expense';
  return 'other';
}

// Helpers: COA mapping and journal/CRJ/CDJ shaping
const COA_CODES = {
  CASH: '101', // Cash on Hand (default)
  CASH_BANK: '102', // Cash in Bank (unused by default)
  AR: '103',
  SALES: '401',
  OTHER_INCOME: '402',
  PURCHASES: '501',
  SUPPLIES: '502',
  RENT: '503',
  UTILITIES: '504',
  ADVERTISING: '505',
  DELIVERY: '506',
  TAXES: '507',
  MISC: '508',
  FEES: '510',
  CAPITAL: '301',
};

// --- Learned category overrides (persisted locally) -----------------------
function loadCategoryOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('aiCategoryOverrides');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (_) { return {}; }
}
function saveCategoryOverrides(map) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('aiCategoryOverrides', JSON.stringify(map)); } catch (_) { /* ignore */ }
}
function normalizeKey(desc = '') {
  return String(desc).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 140);
}

function mapExpenseCategoryToCoa(category = '') {
  const c = String(category).toLowerCase();
  if (c.includes('purchase') || c.includes('cogs') || c.includes('inventory')) return { code: COA_CODES.PURCHASES, label: 'Purchases – Materials' };
  if (c.includes('suppl')) return { code: COA_CODES.SUPPLIES, label: 'Supplies Expense' };
  if (c.includes('rent')) return { code: COA_CODES.RENT, label: 'Rent Expense' };
  if (c.includes('advert') || c.includes('market')) return { code: COA_CODES.ADVERTISING, label: 'Advertising' };
  if (c.includes('deliver') || c.includes('freight') || c.includes('shipping') || c.includes('transport')) return { code: COA_CODES.DELIVERY, label: 'Transportation' };
  if (c.includes('tax') || c.includes('license')) return { code: COA_CODES.TAXES, label: 'Taxes & Licenses' };
  if (c.includes('utilit') || c.includes('electric') || c.includes('water') || c.includes('internet')) return { code: COA_CODES.UTILITIES, label: 'Utilities Expense' };
  if (c.includes('fee') || c.includes('platform')) return { code: COA_CODES.FEES, label: 'Platform Fees & Charges' };
  if (c.includes('misc') || c.includes('other') || c.includes('general')) return { code: COA_CODES.MISC, label: 'Miscellaneous Expense' };
  return { code: COA_CODES.MISC, label: 'Miscellaneous Expense' };
}

function derivePlatformCustomer(description = '') {
  const d = String(description).toLowerCase();
  if (d.includes('shopee')) return 'Shopee Various Customers';
  if (d.includes('tiktok')) return 'TikTok Various Customers';
  if (d.includes('lazada')) return 'Lazada Various Customers';
  return '';
}

export default function UploadProcessPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeping Process | Kitsch Studio';
  }, []);

  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, transaction: null });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [ocrTexts, setOcrTexts] = useState({}); // { filename: text }
  const [ocrStructured, setOcrStructured] = useState({}); // { filename: structuredObj }
  const [ocrCanonical, setOcrCanonical] = useState({}); // { filename: canonicalObj }
  const [ocrWarnings, setOcrWarnings] = useState({}); // { filename: string[] }
  const [transferState, setTransferState] = useState({ transferred: 0, total: 0, categories: [] });
  const [step3Initialized, setStep3Initialized] = useState(false);
  const [lastTransferBooks, setLastTransferBooks] = useState({ counts: {}, total: 0 });
  const [categoryOverrides, setCategoryOverrides] = useState({});
  // Sales ingestion mode & rows
  const [salesMode, setSalesMode] = useState(false); // true when Excel sales file uploaded
  const [salesRows, setSalesRows] = useState([]); // normalized sales rows from backend (date, platform, order_id, etc.)
  const [salesPosting, setSalesPosting] = useState(false);
  const [salesPosted, setSalesPosted] = useState(false);
  const [salesPostLog, setSalesPostLog] = useState([]); // log strings
  const [salesTransfer, setSalesTransfer] = useState({ transferred: 0, total: 0, errors: 0 });

  // Load overrides once on mount
  useEffect(() => { setCategoryOverrides(loadCategoryOverrides()); }, []);

  const totalSteps = steps.length;
  const completedSteps = Object.keys(completed).length;
  const allStepsCompleted = completedSteps === totalSteps;

  // KPI metrics derived from current state
  const docsCount = Object.keys(ocrTexts || {}).length;
  const txCount = Array.isArray(transactions) ? transactions.length : 0;
  const processedCount = (transferState?.transferred || 0) || txCount || docsCount || 0;
  const autoAccepted = txCount ? transactions.filter((t) => !!t.autoBook).length : 0;
  const accuracyRate = txCount ? Math.round((autoAccepted / txCount) * 100) : 0;
  const timeSavedMinutes = processedCount * 2; // simple heuristic: 2 min per item
  const costSavings = processedCount * 10; // simple heuristic: ₱10 per item

  // When arriving at Step 3 (Confirm & Transfer), pre-initialize progress totals (run once per entry)
  useEffect(() => {
    if (activeStep === 3 && !step3Initialized) {
      setTransferState({ transferred: 0, total: transactions?.length || 0, categories: [] });
      setProcessing(false);
      setStep3Initialized(true);
    }
    if (activeStep !== 3 && step3Initialized) {
      setStep3Initialized(false);
    }
  }, [activeStep, step3Initialized, transactions]);

  // Persist KPIs so the main AI Bookkeeper page can read live stats
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stats = {
      processed: processedCount,
      accuracyRate,
      timeSavedMinutes,
      costSavings,
      docsCount,
      txCount,
      transferred: transferState?.transferred || 0,
      updatedAt: Date.now(),
    };
    try {
      window.localStorage.setItem('aiBookkeeperStats', JSON.stringify(stats));
    } catch (e) {
      // ignore storage errors
    }
  }, [processedCount, accuracyRate, timeSavedMinutes, costSavings, docsCount, txCount, transferState]);

  const handleNext = () => {
    setProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setCompleted((prev) => ({ ...prev, [activeStep]: true }));
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setProcessing(false);
    }, 2000);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
    setUploadedFiles([]);
  };

  const handleEditTransaction = (transaction) => {
    // Ensure a book field exists with sensible default
    const book = transaction.book || inferBookFromCategory(transaction.aiCategory);
    setEditDialog({ open: true, transaction: { ...transaction, book } });
  };

  const handleSaveEdit = () => {
    if (editDialog.transaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === editDialog.transaction.id ? editDialog.transaction : t
        )
      );
      // Persist override for future parses based on description root
      const key = normalizeKey(editDialog.transaction.description || editDialog.transaction.sourceFile || '');
      if (key) {
        const next = { ...categoryOverrides, [key]: editDialog.transaction.aiCategory };
        setCategoryOverrides(next);
        saveCategoryOverrides(next);
      }
    }
    setEditDialog({ open: false, transaction: null });
  };

  // Transfer confirmed transactions to appropriate books
  const handleTransfer = async () => {
    // New model: every transaction goes to General Journal first.
    // If classified as expense -> also create Cash Disbursement entry.
    // If income -> also create Cash Receipt entry.
    const items = transactions.slice();
    setProcessing(true);
    setTransferState({ transferred: 0, total: items.length, categories: [] });
    const categoriesSet = new Set();
    const counts = { journal: 0, 'cash-disbursements': 0, 'cash-receipts': 0 };
    try {
  for (let i = 0; i < items.length; i++) {
        const t = items[i];
        const amt = Math.abs(Number(t.amount) || 0);
        const cls = classifyCategory(t.aiCategory);
        categoriesSet.add(t.aiCategory);
        // Journal posting: use COA codes and debit/credit amounts
        const particulars = t.description || '';
        const today = new Date().toISOString().slice(0, 10);
        const normalizeDate = (dStr) => {
          if (!dStr) return null;
          const d = new Date(dStr);
          if (Number.isNaN(d.getTime())) return null;
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        };
  const invDate = normalizeDate(t.dateIssued) || normalizeDate(t.orderDate) || normalizeDate(t.orderPaidDate) || today;
        // Prefer a stable reference so dedupe by ref works across Journal and CRJ/CDJ
        const pickRef = (...vals) => {
          for (const v of vals) {
            const s = (v ?? '').toString().trim();
            if (!s) continue;
            if (/^(n\/?a|na|none|null|undefined|summary)$/i.test(s)) continue;
            return s;
          }
          return '';
        };
        const ref = pickRef(t.invoiceNumber, t.orderSummaryNo, t.orderId);
        if (cls === 'expense') {
          const exp = mapExpenseCategoryToCoa(t.aiCategory);
          const lines = [
            { code: exp.code, description: exp.label, debit: amt, credit: 0 },
            { code: COA_CODES.CASH, description: 'Cash/Bank/eWallet', debit: 0, credit: amt },
          ];
          await axios.post('/api/bookkeeping/journal', { date: invDate, ref, particulars, lines });
        } else if (cls === 'income') {
          const revenueCode = (String(t.aiCategory).toLowerCase().includes('other income')) ? COA_CODES.OTHER_INCOME : COA_CODES.SALES;
          const lines = [
            { code: COA_CODES.CASH, description: 'Cash received', debit: amt, credit: 0 },
            { code: revenueCode, description: String(t.aiCategory || 'Sales Revenue'), debit: 0, credit: amt },
          ];
          await axios.post('/api/bookkeeping/journal', { date: invDate, ref, particulars, lines });
        } else {
          const exp = mapExpenseCategoryToCoa(t.aiCategory);
          const lines = [
            { code: exp.code, description: exp.label, debit: amt, credit: 0 },
            { code: COA_CODES.CASH, description: 'Cash/Bank/eWallet', debit: 0, credit: amt },
          ];
          await axios.post('/api/bookkeeping/journal', { date: invDate, ref, particulars, lines });
        }
        counts.journal += 1;

  if (cls === 'expense') {
          // CDB-only shaping per guide: invoice date, seller as payee, omit reference, Purchases – Materials as default, enriched remarks
          const e = mapExpenseCategoryToCoa(t.aiCategory);
          const normalizeDate = (dStr) => {
            if (!dStr) return null;
            const d = new Date(dStr);
            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
          };
          const invDate = normalizeDate(t.dateIssued) || normalizeDate(t.orderDate) || normalizeDate(t.orderPaidDate) || today;
          const parts = [];
          if (t.description) parts.push(String(t.description));
          if (t.sellerName && !String(t.description || '').includes(t.sellerName)) parts.push(String(t.sellerName));
          const ord = t.orderSummaryNo || t.orderId;
          if (ord) parts.push(`Order ${ord}`);
          const remarks = parts.filter(Boolean).join(' • ');
          const payload = {
            date: invDate,
            // referenceNo intentionally omitted so backend generates CDB-###
            payee: t.sellerName || 'N/A',
            remarks,
            cashCredit: amt,
            purchasesDebit: 0,
            suppliesDebit: 0,
            rentDebit: 0,
            advertisingDebit: 0,
            deliveryDebit: 0,
            taxesDebit: 0,
            miscDebit: 0,
          };
          // Set the appropriate debit column (prefer Purchases – Materials)
          if (e.code === COA_CODES.PURCHASES) payload.purchasesDebit = amt;
          else if (e.code === COA_CODES.SUPPLIES) payload.suppliesDebit = amt;
          else if (e.code === COA_CODES.RENT) payload.rentDebit = amt;
          else if (e.code === COA_CODES.ADVERTISING) payload.advertisingDebit = amt;
          else if (e.code === COA_CODES.DELIVERY) payload.deliveryDebit = amt;
          else if (e.code === COA_CODES.TAXES) payload.taxesDebit = amt;
          else if (e.code === COA_CODES.UTILITIES) payload.utilitiesDebit = amt;
          else if (e.code === COA_CODES.MISC) payload.miscDebit = amt;
          else payload.purchasesDebit = amt; // fallback
          await axios.post('/api/bookkeeping/cash-disbursements', payload);
          counts['cash-disbursements'] += 1;
  } else if (cls === 'income') {
          const platformCustomer = derivePlatformCustomer(t.description) || 'Various Customers';
          const isOtherIncome = String(t.aiCategory).toLowerCase().includes('other income');
          const payload = {
            date: invDate,
            referenceNo: ref,
            customer: platformCustomer,
            cashDebit: amt,
            feesChargesDebit: 0,
            salesReturnsDebit: 0,
            netSalesCredit: isOtherIncome ? 0 : amt,
            otherIncomeCredit: isOtherIncome ? amt : 0,
            arCredit: 0,
            ownersCapitalCredit: 0,
            remarks: t.description,
          };
          await axios.post('/api/bookkeeping/cash-receipts', payload);
          counts['cash-receipts'] += 1;
        }
        setTransferState(prev => ({ ...prev, transferred: prev.transferred + 1, categories: Array.from(categoriesSet) }));
      }
      const newCompleted = { ...completed, 2: true };
      setCompleted(newCompleted);
      setActiveStep(3);
      setLastTransferBooks({ counts, total: items.length });
      // Set refresh flags for affected books
      try {
        window.localStorage.setItem('ledgerNeedsRefresh','1');
        if (counts['cash-disbursements']>0) window.localStorage.setItem('cashDisbursementsNeedsRefresh','1');
        if (counts['cash-receipts']>0) window.localStorage.setItem('cashReceiptsNeedsRefresh','1');
      } catch(_) {}
      // Navigate to journal as the primary book for review
      setTimeout(() => router.push('/dashboard/bookkeeping/general-journal'), 300);
    } catch (err) {
      console.error('Transfer error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Sales transfer (posts journal + cash receipts using backend consolidation)
  const handleSalesTransfer = async () => {
    if (!salesRows.length) return;
    setSalesPosting(true);
    setSalesPosted(false);
    setSalesPostLog([]);
    setSalesTransfer({ transferred: 0, total: salesRows.length, errors: 0 });
    try {
      setSalesPostLog(l => [...l, 'Preparing journal & cash receipt payloads...']);
      const res = await axios.post('/api/ai/sales-post', { sales: salesRows });
      const jp = res?.data?.data?.journalPayloads || [];
      const cp = res?.data?.data?.cashReceiptPayloads || [];
      let postedRows = 0; let errors = 0;
      // We assume jp and cp are grouped in same order by sale; we'll just fire sequential sets.
      // Post journals first
      for (const j of jp) {
        try { await axios.post('/api/bookkeeping/journal', j); setSalesPostLog(l => [...l, `Journal posted: ${j.ref || j.particulars}`]); } 
        catch (e) { errors += 1; setSalesPostLog(l => [...l, `Journal error: ${(e?.response?.data?.message)||e.message}`]); }
      }
      // Post cash receipts
      for (const c of cp) {
        try { await axios.post('/api/bookkeeping/cash-receipts', c); setSalesPostLog(l => [...l, `Cash receipt posted: ${c.referenceNo}`]); } 
        catch (e) { errors += 1; setSalesPostLog(l => [...l, `Cash receipt error: ${(e?.response?.data?.message)||e.message}`]); }
      }
      postedRows = salesRows.length; // each row yields at least 1 journal + 1 cash receipt
      setSalesTransfer({ transferred: postedRows, total: salesRows.length, errors });
      setSalesPostLog(l => [...l, `Done. Rows: ${postedRows}, Errors: ${errors}`]);
      if (!errors) {
        setSalesPosted(true);
        try {
          window.localStorage.setItem('ledgerNeedsRefresh','1');
          window.localStorage.setItem('cashReceiptsNeedsRefresh','1');
        } catch(_) {}
      }
    } catch (e) {
      setSalesPostLog(l => [...l, `Post failed: ${e.message}`]);
    } finally {
      setSalesPosting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialog({ open: false, transaction: null });
  };

  const handleDropFiles = (acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  };

  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleRemoveAllFiles = () => {
    setUploadedFiles([]);
  };

  // Very simple parser to extract line items and amounts from OCR text
  const parseOcrToTransactions = (textsByFile, structuredByFile, canonicalByFile) => {
    const txns = [];
    let id = 1;
    // Only accept numbers that have an explicit currency symbol or code to avoid order numbers.
    const amountRe = /(₱|\bPHP\b|\bphp\b|\$|USD|usd|EUR|eur|€)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)/i;
    const metadataSkip = /(order\s*(summary|id|paid|date)|seller\s*name|date\s*issued|total\s*quantity|subtotal)/i;
    const categoryHints = [
      { k: 'rent', c: 'Rent Expense' },
      { k: 'utility', c: 'Utilities' },
      { k: 'electric', c: 'Utilities' },
      { k: 'water', c: 'Utilities' },
      { k: 'internet', c: 'Utilities' },
      { k: 'office', c: 'Office Supplies' },
      { k: 'paper', c: 'Office Supplies' },
      { k: 'ink', c: 'Office Supplies' },
      { k: 'marketing', c: 'Marketing Expenses' },
      { k: 'ads', c: 'Advertising' },
      { k: 'advertis', c: 'Advertising' },
      { k: 'professional', c: 'Professional Fees' },
      { k: 'accounting', c: 'Professional Fees' },
      { k: 'salary', c: 'Operating Expenses' },
      { k: 'wage', c: 'Operating Expenses' },
      { k: 'inventory', c: 'Cost of Goods Sold' },
      { k: 'sales', c: 'Online Sales Revenue' },
      { k: 'revenue', c: 'Online Sales Revenue' },
      { k: 'shopee', c: 'Online Sales Revenue' },
      { k: 'tiktok', c: 'Online Sales Revenue' },
    ];
  const overrides = categoryOverrides; // snapshot
  Object.entries(textsByFile).forEach(([filename, text]) => {
  const structured = structuredByFile?.[filename] || {};
  const canonical = canonicalByFile?.[filename] || null;
      const fileUrl = canonical?.source?.fileUrl || null;

      // Prefer canonical grand total and organized fields when available (format-agnostic)
  const cFields = canonical?.fields || {};
      const cAmts = canonical?.amounts || {};
      const grandTotal = typeof cAmts?.grandTotal === 'number' ? cAmts.grandTotal : (
        typeof structured?.total === 'number' ? structured.total : null
      );
    if (grandTotal && grandTotal > 0) {
        const descParts = [];
        const seller = cFields.sellerName || structured.supplier;
        const inv = cFields.invoiceNumber || structured.invoiceNumber;
        if (seller) descParts.push(seller);
        if (inv) descParts.push(`Invoice ${inv}`);
        const description = `${descParts.join(' - ') || 'Document Total'  } (${filename})`;
        const baseDesc = description;
        const overrideKey = normalizeKey(baseDesc);
        const learnedCat = overrides[overrideKey];
        txns.push({
          id: id++,
          description: baseDesc,
          amount: grandTotal,
          aiCategory: learnedCat || 'Operating Expenses',
          confidence: 90,
          suggested: true,
          structuredSource: !!structured,
          canonicalSource: !!canonical,
          sourceFile: filename,
          invoiceNumber: inv || '',
          orderSummaryNo: cFields.orderSummaryNo || structured.orderSummaryNo || '',
          orderId: cFields.orderId || structured.orderId || '',
          sellerName: cFields.sellerName || structured.supplier || '',
          dateIssued: cFields.dateIssued || structured.dateIssued || '',
          orderDate: cFields.orderDate || structured.orderDate || structured.order_date || '',
          orderPaidDate: cFields.orderPaidDate || structured.orderPaidDate || '',
      fileUrl,
        });
        return; // skip line-based extraction for this file
      }
      const lines = String(text || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s);
      // naive grouping: look for lines with amounts and pair with preceding description
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(amountRe);
        if (!m) continue;
        const raw = m[2].replace(/,/g, '');
        const amt = parseFloat(raw);
        if (!isFinite(amt) || amt <= 0) continue;
        // Skip if line looks like metadata (order id etc.)
        if (metadataSkip.test(lines[i])) continue;
        const prevLine = lines[i - 1] || '';
        const candidateDesc = (!amountRe.test(prevLine) && prevLine && !metadataSkip.test(prevLine)) ? prevLine : lines[i];
        const desc = candidateDesc.slice(0, 140);
        const lower = (desc || '').toLowerCase();
  const hint = categoryHints.find((h) => lower.includes(h.k));
  let aiCategory = hint ? hint.c : 'Operating Expenses';
  const overrideKey = normalizeKey(desc);
  if (overrides[overrideKey]) aiCategory = overrides[overrideKey];
        txns.push({
          id: id++,
          description: `${desc} (${filename})`,
          amount: amt,
          aiCategory,
          confidence: 80,
          suggested: true,
          sourceFile: filename,
          invoiceNumber: structured?.invoiceNumber || '',
          orderSummaryNo: structured?.orderSummaryNo || '',
          orderId: structured?.orderId || '',
          sellerName: (canonical?.fields?.sellerName) || structured?.supplier || '',
          dateIssued: (canonical?.fields?.dateIssued) || structured?.dateIssued || '',
          orderDate: (canonical?.fields?.orderDate) || structured?.orderDate || structured?.order_date || '',
          orderPaidDate: (canonical?.fields?.orderPaidDate) || structured?.orderPaidDate || '',
          fileUrl,
        });
        if (txns.length >= 50) break; // safety cap
      }
    });
  return txns.length ? txns : steps[2].content.mockData.transactions;
  };

  const handleUploadFiles = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    setProcessing(true);
    setUploadLogs([]);
    try {
  const results = {};
  const structuredAccumulator = {};
  const canonicalAccumulator = {};
  const warningsAccumulator = {};
      const salesAccumulator = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file, file.name);
        // Detect spreadsheet for sales ingestion (xlsx/xls)
        const ext = file.name.split('.').pop()?.toLowerCase();
        const isSpreadsheet = ['xlsx','xls'].includes(ext || '');
        if (isSpreadsheet) {
          try {
            const res = await axios.post('/api/ai/sales-ingest', formData, {
              onUploadProgress: (evt) => {
                const percent = Math.round((evt.loaded * 100) / (evt.total || 1));
                setUploadLogs((prev) => [...prev, `Uploading (sales) ${file.name}: ${percent}%`]);
              },
            });
            const normalized = res?.data?.data?.normalized || [];
            if (Array.isArray(normalized)) {
              normalized.forEach(r => salesAccumulator.push(r));
              setSalesMode(true);
            }
            setUploadLogs((prev) => [...prev, `Processed sales file ${file.name} (${file.size} bytes)`]);
          } catch (e) {
            setUploadLogs((prev) => [...prev, `Sales ingest failed for ${file.name}: ${e.message}`]);
          }
          continue; // skip generic OCR path
        }
        const res = await axios.post('/api/ai/upload', formData, {
          onUploadProgress: (evt) => {
            const percent = Math.round((evt.loaded * 100) / (evt.total || 1));
            setUploadLogs((prev) => [...prev, `Uploading ${file.name}: ${percent}%`]);
          },
        });
        const text = res?.data?.data?.text || '';
        const structured = res?.data?.data?.structured || null;
        const canonical = res?.data?.data?.canonical || null;
        const warnings = res?.data?.data?.warnings || [];
        results[file.name] = text;
        if (structured) structuredAccumulator[file.name] = structured;
        if (canonical) canonicalAccumulator[file.name] = canonical;
        if (Array.isArray(warnings)) warningsAccumulator[file.name] = warnings;
        setUploadLogs((prev) => [...prev, `Processed ${file.name} (${file.size} bytes)`]);
      }
      if (salesAccumulator.length) {
        setSalesRows(salesAccumulator);
      }
      setOcrTexts(results);
      setOcrStructured(structuredAccumulator);
      setOcrCanonical(canonicalAccumulator);
      setOcrWarnings(warningsAccumulator);
      // Build transactions only for expense (non-sales) mode
      if (!salesMode) {
        const parsed = parseOcrToTransactions(results, structuredAccumulator, canonicalAccumulator).map(t => ({ ...t, autoBook: true }));
        setTransactions(parsed);
      } else {
        setTransactions([]); // clear any prior expense transactions
      }

      // Accumulate KPIs on each successful upload batch
      try {
        const incProcessed = parsed.length;
        const incDocs = Object.keys(results).length;
        const incTx = parsed.length;
        const incTime = incProcessed * 2;
        const incCost = incProcessed * 10;
        // Backend accumulate
        fetch('/api/ai/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'accumulate',
            processed: incProcessed,
            docsCount: incDocs,
            txCount: incTx,
            timeSavedMinutes: incTime,
            costSavings: incCost,
          }),
        }).catch(() => {});

        // Local accumulate for immediate UX
        try {
          const raw = window.localStorage.getItem('aiBookkeeperStats');
          const current = raw ? JSON.parse(raw) : {};
          const updated = {
            ...current,
            processed: (Number(current?.processed) || 0) + incProcessed,
            docsCount: (Number(current?.docsCount) || 0) + incDocs,
            txCount: (Number(current?.txCount) || 0) + incTx,
            timeSavedMinutes: (Number(current?.timeSavedMinutes) || 0) + incTime,
            costSavings: (Number(current?.costSavings) || 0) + incCost,
            updatedAt: Date.now(),
          };
          window.localStorage.setItem('aiBookkeeperStats', JSON.stringify(updated));
        } catch (_) { /* ignore */ }
      } catch (_) { /* ignore */ }
      // Mark only Step 0 complete and go to AI Recognition (Step 1)
  const newCompleted = { ...completed, 0: true };
      setCompleted(newCompleted);
      setActiveStep(1);
    } catch (err) {
      setUploadLogs((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      setProcessing(false);
    }
  };

  const renderStepContent = (step, stepIndex) => {
    if (!step || !step.content) {
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Step not found
          </Typography>
        </Box>
      );
    }

    const { content } = step;
    
    switch (stepIndex) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            
            <Stack spacing={3}>
              <Alert severity="info">
                Supported formats: JPG, PNG, PDF, Excel (.xlsx), CSV
              </Alert>
              
              {/* File Upload Dropzone */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Upload Files:
                </Typography>
                <Upload
                  multiple
                  value={uploadedFiles}
                  onDrop={handleDropFiles}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  onUpload={handleUploadFiles}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png'],
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'text/csv': ['.csv'],
                  }}
                  helperText="Drop files here or click to browse. Supported: JPG, PNG, PDF, Excel, CSV"
                />

                {uploadLogs.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Status</Typography>
                    <Stack spacing={1}>
                      {uploadLogs.map((l, i) => (
                        <Alert key={i} severity={l.startsWith('Error') ? 'error' : 'info'}>{l}</Alert>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              
              {/* Connected Platforms */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Connected Platforms:
                </Typography>
                <Stack direction="row" spacing={1}>
                  {content.mockData.platforms.map((platform) => (
                    <Chip key={platform} label={platform} variant="outlined" />
                  ))}
                </Stack>
              </Box>

              {/* Sample Files (for demo) */}
              {uploadedFiles.length === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Sample Files (Demo):
                  </Typography>
                  <Stack spacing={1}>
                    {content.mockData.files.map((file, index) => (
                      <Card key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Iconify icon="eva:file-fill" width={20} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {file.type} • {file.size}
                            </Typography>
                          </Box>
                          <Chip label="Sample" color="info" size="small" />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            <Alert severity="info">Proceed to Step 2 to view the converted OCR text.</Alert>

          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {salesMode ? 'Sales Preview (User Confirmation)' : 'Invoice Preview (User Confirmation)'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {salesMode
                ? 'Review normalized sales data extracted from your spreadsheet. Mapping applied. Click Next to proceed to Data Transfer.'
                : 'Review the structured invoice extraction. You will edit and categorize in the Data Transfer step.'}
            </Typography>
            {salesMode && (
              <Card sx={{ p:2, mb:3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Sales Summary</Typography>
                {salesRows.length === 0 && <Alert severity="info">No sales rows detected.</Alert>}
                {salesRows.length > 0 && (
                  <TableContainer component={Paper} sx={{ maxHeight: 460 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Platform</TableCell>
                          <TableCell>Order ID</TableCell>
                          <TableCell align="right">Total Revenue</TableCell>
                          <TableCell align="right">Fees & Charges</TableCell>
                          <TableCell align="right">Withholding Tax</TableCell>
                          <TableCell align="right">Cash Received</TableCell>
                          <TableCell>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {salesRows.map((r, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{r.date}</TableCell>
                            <TableCell>{r.platform}</TableCell>
                            <TableCell>{r.order_id || r.orderId || ''}</TableCell>
                            <TableCell align="right">{Number(r.total_revenue||0).toLocaleString()}</TableCell>
                            <TableCell align="right">{Number(r.fees||0).toLocaleString()}</TableCell>
                            <TableCell align="right">{Number(r.withholding_tax||0).toLocaleString()}</TableCell>
                            <TableCell align="right">{Number(r.cash_received||0).toLocaleString()}</TableCell>
                            <TableCell>{`To record sales for the day – ${r.platform}`}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {/* Field Mapping Rules */}
                <Box sx={{ mt:3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>📌 Field Mapping Rules</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p:2, height: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight:600, mb:1 }}>🟣 TikTok</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontSize:12, fontWeight:600 }}>Excel Column</TableCell>
                              <TableCell sx={{ fontSize:12, fontWeight:600 }}>Normalized Field</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Total Revenue</TableCell><TableCell sx={{ fontSize:12 }}>Total Revenue</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Total Fees</TableCell><TableCell sx={{ fontSize:12 }}>Fees & Charges</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Adjustment Amount (Withholding)</TableCell><TableCell sx={{ fontSize:12 }}>Withholding Tax</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Total Settlement Amount</TableCell><TableCell sx={{ fontSize:12 }}>Cash Received</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p:2, height: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight:600, mb:1 }}>🟠 Shopee</Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontSize:12, fontWeight:600 }}>Excel Column</TableCell>
                              <TableCell sx={{ fontSize:12, fontWeight:600 }}>Normalized Field</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Original Price (Purple)</TableCell><TableCell sx={{ fontSize:12 }}>Total Revenue</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Platform Fees (Blue)</TableCell><TableCell sx={{ fontSize:12 }}>Fees & Charges</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Withholding Tax (Orange)</TableCell><TableCell sx={{ fontSize:12 }}>Withholding Tax</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontSize:12 }}>Total Released Amount (Green)</TableCell><TableCell sx={{ fontSize:12 }}>Cash Received</TableCell></TableRow>
                          </TableBody>
                        </Table>
                      </Card>
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt:2 }}>
                    Mapping applied automatically during ingestion. Proceed to Data Transfer to post entries.
                  </Alert>
                </Box>
              </Card>
            )}
            {!salesMode && Object.keys(ocrTexts || {}).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Structured Invoice Preview</Typography>
                <Stack spacing={2}>
                  {Object.entries(ocrTexts).map(([name, raw]) => {
                    const s = ocrStructured?.[name] || {};
                    const c = ocrCanonical?.[name] || null;
                    const cFields = c?.fields || {};
                    const cAmts = c?.amounts || {};
                    const warns = ocrWarnings?.[name] || [];
                    const na = (v) => (v === undefined || v === null || v === '' ? '[N/A]' : v);
                    const currency = cFields.currency || s.currency || '₱';
                    const fmtAmt = (v) => (v === 0 || (v != null && v !== '' && !Number.isNaN(Number(v))))
                      ? `${currency}${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '[N/A]';
                    const pad = (v = '', w = 10) => String(v || '').padEnd(w).slice(0, w);
                    const rpad = (v = '', w = 10) => String(v || '').padStart(w).slice(-w);
                    const hdr = `${pad('Product',60)}  ${rpad('Qty',5)}  ${rpad('Price',14)}`;
                    const items = Array.isArray(c?.order_details) && c.order_details.length ? c.order_details : (Array.isArray(s.items) ? s.items : []);
                    const itemsText = Array.isArray(items) && items.length ? [hdr,'-'.repeat(hdr.length),...items.map(it => {
                      const prod = (it.product || '').replace(/\s+/g,' ');
                      const qty = (it.qty != null) ? String(it.qty) : '';
                      const price = (it.productPrice != null) ? Number(it.productPrice) : '';
                      const priceStr = typeof price === 'number' ? Number(price).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) : '';
                      return `${pad(prod,60)}  ${rpad(qty,5)}  ${rpad(priceStr,14)}`;
                    })].join('\n') : '[N/A]';
                    return (
                      <Card key={name} sx={{ p:2, bgcolor:'grey.50' }}>
                        <Typography variant="body2" sx={{ fontWeight:600, mb:1 }}>{name}</Typography>
                        {Array.isArray(warns) && warns.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mb:1, flexWrap:'wrap' }}>
                            {warns.map((w,i) => <Chip key={i} size="small" color="warning" variant="outlined" label={String(w).slice(0,80)} />)}
                          </Stack>
                        )}
                        {/* Summary indicators: Source, Confidence, Grand Total */}
                        {(() => {
                          const sourceLabel = c ? 'Canonical' : 'OCR Structured';
                          const overallConfidence = c?.confidence ?? cFields?.confidence ?? s?.confidence ?? null;
                          const grandTotalRaw = cAmts?.grandTotal ?? s?.total ?? cAmts?.total;
                          const grandTotalFmt = grandTotalRaw != null && grandTotalRaw !== '' && !Number.isNaN(Number(grandTotalRaw))
                            ? fmtAmt(grandTotalRaw)
                            : '[N/A]';
                          let confColor = 'default';
                          if (overallConfidence != null) {
                            if (overallConfidence >= 90) confColor = 'success';
                            else if (overallConfidence >= 75) confColor = 'warning';
                            else confColor = 'error';
                          }
                          return (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:1, flexWrap:'wrap' }}>
                              <Chip size="small" variant="outlined" color="info" label={`Source: ${sourceLabel}`} />
                              <Chip size="small" variant="outlined" color={confColor} label={`Confidence: ${overallConfidence != null ? `${overallConfidence  }%` : 'N/A'}`} />
                              <Chip size="small" variant="filled" color="primary" label={`Grand Total: ${grandTotalFmt}`} />
                            </Stack>
                          );
                        })()}
                        <Box sx={{ fontFamily:'monospace', whiteSpace:'pre-wrap', fontSize:'0.72rem', lineHeight:1.4 }}>
{`Seller Name: ${na(cFields.sellerName || s.supplier)}
Seller Address: ${na(cFields.sellerAddress || s.sellerAddress)}

Buyer Name: ${na(cFields.buyerName || s.buyerName)}
Buyer Address: ${na(cFields.buyerAddress || s.buyerAddress)}

Order Summary
Order Summary No.: ${na(cFields.orderSummaryNo || s.orderSummaryNo)}
Date Issued: ${na(cFields.dateIssued || s.dateIssued)}
Order ID: ${na(cFields.orderId || s.orderId)}
Order Paid Date: ${na(cFields.orderPaidDate || s.orderPaidDate)}
Payment Method: ${na(cFields.paymentMethod || s.paymentMethod)}

Order Details
${itemsText}

Merchandise Subtotal: ${fmtAmt(cAmts.merchandiseSubtotal ?? s.merchandiseSubtotal)}
Shipping Fee: ${fmtAmt(cAmts.shippingFee ?? s.shippingFee)}
Shipping Discount: ${fmtAmt(cAmts.shippingDiscount ?? s.shippingDiscount)}
Total Platform Voucher Applied: ${fmtAmt(cAmts.platformVoucher ?? s.platformVoucher)}
Grand Total: ${fmtAmt(cAmts.grandTotal ?? s.total)}`}
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
            {/* Invoice edit area removed from Step 3 per requirement (editing now only in Step 4) */}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb:2 }}>Data Transfer</Typography>
            <Typography variant="body2" sx={{ color:'text.secondary', mb:3 }}>
              {salesMode ? 'Transfer sales transactions to the books (Journal + Cash Receipt).' : 'Transfer confirmed transactions to the appropriate books.'}
            </Typography>
            {salesMode && (
              <Card sx={{ p:2, mb:3 }}>
                <Typography variant="subtitle2" sx={{ mb:1 }}>Sales Transactions</Typography>
                <Stack spacing={1}>
                  {salesRows.length === 0 && <Alert severity="info">No sales rows detected.</Alert>}
                  {salesRows.map((r, idx) => (
                    <Stack key={idx} direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex:1, minWidth:0 }}>
                        <Typography variant="body2" noWrap title={r.order_id || r.orderId || ''} sx={{ fontWeight:600 }}>{r.platform} Order {r.order_id || r.orderId || '(no id)'} – {r.date}</Typography>
                        <Typography variant="caption" sx={{ color:'text.secondary' }}>₱{Number(r.total_revenue||0).toLocaleString()} • Fees {Number(r.fees||0).toLocaleString()} • Tax {Number(r.withholding_tax||0).toLocaleString()} • Cash {Number(r.cash_received||0).toLocaleString()}</Typography>
                      </Box>
                      <TextField size="small" label="Book" value="Cash Receipt Journal" disabled sx={{ width:200 }} />
                      <Chip size="small" color="info" label="Auto" />
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}
            {/* For invoice mode, only transfer actions now (preview moved to Step 3) */}
            {/* Existing transaction confirmation UI retained for expense mode */}
            {!salesMode && (
              <>
                {/* Editing moved here from Step 3 for invoices */}
                {transactions.length > 0 && (
                  <Card sx={{ p:2, mb:3 }}>
                    <Typography variant="subtitle2" sx={{ mb:1 }}>Detected Transactions (Editable)</Typography>
                    <Stack spacing={1}>
                      {transactions.map(t => (
                        <Stack key={t.id} direction="row" spacing={2} alignItems="center">
                          <Box sx={{ flex:1, minWidth:0 }}>
                            <Typography variant="body2" noWrap title={t.description} sx={{ fontWeight:600 }}>{t.description}</Typography>
                            <Typography variant="caption" sx={{ color:'text.secondary' }}>₱{Number(t.amount||0).toLocaleString()} • {t.aiCategory}</Typography>
                          </Box>
                          <FormControlLabel control={<Switch size="small" checked={!!t.autoBook} onChange={(e)=> setTransactions(prev=> prev.map(x=> x.id===t.id?{...x, autoBook:e.target.checked}:x))} />} label="Auto" />
                          <TextField select size="small" label="Book" value={t.autoBook ? inferBookFromCategory(t.aiCategory) : (t.book || inferBookFromCategory(t.aiCategory))} onChange={(e)=> setTransactions(prev=> prev.map(x=> x.id===t.id?{...x, book:e.target.value, autoBook:false}:x))} sx={{ minWidth:220 }} disabled={!!t.autoBook}>
                            {BOOK_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                          </TextField>
                          <Button size="small" startIcon={<Iconify icon="eva:edit-fill" />} onClick={()=> handleEditTransaction(t)}>Edit</Button>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                )}
                {(!transactions || transactions.length === 0) ? (
                  <Alert severity="info">No transactions detected. Upload files in Step 0 and proceed.</Alert>
                ) : (
                  <Card sx={{ p: 2, mb: 3 }}>
                    <Stack spacing={1}>
                      {transactions.map((t) => (
                        <Stack key={t.id} direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap title={t.description} sx={{ fontWeight: 600 }}>{t.description}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>₱{Number(t.amount || 0).toLocaleString()} • {t.aiCategory}</Typography>
                          </Box>
                          {t.fileUrl ? (
                            <Button size="small" color="info" component="a" href={t.fileUrl} target="_blank" rel="noopener noreferrer" startIcon={<Iconify icon="eva:external-link-fill" />}>View invoice</Button>
                          ) : (
                            <Button size="small" disabled startIcon={<Iconify icon="eva:external-link-fill" />}>View invoice</Button>
                          )}
                          <FormControlLabel control={<Switch size="small" checked={!!t.autoBook} onChange={(e) => setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, autoBook: e.target.checked } : x))} />} label="Auto" />
                          <TextField select size="small" label="Book" value={t.autoBook ? inferBookFromCategory(t.aiCategory) : (t.book || inferBookFromCategory(t.aiCategory))} onChange={(e) => setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, book: e.target.value, autoBook: false } : x))} sx={{ minWidth: 240 }} disabled={!!t.autoBook}>
                            {BOOK_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                          </TextField>
                          <Button size="small" startIcon={<Iconify icon="eva:edit-fill" />} onClick={() => handleEditTransaction(t)}>Edit</Button>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                )}
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Transfer Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{transferState.transferred}/{transferState.total} completed</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={transferState.total ? Math.min(100, Math.round((transferState.transferred / transferState.total) * 100)) : 0} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Stack direction="row" justifyContent="flex-end">
                  <Button variant="contained" disabled={processing || !transactions?.length} onClick={handleTransfer} startIcon={<Iconify icon="eva:arrow-forward-fill" />}>{processing ? 'Transferring...' : 'Start Transfer'}</Button>
                </Stack>
                {transferState.transferred === transferState.total && transferState.total > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>All transactions have been successfully transferred.</Typography>
                      {lastTransferBooks && lastTransferBooks.total > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {Object.entries(lastTransferBooks.counts).map(([book, count]) => {
                            const routeMap = { 'cash-receipts': '/dashboard/bookkeeping/cash-receipt', 'cash-disbursements': '/dashboard/bookkeeping/cash-disbursement', 'journal': '/dashboard/bookkeeping/general-journal', 'ledger': '/dashboard/bookkeeping/general-ledger', };
                            const labelMap = { 'cash-receipts': 'View Cash Receipt Journal', 'cash-disbursements': 'View Cash Disbursement Book', 'journal': 'View General Journal', 'ledger': 'View General Ledger', };
                            const dest = routeMap[book] || '/dashboard/bookkeeping/general-journal';
                            const label = labelMap[book] || 'View Journal';
                            return (<Button key={book} size="small" variant="outlined" onClick={() => router.push(dest)}>{label} ({count})</Button>);
                          })}
                        </Stack>
                      )}
                    </Box>
                  </Alert>
                )}
              </>
            )}
            {salesMode && salesRows.length > 0 && (
              <>
                <Box sx={{ mb: 3, mt: salesRows.length ? 0 : 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Transfer Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{salesTransfer.transferred}/{salesTransfer.total} completed</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={salesTransfer.total ? Math.min(100, Math.round((salesTransfer.transferred / salesTransfer.total) * 100)) : 0} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button variant="contained" disabled={salesPosting || !salesRows.length} onClick={handleSalesTransfer} startIcon={<Iconify icon="eva:arrow-forward-fill" />}>{salesPosting ? 'Posting...' : salesPosted ? 'Repost' : 'Start Transfer'}</Button>
                  {salesPosted && <Button variant="outlined" onClick={() => router.push('/dashboard/bookkeeping/general-journal')} startIcon={<Iconify icon="eva:book-open-fill" />}>Go to Journal</Button>}
                </Stack>
                {salesPostLog.length > 0 && (
                  <Box sx={{ mt:2, maxHeight: 200, overflow:'auto', p:1, bgcolor:'grey.100', borderRadius:1, fontFamily:'monospace', fontSize:'0.72rem' }}>
                    {salesPostLog.map((l,i) => <div key={i}>{l}</div>)}
                  </Box>
                )}
                {salesPosted && salesTransfer.errors === 0 && (
                  <Alert severity="success" sx={{ mt:2 }}>Sales successfully posted.</Alert>
                )}
              </>
            )}
          </Box>
  );

      case 3:
  return null; // unreachable duplicate case removed

      default:
        return null;
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Bookkeeping Process
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / AI Bookkeeper / Upload Process
      </Typography>

      {/* Progress Overview */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Process Progress
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Step {activeStep + 1} of {totalSteps} • {completedSteps} completed
            </Typography>
          </Box>
          <Chip 
            label={`${Math.round((completedSteps / totalSteps) * 100)}% Complete`} 
            color="primary" 
            variant="filled"
          />
        </Stack>
      </Card>

      {/* Stepper */}
      <Card sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 4 }}>
          {renderStepContent(steps[activeStep], activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back
          </Button>
          
          <Box>
            {allStepsCompleted ? (
              <Button
                variant="contained"
                onClick={handleReset}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Start Over
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={processing}
                startIcon={processing ? <Iconify icon="eva:loader-fill" /> : <Iconify icon="eva:arrow-forward-fill" />}
              >
                {processing ? 'Processing...' : activeStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialog.open} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction Categorization</DialogTitle>
        <DialogContent>
          {editDialog.transaction && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  value={editDialog.transaction.description}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, description: e.target.value }
                  }))}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={editDialog.transaction.amount}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, amount: parseFloat(e.target.value) || 0 }
                  }))}
                  InputProps={{
                    startAdornment: <Typography variant="body2">₱</Typography>,
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Category
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={editDialog.transaction.aiCategory}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, aiCategory: e.target.value }
                  }))}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
                {(() => {
                  const m = mapExpenseCategoryToCoa(editDialog.transaction.aiCategory);
                  if (!m) return null;
                  return (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                      COA: {m.code} • {m.label}
                    </Typography>
                  );
                })()}
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Confidence Level
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={editDialog.transaction.confidence}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, confidence: parseInt(e.target.value) || 0 }
                  }))}
                  InputProps={{
                    endAdornment: <Typography variant="body2">%</Typography>,
                  }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
} 