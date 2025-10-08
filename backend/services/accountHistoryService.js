const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class AccountHistoryService {
  /**
   * Get user's login history with pagination and filtering
   */
  async getUserLoginHistory(userId, options = {}, userToken = null) {
    try {
      const {
        limit = 50,
        offset = 0,
        activityType = 'login',
        status = null,
        startDate = null,
        endDate = null,
        search = null
      } = options;

      // Create a Supabase client with the user's token for RLS to work properly
      let supabaseClient = supabase;
      if (userToken) {
        const { createClient } = require('@supabase/supabase-js');
        supabaseClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${userToken}`
              }
            }
          }
        );
      }

      console.log('Account History Service: Getting user login history with user token:', !!userToken);

      let query = supabaseClient
        .from('account_history')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      if (search) {
        query = query.or(`device_type.ilike.%${search}%,location.ilike.%${search}%,ip_address.ilike.%${search}%,browser_name.ilike.%${search}%,operating_system.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching login history:', error);
        throw new Error(`Failed to fetch login history: ${error.message}`);
      }

      return {
        success: true,
        data: data || [],
        total: count || 0,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error in getUserLoginHistory:', error);
      throw error;
    }
  }

  /**
   * Log a new account activity
   */
  async logAccountActivity(activityData, userToken = null) {
    try {
      const {
        userId,
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
      } = activityData;

      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Create a Supabase client with the user's token for RLS to work properly
      let supabaseClient = supabase;
      if (userToken) {
        const { createClient } = require('@supabase/supabase-js');
        supabaseClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${userToken}`
              }
            }
          }
        );
      }

      console.log('Account History Service: Using user token for RLS:', !!userToken);
      console.log('Account History Service: User ID:', userId);

      const { data, error } = await supabaseClient
        .from('account_history')
        .insert([{
          user_id: userId,
          activity_type: activityType,
          status,
          device_type: deviceType,
          browser_name: browserName,
          operating_system: operatingSystem,
          user_agent: userAgent,
          ip_address: ipAddress,
          location,
          country,
          city,
          session_id: sessionId,
          is_mobile: isMobile,
          is_tablet: isTablet,
          is_desktop: isDesktop
        }])
        .select()
        .single();

      if (error) {
        console.error('Error logging account activity:', error);
        throw new Error(`Failed to log account activity: ${error.message}`);
      }

      return {
        success: true,
        data,
        message: 'Account activity logged successfully'
      };
    } catch (error) {
      console.error('Error in logAccountActivity:', error);
      throw error;
    }
  }

  /**
   * Clear user's login history
   */
  async clearUserHistory(userId, activityType = 'login') {
    try {
      const { error } = await supabase
        .from('account_history')
        .delete()
        .eq('user_id', userId)
        .eq('activity_type', activityType);

      if (error) {
        console.error('Error clearing user history:', error);
        throw new Error(`Failed to clear user history: ${error.message}`);
      }

      return {
        success: true,
        message: 'Login history cleared successfully'
      };
    } catch (error) {
      console.error('Error in clearUserHistory:', error);
      throw error;
    }
  }

  /**
   * Delete a specific history entry
   */
  async deleteHistoryEntry(userId, entryId) {
    try {
      const { error } = await supabase
        .from('account_history')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting history entry:', error);
        throw new Error(`Failed to delete history entry: ${error.message}`);
      }

      return {
        success: true,
        message: 'History entry deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteHistoryEntry:', error);
      throw error;
    }
  }

  /**
   * Get history statistics for a user
   */
  async getUserHistoryStats(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_login_history', {
          p_user_id: userId,
          p_limit: 1000,
          p_offset: 0
        });

      if (error) {
        console.error('Error fetching history stats:', error);
        throw new Error(`Failed to fetch history statistics: ${error.message}`);
      }

      const history = data || [];
      
      // Calculate statistics
      const stats = {
        totalLogins: history.length,
        successfulLogins: history.filter(h => h.status === 'successful').length,
        failedLogins: history.filter(h => h.status === 'failed').length,
        suspiciousLogins: history.filter(h => h.status === 'suspicious').length,
        uniqueDevices: [...new Set(history.map(h => h.device_type))].length,
        uniqueLocations: [...new Set(history.map(h => h.location))].length,
        uniqueIpAddresses: [...new Set(history.map(h => h.ip_address))].length,
        lastLogin: history.length > 0 ? history[0].created_at : null,
        deviceBreakdown: this.getDeviceBreakdown(history),
        locationBreakdown: this.getLocationBreakdown(history)
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in getUserHistoryStats:', error);
      throw error;
    }
  }

  /**
   * Helper method to get device breakdown
   */
  getDeviceBreakdown(history) {
    const breakdown = {};
    history.forEach(entry => {
      const device = entry.device_type || 'Unknown';
      breakdown[device] = (breakdown[device] || 0) + 1;
    });
    return breakdown;
  }

  /**
   * Helper method to get location breakdown
   */
  getLocationBreakdown(history) {
    const breakdown = {};
    history.forEach(entry => {
      const location = entry.location || 'Unknown';
      breakdown[location] = (breakdown[location] || 0) + 1;
    });
    return breakdown;
  }

  /**
   * Export user history as CSV
   */
  async exportUserHistory(userId, options = {}) {
    try {
      const { activityType = 'login', format = 'csv' } = options;
      
      const result = await this.getUserLoginHistory(userId, { 
        ...options, 
        limit: 10000 // Large limit for export
      });

      if (format === 'csv') {
        return this.formatAsCSV(result.data);
      }
      
      return result;
    } catch (error) {
      console.error('Error in exportUserHistory:', error);
      throw error;
    }
  }

  /**
   * Helper method to format data as CSV
   */
  formatAsCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = [
      'Date',
      'Time', 
      'Activity Type',
      'Status',
      'Device',
      'Browser',
      'OS',
      'Location',
      'IP Address'
    ];

    const rows = data.map(entry => [
      this.formatDate(entry.created_at),
      this.formatTime(entry.created_at),
      entry.activity_type,
      entry.status,
      entry.device_type || '',
      entry.browser_name || '',
      entry.operating_system || '',
      entry.location || '',
      entry.ip_address || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Helper method to format date
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US');
  }

  /**
   * Helper method to format time
   */
  formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('en-US');
  }

  /**
   * Detect device type from user agent
   */
  detectDeviceInfo(userAgent) {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Tablet)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Extract browser info
    let browserName = 'Unknown';
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';

    // Extract OS info
    let operatingSystem = 'Unknown';
    if (userAgent.includes('Windows')) operatingSystem = 'Windows';
    else if (userAgent.includes('Mac')) operatingSystem = 'macOS';
    else if (userAgent.includes('Linux')) operatingSystem = 'Linux';
    else if (userAgent.includes('Android')) operatingSystem = 'Android';
    else if (userAgent.includes('iOS')) operatingSystem = 'iOS';

    // Create device type string
    const deviceType = `${operatingSystem} ${browserName}`;

    return {
      deviceType,
      browserName,
      operatingSystem,
      isMobile,
      isTablet,
      isDesktop
    };
  }
}

module.exports = new AccountHistoryService();
