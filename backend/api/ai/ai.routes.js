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
const { postToWebhook } = require('../../services/n8nClient');
const { chatComplete, getConfig: getLLMConfig } = require('../../services/llmClient');

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
// On module load, try to hydrate in-memory KPI from DB snapshot
try {
  const { getMonth } = require('../../services/kpiRepo');
  (async () => {
    try {
      const { data } = await getMonth();
      if (data) {
        kpiStats = {
          processed: Number(data.transactions_processed || 0),
          accuracyRate: typeof data.accuracy_rate === 'number' ? data.accuracy_rate : 0,
          timeSavedMinutes: Number(data.time_saved_minutes || 0),
          costSavings: Number(data.cost_savings || 0),
          docsCount: Number(data.docs_count || 0),
          txCount: Number(kpiStats.txCount || 0),
          transferred: Number(kpiStats.transferred || 0),
          updatedAt: Date.now(),
        };
      }
    } catch (_) {}
  })();
} catch (_) { /* supabase not configured or repo missing */ }

// In-memory processed invoice/receipt JSON store (ephemeral)
const processedStore = []; // { id, originalName, storedPath, size, mimetype, extractedAt, canonical }

function canonicalizeStructured({ rawText, structured, meta }) {
  const s = structured || {};

  // Basic scanners for optional fields in text
  const scanLine = (labels) => {
    if (!rawText) return null;
    const lines = String(rawText).split(/\r?\n/);
    for (const lbl of labels) {
      // Escape whitespace properly in template literal by double-escaping backslashes
      const re = new RegExp(`^\\s*${lbl}\\s*[:\\-]?\\s*(.+)$`, 'i');
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
  // Indicators for grand total detection
  grandTotalDetectedByBold: typeof s.grandTotalDetectedByBold === 'boolean' ? s.grandTotalDetectedByBold : null,
  grandTotalSource: s.grandTotalSource || null,
  grandTotalConfidence: typeof s.grandTotalConfidence === 'number' ? s.grandTotalConfidence : null,
  grandTotalBoldText: typeof s.grandTotalBoldText === 'string' ? s.grandTotalBoldText : null,
  grandTotalVerifiedByBreakdown: typeof s.grandTotalVerifiedByBreakdown === 'boolean' ? s.grandTotalVerifiedByBreakdown : null,
  grandTotalVerifiedDelta: typeof s.grandTotalVerifiedDelta === 'number' ? s.grandTotalVerifiedDelta : null,
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

// Lightweight local assistant for offline fallback (pattern-based)
function localAssistantReply(input, stats) {
  const msg = String(input || '').trim();
  const m = msg.toLowerCase();
  const suggest = '\n\nYou can try:\n• "Categorize recent transactions"\n• "Generate monthly report for August"\n• "Upload receipts"';

  // Prefer intent answers over greetings if the message contains more than a greeting
  const isGreeting = /\b(hi|hello|hey|yo|sup)\b/i.test(msg);
  const hasIntent = /(what\s+is|explain|how\s+does|categor|report|summary|monthly|statement|upload|receipt|invoice|excel|csv|file|cash\s*(vs|and)?\s*accrual|accrual\s*(vs|and)?\s*cash|ebitda|cogs|cost of goods|gross\s*(margin|profit)|net\s*(profit|income)|accounts\s*(receivable|payable)|a\s*r\b|a\s*p\b|depreciation|amortization)/i.test(m);
  if (isGreeting && !hasIntent) {
    return 'Hi! I’m your AI Bookkeeper. I can categorize transactions, extract data from receipts, and generate quick reports.' + suggest;
  }
  // What is AI bookkeeping / explain
  if (/(what\s+is|explain|how\s+does).*(ai|bookkeep)/i.test(msg) || /ai\s*bookkeep/i.test(m)) {
    if (/bookkeep/i.test(m)) {
      return 'AI bookkeeping uses automation to extract data from receipts/invoices, auto‑categorize transactions, and build summaries so you spend less time on manual entry. Upload files in “Upload Process” and I’ll handle extraction; then ask me to categorize or report.';
    }
    // Generic AI explanation
    return 'AI (artificial intelligence) refers to software techniques that enable computers to perform tasks that typically require human intelligence—like understanding language, recognizing patterns, making predictions, and planning. In this app, AI helps read receipts, categorize transactions, and generate summaries.';
  }
  // Generic "what is ..." without AI — steer to LLM or provide guidance
  if (/^\s*what\s+is\s+.+/i.test(msg)) {
    return 'I can help with general questions too. For the best answers, enable the LLM fallback (set LLM_API_KEY in backend/.env or use the advanced n8n workflow). For bookkeeping, you can ask me to categorize or generate reports.';
  }
  // Categorization intent
  if (/categor/i.test(m)) {
    return 'To categorize, upload your receipts or a CSV/XLSX of transactions in Upload Process. I’ll group by vendor/keywords and map to categories (e.g., Office Supplies, Utilities). Then ask “categorize recent transactions”.';
  }
  // Report intent
  if (/(report|summary|monthly|statement)/i.test(m)) {
    return 'I can generate a monthly summary once your data is in. After uploading, ask “generate monthly report for <month>”.';
  }
  // Upload intent
  if (/(upload|receipt|invoice|excel|csv|file)/i.test(m)) {
    return 'Use the Upload Process screen to send receipts (PDF/images) or Excel/CSV files. I’ll extract totals, dates, and line items automatically.';
  }
  // Cash vs Accrual accounting
  if (/(cash\s*(vs|and)?\s*accrual|accrual\s*(vs|and)?\s*cash)/i.test(m)) {
    return [
      'Cash vs Accrual (simple):',
      '- Cash: record income when money is received and expenses when money is paid.',
      '- Accrual: record income when earned (invoice issued) and expenses when incurred (bill received), even if cash moves later.',
      'Use cash for simplicity/very small businesses; use accrual for inventory, invoices/credit terms, and more accurate period reporting.'
    ].join(' ');
  }
  // EBITDA
  if (/ebitda/i.test(m)) {
    return 'EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization. It approximates operating performance by stripping capital structure, tax, and non‑cash charges. Rough formula: Net Income + Interest + Taxes + Depreciation + Amortization.';
  }
  // COGS
  if (/(cogs|cost of goods)/i.test(m)) {
    return 'COGS (Cost of Goods Sold) are direct costs to produce/sell goods: beginning inventory + purchases − ending inventory. It excludes operating expenses like marketing or rent.';
  }
  // Gross vs Net
  if (/(gross\s*(margin|profit)|net\s*(profit|income))/i.test(m)) {
    return 'Gross profit = Revenue − COGS (before operating expenses). Gross margin = Gross profit ÷ Revenue. Net profit = All revenue − (COGS + operating expenses + interest + taxes).';
  }
  // Financial statements differences
  if (/(balance\s*sheet).*?(income\s*statement|p&l)|((income\s*statement|p&l).*?balance\s*sheet)/i.test(m)) {
    return 'Balance sheet shows what you own/owe at a point in time (assets, liabilities, equity). Income statement (P&L) shows performance over a period (revenue, expenses, profit).';
  }
  // AR/AP
  if (/(accounts\s*receivable|a\s*r\b)/i.test(m)) {
    return 'Accounts Receivable (AR): money customers owe you for invoices you’ve issued but not yet collected.';
  }
  if (/(accounts\s*payable|a\s*p\b)/i.test(m)) {
    return 'Accounts Payable (AP): bills you owe suppliers that you’ve received but not yet paid.';
  }
  // Depreciation/amortization
  if (/(depreciation|amortization)/i.test(m)) {
    return 'Depreciation (tangible) and amortization (intangible) spread the cost of assets over their useful life, creating a non‑cash expense each period.';
  }
  // Generic explain prompts for common accounting topics
  if (/^\s*(explain|tell\s+me\s+about)\b/i.test(msg)) {
    return 'Here’s a simple take: I can explain bookkeeping concepts like cash vs accrual, EBITDA, COGS, margins, AR/AP, and financial statements. Ask any of those, or upload data and I’ll help categorize and report.';
  }
  // KPI intent
  if (/(stats|kpi|progress|how\s+much|processed)/i.test(m)) {
    const s = stats || {};
    return `Live stats — processed: ${s.processed || 0}, accuracy: ${s.accuracyRate || 0}%, time saved: ${s.timeSavedMinutes || 0} mins, cost savings: ₱${Number(s.costSavings || 0).toLocaleString()}.`;
  }
  // Default helpful message
  return (process.env.ASSISTANT_FALLBACK_MESSAGE || 'Assistant is warming up. Please try again in a moment.') + suggest;
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

// Diagnostic: compare DB snapshot vs in-memory
router.get('/stats/db', async (req, res) => {
  try {
    const { getMonth } = require('../../services/kpiRepo');
    const { data, error } = await getMonth();
    if (error) return res.json({ success: true, data: { memory: kpiStats, db: null, warning: 'supabase not configured or query failed' } });
    const db = data ? {
      processed: Number(data.transactions_processed || 0),
      accuracyRate: typeof data.accuracy_rate === 'number' ? data.accuracy_rate : 0,
      timeSavedMinutes: Number(data.time_saved_minutes || 0),
      costSavings: Number(data.cost_savings || 0),
      docsCount: Number(data.docs_count || 0),
      monthKey: data.month_key,
      lastCalculatedAt: data.last_calculated_at,
    } : null;
    return res.json({ success: true, data: { memory: kpiStats, db } });
  } catch (_) {
    return res.json({ success: true, data: { memory: kpiStats, db: null } });
  }
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
    // Fire-and-forget DB persistence using repo (non-blocking)
    try {
      const { snapshot, accumulate: dbAccumulate } = require('../../services/kpiRepo');
      if (body.mode === 'accumulate') {
        dbAccumulate({
          processed: Number(body.processed || 0),
          docsCount: Number(body.docsCount || 0),
          timeSavedMinutes: Number(body.timeSavedMinutes || 0),
          costSavings: Number(body.costSavings || 0),
          accuracyRate: typeof body.accuracyRate === 'number' ? body.accuracyRate : undefined,
        }).catch(()=>{});
      } else {
        snapshot(kpiStats).catch(()=>{});
      }
    } catch(_) { /* ignore persistence errors */ }
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
 * @route POST /api/ai/sales-ingest
 * @desc  Upload Shopee/TikTok sales Excel and convert to normalized schema + journal lines
 *        Uses Python sales_ingest.py for rich parsing (pandas/openpyxl). Falls back to Node xlsx if Python missing.
 */
router.post('/sales-ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    if (!['xlsx','xls'].includes(ext)) {
      return res.status(400).json({ success: false, message: 'Only Excel files (.xlsx/.xls) supported for sales ingest' });
    }
  const pythonPath = resolvePythonExecutable();
    const scriptPath = path.join(__dirname, '..', '..', 'python', 'sales_ingest.py');
    const filePath = req.file.path;
    // Reusable Node fallback using xlsx (kept lightweight). Called on spawn error OR script failure (e.g., missing openpyxl).
    const toAbsoluteUrl = (storedPath) => {
      try {
        const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http');
        const host = req.get('host');
        return `${proto}://${host}/${storedPath}`;
      } catch (_) { return `/${storedPath}`; }
    };

    const performNodeFallback = () => {
      try {
        const XLSX = require('xlsx');
        const wb = XLSX.readFile(filePath, { cellDates: true });

        const sigShopee = ['original price', 'total released amount', 'platform fees', 'withholding'];
        const sigTikTok = ['settlement amount', 'adjustment amount', 'total fees', 'released amount'];

        const parseWorksheet = (ws) => {
          // First attempt: default sheet_to_json
          let json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
          let headerIdxUsed = null;
          const looksEmpty = !json.length || Object.keys(json[0] || {}).every(k => /^__EMPTY/.test(String(k)) || String(k).startsWith('Unnamed'));
          if (looksEmpty) {
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, blankrows: false });
            let headerIdx = -1;
            const maxScan = Math.min(rows.length, 20);
            for (let i = 0; i < maxScan; i++) {
              const row = (rows[i] || []).map(v => String(v || '').toLowerCase());
              if (!row.length) continue;
              const joined = row.join(' ');
              let hits = 0;
              for (const s of [...sigShopee, ...sigTikTok]) { if (joined.includes(s)) hits++; }
              if (hits >= 2) { headerIdx = i; break; }
            }
            if (headerIdx >= 0) {
              json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, range: headerIdx });
              headerIdxUsed = headerIdx;
            } else {
              // Try common Shopee header rows explicitly (zero-based indexes 4/5 => display rows 5/6)
              for (const idx of [4, 5]) {
                const attempt = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, range: idx });
                if (attempt && attempt.length && !Object.keys(attempt[0] || {}).every(k => /^__EMPTY/.test(String(k)))) {
                  json = attempt;
                  headerIdxUsed = idx;
                  break;
                }
              }
            }
          }
          return { json, headerIdxUsed };
        };

        let best = { rows: [], journalEntries: [], platform: 'Unknown', count: 0, sheet: null, headerIdxUsed: null };
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          if (!ws) continue;
          const { json, headerIdxUsed } = parseWorksheet(ws);
          if (!json || !json.length) continue;
          const lowerCols = Object.fromEntries(Object.keys(json[0] || {}).map(c => [c.toLowerCase(), c]));
          const pick = (...alts) => {
            const keys = Object.keys(lowerCols);
            for (const a of alts) {
              const needle = String(a).toLowerCase();
              const hit = keys.find(k => k.includes(needle));
              if (hit) return lowerCols[hit];
            }
            return null;
          };
          const isTikTok = Object.keys(lowerCols).some(c => c.includes('settlement amount'));
          const platform = isTikTok ? 'TikTok' : 'Shopee';
          const rows = [];
          for (const r of json) {
            const dateField = pick(
              'payout completed date','payout completion date','payout date','order settled time','order settled date','settlement date','settled date',
              'release date','order date','transaction date','date'
            );
            // Revenue: include "original product price" for Shopee
            const revenueField = pick('total revenue','original product price','original price','gross sales');
            // Fees: prefer holistic columns; if absent and platform is Shopee, sum individual fee columns
            let feesVal = Number(String(r[pick('total fees','platform fees','fees & charges')] || '').replace(/[^0-9.-]/g,'')) || 0;
            if (!feesVal && platform === 'Shopee') {
              const feeKeys = Object.keys(r).map(k => String(k || ''));
              const feeNeedles = ['commission fee','service fee','transaction fee','support program fee','ams commission','platform fee'];
              for (const k of feeKeys) {
                const lk = k.toLowerCase();
                if (feeNeedles.some(n => lk.includes(n))) {
                  feesVal += Number(String(r[k]).replace(/[^0-9.-]/g,'')) || 0;
                }
              }
            }
            const row = {
              date: (r[dateField] || '').toString(),
              platform,
              order_id: (r[pick('order id','orderid','order no','order number')] || '').toString(),
              total_revenue: Number(String(r[revenueField] || '').replace(/[^0-9.-]/g,'')) || 0,
              fees: feesVal,
              withholding_tax: Number(String(r[pick('withholding tax','adjustment amount','adjustment amount (withholding)')] || '').replace(/[^0-9.-]/g,'')) || 0,
              cash_received: Number(String(r[pick('total settlement amount','total released amount','released amount')] || '').replace(/[^0-9.-]/g,'')) || 0,
            };
            if (row.total_revenue || row.cash_received) rows.push(row);
          }
          const journalEntries = rows.map(o => {
            const cash = o.cash_received; const fees = o.fees; const tax = o.withholding_tax; const revenue = o.total_revenue;
            const creditSales = platform === 'TikTok' ? (cash + fees + tax) : revenue;
            const lines = [ { account: 'Cash', side: 'Dr', amount: cash } ];
            if (tax > 0) lines.push({ account: 'Withholding Tax', side: 'Dr', amount: tax });
            if (fees > 0) lines.push({ account: 'Fees & Charges', side: 'Dr', amount: fees });
            lines.push({ account: 'Sales', side: 'Cr', amount: creditSales });
            return { date: o.date, remarks: `To record sales for the day - ${platform}`, platform, orderId: o.order_id, lines };
          });
          if (rows.length > best.count) {
            best = { rows, journalEntries, platform, count: rows.length, sheet: sheetName, headerIdxUsed };
          }
        }

        // If all sheets failed, return empty structure
        const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const fileMeta = { originalName: req.file.originalname, storedPath, fileUrl: toAbsoluteUrl(storedPath) };
        if (best.count === 0) {
          return { success: true, fallback: true, data: { platform: 'Unknown', count: 0, normalized: [], journalEntries: [], diagnostics: { selectedSheet: null, headerIdxUsed: null }, fileMeta } };
        }
        return { success: true, fallback: true, data: { platform: best.platform, count: best.count, normalized: best.rows, journalEntries: best.journalEntries, diagnostics: { selectedSheet: best.sheet, headerIdxUsed: best.headerIdxUsed }, fileMeta } };
      } catch (e) {
        return { success: false, message: 'node_fallback_failed', error: e.message };
      }
    };
    const py = spawn(pythonPath, [scriptPath, filePath], { env: { ...process.env }, windowsHide: true });
    let stdout = ''; let stderr = ''; let responded = false;
    py.stdout.on('data', d => { stdout += d.toString(); });
    py.stderr.on('data', d => { stderr += d.toString(); });
    py.on('error', async (err) => {
      if (responded) return; responded = true;
      const fb = performNodeFallback();
      if (fb.success) return res.json(fb);
      return res.status(500).json({ success: false, message: 'sales_ingest_failed', error: err.message, stderr, fallbackError: fb.error });
    });
    py.on('close', (code) => {
      if (responded) return; responded = true;
  try {
        const parsed = JSON.parse(stdout || '{}');
        if (!parsed.success) {
          // If openpyxl or pandas dependency missing -> fallback
          if (/openpyxl/i.test(parsed.error || '') || /openpyxl/i.test(stderr) || /openpyxl/i.test(stdout)) {
            const fb = performNodeFallback();
            if (fb.success) return res.json(fb);
          }
          return res.status(500).json({ success: false, message: 'Sales ingest script error', stderr, stdout });
        }
        // If Python succeeded but returned zero rows, try Node fallback for resilience
        const data = parsed.data || {};
        // Enrich with file meta for frontend preview
        const storedPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
        const fileMeta = { originalName: req.file.originalname, storedPath, fileUrl: toAbsoluteUrl(storedPath) };
        if (data && typeof data === 'object') data.fileMeta = fileMeta;
        if ((data.count === 0 || !Array.isArray(data.normalized) || data.normalized.length === 0)) {
          const fb = performNodeFallback();
          if (fb && fb.success && fb.data && fb.data.count > 0) {
            return res.json({ ...fb, warnings: ['python_zero_rows_fallback_used'], pythonDiagnostics: { stderr, stdout, pythonData: data } });
          }
          // Return Python result with diagnostics if fallback also empty
          return res.json({ success: true, data: data, warnings: ['python_zero_rows_no_fallback_rows'], stderr, stdout });
        }
        // Optionally auto-post journal entries if client sends ?post=1
        const autoPost = req.query.post === '1';
        if (autoPost && data && Array.isArray(data.journalEntries)) {
          try {
            const bk = require('../bookkeeping/bookkeeping.routes'); // avoid circular heavy use; we only need post logic via fetch style
          } catch (e) {
            // ignore if not resolvable
          }
        }
  return res.json({ success: true, data, stderr });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Sales ingest parse failed', error: String(e), stderr, stdout });
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * @route POST /api/ai/sales-post
 * @desc  Accept normalized sales JSON (array) and create Journal + Cash Receipt entries.
 *        Body: { sales: [ { date, platform, total_revenue, fees, withholding_tax, cash_received } ] }
 */
router.post('/sales-post', express.json(), async (req, res) => {
  try {
    const sales = Array.isArray(req.body?.sales) ? req.body.sales : [];
    if (!sales.length) return res.status(400).json({ success: false, message: 'No sales provided' });
    const bookkeeping = require('../bookkeeping/bookkeeping.routes'); // ensure loaded for journal posting
    const app = require('express')();
    // We'll call journal & cash-receipts endpoints via internal logic by requiring the router store indirectly.
    // Simpler: replicate posting logic here (avoids private store access) using fetch-like axios to our own endpoints is overkill.
    const { getAccount } = require('../bookkeeping/coa');
    // We'll push directly into journal using same in-memory store via dynamic require.
    // Access store indirectly by patching module (not exported) is messy; instead re-post through HTTP would need server reference.
    // For now, just build journal payloads and return; client will POST them.
    const journalPayloads = [];
    const cashReceiptPayloads = [];
    for (const s of sales) {
      const date = s.date || new Date().toISOString().slice(0,10);
      const platform = s.platform || 'Platform';
      const orderId = s.order_id || s.orderId || '';
      const cash = Number(s.cash_received)||0;
      const fees = Number(s.fees)||0;
      const tax = Number(s.withholding_tax)||0;
      const revenue = Number(s.total_revenue)||0;
      const creditSales = platform.toLowerCase()==='tiktok' ? (cash + fees + tax) : revenue;
      const lines = [];
      if (cash) lines.push({ code: '101', debit: cash, credit: 0, description: 'Cash received' });
      if (tax) lines.push({ code: '109', debit: tax, credit: 0, description: 'Withholding Tax' });
      if (fees) lines.push({ code: '510', debit: fees, credit: 0, description: 'Platform Fees & Charges' });
      if (creditSales) lines.push({ code: '401', debit: 0, credit: creditSales, description: 'Sales Revenue' });
      journalPayloads.push({ date, ref: `${platform.substring(0,2).toUpperCase()}-${date}`, particulars: `To record sales for the day - ${platform}`, orderId, lines });
      cashReceiptPayloads.push({
        date,
        referenceNo: `${platform.substring(0,2).toUpperCase()}-${date}`,
        customer: `${platform} Customers`,
        orderId,
        cashDebit: cash,
        feesChargesDebit: fees,
        salesReturnsDebit: 0,
        netSalesCredit: platform.toLowerCase()==='tiktok' ? creditSales : creditSales, // unified
        otherIncomeCredit: 0,
        arCredit: 0,
        ownersCapitalCredit: 0,
        remarks: `To record sales for the day - ${platform}`
      });
    }
    return res.json({ success: true, data: { journalPayloads, cashReceiptPayloads } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// --- Simple in-memory chat sessions (ephemeral; swap to Redis/DB later) ---
const chatSessions = new Map(); // sessionId -> { history: [{role, content, ts}], createdAt }
function getOrCreateSession(sessionId) {
  let id = sessionId || crypto.randomUUID();
  if (!chatSessions.has(id)) {
    chatSessions.set(id, { history: [], createdAt: Date.now() });
  }
  return { id, session: chatSessions.get(id) };
}

/**
 * @route   GET /api/ai/assistant/health
 * @desc    Check whether n8n webhook is configured
 */
router.get('/assistant/health', (req, res) => {
  const url = process.env.N8N_WEBHOOK_URL || '';
  const configured = Boolean(url && (url.startsWith('http') || url.startsWith('mock:')));
  const masked = url ? url.replace(/:[^@/]+@/, ':***@') : null; // mask basic auth secret
  res.json({ success: true, data: { configured, url: masked } });
});

/**
 * @route   POST /api/ai/assistant/message
 * @desc    Send a user message to the n8n AI workflow and return the assistant reply
 * @body    { message: string, sessionId?: string, context?: object }
 */
router.post('/assistant/message', express.json(), async (req, res) => {
  try {
    const { message, sessionId, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const { id, session } = getOrCreateSession(sessionId);
    // push user message
    session.history.push({ role: 'user', content: message, ts: Date.now() });
    // keep last 20 messages
    session.history = session.history.slice(-20);

    const payload = {
      type: 'ai_assistant_message',
      sessionId: id,
      message,
      history: session.history,
      context: {
        ...context,
        app: 'STUDIO360',
        page: 'ai-bookkeeper',
      },
    };

    const resp = await postToWebhook('assistant', payload);
    if (!resp.ok) {
      // If a direct LLM is configured, use it as a powerful fallback
      try {
        const llmCfg = getLLMConfig();
        if (llmCfg.apiKey) {
          const system = 'You are the STUDIO360 AI Bookkeeper assistant. Be concise and helpful. If the user asks about bookkeeping tasks, guide them to upload receipts, categorize transactions, or generate reports.';
          const llmReply = await chatComplete({
            system,
            messages: [
              ...session.history.map(h => ({ role: h.role, content: String(h.content || '') })),
              { role: 'user', content: String(message) },
            ],
            temperature: 0.3,
            maxTokens: 400,
          });
          session.history.push({ role: 'assistant', content: llmReply, ts: Date.now() });
          return res.json({ success: true, data: { sessionId: id, reply: llmReply, source: 'llm' } });
        }
      } catch (e) {
        console.warn('LLM fallback error:', e.message || e);
      }

      // Otherwise, use the local heuristic reply
      const hint = localAssistantReply(message, kpiStats);
      if (resp.error) console.warn('n8n webhook error:', resp.error);
      session.history.push({ role: 'assistant', content: hint, ts: Date.now() });
      return res.json({ success: true, data: { sessionId: id, reply: hint, source: 'fallback' } });
    }

    const data = resp.data || {};
    const reply =
      (typeof data.reply === 'string' && data.reply) ||
      (Array.isArray(data.messages) && data.messages.find(m => m.role !== 'user')?.content) ||
      (typeof data.text === 'string' && data.text) ||
      'Okay.';

    // optionally adjust KPI stats if workflow returns deltas
    if (data.statsDelta && typeof data.statsDelta === 'object') {
      const d = data.statsDelta;
      kpiStats.processed = (kpiStats.processed || 0) + Number(d.processed || 0);
      if (typeof d.accuracyRate === 'number') kpiStats.accuracyRate = d.accuracyRate;
      kpiStats.timeSavedMinutes = (kpiStats.timeSavedMinutes || 0) + Number(d.timeSavedMinutes || 0);
      kpiStats.costSavings = (kpiStats.costSavings || 0) + Number(d.costSavings || 0);
      kpiStats.txCount = (kpiStats.txCount || 0) + Number(d.txCount || 0);
      kpiStats.docsCount = (kpiStats.docsCount || 0) + Number(d.docsCount || 0);
      kpiStats.updatedAt = Date.now();
    }

    // store assistant reply
    session.history.push({ role: 'assistant', content: reply, ts: Date.now() });

    return res.json({ success: true, data: { sessionId: id, reply, raw: data } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/ai/upload
 * @desc    Upload a file for OCR/processing (images, PDFs, CSV/XLSX)
 *          If the file is an Excel/CSV, parse rows directly instead of OCR to build a pseudo-canonical object.
 * @access  Private
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    const isSpreadsheet = ['xlsx','xls','csv'].includes(ext);

    // Helper to respond for spreadsheet by converting to a simplified canonical schema
    const handleSpreadsheet = () => {
      try {
        const XLSX = require('xlsx');
        const wb = XLSX.readFile(req.file.path, { cellDates: true });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
        // Attempt to identify columns
        // Heuristics: amount, total, date, description, invoice, seller
        const pickCol = (aliases) => {
          if (!json.length) return null;
          const first = json[0];
            const keys = Object.keys(first || {});
          for (const a of aliases) {
            const k = keys.find((kk) => kk.toLowerCase().replace(/\s+/g,'').includes(a));
            if (k) return k;
          }
          return null;
        };
        const amountCol = pickCol(['amount','total','gross','net','grand']);
        const dateCol = pickCol(['date','txn','trans','issued']);
        const descCol = pickCol(['description','desc','details','particular','item']);
        const invoiceCol = pickCol(['invoice','inv','ref','reference']);
        const sellerCol = pickCol(['seller','supplier','vendor','customer','client']);
        // Build items list (limit 200 rows for safety)
        const items = [];
        let grandTotal = 0;
        json.slice(0, 500).forEach((row, idx) => {
          const rawAmt = amountCol ? row[amountCol] : '';
          // Normalise numeric parsing (remove commas, currency symbols)
          let amt = null;
          if (rawAmt !== null && rawAmt !== undefined && rawAmt !== '') {
            const cleaned = String(rawAmt).replace(/[^0-9.-]/g,'');
            if (cleaned && !isNaN(Number(cleaned))) amt = Number(cleaned);
          }
          if (amt != null) grandTotal += amt;
          items.push({
            no: idx + 1,
            product: descCol ? String(row[descCol]).trim().slice(0,160) : `Row ${idx+1}`,
            variation: null,
            productPrice: amt,
            qty: 1,
            subtotal: amt,
          });
        });
        // Derive a pseudo-structured object compatible with canonicalizeStructured
        const structured = {
          supplier: json[0]?.[sellerCol] || null,
          invoiceNumber: json[0]?.[invoiceCol] || null,
          dateIssued: json[0]?.[dateCol] || null,
          total: grandTotal || null,
          items,
          merchandiseSubtotal: grandTotal || null,
        };
        const storedPath = req.file.path.replace(/\\/g,'/').replace(process.cwd().replace(/\\/g,'/')+'/', '');
        const meta = {
          originalName: req.file.originalname,
          storedPath,
          fileUrl: `/${storedPath}`,
          size: req.file.size,
          mimetype: req.file.mimetype,
        };
        const canonical = canonicalizeStructured({ rawText: '', structured, meta });
        const id = crypto.randomUUID();
        processedStore.push({ id, ...meta, extractedAt: canonical.extractedAt, canonical });
        return res.json({
          success: true,
          message: 'Spreadsheet parsed successfully',
          data: {
            id,
            ...meta,
            text: '',
            structured,
            canonical,
            fileUrl: meta.fileUrl,
            warnings: [],
            diagnostics: { rows: json.length, sheet: sheetName, detectedColumns: { amountCol, dateCol, descCol, invoiceCol, sellerCol } }
          }
        });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Spreadsheet parse failed', error: e.message });
      }
    };

    if (isSpreadsheet) {
      // Force spreadsheet parser path only (skip OCR entirely)
      return handleSpreadsheet();
    }

    // Non-spreadsheet: force strict Tesseract-only OCR (disable advanced helpers)
    process.env.STRICT_TESSERACT_ONLY = '1';

    // Resolve Python path robustly (venv -> env -> common install paths -> PATH)
    const pythonPath = resolvePythonExecutable();
    const scriptPath = path.join(__dirname, '..', '..', 'python', 'process_file.py');
    const filePath = req.file.path;

    // Spawn Python processor
    // Resolve a Poppler bin path if we have a bundled copy
  const bundledPopplerBin = (() => {
      try {
        const base = path.join(__dirname, '..', '..', 'python', 'poppler', 'extracted');
        if (!fs.existsSync(base)) return null;
        const entries = fs.readdirSync(base).filter((d) => d && fs.existsSync(path.join(base, d, 'Library', 'bin')));
        if (entries.length > 0) return path.join(base, entries[0], 'Library', 'bin');
      } catch (e) {}
      return null;
    })();

  // Writable cache dirs for Paddle / PaddleX on Windows (avoid permissions under %USERPROFILE%)
  const cacheRoot = path.join(__dirname, '..', '..', 'python', '.cache');
  try { fs.mkdirSync(cacheRoot, { recursive: true }); } catch (_) {}
  const paddlexHome = path.join(cacheRoot, 'paddlex');
  const paddleHome = path.join(cacheRoot, 'paddle');
  const xdgCache = path.join(cacheRoot, 'xdg');
  try { fs.mkdirSync(paddlexHome, { recursive: true }); } catch (_) {}
  try { fs.mkdirSync(paddleHome, { recursive: true }); } catch (_) {}
  try { fs.mkdirSync(xdgCache, { recursive: true }); } catch (_) {}

    const py = spawn(pythonPath, [scriptPath, filePath], {
      env: {
        ...process.env,
        // Allow overriding Tesseract/Poppler via env in backend process
        TESSERACT_PATH: process.env.TESSERACT_PATH || 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe',
        // Prefer bundled poppler bin if present; user can override via env
        POPPLER_PATH: process.env.POPPLER_PATH || bundledPopplerBin || path.join(__dirname, '..', '..', 'python', 'poppler'),
        // Ensure Paddle is enabled by default
        ENABLE_PADDLE_OCR: process.env.ENABLE_PADDLE_OCR || '1',
        PADDLE_ON_PDF: process.env.PADDLE_ON_PDF || '1',
  // Paddle caches
  PPDX_HOME: process.env.PPDX_HOME || paddlexHome,
  PADDLE_HOME: process.env.PADDLE_HOME || paddleHome,
  XDG_CACHE_HOME: process.env.XDG_CACHE_HOME || xdgCache,
  // Some Windows environments need this to avoid OpenMP/MKL conflicts
  KMP_DUPLICATE_LIB_OK: process.env.KMP_DUPLICATE_LIB_OK || 'TRUE',
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
            warnings: parsed.warnings || [],
            diagnostics: parsed.diagnostics || null
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

/**
 * @route   GET /api/ai/ocr/health
 * @desc    Check Python OCR environment availability (Python path, Tesseract, Poppler, PaddleOCR)
 */
router.get('/ocr/health', async (req, res) => {
  try {
    const pythonPath = resolvePythonExecutable();
    const scriptPath = path.join(__dirname, '..', '..', 'python', 'process_file.py');
    const py = spawn(pythonPath, ['-c', 'import sys,os;\nprint("python_ok")\ntry:\n import pytesseract; print("tesseract_var=", os.environ.get("TESSERACT_PATH"));\nexcept Exception as e:\n print("pytesseract_err=", e)\ntry:\n import fitz; print("pymupdf_ok")\nexcept Exception as e:\n print("pymupdf_err=", e)\ntry:\n from paddleocr import PaddleOCR; print("paddle_ok")\nexcept Exception as e:\n print("paddle_err=", e)'], {
      env: {
        ...process.env,
        ENABLE_PADDLE_OCR: process.env.ENABLE_PADDLE_OCR || '1',
        PADDLE_ON_PDF: process.env.PADDLE_ON_PDF || '1',
      },
      windowsHide: true
    });
    let out = '';
    let err = '';
    py.stdout.on('data', d => { out += d.toString(); });
    py.stderr.on('data', d => { err += d.toString(); });
    py.on('close', (code) => {
      return res.json({ success: true, data: { pythonPath, out, err, code } });
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router; 