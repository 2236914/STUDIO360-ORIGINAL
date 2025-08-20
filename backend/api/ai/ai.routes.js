/**
 * AI Routes
 * Handles AI bookkeeper endpoints
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { spawn } = require('child_process');
const XLSX = require('xlsx');
const crypto = require('crypto');

// In-memory KPI stats (can be replaced with DB later)
function freshKPI() {
  return {
    processed: 0,
    accuracyRate: 0,
    timeSavedMinutes: 0,
    costSavings: 0,
    docsCount: 0,
    txCount: 0,
    transferred: 0,
    updatedAt: Date.now(),
  };
}
let kpiStats = freshKPI();

// In-memory processed invoice/receipt JSON store (ephemeral)
const processedStore = []; // { id, originalName, storedPath, size, mimetype, extractedAt, canonical }

function canonicalizeStructured({ rawText, structured, meta }) {
  const s = structured || {};
  return {
    schemaVersion: '1.0',
    extractedAt: Date.now(),
    source: {
      originalName: meta.originalName,
      storedPath: meta.storedPath,
      mimetype: meta.mimetype,
      size: meta.size,
    },
    fields: {
      sellerName: s.supplier || null,
  sellerAddress: s.sellerAddress || null,
  buyerName: s.buyerName || null,
  buyerAddress: s.buyerAddress || null,
      orderSummaryNo: s.orderSummaryNo || s.invoiceNumber || null,
      invoiceNumber: s.invoiceNumber || null,
      orderId: s.orderId || null,
      dateIssued: s.dateIssued || s.date || null,
      orderPaidDate: s.orderPaidDate || null,
      paymentMethod: s.paymentMethod || null,
      currency: s.currency || null,
      amountInWords: s.amountInWords || null,
    },
    amounts: {
      merchandiseSubtotal: s.merchandiseSubtotal ?? null,
      shippingFee: s.shippingFee ?? null,
      shippingDiscount: s.shippingDiscount ?? null,
      platformVoucher: s.platformVoucher ?? null,
      grandTotal: s.total ?? s.grandTotal ?? null,
      tax: s.tax ?? null,
    },
    items: Array.isArray(s.items) ? s.items.map(it => ({
      no: it.no ?? null,
      product: it.product ?? null,
      variation: it.variation ?? null,
      productPrice: it.productPrice ?? null,
      qty: it.qty ?? null,
      subtotal: it.subtotal ?? null,
    })) : [],
    // order_details: same data but with requested snake_case keys
    order_details: Array.isArray(s.items) ? s.items.map(it => ({
      no: it.no ?? null,
      product: it.product ?? null,
      variation: it.variation ?? null,
      product_price: it.productPrice ?? null,
      qty: it.qty ?? null,
      subtotal: it.subtotal ?? null,
    })) : [],
    raw: {
      text: rawText,
      structured: s,
    }
  };
}

// Attempt to resolve a working Python executable path on Windows/Unix
function resolvePythonExecutable() {
  // 1) Project venv (Windows layout)
  const venvWin = path.join(process.cwd(), 'python', '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(venvWin)) return venvWin;
  // 2) Project venv (POSIX layout)
  const venvPosix = path.join(process.cwd(), 'python', '.venv', 'bin', 'python');
  if (fs.existsSync(venvPosix)) return venvPosix;
  // 3) Explicit env override
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) return process.env.PYTHON_PATH;

  // 4) Common Windows install locations (Python 3.9 - 3.13)
  const vers = ['39','310','311','312','313','314'];
  const roots = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Python'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Python'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Python'),
    'C:/',
  ].filter(Boolean);
  for (const root of roots) {
    for (const v of vers) {
      const p1 = path.join(root, `Python${v}`, 'python.exe');
      if (fs.existsSync(p1)) return p1;
      const p2 = path.join('C:/', `Python${v}`, 'python.exe');
      if (fs.existsSync(p2)) return p2;
    }
  }

  // 5) Fallback to PATH entry
  return process.env.PYTHON || 'python';
}

// Ensure uploads directory exists (relative to backend working dir)
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  // no-op
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

/**
 * @route   GET /api/ai/stats
 * @desc    Get AI Bookkeeper KPI stats
 * @access  Private
 */
router.get('/stats', (req, res) => {
  return res.json({ success: true, data: kpiStats });
});

/**
 * @route   POST /api/ai/stats
 * @desc    Update AI Bookkeeper KPI stats (merge)
 * @access  Private
 */
router.post('/stats', express.json(), (req, res) => {
  try {
    const allowed = [
      'processed',
      'accuracyRate',
      'timeSavedMinutes',
      'costSavings',
      'docsCount',
      'txCount',
      'transferred',
      'updatedAt',
    ];
    const body = req.body || {};
    const accumulate = body.mode === 'accumulate';

    for (const key of allowed) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
      const val = body[key];
      if (accumulate && key !== 'accuracyRate' && typeof val === 'number') {
        kpiStats[key] = (Number(kpiStats[key]) || 0) + Number(val);
      } else {
        kpiStats[key] = val;
      }
    }
    // ensure updatedAt
    kpiStats.updatedAt = Date.now();
    return res.json({ success: true, data: kpiStats });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

/**
 * @route   POST /api/ai/stats/reset
 * @desc    Reset KPI stats to initial zero state
 * @access  Private
 */
router.post('/stats/reset', (req, res) => {
  kpiStats = freshKPI();
  return res.json({ success: true, message: 'KPI stats reset', data: kpiStats });
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

/**
 * @route   POST /api/ai/upload
 * @desc    Upload a file for OCR/processing (images, PDFs, CSV/XLSX)
 * @access  Private
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Fast-path: handle CSV/XLSX directly
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const isExcel = ['.xlsx', '.xls', '.csv'].includes(ext);
    if (isExcel) {
      try {
        // Read workbook or CSV into first sheet
        let wb;
        if (ext === '.csv') {
          const csv = fs.readFileSync(req.file.path, 'utf8');
          wb = XLSX.read(csv, { type: 'string' });
        } else {
          wb = XLSX.readFile(req.file.path);
        }
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        // Try to map common sales/shop export headers to a canonical structure
        // Heuristics for column names
        const headerMap = (h) => String(h || '').trim().toLowerCase();
        const pick = (obj, keys) => {
          for (const k of keys) {
            const v = obj[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') return v;
          }
          return '';
        };

        const canonicalItems = [];
        let grandTotal = 0;
        let currency = 'PHP';
        for (const r of rows) {
          // Build a lower-key alias object for robust access
          const low = {};
          for (const [k, v] of Object.entries(r)) low[headerMap(k)] = v;
          // Typical marketplaces: order id, order number, product, quantity, unit price, net/gross amount
          const orderId = pick(low, ['order id', 'order_id', 'orderid', 'order #', 'order no', 'order number', 'transaction id']);
          const orderSummaryNo = pick(low, ['order summary no', 'order summary no.', 'order summary', 'reference no', 'reference number']);
          const invoiceNumber = pick(low, ['invoice number', 'invoice no', 'invoice #']);
          const product = pick(low, ['product name', 'product', 'item name', 'item']);
          const qtyRaw = pick(low, ['qty', 'quantity', 'item qty', 'units']);
          const unitRaw = pick(low, ['unit price', 'price', 'product price', 'unit_amount']);
          const amountRaw = pick(low, ['amount', 'subtotal', 'total', 'net amount', 'grand total']);
          const currRaw = pick(low, ['currency', 'curr', 'cur']);
          if (currRaw) currency = String(currRaw).toUpperCase();
          const qty = Number(String(qtyRaw).replace(/,/g, '')) || 0;
          const productPrice = Number(String(unitRaw).replace(/,/g, '')) || 0;
          const subtotal = Number(String(amountRaw).replace(/,/g, '')) || (qty && productPrice ? qty * productPrice : 0);
          if (subtotal) grandTotal += subtotal;
          canonicalItems.push({
            no: canonicalItems.length + 1,
            product: product || '',
            variation: '',
            productPrice: productPrice || null,
            qty: qty || null,
            subtotal: subtotal || null,
            _ref: { orderId, orderSummaryNo, invoiceNumber },
          });
        }

        const storedPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
        const meta = {
          originalName: req.file.originalname,
          storedPath,
          size: req.file.size,
          mimetype: req.file.mimetype
        };
        const structured = {
          _source: 'excel',
          supplier: '',
          sellerAddress: '',
          buyerName: '',
          buyerAddress: '',
          orderSummaryNo: '',
          invoiceNumber: '',
          orderId: '',
          dateIssued: '',
          orderPaidDate: '',
          paymentMethod: '',
          currency,
          merchandiseSubtotal: grandTotal,
          shippingFee: 0,
          shippingDiscount: 0,
          platformVoucher: 0,
          total: grandTotal,
          items: canonicalItems,
        };
        const canonical = canonicalizeStructured({ rawText: '', structured, meta });
        const id = crypto.randomUUID();
        processedStore.push({ id, ...meta, extractedAt: canonical.extractedAt, canonical });
        return res.json({ success: true, message: 'Excel parsed successfully', data: { id, ...meta, text: '', structured, canonical } });
      } catch (e) {
        return res.status(400).json({ success: false, message: `Failed to parse Excel/CSV: ${e.message}` });
      }
    }

    // Resolve Python path robustly (venv -> env -> common install paths -> PATH)
    const pythonPath = resolvePythonExecutable();
    const scriptPath = path.join(__dirname, '..', '..', 'python', 'process_file.py');
    const filePath = req.file.path;

    // Spawn Python processor
    const py = spawn(pythonPath, [scriptPath, filePath], {
      env: {
        ...process.env,
        // Allow overriding Tesseract/Poppler via env in backend process
        TESSERACT_PATH: process.env.TESSERACT_PATH || 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
        POPPLER_PATH: process.env.POPPLER_PATH || ''
      }
    });

    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });

    py.on('close', (code) => {
      try {
        const parsed = JSON.parse(stdout || '{}');
        if (!parsed.success) {
          return res.status(500).json({ success: false, message: parsed.error || 'Processing failed', stderr, pythonPath });
        }
        const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const meta = {
          originalName: req.file.originalname,
          storedPath,
          size: req.file.size,
          mimetype: req.file.mimetype
        };
        const canonical = canonicalizeStructured({
          rawText: parsed.text || '',
          structured: parsed.structured || {},
          meta
        });
        const id = crypto.randomUUID();
        processedStore.push({ id, ...meta, extractedAt: canonical.extractedAt, canonical });
        return res.json({
          success: true,
          message: 'File processed successfully',
          data: {
            id,
            ...meta,
            text: parsed.text,
            structured: parsed.structured || null,
            canonical
          }
        });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to parse processor output', stderr, stdout, pythonPath });
      }
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/ai/processed
 * @desc    List processed documents (metadata only)
 * @access  Private
 */
router.get('/processed', (req, res) => {
  const list = processedStore.map(p => ({
    id: p.id,
    originalName: p.originalName,
    storedPath: p.storedPath,
    size: p.size,
    mimetype: p.mimetype,
    extractedAt: p.extractedAt,
    currency: p.canonical.fields.currency,
    grandTotal: p.canonical.amounts.grandTotal,
  }));
  res.json({ success: true, data: { count: list.length, documents: list } });
});

/**
 * @route   GET /api/ai/processed/:id
 * @desc    Get full canonical JSON for a processed document
 * @access  Private
 */
router.get('/processed/:id', (req, res) => {
  const doc = processedStore.find(p => p.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: doc.canonical });
});

/**
 * @route   POST /api/ai/categorize
 * @desc    Categorize transactions
 * @access  Private
 */
router.post('/categorize', (req, res) => {
  // TODO: Implement transaction categorization
  res.json({
    success: true,
    message: 'Categorization endpoint - to be implemented',
    data: {
      categorizationId: 'cat_789012',
      transactions: [],
      summary: {
        totalTransactions: 0,
        categorizedCount: 0,
        uncategorizedCount: 0,
        averageConfidence: 0
      }
    }
  });
});

/**
 * @route   GET /api/ai/categories
 * @desc    Get available categories
 * @access  Private
 */
router.get('/categories', (req, res) => {
  // TODO: Implement categories retrieval
  res.json({
    success: true,
    message: 'Categories endpoint - to be implemented',
    data: {
      categories: [
        {
          id: 'office_supplies',
          name: 'Office Supplies',
          color: '#1976d2',
          icon: 'ic-office'
        },
        {
          id: 'travel',
          name: 'Travel',
          color: '#388e3c',
          icon: 'ic-travel'
        }
      ]
    }
  });
});

/**
 * @route   GET /api/ai/logs
 * @desc    Get categorization logs
 * @access  Private
 */
router.get('/logs', (req, res) => {
  // TODO: Implement logs retrieval
  res.json({
    success: true,
    message: 'Logs endpoint - to be implemented',
    data: {
      logs: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    }
  });
});

module.exports = router; 