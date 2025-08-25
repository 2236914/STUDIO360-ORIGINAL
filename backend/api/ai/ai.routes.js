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

  // Basic scanners for optional fields in text
  const scanLine = (labels) => {
    if (!rawText) return null;
    const lines = String(rawText).split(/\r?\n/);
    for (const lbl of labels) {
      const re = new RegExp(`^\s*${lbl}\s*[:\-]?\s*(.+)$`, 'i');
      for (const ln of lines) {
        const m = ln.match(re);
        if (m && m[1]) return m[1].trim().slice(0, 200);
      }
    }
    return null;
  };

  const items = Array.isArray(s.items) ? s.items : [];
  const itemsSnake = items.map(it => ({
    no: it.no ?? null,
    product: it.product ?? null,
    variation: it.variation ?? null,
    product_price: it.productPrice ?? null,
    qty: it.qty ?? null,
    subtotal: it.subtotal ?? null,
  }));
  const itemsRequested = items.map(it => ({
    item_name: it.product ?? null,
    qty: it.qty ?? null,
    price: it.productPrice ?? null,
    subtotal: it.subtotal ?? null,
  }));

  const paymentBreakdown = {
    merchandiseSubtotal: s.merchandiseSubtotal ?? null,
    shippingFee: s.shippingFee ?? null,
    shippingDiscount: s.shippingDiscount ?? null,
    serviceCharge: s.serviceCharge ?? null,
    voucherDiscount: s.voucherDiscount ?? (s.platformVoucher ?? null),
    loyaltyPointsUsed: s.loyaltyPointsUsed ?? null,
    grandTotal: s.total ?? s.grandTotal ?? null,
  };

  return {
    schemaVersion: '1.1',
    extractedAt: Date.now(),
    source: {
      originalName: meta.originalName,
      storedPath: meta.storedPath,
  fileUrl: meta.fileUrl || null,
      mimetype: meta.mimetype,
      size: meta.size,
    },
    fields: {
      sellerName: s.supplier || null,
      sellerAddress: s.sellerAddress || null,
      buyerName: s.buyerName || null,
      buyerAddress: s.buyerAddress || null,
      // Flat access to keep backward compatible consumers happy
      orderSummaryNo: s.orderSummaryNo || s.invoiceNumber || null,
      invoiceNumber: s.invoiceNumber || null,
      orderId: s.orderId || null,
      dateIssued: s.dateIssued || s.date || null,
      orderPaidDate: s.orderPaidDate || null,
      paymentMethod: s.paymentMethod || null,
      currency: s.currency || null,
      amountInWords: s.amountInWords || null,
    },
    // New sections matching requested schema
    orderSummary: {
      orderSummaryNo: s.orderSummaryNo || s.invoiceNumber || null,
      dateIssued: s.dateIssued || s.date || null,
      orderId: s.orderId || null,
      orderPaidDate: s.orderPaidDate || null,
      paymentMethod: s.paymentMethod || null,
    },
    orderDetails: {
      items: itemsRequested,
      branchName: s.branchName ?? scanLine(['Branch Name', 'Branch']) ?? null,
      route: s.route ?? scanLine(['Route']) ?? null,
      driver: s.driver ?? s.deliveryRider ?? scanLine(['Driver', 'Delivery Rider']) ?? null,
    },
    paymentBreakdown,
    // Preserve previous groups for compatibility
    amounts: {
      ...paymentBreakdown,
      tax: s.tax ?? null,
    },
    items: items.map(it => ({
      no: it.no ?? null,
      product: it.product ?? null,
      variation: it.variation ?? null,
      productPrice: it.productPrice ?? null,
      qty: it.qty ?? null,
      subtotal: it.subtotal ?? null,
    })),
    order_details: itemsSnake,
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
  if (process.platform === 'win32') {
    // Try Windows Python launcher if available
    return process.env.PYTHON || 'py';
  }
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
        // Prefer bundled poppler if present; user can override via env
        POPPLER_PATH: process.env.POPPLER_PATH || path.join(__dirname, '..', '..', 'python', 'poppler')
      },
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    let responded = false;
    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });
    const toAbsoluteUrl = (storedPath) => {
      try {
        const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
        const host = req.get('host');
        // storedPath already normalized like 'uploads/filename.ext'
        return `${proto}://${host}/${storedPath}`;
      } catch (_) {
        return `/${storedPath}`;
      }
    };

    py.on('error', (err) => {
      if (responded) return;
      responded = true;
      const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      const meta = {
        originalName: req.file.originalname,
        storedPath,
        fileUrl: toAbsoluteUrl(storedPath),
        size: req.file.size,
        mimetype: req.file.mimetype
      };
      const canonical = canonicalizeStructured({ rawText: '', structured: {}, meta });
      if (canonical && canonical.source) canonical.source.fileUrl = meta.fileUrl;
      return res.json({
        success: true,
        message: 'Processed with fallback (Python not available)',
        data: { id: crypto.randomUUID(), ...meta, text: '', structured: null, canonical, warnings: ['python_not_found', err.message] }
      });
    });

    py.on('close', (code) => {
      if (responded) return;
      try {
        const parsed = JSON.parse(stdout || '{}');
        const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const meta = {
          originalName: req.file.originalname,
          storedPath,
          fileUrl: toAbsoluteUrl(storedPath),
          size: req.file.size,
          mimetype: req.file.mimetype
        };
        if (!parsed.success) {
          // Soft-fail: return canonical fallback with warnings rather than 500
          const canonical = canonicalizeStructured({ rawText: '', structured: {}, meta });
          if (canonical && canonical.source) canonical.source.fileUrl = meta.fileUrl;
          responded = true;
          return res.json({
            success: true,
            message: 'Processed with fallback (python reported failure)',
            data: { id: crypto.randomUUID(), ...meta, text: '', structured: null, canonical, warnings: ['python_success_false', parsed.error || 'unknown_error', stderr] }
          });
        }
        const canonical = canonicalizeStructured({
          rawText: parsed.text || '',
          structured: parsed.structured || {},
          meta
        });
        if (canonical && canonical.source) canonical.source.fileUrl = meta.fileUrl;
        const id = crypto.randomUUID();
        processedStore.push({ id, ...meta, extractedAt: canonical.extractedAt, canonical });
        responded = true;
        return res.json({
          success: true,
          message: 'File processed successfully',
          data: {
            id,
            ...meta,
            text: parsed.text,
            structured: parsed.structured || null,
            canonical,
            fileUrl: meta.fileUrl,
            warnings: parsed.warnings || []
          }
        });
      } catch (e) {
        responded = true;
        const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const meta = {
          originalName: req.file.originalname,
          storedPath,
          fileUrl: toAbsoluteUrl(storedPath),
          size: req.file.size,
          mimetype: req.file.mimetype
        };
        const canonical = canonicalizeStructured({ rawText: '', structured: {}, meta });
        if (canonical && canonical.source) canonical.source.fileUrl = meta.fileUrl;
        return res.json({
          success: true,
          message: 'Processed with fallback (output parse failed)',
          data: { id: crypto.randomUUID(), ...meta, text: '', structured: null, canonical, warnings: ['parse_failed', String(e), stderr] }
        });
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
  fileUrl: p.canonical?.source?.fileUrl || `/${p.storedPath}`,
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
 * @route   GET /api/ai/file/:id
 * @desc    Stream the originally uploaded file by processed document ID
 * @access  Private
 */
router.get('/file/:id', (req, res) => {
  const doc = processedStore.find(p => p.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  const absPath = path.resolve(process.cwd(), doc.storedPath);
  if (!fs.existsSync(absPath)) return res.status(404).json({ success: false, message: 'File missing on server' });
  // Let the browser preview if possible
  res.setHeader('Content-Disposition', `inline; filename="${doc.originalName.replace(/"/g, '')}"`);
  return res.sendFile(absPath);
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