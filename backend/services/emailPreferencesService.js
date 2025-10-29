const { supabase } = require('./supabaseClient');

class EmailPreferencesService {
  /**
   * Get email preferences for a user
   */
  async getPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching email preferences:', error);
        return null;
      }

      // If no preferences exist, return defaults
      if (!data) {
        return this.getDefaultPreferences();
      }

      return data;
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Create or update email preferences for a user
   */
  async setPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting email preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in setPreferences:', error);
      return null;
    }
  }

  /**
   * Update specific preference
   */
  async updatePreference(userId, preferenceKey, value) {
    try {
      const updateData = {
        [preferenceKey]: value,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          ...updateData,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating email preference:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePreference:', error);
      return null;
    }
  }

  /**
   * Get default email preferences
   */
  getDefaultPreferences() {
    return {
      order_confirmation: true,
      order_status_updates: true,
      new_order_alerts: true,
      low_stock_alerts: true,
      product_updates: true,
      marketing_emails: false,
      weekly_summary: true,
      send_to_email: null,
      notify_for_own_orders: false,
    };
  }

  /**
   * Initialize default preferences for a user if they don't exist
   */
  async initializeDefaults(userId) {
    try {
      const existing = await this.getPreferences(userId);
      
      if (existing) {
        return existing; // Already has preferences
      }

      // Create default preferences
      const defaults = this.getDefaultPreferences();
      return await this.setPreferences(userId, defaults);
    } catch (error) {
      console.error('Error initializing email preferences:', error);
      return null;
    }
  }

  /**
   * Check if user should receive a specific notification type
   */
  async shouldReceiveNotification(userId, notificationType) {
    try {
      const preferences = await this.getPreferences(userId);
      
      if (!preferences) {
        return true; // Default to sending if no preferences
      }

      const preferenceMap = {
        'order_confirmation': 'order_confirmation',
        'order_status_update': 'order_status_updates',
        'new_order_alert': 'new_order_alerts',
        'low_stock_alert': 'low_stock_alerts',
        'product_updates': 'product_updates',
        'marketing_emails': 'marketing_emails',
        'weekly_summary': 'weekly_summary'
      };

      const preferenceField = preferenceMap[notificationType];
      if (!preferenceField) {
        return true; // Default to sending unknown types
      }

      return preferences[preferenceField] !== false;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to sending on error
    }
  }

  /**
   * Get all notification history for a user
   */
  async getNotificationHistory(userId, filters = {}) {
    try {
      let query = supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.notification_type) {
        query = query.eq('notification_type', filters.notification_type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notification history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotificationHistory:', error);
      return [];
    }
  }
}

module.exports = new EmailPreferencesService();

