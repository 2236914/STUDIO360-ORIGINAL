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
 * Hybrid Authentication Middleware
 * Tries Supabase first, falls back to custom JWT
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

  // Try Supabase authentication first
  if (supabase) {
    try {
      console.log('Hybrid auth: Attempting Supabase token verification...');
      
      // Create a client with the user's token for auth
      const { createClient } = require('@supabase/supabase-js');
      const userSupabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      
      const { data: { user }, error } = await userSupabase.auth.getUser(token);
      
      console.log('Hybrid auth: Supabase verification result:', { 
        hasUser: !!user, 
        userId: user?.id, 
        email: user?.email, 
        error: error?.message 
      });
      
      if (!error && user) {
        // Supabase token is valid
        console.log('✅ Hybrid auth: Supabase token valid for user:', user.id);
        req.user = {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user'
        };
        return next();
      } else {
        console.log('⚠️ Supabase auth failed:', error?.message);
      }
    } catch (error) {
      // Supabase verification failed, try custom JWT
      console.log('Hybrid auth: Supabase token verification error:', error.message);
    }
  }

  // Fall back to custom JWT verification
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-key-here') {
    console.error('⚠️ JWT_SECRET not configured properly');
    console.log('Attempting to use Supabase auth only...');
    return res.status(401).json({ 
      success: false, 
      message: 'JWT_SECRET not configured. Please set JWT_SECRET in backend/.env' 
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
  generateToken
};
