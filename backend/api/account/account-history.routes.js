const express = require('express');
const router = express.Router();
const accountHistoryService = require('../../services/accountHistoryService');
const { authenticateTokenHybrid } = require('../../middleware/auth');
const userService = require('../../services/userService');
const supabase = require('../../services/supabaseClient');

/**
 * @route POST /api/account/log-failed-login
 * @desc Log a failed login attempt (public, no auth required)
 * @access Public
 */
router.post('/log-failed-login', async (req, res) => {
  try {
    const {
      email,
      activityType = 'login',
      status = 'failed',
      deviceType,
      browserName,
      operatingSystem,
      userAgent,
      ipAddress = req.ip,
      location,
      country,
      city,
      isMobile = false,
      isTablet = false,
      isDesktop = true
    } = req.body;

    // Look up user by email
    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      // User doesn't exist, can't log to account_history
      console.log(`Failed login attempt for non-existent email: ${email}`);
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    // Auto-detect device info if not provided
    let deviceInfo = {};
    if (userAgent && (!deviceType || !browserName || !operatingSystem)) {
      deviceInfo = accountHistoryService.detectDeviceInfo(userAgent);
    }

    const activityData = {
      userId: user.id,
      activityType,
      status,
      deviceType: deviceType || deviceInfo.deviceType,
      browserName: browserName || deviceInfo.browserName,
      operatingSystem: operatingSystem || deviceInfo.operatingSystem,
      userAgent,
      ipAddress,
      location,
      country,
      city,
      isMobile: isMobile || deviceInfo.isMobile,
      isTablet: isTablet || deviceInfo.isTablet,
      isDesktop: isDesktop || deviceInfo.isDesktop
    };

    console.log('Backend: Logging failed login attempt for user:', user.id);

    // Use the database function with SECURITY DEFINER to bypass RLS
    // Convert null/undefined values to proper NULL
    const { data: historyId, error } = await supabase.rpc('log_account_activity', {
      p_user_id: user.id,
      p_activity_type: activityType,
      p_status: status,
      p_device_type: activityData.deviceType || null,
      p_browser_name: activityData.browserName || null,
      p_operating_system: activityData.operatingSystem || null,
      p_user_agent: userAgent || null,
      p_ip_address: ipAddress || null,
      p_location: location || null,
      p_country: country || null,
      p_city: city || null,
      p_is_mobile: activityData.isMobile,
      p_is_tablet: activityData.isTablet,
      p_is_desktop: activityData.isDesktop
    });

    if (error) {
      console.error('Error logging failed login attempt:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to log failed login attempt: ' + error.message
      });
    }
    
    console.log('Successfully logged failed login attempt with ID:', historyId);

    return res.json({
      success: true,
      message: 'Failed login attempt logged successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/account/log-failed-login:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

/**
 * @route GET /api/account/history
 * @desc Get user's login history with pagination and filtering
 * @access Private
 */
router.get('/history', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const {
      limit = 50,
      offset = 0,
      activityType = 'login',
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      activityType,
      status,
      startDate,
      endDate,
      search
    };

    // Get the user's token from the Authorization header for RLS
    const authHeader = req.headers['authorization'];
    const userToken = authHeader && authHeader.split(' ')[1];
    console.log('Backend: Getting login history with user token:', !!userToken);

    const result = await accountHistoryService.getUserLoginHistory(userId, options, userToken);
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total
      },
      message: 'Login history retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /api/account/history:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/account/history
 * @desc Log a new account activity
 * @access Private
 */
router.post('/history', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const {
      activityType = 'login',
      status = 'successful',
      deviceType,
      browserName,
      operatingSystem,
      userAgent,
      ipAddress,
      location,
      country,
      city,
      sessionId,
      isMobile = false,
      isTablet = false,
      isDesktop = true
    } = req.body;

    // Auto-detect device info if not provided
    let deviceInfo = {};
    if (userAgent && (!deviceType || !browserName || !operatingSystem)) {
      deviceInfo = accountHistoryService.detectDeviceInfo(userAgent);
    }

    const activityData = {
      userId,
      activityType,
      status,
      deviceType: deviceType || deviceInfo.deviceType,
      browserName: browserName || deviceInfo.browserName,
      operatingSystem: operatingSystem || deviceInfo.operatingSystem,
      userAgent,
      ipAddress: ipAddress || req.ip,
      location,
      country,
      city,
      sessionId,
      isMobile: isMobile || deviceInfo.isMobile,
      isTablet: isTablet || deviceInfo.isTablet,
      isDesktop: isDesktop || deviceInfo.isDesktop
    };

    console.log('Backend: Logging account activity with data:', activityData);
    console.log('Backend: User ID from auth:', userId);
    console.log('Backend: Auth user object:', req.user);

    // Get the user's token from the Authorization header for RLS
    const authHeader = req.headers['authorization'];
    const userToken = authHeader && authHeader.split(' ')[1];
    console.log('Backend: User token for RLS:', !!userToken);

    const result = await accountHistoryService.logAccountActivity(activityData, userToken);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/account/history:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/account/history
 * @desc Clear user's login history
 * @access Private
 */
router.delete('/history', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { activityType = 'login' } = req.body;

    const result = await accountHistoryService.clearUserHistory(userId, activityType);
    
    res.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/account/history:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/account/history/:id
 * @desc Delete a specific history entry
 * @access Private
 */
router.delete('/history/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'History entry ID is required' 
      });
    }

    const result = await accountHistoryService.deleteHistoryEntry(userId, id);
    
    res.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/account/history/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/account/history/stats
 * @desc Get user's history statistics
 * @access Private
 */
router.get('/history/stats', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const result = await accountHistoryService.getUserHistoryStats(userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/account/history/stats:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/account/history/export
 * @desc Export user's history as CSV
 * @access Private
 */
router.get('/history/export', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const {
      activityType = 'login',
      format = 'csv',
      startDate,
      endDate,
      status
    } = req.query;

    const options = {
      activityType,
      format,
      startDate,
      endDate,
      status
    };

    if (format === 'csv') {
      const csvData = await accountHistoryService.exportUserHistory(userId, options);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="login-history-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      const result = await accountHistoryService.exportUserHistory(userId, options);
      res.json(result);
    }
  } catch (error) {
    console.error('Error in GET /api/account/history/export:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/account/history/log-login
 * @desc Log a successful login attempt
 * @access Private
 */
router.post('/history/log-login', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Auto-detect device info
    const deviceInfo = accountHistoryService.detectDeviceInfo(userAgent);

    const activityData = {
      userId,
      activityType: 'login',
      status: 'successful',
      userAgent,
      ipAddress,
      ...deviceInfo
    };

    const result = await accountHistoryService.logAccountActivity(activityData);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/account/history/log-login:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

module.exports = router;
