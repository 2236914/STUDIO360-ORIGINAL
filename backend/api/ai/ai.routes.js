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

// In-memory KPI stats (can be replaced with DB later)
let kpiStats = {
  processed: 0,
  accuracyRate: 0,
  timeSavedMinutes: 0,
  costSavings: 0,
  docsCount: 0,
  txCount: 0,
  transferred: 0,
  updatedAt: 0,
};

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

    // Prefer project venv Python if available, else env override, else system python
    const venvPython = path.join(process.cwd(), 'python', '.venv', 'Scripts', 'python.exe');
    const pythonPath = fs.existsSync(venvPython)
      ? venvPython
      : (process.env.PYTHON_PATH || 'python');
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
          return res.status(500).json({ success: false, message: parsed.error || 'Processing failed', stderr });
        }
        return res.json({
          success: true,
          message: 'File processed successfully',
          data: {
            originalName: req.file.originalname,
            storedPath: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
            size: req.file.size,
            mimetype: req.file.mimetype,
            text: parsed.text
          }
        });
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to parse processor output', stderr, stdout });
      }
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
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