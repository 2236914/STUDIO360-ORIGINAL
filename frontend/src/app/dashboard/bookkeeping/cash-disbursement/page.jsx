'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'src/utils/axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';

// ----------------------------------------------------------------------

const MOCK_DISBURSEMENT_ENTRIES = [
  {
    id: 1,
    date: 'Aug 15, 2024',
    invoiceNumber: 'SI0876213',
    description: 'DTI Certificate',
    creditCash: 1030,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 1030,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'DTI',
  },
  // ... other mock entries ...
];

// Helper to map a backend disbursement entry to the wide table schema (extended)
function mapDisbursementToRow(d) {
  const base = {
    id: d.id,
    date: d.date,
    invoiceNumber: d.referenceNo || d.checkNo || '',
  description: d.description || d.remarks || '',
    entity: d.payee || '',
    creditCash: Number(d.cashCredit || d.amount || 0),
    creditWithholdingTax: Number(d.withholdingTaxCredit || 0),
    // Extended debit columns
    debitPurchasesMaterials: Number(d.purchasesDebit || 0),
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: Number(d.taxesDebit || 0),
    debitOfficeSupplies: Number(d.suppliesDebit || 0),
    debitInventory: Number(d.inventoryDebit || 0),
    debitSalary: 0,
    debitFreightDelivery: Number(d.deliveryDebit || 0),
    debitAdvertising: Number(d.advertisingDebit || 0),
    debitProfessionalFee: 0,
    debitUtilities: Number(d.utilitiesDebit || 0),
    debitRent: Number(d.rentDebit || 0),
    debitBankLoan: Number(d.bankLoanDebit || 0),
    debitInterestExpense: Number(d.interestExpenseDebit || 0),
    debitOwnersWithdrawal: Number(d.ownersWithdrawalDebit || 0),
    debitMiscellaneous: Number(d.miscDebit || 0),
    remarks: d.remarks || '',
  };
  const acct = (d.account || '').toLowerCase();
  const map = {
    'purchases': 'debitPurchasesMaterials',
    'materials': 'debitPurchasesMaterials',
    equipment: 'debitEquipment',
    'furniture & fixtures': 'debitFurnitureFixtures',
    furniture: 'debitFurnitureFixtures',
    fixtures: 'debitFurnitureFixtures',
    'taxes & licenses': 'debitTaxesLicenses',
    taxes: 'debitTaxesLicenses',
    licenses: 'debitTaxesLicenses',
    'office supplies': 'debitOfficeSupplies',
    supplies: 'debitOfficeSupplies',
    inventory: 'debitInventory',
    salary: 'debitSalary',
    salaries: 'debitSalary',
    payroll: 'debitSalary',
    'freight-out': 'debitFreightDelivery',
    delivery: 'debitFreightDelivery',
    freight: 'debitFreightDelivery',
    advertising: 'debitAdvertising',
    marketing: 'debitAdvertising',
    'professional fee': 'debitProfessionalFee',
    professional: 'debitProfessionalFee',
    utilities: 'debitUtilities',
    rent: 'debitRent',
    'withholding tax': 'creditWithholdingTax',
    'bank loan': 'debitBankLoan',
    loan: 'debitBankLoan',
    'interest expense': 'debitInterestExpense',
    interest: 'debitInterestExpense',
    "owner's withdrawal": 'debitOwnersWithdrawal',
    withdrawal: 'debitOwnersWithdrawal',
    draw: 'debitOwnersWithdrawal',
  miscellaneous: 'debitMiscellaneous',
  misc: 'debitMiscellaneous',
  };
  // find a key contained in account string
  const matched = Object.keys(map).find((k) => acct.includes(k));
  if (matched) {
  base[map[matched]] = Number(d.amount || 0);
  }
  return base;
}

export default function CashDisbursementPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - Cash Disbursement Journal | Kitsch Studio';
  }, []);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [rows, setRows] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  // Import invoice dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null); // { extracted, raw }
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    checkNo: '',
    payee: '',
    description: '',
    amount: '',
    account: '',
  });

  // Horizontal drag-to-scroll support for wide table
  const scrollRef = useRef(null);
  const isDrag = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (clientX) => {
    if (!scrollRef.current) return;
    isDrag.current = true;
    startX.current = clientX;
    startScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    setDragging(true);
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = 'none';
    }
  };
  const onPointerMove = (clientX) => {
    if (!scrollRef.current || !isDrag.current) return;
    const dx = clientX - startX.current;
    scrollRef.current.scrollLeft = startScrollLeft.current - dx;
  };
  const endDrag = () => {
    if (!scrollRef.current) return;
    isDrag.current = false;
    scrollRef.current.style.cursor = 'grab';
    setDragging(false);
    if (typeof document !== 'undefined') {
      document.body.style.userSelect = '';
    }
  };

  const nudgeScroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const dx = 480 * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: dx, behavior: 'smooth' });
  };

  const onWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    // Translate vertical wheel movement into horizontal scroll for wide tables
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      // Prevent the page from scrolling vertically when over the table region
      e.preventDefault?.();
    }
  };

  const ACCEPT = '.pdf,.jpg,.jpeg,.png,.csv,.xlsx';
  const onImportFileChange = (e) => {
    setImportError('');
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = ACCEPT.split(',').some((ext) => f.name.toLowerCase().endsWith(ext.trim()));
    if (!ok) {
      setImportError('Unsupported file type. Allowed: PDF, JPG, PNG, CSV, XLSX');
      setImportFile(null);
      return;
    }
    setImportFile(f);
  };
  const parseInvoice = async () => {
    setImportError('');
    if (!importFile) {
      setImportError('Please choose a file first');
      return;
    }
    setImportLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      // Use AI OCR canonical upload endpoint
      const resp = await fetch(`${BACKEND_URL}/api/ai/upload`, { method: 'POST', body: fd });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || data.error || 'Parse failed');
      }
      // Store the raw response data (includes canonical payload)
      setImportResult(data.data);
    } catch (err) {
      setImportError(err.message || String(err));
    } finally {
      setImportLoading(false);
    }
  };
  const applyImportedToForm = () => {
    const canonical = importResult?.canonical || null;
    const extracted = importResult?.extracted || {};
    const isUnknown = (v) => v === undefined || v === null || v === '' || String(v).toLowerCase() === 'unknown';
    // Prefer canonical amounts first, then legacy extracted
    const amount = (
      canonical?.amounts?.grandTotal ??
      canonical?.paymentBreakdown?.grandTotal ??
      (!isUnknown(extracted.grand_total) ? Number(extracted.grand_total) : undefined) ??
      (!isUnknown(extracted.total) ? Number(extracted.total) : undefined) ??
      (!isUnknown(extracted.subtotal) ? Number(extracted.subtotal) : undefined) ??
      ''
    );
    // Build a lightweight items array for description (prefer canonical)
    const items = Array.isArray(canonical?.orderDetails?.items)
      ? canonical.orderDetails.items.map((i) => ({ name: i?.item_name }))
      : Array.isArray(canonical?.items)
      ? canonical.items.map((i) => ({ name: i?.product }))
      : Array.isArray(extracted.items)
      ? extracted.items
      : [];
    const desc = items.length
      ? `Imported: ${items
          .slice(0, 2)
          .map((i) => i?.name)
          .filter(Boolean)
          .join(', ')}${items.length > 2 ? '…' : ''}`
      : 'Imported from invoice';

    // Helper: normalize a date-like value into YYYY-MM-DD
    const normalizeToYMD = (val) => {
      if (val === undefined || val === null) return '';
      const s = typeof val === 'string' ? val.trim() : val;
      if (s === '') return '';
      const pad = (n) => String(n).padStart(2, '0');
      let d;
      if (typeof s === 'number') {
        // If seconds (10 digits) convert to ms
        const ms = String(Math.floor(s)).length === 10 ? s * 1000 : s;
        d = new Date(ms);
      } else if (typeof s === 'string') {
        // Try direct parse (ISO, RFC, etc.)
        const direct = new Date(s);
        if (!Number.isNaN(direct.getTime())) d = direct;
        if (!d) {
          // Try YYYY[/-.]MM[/-.]DD
          let m = s.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
          if (m) {
            const y = parseInt(m[1], 10);
            const month = parseInt(m[2], 10);
            const day = parseInt(m[3], 10);
            d = new Date(y, month - 1, day);
          }
          if (!d) {
            // Try DD[/-.]MM[/-.]YYYY or MM[/-.]DD[/-.]YYYY (disambiguate via >12 rule)
            m = s.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
            if (m) {
              const a = parseInt(m[1], 10);
              const b = parseInt(m[2], 10);
              const y = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
              const dayFirst = a > 12;
              const month = dayFirst ? b : a;
              const day = dayFirst ? a : b;
              d = new Date(y, month - 1, day);
            }
          }
          if (!d) {
            // Try formats like '15 Aug 2024' or 'Aug 15, 2024'
            const alt = new Date(Date.parse(s));
            if (!Number.isNaN(alt.getTime())) d = alt;
          }
        }
      }
      if (!d || Number.isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    // Prefer invoice document dates: order paid date, then date issued, then legacy
    const candidateDates = [
      // Canonical primary
      canonical?.fields?.orderPaidDate,
      canonical?.orderSummary?.orderPaidDate,
      canonical?.fields?.dateIssued,
      canonical?.orderSummary?.dateIssued,
      // Canonical raw structured (if available)
      canonical?.raw?.structured?.orderPaidDate,
      canonical?.raw?.structured?.dateIssued,
      canonical?.raw?.structured?.date,
      // Legacy extracted fields (older parser)
      extracted.invoice_date,
      extracted.issue_date,
      extracted.order_date,
      extracted.date,
      extracted.posting_date,
      extracted.transaction_date,
    ].filter((v) => !isUnknown(v));
    const docDate = normalizeToYMD(candidateDates.find(Boolean));

    const refNo =
      canonical?.fields?.orderSummaryNo ||
      canonical?.fields?.invoiceNumber ||
      canonical?.fields?.orderId ||
      (!isUnknown(extracted.order_number) ? String(extracted.order_number) : undefined) ||
      '';
    const seller =
      canonical?.fields?.sellerName ||
      (!isUnknown(extracted.seller_name) ? String(extracted.seller_name) : undefined) ||
      '';

    setForm((f) => ({
      ...f,
      // Use document date if available; fallback to current form date
      date: docDate || f.date,
      checkNo: refNo || f.checkNo,
      payee: seller || f.payee,
      description: desc,
      amount: amount,
      account: f.account,
    }));
    setImportOpen(false);
    setAddOpen(true);
  };

  // Load disbursements from backend and map to table rows
  useEffect(() => {
    const fetchDisbursements = async () => {
      try {
        const res = await axios.get('/api/bookkeeping/cash-disbursements');
        const list = res?.data?.data?.disbursements || [];
        const mapped = list.map(mapDisbursementToRow);
        setRows(mapped);
      } catch (err) {
        console.error('Failed to load cash disbursements:', err);
        // Do not fallback to mock so the UI reflects actual backend state
        // Leave rows as-is to avoid showing sample data
      }
    };
    fetchDisbursements();
  }, []);

  const TOTALS = useMemo(() => {
    const totals = {
      creditCash: 0,
      debitPurchasesMaterials: 0,
      debitOfficeSupplies: 0,
      debitRent: 0,
      debitUtilities: 0,
      debitAdvertising: 0,
      debitFreightDelivery: 0,
      debitTaxesLicenses: 0,
      debitMiscellaneous: 0,
    };
    rows.forEach((e) => {
      Object.keys(totals).forEach((k) => { totals[k] += Number(e[k] || 0); });
    });
    return totals;
  }, [rows]);

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Cash Disbursement Book
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / Cash Disbursement Book
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Cash Disbursement Book Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track all cash payments and disbursements made by your business. Monitor expenses, 
              vendor payments, and cash outflows with detailed transaction records and payment history.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Filters & Actions */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters & Actions
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search disbursements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <TextField
            select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="August">August</MenuItem>
            <MenuItem value="September">September</MenuItem>
            <MenuItem value="October">October</MenuItem>
          </TextField>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ minWidth: 140 }}
            onClick={() => { setAddError(''); setAddOpen(true); }}
          >
            + Add Entry
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:upload" />}
            sx={{ minWidth: 160 }}
            onClick={() => { setImportError(''); setImportResult(null); setImportFile(null); setImportOpen(true); }}
          >
            Import invoice
          </Button>
        </Stack>
      </Card>

      {/* Cash Disbursement Book Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              CASH DISBURSEMENT BOOK 
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {rows.length} transactions • August - September 2024
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton sx={{ color: 'success.main' }}>
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
            <IconButton aria-label="scroll left" onClick={() => nudgeScroll('left')}>
              <Iconify icon="mdi:chevron-left" />
            </IconButton>
            <IconButton aria-label="scroll right" onClick={() => nudgeScroll('right')}>
              <Iconify icon="mdi:chevron-right" />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={scrollRef}
          role="region"
          aria-label="Cash Disbursement horizontal scroller"
          onMouseDown={(e) => onPointerDown(e.clientX)}
          onMouseMove={(e) => onPointerMove(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => onPointerDown(e.touches[0]?.clientX || 0)}
          onTouchMove={(e) => onPointerMove(e.touches[0]?.clientX || 0)}
          onTouchEnd={endDrag}
          onWheel={onWheel}
          sx={{ 
          overflowX: 'auto',
          width: '100%',
          cursor: 'grab',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pinch-zoom',
          overscrollBehaviorX: 'contain',
          userSelect: dragging ? 'none' : 'auto',
          '&::-webkit-scrollbar': { height: 10 },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: 4 },
          '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: 4 },
        }}>
          <TableContainer component={Paper} sx={{ 
            boxShadow: 'none', 
            border: `1px solid ${theme.palette.divider}`, 
            width: 'max-content',
            overflow: 'hidden',
          }}>
            <Table sx={{ width: 'max-content', '& .MuiTableCell-root': { py: 1, px: 1, whiteSpace: 'nowrap' } }}>
              <TableHead>
                {/* Grouped header rows */}
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell rowSpan={2} sx={{ position: 'sticky', left: 0, zIndex: 2, bgcolor: 'grey.50', fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 110 }}>Date</TableCell>
                  <TableCell rowSpan={2} sx={{ position: 'sticky', left: 110, zIndex: 2, bgcolor: 'grey.50', fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 160 }}>Voucher / Ref No.</TableCell>
                  <TableCell rowSpan={2} sx={{ position: 'sticky', left: 270, zIndex: 2, bgcolor: 'grey.50', fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 240 }}>Payee / Particulars</TableCell>
                    <TableCell align="center" colSpan={1} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>CREDIT</TableCell>
                    <TableCell align="center" colSpan={8} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>DEBIT</TableCell>
                    <TableCell align="left" sx={{ fontWeight: 700, minWidth: 140, bgcolor: 'grey.50' }} />
                </TableRow>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                    {/* CREDIT sub-columns */}
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 180, whiteSpace: 'normal', lineHeight: 1.15 }}>Cash / Bank / eWallet</TableCell>
                    {/* DEBIT sub-columns (requested set) */}
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 200, whiteSpace: 'normal', lineHeight: 1.15 }}>Purchases – Materials</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 200, whiteSpace: 'normal', lineHeight: 1.15 }}>Supplies Expense</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 180, whiteSpace: 'normal', lineHeight: 1.15 }}>Rent Expense</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 180, whiteSpace: 'normal', lineHeight: 1.15 }}>Utilities Expense</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 220, whiteSpace: 'normal', lineHeight: 1.15 }}>Advertising</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 220, whiteSpace: 'normal', lineHeight: 1.15 }}>Transportation</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 200, whiteSpace: 'normal', lineHeight: 1.15 }}>Taxes & Licenses</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, minWidth: 220, whiteSpace: 'normal', lineHeight: 1.15, borderRight: `1px solid ${theme.palette.divider}` }}>Miscellaneous Expense</TableCell>
                    {/* REMARKS aligned with sub headers */}
                    <TableCell align="left" sx={{ fontWeight: 600, minWidth: 140, whiteSpace: 'normal', lineHeight: 1.15 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((entry, index) => (
                  <TableRow 
                    key={entry.id} 
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      bgcolor: index % 2 === 0 ? 'white' : 'grey.25',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: index % 2 === 0 ? 'white' : 'grey.25', borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.date}
                    </TableCell>
                    <TableCell sx={{ position: 'sticky', left: 110, zIndex: 1, bgcolor: index % 2 === 0 ? 'white' : 'grey.25', borderRight: `1px solid ${theme.palette.divider}` }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.invoiceNumber}
                        </Typography>
                        <Label 
                          variant="soft" 
                          color={entry.entity === 'IKEA' ? 'warning' : 'primary'}
                          sx={{ 
                            bgcolor: entry.entity === 'IKEA' ? '#FFF3E0' : '#E3F2FD',
                            color: entry.entity === 'IKEA' ? '#E65100' : '#1976D2',
                            border: entry.entity === 'IKEA' ? '1px solid #FFB74D' : '1px solid #90CAF9',
                            borderRadius: '12px',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            alignSelf: 'flex-start',
                          }}
                        >
                          {entry.entity}
                        </Label>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ position: 'sticky', left: 270, zIndex: 1, bgcolor: index % 2 === 0 ? 'white' : 'grey.25', borderRight: `1px solid ${theme.palette.divider}` }}>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {entry.entity || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {entry.description || entry.remarks || ''}
                        </Typography>
                      </Stack>
                    </TableCell>
                    {/* CREDIT sub-columns */}
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.creditCash > 0 ? `₱${fNumber(entry.creditCash)}` : '-'}
                    </TableCell>
                    {/* DEBIT sub-columns */}
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitPurchasesMaterials > 0 ? `₱${fNumber(entry.debitPurchasesMaterials)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitOfficeSupplies > 0 ? `₱${fNumber(entry.debitOfficeSupplies)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitRent > 0 ? `₱${fNumber(entry.debitRent)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitUtilities > 0 ? `₱${fNumber(entry.debitUtilities)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitAdvertising > 0 ? `₱${fNumber(entry.debitAdvertising)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitFreightDelivery > 0 ? `₱${fNumber(entry.debitFreightDelivery)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitTaxesLicenses > 0 ? `₱${fNumber(entry.debitTaxesLicenses)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitMiscellaneous > 0 ? `₱${fNumber(entry.debitMiscellaneous)}` : '-'}
                    </TableCell>
                    <TableCell align="left" sx={{ maxWidth: 260, whiteSpace: 'normal', lineHeight: 1.3 }}>
                      {entry.remarks || ''}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Total Row */}
                <TableRow sx={{ 
                  bgcolor: '#E3F2FD', 
                  borderTop: `2px solid ${theme.palette.primary.main}`,
                }}>
                  <TableCell colSpan={3} sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: '#E3F2FD', borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      TOTAL
                    </Typography>
                  </TableCell>
                  {/* CREDIT totals */}
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.creditCash)}
                    </Typography>
                  </TableCell>
                  {/* DEBIT totals */}
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitPurchasesMaterials)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitOfficeSupplies)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitRent)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitUtilities)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitAdvertising)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitFreightDelivery)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitTaxesLicenses)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitMiscellaneous)}
                    </Typography>
                  </TableCell>
                  <TableCell align="left" sx={{ maxWidth: 260 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}></Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Cash Disbursement Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {addError ? <Alert severity="error">{addError}</Alert> : null}
            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Check / Ref No. (optional)"
              value={form.checkNo}
              onChange={(e) => setForm((f) => ({ ...f, checkNo: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Payee / Entity"
              value={form.payee}
              onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Amount (₱)"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Expense Account (e.g., Utilities, Rent, Office Supplies)"
              value={form.account}
              onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setAddError('');
              const amt = Number(form.amount) || 0;
              const acc = (form.account || '').toLowerCase();
              // Map the typed account to backend debit field
              const debitFieldMap = [
                { key: 'purchasesDebit', match: ['purchases', 'materials'] },
                { key: 'suppliesDebit', match: ['office supplies', 'supplies'] },
                { key: 'rentDebit', match: ['rent'] },
                { key: 'advertisingDebit', match: ['advertising', 'marketing'] },
                { key: 'deliveryDebit', match: ['delivery', 'freight', 'freight-out', 'transportation'] },
                { key: 'taxesDebit', match: ['taxes', 'licenses', 'taxes & licenses'] },
                { key: 'miscDebit', match: ['miscellaneous', 'misc'] },
                { key: 'utilitiesDebit', match: ['utilities'] },
                { key: 'bankLoanDebit', match: ['bank loan', 'loan'] },
                { key: 'interestExpenseDebit', match: ['interest expense', 'interest'] },
                { key: 'ownersWithdrawalDebit', match: ["owner's withdrawal", 'withdrawal', 'draw'] },
                { key: 'inventoryDebit', match: ['inventory'] },
              ];
              let debitPayload = {};
              for (const m of debitFieldMap) {
                if (m.match.some((t) => acc.includes(t))) {
                  debitPayload[m.key] = amt;
                  break;
                }
              }
              // Fallback: if no account matched, treat as Purchases – Materials
              if (Object.keys(debitPayload).length === 0) {
                debitPayload.purchasesDebit = amt;
              }
              const payload = {
                date: form.date,
                referenceNo: form.checkNo || '',
                payee: form.payee?.trim(),
                remarks: form.description?.trim(),
                cashCredit: amt,
                ...debitPayload,
              };
              if (!payload.date || !payload.payee || !payload.remarks) {
                setAddError('Please provide date, payee, and description.');
                return;
              }
              try {
                const res = await axios.post('/api/bookkeeping/cash-disbursements', payload);
                const entry = res?.data?.data?.entry;
                if (entry) {
                  setRows((prev) => [...prev, mapDisbursementToRow(entry)]);
                  setAddOpen(false);
                  setForm({ date: new Date().toISOString().slice(0, 10), checkNo: '', payee: '', description: '', amount: '', account: '' });
                } else {
                  setAddError('Unexpected response from server.');
                }
              } catch (err) {
                setAddError(err?.response?.data?.message || err.message || 'Failed to add entry');
              }
            }}
          >
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Invoice Dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {importError ? <Alert severity="error">{importError}</Alert> : null}
            <Button variant="outlined" component="label">
              Choose file
              <input type="file" accept={ACCEPT} hidden onChange={onImportFileChange} />
            </Button>
            {importFile ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Selected: {importFile.name}
              </Typography>
            ) : null}
            <Button variant="contained" onClick={parseInvoice} disabled={importLoading || !importFile}>
              {importLoading ? 'Processing…' : 'Parse Invoice'}
            </Button>
            {importResult ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview</Typography>
                {(() => {
                  const c = importResult.canonical || {};
                  const extracted = importResult.extracted || {};
                  const orderNo = c.fields?.orderSummaryNo || c.fields?.invoiceNumber || c.fields?.orderId || extracted.order_number;
                  const seller = c.fields?.sellerName || extracted.seller_name;
                  const date = c.fields?.orderPaidDate || c.fields?.dateIssued || extracted.order_date || extracted.date;
                  const amount = c.amounts?.grandTotal ?? c.paymentBreakdown?.grandTotal ?? extracted.grand_total ?? extracted.total ?? extracted.subtotal;
                  const items = Array.isArray(c.orderDetails?.items)
                    ? c.orderDetails.items.map((i) => i?.item_name).filter(Boolean)
                    : Array.isArray(c.items)
                    ? c.items.map((i) => i?.product).filter(Boolean)
                    : (extracted.items || []).map((i) => i?.name).filter(Boolean);
                  return (
                    <>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Order/Invoice: {orderNo || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Seller: {seller || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Date: {date || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Amount: {String(amount ?? '-')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Items: {items.slice(0, 3).join(', ')}
                      </Typography>
                    </>
                  );
                })()}
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Close</Button>
          <Button variant="contained" disabled={!importResult} onClick={applyImportedToForm}>Use in Add Entry</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
} 