const { supabase } = require('./supabaseClient');

class ShopService {
  /**
   * Get shop information by user ID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} Shop info object or null if not found
   */
  async getShopInfo(userId) {
    try {
      console.log('Getting shop info for user ID:', userId);
      
      const { data, error } = await supabase
        .from('shop_info')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      console.log('Shop info query result:', { data, error });

      if (error) {
        console.error('Error fetching shop info:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getShopInfo:', error);
      return null;
    }
  }

  /**
   * Create or update shop information
   * @param {string} userId - User UUID
   * @param {Object} shopData - Shop data
   * @returns {Promise<Object|null>} Created/updated shop info or null if failed
   */
  async upsertShopInfo(userId, shopData) {
    try {
      const { data, error } = await supabase
        .from('shop_info')
        .upsert([{
          user_id: userId,
          ...shopData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting shop info:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertShopInfo:', error);
      return null;
    }
  }

  /**
   * Get shipping settings by user ID
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} Shipping settings or null if not found
   */
  async getShippingSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('shipping_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching shipping settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getShippingSettings:', error);
      return null;
    }
  }

  /**
   * Create or update shipping settings
   * @param {string} userId - User UUID
   * @param {Object} settingsData - Shipping settings data
   * @returns {Promise<Object|null>} Created/updated settings or null if failed
   */
  async upsertShippingSettings(userId, settingsData) {
    try {
      const { data, error } = await supabase
        .from('shipping_settings')
        .upsert([{
          user_id: userId,
          ...settingsData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting shipping settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertShippingSettings:', error);
      return null;
    }
  }

  /**
   * Get all couriers for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} Array of courier objects
   */
  async getCouriers(userId) {
    try {
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching couriers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCouriers:', error);
      return [];
    }
  }

  /**
   * Create a new courier
   * @param {string} userId - User UUID
   * @param {Object} courierData - Courier data
   * @returns {Promise<Object|null>} Created courier or null if failed
   */
  async createCourier(userId, courierData) {
    try {
      const { data, error } = await supabase
        .from('couriers')
        .insert([{
          user_id: userId,
          ...courierData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating courier:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createCourier:', error);
      return null;
    }
  }

  /**
   * Update courier
   * @param {string} courierId - Courier UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated courier or null if failed
   */
  async updateCourier(courierId, updateData) {
    try {
      const { data, error } = await supabase
        .from('couriers')
        .update(updateData)
        .eq('id', courierId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating courier:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCourier:', error);
      return null;
    }
  }

  /**
   * Delete courier (soft delete)
   * @param {string} courierId - Courier UUID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCourier(courierId) {
    try {
      const { error } = await supabase
        .from('couriers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', courierId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting courier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCourier:', error);
      return false;
    }
  }

  /**
   * Get regional shipping rates for a courier
   * @param {string} courierId - Courier UUID
   * @returns {Promise<Array>} Array of regional rate objects
   */
  async getRegionalRates(courierId) {
    try {
      const { data, error } = await supabase
        .from('regional_shipping_rates')
        .select('*')
        .eq('courier_id', courierId)
        .order('region_name', { ascending: true });

      if (error) {
        console.error('Error fetching regional rates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRegionalRates:', error);
      return [];
    }
  }

  /**
   * Create or update regional shipping rate
   * @param {string} courierId - Courier UUID
   * @param {Object} rateData - Rate data
   * @returns {Promise<Object|null>} Created/updated rate or null if failed
   */
  async upsertRegionalRate(courierId, rateData) {
    try {
      const { data, error } = await supabase
        .from('regional_shipping_rates')
        .upsert([{
          courier_id: courierId,
          ...rateData
        }], {
          onConflict: 'courier_id,region_name'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting regional rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertRegionalRate:', error);
      return null;
    }
  }

  /**
   * Get complete shop data (shop info, shipping settings, couriers with rates)
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Complete shop data
   */
  async getCompleteShopData(userId) {
    try {
      const [shopInfo, shippingSettings, couriers] = await Promise.all([
        this.getShopInfo(userId),
        this.getShippingSettings(userId),
        this.getCouriers(userId)
      ]);

      // Get regional rates for each courier
      const couriersWithRates = await Promise.all(
        couriers.map(async (courier) => {
          const rates = await this.getRegionalRates(courier.id);
          return {
            ...courier,
            rates
          };
        })
      );

      return {
        shopInfo,
        shippingSettings,
        couriers: couriersWithRates
      };
    } catch (error) {
      console.error('Error in getCompleteShopData:', error);
      return {
        shopInfo: null,
        shippingSettings: null,
        couriers: []
      };
    }
  }

  /**
   * Get active regions count for a user
   * @param {string} userId - User UUID
   * @returns {Promise<number>} Number of active regions
   */
  async getActiveRegionsCount(userId) {
    try {
      const { count, error } = await supabase
        .from('regional_shipping_rates')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .in('courier_id', 
          supabase
            .from('couriers')
            .select('id')
            .eq('user_id', userId)
            .is('deleted_at', null)
        );

      if (error) {
        console.error('Error getting active regions count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getActiveRegionsCount:', error);
      return 0;
    }
  }
}

module.exports = new ShopService();
