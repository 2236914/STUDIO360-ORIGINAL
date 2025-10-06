const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @route GET /api/auth/user/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming JWT middleware sets req.user
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove sensitive data
    const { deleted_at, ...userProfile } = user;
    
    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/auth/user/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { name, email } = req.body;
    
    // Validate input
    if (!name && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field (name or email) is required' 
      });
    }

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await userService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update user profile' 
      });
    }

    // Remove sensitive data
    const { deleted_at, ...userProfile } = updatedUser;
    
    res.json({
      success: true,
      data: userProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/auth/user/:id
 * @desc Get user by ID (admin only)
 * @access Private (Admin)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Check if user is admin or requesting their own data
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove sensitive data
    const { deleted_at, ...userProfile } = user;
    
    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/auth/user
 * @desc Get all users (admin only)
 * @access Private (Admin)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    const { limit = 10, offset = 0, role } = req.query;
    
    const users = await userService.getAllUsers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      role
    });

    // Remove sensitive data from all users
    const sanitizedUsers = users.map(user => {
      const { deleted_at, ...userProfile } = user;
      return userProfile;
    });
    
    res.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: sanitizedUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/auth/user/:id
 * @desc Delete user (admin only)
 * @access Private (Admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const success = await userService.deleteUser(id);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user' 
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
