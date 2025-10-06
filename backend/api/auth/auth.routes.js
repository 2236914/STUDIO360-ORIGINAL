const express = require('express');
const router = express.Router();
const { generateToken } = require('../../middleware/auth');
const userService = require('../../services/userService');

router.get('/health', (req, res) => {
	res.json({ success: true, service: 'auth', status: 'ok' });
});

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // For now, we'll create a simple login that works with any email
    // In a real app, you'd verify the password against the database
    let user = await userService.getUserByEmail(email);
    
    if (!user) {
      // Create a new user if they don't exist (for testing)
      user = await userService.createUser({
        email,
        name: email.split('@')[0], // Use email prefix as name
        role: 'user'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await userService.createUser({
      email,
      name,
      role: 'user'
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
