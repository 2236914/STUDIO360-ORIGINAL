/**
 * STUDIO360 AI Services
 * Main server for AI/ML services including OCR and categorization
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');

// Load environment variables
dotenv.config();

// Import services
const OCRService = require('./services/ocr-service');
const CategorizationService = require('./services/categorization-service');

const app = express();
const PORT = process.env.AI_PORT || 3002;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize services
const ocrService = new OCRService();
const categorizationService = new CategorizationService();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3033', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Services',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// OCR endpoint
app.post('/api/ocr/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    logger.info(`OCR request received for file: ${req.file.originalname}`);

    const language = req.body.language || 'eng';
    const result = await ocrService.extractText(req.file.buffer, { language });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('OCR extraction failed:', error);
    res.status(500).json({
      success: false,
      error: 'OCR extraction failed',
      message: error.message
    });
  }
});

// Categorization endpoint
app.post('/api/categorize/transaction', async (req, res) => {
  try {
    const { description, amount, merchant } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Transaction description is required'
      });
    }

    logger.info(`Categorization request for: ${description}`);

    const result = await categorizationService.categorizeTransaction({
      description,
      amount: parseFloat(amount) || 0,
      merchant: merchant || ''
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Categorization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Categorization failed',
      message: error.message
    });
  }
});

// Get available categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = categorizationService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Failed to get categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      message: error.message
    });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    service: 'STUDIO360 AI Services',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      ocr: '/api/ocr/extract',
      categorization: '/api/categorize/transaction',
      categories: '/api/categories'
    },
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'AI service endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🤖 STUDIO360 AI Services running on port ${PORT}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📄 OCR endpoint: http://localhost:${PORT}/api/ocr/extract`);
  logger.info(`🏷️  Categorization: http://localhost:${PORT}/api/categorize/transaction`);
  logger.info(`✅ All AI services ready!`);
});

module.exports = app;
