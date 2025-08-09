'use client';

import { useState, useEffect } from 'react';
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

function inferBookFromCategory(category = '') {
  const c = String(category).toLowerCase();
  const incomeLike = ['online sales', 'walk-in sales', 'sales', 'revenue', 'other income'];
  const expenseLike = ['expense', 'expenses', 'utilities', 'rent', 'insurance', 'office supplies', 'advertising', 'marketing', 'travel', 'professional fees', 'platform fees', 'cost of goods sold'];
  if (incomeLike.some(k => c.includes(k))) return 'cash-receipts';
  if (expenseLike.some(k => c.includes(k))) return 'cash-disbursements';
  return 'journal';
}

export default function UploadProcessPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeping Process | Kitsch Studio';
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, transaction: null });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [ocrTexts, setOcrTexts] = useState({}); // { filename: text }
  const [transferState, setTransferState] = useState({ transferred: 0, total: 0, categories: [] });
  const [step3Initialized, setStep3Initialized] = useState(false);

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
    const items = transactions.map(t => {
      const inferred = inferBookFromCategory(t.aiCategory);
      const book = t.autoBook ? inferred : (t.book || inferred);
      return { ...t, book };
    });
    setProcessing(true);
    setTransferState({ transferred: 0, total: items.length, categories: [] });
    const categoriesSet = new Set();
    try {
      for (let i = 0; i < items.length; i++) {
        const t = items[i];
        categoriesSet.add(t.aiCategory);
        // Minimal mapping per book
        if (t.book === 'cash-receipts') {
          await axios.post('/api/bookkeeping/cash-receipts', {
            date: new Date().toISOString().slice(0, 10),
            invoiceNumber: '',
            description: t.description,
            netSales: Number(t.amount) || 0,
            feesAndCharges: 0,
            cash: Number(t.amount) || 0,
            withholdingTax: 0,
            ownersCapital: 0,
            loansPayable: 0,
          });
        } else if (t.book === 'cash-disbursements') {
          await axios.post('/api/bookkeeping/cash-disbursements', {
            date: new Date().toISOString().slice(0, 10),
            checkNo: '',
            payee: 'N/A',
            description: t.description,
            amount: Number(t.amount) || 0,
            account: t.aiCategory,
          });
        } else if (t.book === 'ledger') {
          // Post a simple ledger line; type based on sign (non-negative -> debit)
          await axios.post('/api/bookkeeping/ledger', {
            date: new Date().toISOString().slice(0, 10),
            account: t.aiCategory || 'Uncategorized',
            description: t.description,
            type: (Number(t.amount) || 0) >= 0 ? 'debit' : 'credit',
            amount: Math.abs(Number(t.amount) || 0),
          });
        } else {
          // Default to general journal with a placeholder balancing entry
          const amt = Math.abs(Number(t.amount) || 0);
          const isExpense = inferBookFromCategory(t.aiCategory) === 'cash-disbursements';
          const entries = isExpense
            ? [
                { account: t.aiCategory || 'Expense', description: t.description, type: 'debit', amount: amt },
                { account: 'Cash', description: t.description, type: 'credit', amount: amt },
              ]
            : [
                { account: 'Cash', description: t.description, type: 'debit', amount: amt },
                { account: t.aiCategory || 'Revenue', description: t.description, type: 'credit', amount: amt },
              ];
          await axios.post('/api/bookkeeping/journal', {
            date: new Date().toISOString().slice(0, 10),
            ref: '',
            entries,
          });
        }
        setTransferState(prev => ({ ...prev, transferred: prev.transferred + 1, categories: Array.from(categoriesSet) }));
      }
      // Mark step complete and advance to Data Transfer step
      const newCompleted = { ...completed, 2: true };
      setCompleted(newCompleted);
      setActiveStep(3);
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
  const parseOcrToTransactions = (textsByFile) => {
    const txns = [];
    let id = 1;
    const amountRe = /(₱|php)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)/i;
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
        const desc = (lines[i - 1] && !amountRe.test(lines[i - 1]) ? lines[i - 1] : lines[i])
          .slice(0, 140);
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
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file, file.name);
        const res = await axios.post('/api/ai/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            const percent = Math.round((evt.loaded * 100) / (evt.total || 1));
            setUploadLogs((prev) => [...prev, `Uploading ${file.name}: ${percent}%`]);
          },
        });
        const text = res?.data?.data?.text || '';
        results[file.name] = text;
        setUploadLogs((prev) => [...prev, `Processed ${file.name} (${file.size} bytes)`]);
      }
      setOcrTexts(results);
      // Build transactions from OCR text
      const parsed = parseOcrToTransactions(results).map(t => ({ ...t, autoBook: true }));
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

            {/* Converted OCR Text Preview */}
            {Object.keys(ocrTexts || {}).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Converted Text</Typography>
                <Stack spacing={2}>
                  {Object.entries(ocrTexts).map(([name, text]) => (
                    <Card key={name} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{name}</Typography>
                      <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                        {text ? String(text).slice(0, 1000) : '(no text found)'}{text && String(text).length > 1000 ? '…' : ''}
                      </Typography>
                    </Card>
                  ))}
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
                All transactions have been successfully transferred.
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