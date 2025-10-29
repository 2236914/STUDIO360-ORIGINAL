const jwt = require('jsonwebtoken');
const { supabase } = require('../services/supabaseClient');
const userService = require('../services/userService');

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
    
    // Resolve role from our user table first, then fall back to Supabase metadata
    let resolvedRole = 'user';
    try {
      const dbUser = await userService.getUserByEmail(user.email);
      if (dbUser && dbUser.role) {
        resolvedRole = dbUser.role;
      } else if (user.user_metadata?.role) {
        resolvedRole = user.user_metadata.role;
      }
    } catch (e) {
      console.warn('Role resolution fallback to metadata due to error:', e);
      if (user.user_metadata?.role) {
        resolvedRole = user.user_metadata.role;
      }
    }

    // Set user info in request
    req.user = {
      id: user.id,
      email: user.email,
      role: resolvedRole
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

    // Resolve role from DB or metadata for hybrid middleware as well
    let resolvedRole = 'user';
    try {
      const dbUser = await userService.getUserByEmail(user.email);
      if (dbUser && dbUser.role) {
        resolvedRole = dbUser.role;
      } else if (user.user_metadata?.role) {
        resolvedRole = user.user_metadata.role;
      }
    } catch (e) {
      console.warn('Role resolution fallback to metadata (hybrid):', e);
      if (user.user_metadata?.role) {
        resolvedRole = user.user_metadata.role;
      }
    }

    req.user = { id: user.id, email: user.email, role: resolvedRole };
    return next();
  } catch (error) {
    console.error('Supabase token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Require Admin Role Middleware
 * Only allows users with role 'admin_it'
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== 'admin_it') {
    return res.status(403).json({ success: false, message: 'Admin privileges required' });
  }
  next();
};

/**
 * Factory to require any of the allowed roles
 */
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient role' });
  }
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
  requireRole,
  generateToken
};
