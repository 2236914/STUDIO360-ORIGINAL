/**
 * STUDIO360 Backend Server
 * Main entry point for the backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const BOOT_ID = crypto.randomUUID();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration (allow multiple origins in dev)
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3033',
  'http://localhost:3034',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3033',
  'http://127.0.0.1:3034',
];
const envOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length > 0 ? envOrigins : defaultAllowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    // Always allow explicit env-provided origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    try {
      const url = new URL(origin);
      const host = url.hostname;
      const isLocalhost = host === 'localhost' || host === '127.0.0.1';
      // In development, allow any localhost/127.0.0.1 port
      if ((process.env.NODE_ENV || 'development') !== 'production' && isLocalhost) {
        return callback(null, true);
      }
    } catch (_) {
      // fallthrough
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    bootId: BOOT_ID,
  });
});

// API Routes
try { app.use('/api/auth', require('./api/auth/auth.routes')); } catch (_) { console.warn('Auth routes missing'); }
try { app.use('/api/auth/user', require('./api/auth/user.routes')); } catch (_) { console.warn('User routes missing'); }
try { app.use('/api/shop', require('./api/shop/shop.routes')); } catch (_) { console.warn('Shop routes missing'); }
try { app.use('/api/store-pages', require('./api/store-pages/store-pages.routes')); } catch (_) { console.warn('Store pages routes missing'); }
try { app.use('/api/inventory', require('./api/inventory/inventory.routes')); } catch (_) { console.warn('Inventory routes missing'); }
try { app.use('/api/orders', require('./api/orders/orders.routes')); } catch (_) { console.warn('Orders routes missing'); }
try { app.use('/api/assistant', require('./api/assistant/assistant.routes')); } catch (_) { console.warn('Assistant routes missing'); }
try { app.use('/api/ai', require('./api/ai/ai.routes')); } catch (_) { console.warn('AI routes missing'); }
try { app.use('/api/invoices', require('./api/invoices/invoices.routes')); } catch (_) { console.warn('Invoice routes missing'); }
try { app.use('/api/bookkeeping', require('./api/bookkeeping/bookkeeping.routes')); } catch (_) { console.warn('Bookkeeping routes missing'); }
try { app.use('/api/analytics', require('./api/analytics/analytics.routes')); } catch (_) { console.warn('Analytics routes missing'); }
try { app.use('/api/analytics', require('./api/analytics/product-forecasting.routes')); } catch (_) { console.warn('Product forecasting routes missing'); }
try { app.use('/api/analytics', require('./api/analytics/financial-forecasting.routes')); } catch (_) { console.warn('Financial forecasting routes missing'); }
try { app.use('/api/vouchers', require('./api/vouchers/vouchers.routes')); } catch (_) { console.warn('Voucher routes missing'); }
try { app.use('/api/mail', require('./api/mail/mail.routes')); } catch (_) { console.warn('Mail routes missing'); }
try { app.use('/api/account', require('./api/account/account-history.routes')); } catch (_) { console.warn('Account history routes missing'); }
try { app.use('/api/public/storefront', require('./api/public/public-storefront.routes')); } catch (_) { console.warn('Public storefront routes missing'); }
try { app.use('/api/upload', require('./api/upload/upload.routes')); } catch (_) { console.warn('Upload routes missing'); }
try { app.use('/api/payments/xendit', require('./api/payments/xendit.routes')); } catch (_) { console.warn('Xendit payment routes missing'); }

// Status endpoint retained
app.get('/api/status', (req, res) => {
  res.json({ message: 'STUDIO360 Backend API is running!', version: '1.0.0' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server only if not required as a module (e.g., during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 STUDIO360 Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 