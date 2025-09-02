'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'src/utils/axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';

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
  'Online Sales Revenue',
  'Walk-in Sales',
  'Cost of Goods Sold',
  'Marketing Expenses',
  'Operating Expenses',
  'Platform Fees',
  'Rent Expense',
  'Utilities',
  'Insurance',
  'Office Supplies',
  'Equipment',
  'Advertising',
  'Travel Expenses',
  'Professional Fees',
  'Other Income',
  'Other Expenses'
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
        // Journal entry composition
        let journalEntries;
        if (cls === 'expense') {
          journalEntries = [
            { account: t.aiCategory || 'Expense', description: t.description, type: 'debit', amount: amt },
            { account: 'Cash', description: t.description, type: 'credit', amount: amt },
          ];
        } else if (cls === 'income') {
          journalEntries = [
            { account: 'Cash', description: t.description, type: 'debit', amount: amt },
            { account: t.aiCategory || 'Revenue', description: t.description, type: 'credit', amount: amt },
          ];
        } else { // other/unknown -> default to expense style for now
          journalEntries = [
            { account: t.aiCategory || 'Other', description: t.description, type: 'debit', amount: amt },
            { account: 'Cash', description: t.description, type: 'credit', amount: amt },
          ];
        }
        await axios.post('/api/bookkeeping/journal', {
          date: new Date().toISOString().slice(0, 10),
          ref: '',
          entries: journalEntries,
        });
        counts.journal += 1;

        if (cls === 'expense') {
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
          await axios.post('/api/bookkeeping/cash-disbursements', {
            date: new Date().toISOString().slice(0, 10),
            checkNo: ref,
            payee: 'N/A',
            description: t.description,
            amount: amt,
            account: t.aiCategory,
          });
          counts['cash-disbursements'] += 1;
        } else if (cls === 'income') {
          await axios.post('/api/bookkeeping/cash-receipts', {
            date: new Date().toISOString().slice(0, 10),
            invoiceNumber: '',
            description: t.description,
            netSales: amt,
            feesAndCharges: 0,
            cash: amt,
            withholdingTax: 0,
            ownersCapital: 0,
            loansPayable: 0,
          });
          counts['cash-receipts'] += 1;
        }
        setTransferState(prev => ({ ...prev, transferred: prev.transferred + 1, categories: Array.from(categoriesSet) }));
      }
      const newCompleted = { ...completed, 2: true };
      setCompleted(newCompleted);
      setActiveStep(3);
      setLastTransferBooks({ counts, total: items.length });
      // Navigate to journal as the primary book for review
      setTimeout(() => router.push('/dashboard/bookkeeping/general-journal'), 300);
    } catch (err) {
      console.error('Transfer error:', err);
    } finally {
      setProcessing(false);
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
        const description = (descParts.join(' - ') || 'Document Total') + ` (${filename})`;
        txns.push({
          id: id++,
          description,
          amount: grandTotal,
          aiCategory: 'Operating Expenses',
          confidence: 90,
          suggested: true,
          structuredSource: !!structured,
          canonicalSource: !!canonical,
          sourceFile: filename,
          invoiceNumber: inv || '',
          orderSummaryNo: cFields.orderSummaryNo || structured.orderSummaryNo || '',
          orderId: cFields.orderId || structured.orderId || '',
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
        const aiCategory = hint ? hint.c : 'Operating Expenses';
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
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file, file.name);
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
      setOcrTexts(results);
      setOcrStructured(structuredAccumulator);
      setOcrCanonical(canonicalAccumulator);
      setOcrWarnings(warningsAccumulator);
      // Build transactions from OCR text
      const parsed = parseOcrToTransactions(results, structuredAccumulator, canonicalAccumulator).map(t => ({ ...t, autoBook: true }));
      setTransactions(parsed);

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
              AI Recognition
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Converted text from your documents.
            </Typography>

            {/* Structured OCR Text Preview */}
            {Object.keys(ocrTexts || {}).length > 0 && (
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
                    // Simplified order details: Product | Qty | Price (unit)
                    const pad = (v = '', w = 10) => String(v || '').padEnd(w).slice(0, w);
                    const rpad = (v = '', w = 10) => String(v || '').padStart(w).slice(-w);
                    const hdr = `${pad('Product',60)}  ${rpad('Qty',5)}  ${rpad('Price',14)}`;
                    // Prefer canonical items (order_details) then fallback to structured items
                    const items = Array.isArray(c?.order_details) && c.order_details.length
                      ? c.order_details
                      : (Array.isArray(s.items) ? s.items : []);
                    const itemsText = Array.isArray(items) && items.length
                      ? [
                          hdr,
                          '-'.repeat(hdr.length),
                          ...items.map((it) => {
                            const prod = (it.product || '').replace(/\s+/g, ' ');
                            const qty = (it.qty != null) ? String(it.qty) : '';
                            const price = (it.productPrice != null) ? Number(it.productPrice) : '';
                            const priceStr = typeof price === 'number' ? Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
                            return `${pad(prod,60)}  ${rpad(qty,5)}  ${rpad(priceStr,14)}`;
                          })
                        ].join('\n')
                      : '[N/A]';
                    return (
                      <Card key={name} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{name}</Typography>
                        {Array.isArray(warns) && warns.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                            {warns.map((w, idx) => (
                              <Chip key={idx} size="small" color="warning" variant="outlined" label={String(w).slice(0, 80)} />
                            ))}
                          </Stack>
                        )}
                        <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.72rem', lineHeight: 1.4 }}>
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
Grand Total: ${fmtAmt(cAmts.grandTotal ?? s.total)}
`}
                        </Box>
                        {/* Grand Total Indicators */}
                        {(() => {
                          const gtDetectedBold = (cFields.grandTotalDetectedByBold ?? s.grandTotalDetectedByBold);
                          const gtSource = (cFields.grandTotalSource ?? s.grandTotalSource);
                          const gtConf = (typeof (cFields.grandTotalConfidence ?? s.grandTotalConfidence) === 'number')
                            ? Number(cFields.grandTotalConfidence ?? s.grandTotalConfidence)
                            : null;
                          const gtVerified = (cFields.grandTotalVerifiedByBreakdown ?? s.grandTotalVerifiedByBreakdown);
                          const gtDelta = (typeof (cFields.grandTotalVerifiedDelta ?? s.grandTotalVerifiedDelta) === 'number')
                            ? Number(cFields.grandTotalVerifiedDelta ?? s.grandTotalVerifiedDelta)
                            : null;
                          const gtBoldText = (cFields.grandTotalBoldText ?? s.grandTotalBoldText) || '';
                          const cur = currency;
                          const prettyDelta = (d) => `${cur}${Math.abs(Number(d) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          if (
                            gtDetectedBold == null && gtSource == null && gtConf == null && gtVerified == null && gtDelta == null
                          ) return null;
                          return (
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              {gtVerified === true && (
                                <Chip size="small" color="success" label="Grand total verified" icon={<Iconify icon="eva:checkmark-circle-2-fill" />} />
                              )}
                              {gtVerified === false && (
                                <Chip size="small" color="warning" label={`Grand total mismatch Δ ${prettyDelta(gtDelta)}`} icon={<Iconify icon="eva:alert-triangle-fill" />} />
                              )}
                              {gtVerified == null && (
                                <Chip size="small" color="default" label="Verification unavailable" />
                              )}
                              {gtDetectedBold === true && (
                                gtBoldText ? (
                                  <Tooltip title={<Box sx={{ maxWidth: 420, whiteSpace: 'pre-wrap' }}>{gtBoldText}</Box>}>
                                    <Chip size="small" color="info" label="Detected from bold text" />
                                  </Tooltip>
                                ) : (
                                  <Chip size="small" color="info" label="Detected from bold text" />
                                )
                              )}
                              {gtSource && (
                                <Chip size="small" variant="outlined" label={`Source: ${gtSource}`} />
                              )}
                              {typeof gtConf === 'number' && (
                                <Chip size="small" variant="outlined" label={`Confidence: ${Math.round(gtConf * 100)}%`} />
                              )}
                            </Stack>
                          );
                        })()}
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.6 }}>
                          Raw OCR snippet: {raw ? String(raw).slice(0, 140) : '(no text)'}{raw && String(raw).length > 140 ? '…' : ''}
                        </Typography>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Review & Confirm
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Verify each detected transaction. Auto routing is enabled by default; toggle off to override the Book. Then start transfer.
            </Typography>

            {(!transactions || transactions.length === 0) ? (
              <Alert severity="info">No transactions detected. Upload files in Step 0 and proceed.</Alert>
            ) : (
              <Card sx={{ p: 2, mb: 3 }}>
                <Stack spacing={1}>
                  {transactions.map((t) => (
                    <Stack key={t.id} direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap title={t.description} sx={{ fontWeight: 600 }}>
                          {t.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          ₱{Number(t.amount || 0).toLocaleString()} • {t.aiCategory}
                        </Typography>
                      </Box>
                      {t.fileUrl ? (
                        <Button
                          size="small"
                          color="info"
                          component="a"
                          href={t.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Iconify icon="eva:external-link-fill" />}
                        >
                          View invoice
                        </Button>
                      ) : (
                        <Button size="small" disabled startIcon={<Iconify icon="eva:external-link-fill" />}>View invoice</Button>
                      )}
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={!!t.autoBook}
                            onChange={(e) => setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, autoBook: e.target.checked } : x))}
                          />
                        }
                        label="Auto"
                      />
                      <TextField
                        select
                        size="small"
                        label="Book"
                        value={t.autoBook ? inferBookFromCategory(t.aiCategory) : (t.book || inferBookFromCategory(t.aiCategory))}
                        onChange={(e) => setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, book: e.target.value, autoBook: false } : x))}
                        sx={{ minWidth: 240 }}
                        disabled={!!t.autoBook}
                      >
                        {BOOK_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
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
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {transferState.transferred}/{transferState.total} completed
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={transferState.total ? Math.min(100, Math.round((transferState.transferred / transferState.total) * 100)) : 0}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" disabled={processing || !transactions?.length} onClick={handleTransfer} startIcon={<Iconify icon="eva:arrow-forward-fill" />}>
                {processing ? 'Transferring...' : 'Start Transfer'}
              </Button>
            </Stack>

            {transferState.transferred === transferState.total && transferState.total > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    All transactions have been successfully transferred.
                  </Typography>
                  {/* Quick links to affected books */}
                  {lastTransferBooks && lastTransferBooks.total > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {Object.entries(lastTransferBooks.counts).map(([book, count]) => {
                        const routeMap = {
                          'cash-receipts': '/dashboard/bookkeeping/cash-receipt',
                          'cash-disbursements': '/dashboard/bookkeeping/cash-disbursement',
                          'journal': '/dashboard/bookkeeping/general-journal',
                          'ledger': '/dashboard/bookkeeping/general-ledger',
                        };
                        const labelMap = {
                          'cash-receipts': 'View Cash Receipt Journal',
                          'cash-disbursements': 'View Cash Disbursement Book',
                          'journal': 'View General Journal',
                          'ledger': 'View General Ledger',
                        };
                        const dest = routeMap[book] || '/dashboard/bookkeeping/general-journal';
                        const label = labelMap[book] || 'View Journal';
                        return (
                          <Button key={book} size="small" variant="outlined" onClick={() => router.push(dest)}>
                            {label} ({count})
                          </Button>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Alert>
            )}
          </Box>
        );

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