const { supabase } = require('./supabaseClient');
const emailService = require('./emailService');
const emailPreferencesService = require('./emailPreferencesService');

class UserService {

  /**
   * Get user by ID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('user_model')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      // Normalize timestamp fields to either ISO strings or null
      if (data) {
        try {
          data.created_at = data.created_at ? new Date(data.created_at).toISOString() : null;
        } catch (e) {
          data.created_at = null;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'last_login')) {
          try {
            data.last_login = data.last_login ? new Date(data.last_login).toISOString() : null;
          } catch (e) {
            data.last_login = null;
          }
        }
        if (data.role) data.role = String(data.role).toLowerCase();
      }

      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('user_model')
        .select('*')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching user by email:', error);
        return null;
      }

      // Normalize timestamp fields to either ISO strings or null
      if (data) {
        try {
          data.created_at = data.created_at ? new Date(data.created_at).toISOString() : null;
        } catch (e) {
          data.created_at = null;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'last_login')) {
          try {
            data.last_login = data.last_login ? new Date(data.last_login).toISOString() : null;
          } catch (e) {
            data.last_login = null;
          }
        }
        if (data.role) data.role = String(data.role).toLowerCase();
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.name - User name
   * @param {string} userData.role - User role (default: 'user')
   * @returns {Promise<Object|null>} Created user object or null if failed
   */
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('user_model')
        .insert([{
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      // Send welcome email to the new user
      try {
        const emailData = {
          customerName: userData.name,
          accountEmail: userData.email
        };
        await emailService.sendWelcomeEmail(data.id, emailData);
        console.log('✅ Welcome email sent to:', userData.email);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail user creation if email fails
      }

      // Initialize default email preferences for the new user
      try {
        await emailPreferencesService.initializeDefaults(data.id);
        console.log('✅ Email preferences initialized for user:', data.id);
      } catch (prefError) {
        console.error('Error initializing email preferences:', prefError);
        // Don't fail user creation if preferences init fails
      }

      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user object or null if failed
   */
  async updateUser(userId, updateData) {
    try {
      // Sanitize timestamp fields so we don't send string 'null' to Postgres
      const sanitized = { ...updateData };
      if (sanitized.created_at === 'null' || sanitized.created_at === 'undefined') sanitized.created_at = null;
      if (sanitized.created_at) {
        try { sanitized.created_at = new Date(sanitized.created_at).toISOString(); } catch (e) { sanitized.created_at = null; }
      }
      if (sanitized.last_login === 'null' || sanitized.last_login === 'undefined') sanitized.last_login = null;
      if (sanitized.last_login) {
        try { sanitized.last_login = new Date(sanitized.last_login).toISOString(); } catch (e) { sanitized.last_login = null; }
      }
      if (sanitized.role) sanitized.role = String(sanitized.role).toLowerCase();

      const { data, error } = await supabase
        .from('user_model')
        .update(sanitized)
        .eq('id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }

  /**
   * Soft delete user by ID
   * @param {string} userId - User UUID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('user_model')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  }

  /**
   * Get all users (for admin purposes)
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of users to return
   * @param {number} options.offset - Offset for pagination
   * @param {string} options.role - Filter by role
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers(options = {}) {
    try {
      let query = supabase
        .from('user_model')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (options.role) {
        query = query.eq('role', options.role);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    try {
      const { data, error } = await supabase
        .from('user_model')
        .select('id')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking email existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in emailExists:', error);
      return false;
    }
  }

  /**
   * Get user count by role
   * @param {string} role - Role to count
   * @returns {Promise<number>} Number of users with the role
   */
  async getUserCountByRole(role) {
    try {
      const { count, error } = await supabase
        .from('user_model')
        .select('*', { count: 'exact', head: true })
        .eq('role', role)
        .is('deleted_at', null);

      if (error) {
        console.error('Error getting user count by role:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUserCountByRole:', error);
      return 0;
    }
  }
}

module.exports = new UserService();
