const { supabase } = require('./supabaseClient');

class VouchersService {
  // ============================================
  // VOUCHER METHODS
  // ============================================

  /**
   * Get all vouchers for a user with optional filters
   */
  async getVouchers(userId, filters = {}) {
    try {
      let query = supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching vouchers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVouchers:', error);
      return [];
    }
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(voucherId, userId) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('id', voucherId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching voucher:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getVoucherById:', error);
      return null;
    }
  }

  /**
   * Get voucher by code
   */
  async getVoucherByCode(code, userId) {
    try {
      const { data, error} = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching voucher by code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getVoucherByCode:', error);
      return null;
    }
  }

  /**
   * Create a new voucher
   */
  async createVoucher(userId, voucherData) {
    try {
      // Check if code already exists for this user
      const existing = await this.getVoucherByCode(voucherData.code, userId);
      if (existing) {
        return { error: 'Voucher code already exists' };
      }

      const { data, error } = await supabase
        .from('vouchers')
        .insert([{
          user_id: userId,
          ...voucherData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating voucher:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in createVoucher:', error);
      return { error: 'Failed to create voucher' };
    }
  }

  /**
   * Update voucher
   */
  async updateVoucher(voucherId, userId, updateData) {
    try {
      // If code is being updated, check if it already exists
      if (updateData.code) {
        const existing = await this.getVoucherByCode(updateData.code, userId);
        if (existing && existing.id !== voucherId) {
          return { error: 'Voucher code already exists' };
        }
      }

      const { data, error } = await supabase
        .from('vouchers')
        .update(updateData)
        .eq('id', voucherId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating voucher:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in updateVoucher:', error);
      return { error: 'Failed to update voucher' };
    }
  }

  /**
   * Delete voucher (soft delete)
   */
  async deleteVoucher(voucherId, userId) {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', voucherId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting voucher:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVoucher:', error);
      return false;
    }
  }

  /**
   * Delete multiple vouchers
   */
  async deleteVouchers(voucherIds, userId) {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', voucherIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting vouchers:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVouchers:', error);
      return false;
    }
  }

  /**
   * Toggle voucher status
   */
  async toggleVoucherStatus(voucherId, userId) {
    try {
      // Get current status
      const voucher = await this.getVoucherById(voucherId, userId);
      if (!voucher) return null;

      const newStatus = voucher.is_active ? false : true;
      const statusText = newStatus ? 'active' : 'inactive';

      const { data, error } = await supabase
        .from('vouchers')
        .update({ 
          is_active: newStatus,
          status: statusText
        })
        .eq('id', voucherId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error toggling voucher status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleVoucherStatus:', error);
      return null;
    }
  }

  // ============================================
  // VOUCHER VALIDATION METHODS
  // ============================================

  /**
   * Validate voucher code
   */
  async validateVoucher(userId, code, customerId = null, cartTotal = 0) {
    try {
      const { data, error } = await supabase
        .rpc('validate_voucher', {
          p_user_id: userId,
          p_code: code,
          p_customer_id: customerId,
          p_cart_total: cartTotal
        });

      if (error) {
        console.error('Error validating voucher:', error);
        return {
          is_valid: false,
          message: 'Failed to validate voucher'
        };
      }

      return data[0] || {
        is_valid: false,
        message: 'Invalid voucher'
      };
    } catch (error) {
      console.error('Error in validateVoucher:', error);
      return {
        is_valid: false,
        message: 'Failed to validate voucher'
      };
    }
  }

  /**
   * Apply voucher (record usage)
   */
  async applyVoucher(userId, voucherId, usageData) {
    try {
      const { data, error } = await supabase
        .from('voucher_usage')
        .insert([{
          voucher_id: voucherId,
          user_id: userId,
          ...usageData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error applying voucher:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in applyVoucher:', error);
      return null;
    }
  }

  /**
   * Get voucher usage history
   */
  async getVoucherUsage(voucherId, userId) {
    try {
      const { data, error } = await supabase
        .from('voucher_usage')
        .select('*')
        .eq('voucher_id', voucherId)
        .eq('user_id', userId)
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Error fetching voucher usage:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVoucherUsage:', error);
      return [];
    }
  }

  // ============================================
  // STATISTICS METHODS
  // ============================================

  /**
   * Get voucher statistics
   */
  async getVoucherStats(userId) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('status, usage_count, discount_value, type')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching voucher stats:', error);
        return {
          totalVouchers: 0,
          activeVouchers: 0,
          inactiveVouchers: 0,
          expiredVouchers: 0,
          totalUsage: 0,
        };
      }

      const stats = {
        totalVouchers: data.length,
        activeVouchers: data.filter(v => v.status === 'active').length,
        inactiveVouchers: data.filter(v => v.status === 'inactive').length,
        expiredVouchers: data.filter(v => v.status === 'expired').length,
        usedVouchers: data.filter(v => v.status === 'used').length,
        totalUsage: data.reduce((sum, v) => sum + (v.usage_count || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error('Error in getVoucherStats:', error);
      return {
        totalVouchers: 0,
        activeVouchers: 0,
        inactiveVouchers: 0,
        expiredVouchers: 0,
        totalUsage: 0,
      };
    }
  }
}

module.exports = new VouchersService();

