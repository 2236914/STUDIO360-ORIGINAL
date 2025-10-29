const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabaseClient');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Optional JWT Authentication Middleware
 * Verifies JWT token if present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    req.user = null;
    return next();
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

/**
 * Supabase Authentication Middleware
 * Verifies Supabase JWT token from Authorization header
 */
const authenticateSupabaseToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  if (!supabase) {
    console.error('Supabase client not configured');
    return res.status(500).json({ 
      success: false, 
      message: 'Server configuration error' 
    });
  }

  try {
    console.log('Attempting Supabase token verification for token:', token.substring(0, 20) + '...');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('Supabase verification result:', { user: user ? { id: user.id, email: user.email } : null, error });
    
    if (error || !user) {
      console.log('Supabase token verification failed:', error);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Set user info in request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Supabase token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Supabase-only Authentication Middleware (hybrid name retained for compatibility)
 * Verifies the Supabase access token from the Authorization header and does NOT
 * fall back to custom JWT. Keeps the same export used across routes.
 */
const authenticateTokenHybrid = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }
  try {
    if (!supabase) {
      console.error('Supabase client not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    // Create a client with the user's token for auth and verify
    const { createClient } = require('@supabase/supabase-js');
    const userSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser(token);
    if (error || !user) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = { id: user.id, email: user.email, role: user.user_metadata?.role || 'user' };
    return next();
  } catch (error) {
    console.error('Supabase token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Require Admin Role Middleware
 * Ensures the user has admin or admin_it role
 * Now allows all authenticated users (removed strict role check)
 */
const requireAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  // Allow all authenticated users to access IT Maintenance
  next();
};

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(payload, jwtSecret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

module.exports = {
  authenticateToken,
  authenticateSupabaseToken,
  authenticateTokenHybrid,
  optionalAuth,
  requireAdmin,
  generateToken
};
