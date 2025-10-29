const { supabase } = require('./supabaseClient');

class StorePagesService {
  // ============================================
  // HOMEPAGE METHODS
  // ============================================

  /**
   * Get hero section
   */
  async getHeroSection(userId) {
    try {
      const { data, error } = await supabase
        .from('store_hero_section')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching hero section:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getHeroSection:', error);
      return null;
    }
  }

  /**
   * Update hero section
   */
  async upsertHeroSection(userId, heroData) {
    try {
      const { data, error } = await supabase
        .from('store_hero_section')
        .upsert([{
          user_id: userId,
          ...heroData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting hero section:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertHeroSection:', error);
      return null;
    }
  }

  /**
   * Get featured products section
   */
  async getFeaturedProducts(userId) {
    try {
      const { data, error } = await supabase
        .from('store_featured_products')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching featured products:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return null;
    }
  }

  /**
   * Update featured products section
   */
  async upsertFeaturedProducts(userId, featuredData) {
    try {
      const { data, error } = await supabase
        .from('store_featured_products')
        .upsert([{
          user_id: userId,
          ...featuredData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting featured products:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertFeaturedProducts:', error);
      return null;
    }
  }

  /**
   * Get featured product items
   */
  async getFeaturedProductItems(userId) {
    try {
      const { data, error } = await supabase
        .from('featured_product_items')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching featured product items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedProductItems:', error);
      return [];
    }
  }

  /**
   * Update featured product items (replaces all items)
   */
  async upsertFeaturedProductItems(userId, productIds) {
    try {
      // Delete all existing items
      await supabase
        .from('featured_product_items')
        .delete()
        .eq('user_id', userId);

      // Insert new items
      if (productIds && productIds.length > 0) {
        const items = productIds.map((productId, index) => ({
          user_id: userId,
          product_id: productId,
          display_order: index
        }));

        const { data, error } = await supabase
          .from('featured_product_items')
          .insert(items)
          .select();

        if (error) {
          console.error('Error upserting featured product items:', error);
          return [];
        }

        return data || [];
      }

      return [];
    } catch (error) {
      console.error('Error in upsertFeaturedProductItems:', error);
      return [];
    }
  }

  /**
   * Get categories
   */
  async getCategories(userId) {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * Create category
   */
  async createCategory(userId, categoryData) {
    try {
      const { data, error} = await supabase
        .from('store_categories')
        .insert([{
          user_id: userId,
          ...categoryData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createCategory:', error);
      return null;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId, updateData) {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      return null;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabase
        .from('store_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      return false;
    }
  }

  /**
   * Get split feature
   */
  async getSplitFeature(userId) {
    try {
      const { data, error } = await supabase
        .from('store_split_feature')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching split feature:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSplitFeature:', error);
      return null;
    }
  }

  /**
   * Update split feature
   */
  async upsertSplitFeature(userId, featureData) {
    try {
      const { data, error } = await supabase
        .from('store_split_feature')
        .upsert([{
          user_id: userId,
          ...featureData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting split feature:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertSplitFeature:', error);
      return null;
    }
  }

  /**
   * Get coupon
   */
  async getCoupon(userId) {
    try {
      const { data, error } = await supabase
        .from('store_coupon')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching coupon:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCoupon:', error);
      return null;
    }
  }

  /**
   * Get welcome popup settings
   */
  async getWelcomePopup(userId) {
    try {
      const { data, error } = await supabase
        .from('store_welcome_popup')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If table doesn't exist yet (42P01) or no rows (PGRST116), treat as no data
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        console.error('Error fetching welcome popup:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getWelcomePopup:', error);
      return null;
    }
  }

  /**
   * Update welcome popup settings
   */
  async upsertWelcomePopup(userId, popupData) {
    try {
      const { data, error } = await supabase
        .from('store_welcome_popup')
        .upsert([
          {
            user_id: userId,
            ...popupData,
          },
        ], {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          // Table missing in this environment; act as no-op so the rest of the page still saves.
          return null;
        }
        console.error('Error upserting welcome popup:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertWelcomePopup:', error);
      return null;
    }
  }

  /**
   * Update coupon
   */
  async upsertCoupon(userId, couponData) {
    try {
      const { data, error } = await supabase
        .from('store_coupon')
        .upsert([{
          user_id: userId,
          ...couponData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting coupon:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertCoupon:', error);
      return null;
    }
  }

  /**
   * Get events block
   */
  async getEventsBlock(userId) {
    try {
      const { data, error } = await supabase
        .from('store_events_block')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching events block:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getEventsBlock:', error);
      return null;
    }
  }

  /**
   * Update events block
   */
  async upsertEventsBlock(userId, eventsData) {
    try {
      const { data, error } = await supabase
        .from('store_events_block')
        .upsert([{
          user_id: userId,
          ...eventsData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting events block:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertEventsBlock:', error);
      return null;
    }
  }

  /**
   * Get platforms
   */
  async getPlatforms(userId) {
    try {
      const { data, error } = await supabase
        .from('store_platforms')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching platforms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPlatforms:', error);
      return [];
    }
  }

  /**
   * Create platform
   */
  async createPlatform(userId, platformData) {
    try {
      // Map incoming fields to DB columns explicitly to avoid unknown columns
      const payload = {
        user_id: userId,
        platform_name: platformData.platform_name || platformData.name || '',
        platform_url: platformData.platform_url || platformData.url || '',
        icon_name: platformData.icon_name || platformData.icon || '',
        logo_url: platformData.logo_url || '',
        display_order: platformData.display_order ?? 0,
        is_active: platformData.is_active !== false,
      };

      const { data, error } = await supabase
        .from('store_platforms')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error creating platform:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createPlatform:', error);
      return null;
    }
  }

  /**
   * Update platform
   */
  async updatePlatform(platformId, updateData) {
    try {
      // Only allow known columns to be updated
      const payload = {
        platform_name: updateData.platform_name || updateData.name,
        platform_url: updateData.platform_url || updateData.url,
        icon_name: updateData.icon_name || updateData.icon,
        logo_url: updateData.logo_url,
        display_order: updateData.display_order,
        is_active: updateData.is_active,
      };

      const { data, error } = await supabase
        .from('store_platforms')
        .update(payload)
        .eq('id', platformId)
        .select()
        .single();

      if (error) {
        console.error('Error updating platform:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePlatform:', error);
      return null;
    }
  }

  /**
   * Delete platform
   */
  async deletePlatform(platformId) {
    try {
      const { error } = await supabase
        .from('store_platforms')
        .delete()
        .eq('id', platformId);

      if (error) {
        console.error('Error deleting platform:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePlatform:', error);
      return false;
    }
  }

  /**
   * Get announcement
   */
  async getAnnouncement(userId) {
    try {
      const { data, error } = await supabase
        .from('store_announcement')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching announcement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAnnouncement:', error);
      return null;
    }
  }

  /**
   * Update announcement
   */
  async upsertAnnouncement(userId, announcementData) {
    try {
      const { data, error } = await supabase
        .from('store_announcement')
        .upsert([{
          user_id: userId,
          ...announcementData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting announcement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertAnnouncement:', error);
      return null;
    }
  }

  /**
   * Get complete homepage data
   */
  async getCompleteHomepageData(userId) {
    try {
      const [
        heroSection,
        featuredProducts,
        featuredProductItems,
        categories,
        splitFeature,
        coupon,
        welcomePopup,
        eventsBlock,
        platforms,
        announcement
      ] = await Promise.all([
        this.getHeroSection(userId),
        this.getFeaturedProducts(userId),
        this.getFeaturedProductItems(userId),
        this.getCategories(userId),
        this.getSplitFeature(userId),
        this.getCoupon(userId),
        this.getWelcomePopup(userId),
        this.getEventsBlock(userId),
        this.getPlatforms(userId),
        this.getAnnouncement(userId)
      ]);

      return {
        heroSection,
        featuredProducts: {
          ...featuredProducts,
          productIds: featuredProductItems.map(item => item.product_id)
        },
        categories,
        splitFeature,
        coupon,
        welcomePopup,
        eventsBlock,
        platforms,
        announcement
      };
    } catch (error) {
      console.error('Error in getCompleteHomepageData:', error);
      return {};
    }
  }

  // ============================================
  // ABOUT PAGE METHODS
  // ============================================

  /**
   * Get shop story
   */
  async getShopStory(userId) {
    try {
      const { data, error } = await supabase
        .from('store_shop_story')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching shop story:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getShopStory:', error);
      return null;
    }
  }

  /**
   * Update shop story
   */
  async upsertShopStory(userId, storyData) {
    try {
      const { data, error } = await supabase
        .from('store_shop_story')
        .upsert([{
          user_id: userId,
          ...storyData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting shop story:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertShopStory:', error);
      return null;
    }
  }

  /**
   * Get social media
   */
  async getSocialMedia(userId) {
    try {
      const { data, error } = await supabase
        .from('store_social_media')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching social media:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSocialMedia:', error);
      return null;
    }
  }

  /**
   * Update social media
   */
  async upsertSocialMedia(userId, socialData) {
    try {
      const { data, error } = await supabase
        .from('store_social_media')
        .upsert([{
          user_id: userId,
          ...socialData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting social media:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertSocialMedia:', error);
      return null;
    }
  }

  /**
   * Get social platforms
   */
  async getSocialPlatforms(userId) {
    try {
      const { data, error } = await supabase
        .from('store_social_platforms')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching social platforms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSocialPlatforms:', error);
      return [];
    }
  }

  /**
   * Create social platform
   */
  async createSocialPlatform(userId, platformData) {
    try {
      const { data, error } = await supabase
        .from('store_social_platforms')
        .insert([{
          user_id: userId,
          ...platformData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating social platform:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createSocialPlatform:', error);
      return null;
    }
  }

  /**
   * Update social platform
   */
  async updateSocialPlatform(platformId, updateData) {
    try {
      const { data, error } = await supabase
        .from('store_social_platforms')
        .update(updateData)
        .eq('id', platformId)
        .select()
        .single();

      if (error) {
        console.error('Error updating social platform:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateSocialPlatform:', error);
      return null;
    }
  }

  /**
   * Delete social platform
   */
  async deleteSocialPlatform(platformId) {
    try {
      const { error } = await supabase
        .from('store_social_platforms')
        .delete()
        .eq('id', platformId);

      if (error) {
        console.error('Error deleting social platform:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSocialPlatform:', error);
      return false;
    }
  }

  /**
   * Get complete about page data
   */
  async getCompleteAboutData(userId) {
    try {
      const [shopStory, socialMedia, socialPlatforms] = await Promise.all([
        this.getShopStory(userId),
        this.getSocialMedia(userId),
        this.getSocialPlatforms(userId)
      ]);

      return {
        shopStory,
        socialMedia,
        socialPlatforms
      };
    } catch (error) {
      console.error('Error in getCompleteAboutData:', error);
      return {};
    }
  }

  // ============================================
  // SHIPPING PAGE METHODS
  // ============================================

  /**
   * Get local shipping
   */
  async getLocalShipping(userId) {
    try {
      const { data, error } = await supabase
        .from('store_local_shipping')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching local shipping:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLocalShipping:', error);
      return null;
    }
  }

  /**
   * Update local shipping
   */
  async upsertLocalShipping(userId, shippingData) {
    try {
      const { data, error } = await supabase
        .from('store_local_shipping')
        .upsert([{
          user_id: userId,
          ...shippingData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting local shipping:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertLocalShipping:', error);
      return null;
    }
  }

  /**
   * Get international shipping
   */
  async getInternationalShipping(userId) {
    try {
      const { data, error } = await supabase
        .from('store_international_shipping')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching international shipping:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getInternationalShipping:', error);
      return null;
    }
  }

  /**
   * Update international shipping
   */
  async upsertInternationalShipping(userId, shippingData) {
    try {
      const { data, error } = await supabase
        .from('store_international_shipping')
        .upsert([{
          user_id: userId,
          ...shippingData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting international shipping:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertInternationalShipping:', error);
      return null;
    }
  }

  /**
   * Get shipping rates
   */
  async getShippingRates(userId) {
    try {
      const { data, error } = await supabase
        .from('store_shipping_rates')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching shipping rates:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getShippingRates:', error);
      return null;
    }
  }

  /**
   * Update shipping rates
   */
  async upsertShippingRates(userId, ratesData) {
    try {
      const { data, error } = await supabase
        .from('store_shipping_rates')
        .upsert([{
          user_id: userId,
          ...ratesData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting shipping rates:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertShippingRates:', error);
      return null;
    }
  }

  /**
   * Get return policy
   */
  async getReturnPolicy(userId) {
    try {
      const { data, error } = await supabase
        .from('store_return_policy')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching return policy:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getReturnPolicy:', error);
      return null;
    }
  }

  /**
   * Update return policy
   */
  async upsertReturnPolicy(userId, policyData) {
    try {
      const { data, error } = await supabase
        .from('store_return_policy')
        .upsert([{
          user_id: userId,
          ...policyData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting return policy:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertReturnPolicy:', error);
      return null;
    }
  }

  /**
   * Get FAQs
   */
  async getFAQs(userId) {
    try {
      const { data, error } = await supabase
        .from('store_faqs')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFAQs:', error);
      return [];
    }
  }

  /**
   * Create FAQ
   */
  async createFAQ(userId, faqData) {
    try {
      const { data, error } = await supabase
        .from('store_faqs')
        .insert([{
          user_id: userId,
          ...faqData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating FAQ:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createFAQ:', error);
      return null;
    }
  }

  /**
   * Update FAQ
   */
  async updateFAQ(faqId, updateData) {
    try {
      const { data, error } = await supabase
        .from('store_faqs')
        .update(updateData)
        .eq('id', faqId)
        .select()
        .single();

      if (error) {
        console.error('Error updating FAQ:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateFAQ:', error);
      return null;
    }
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(faqId) {
    try {
      const { error } = await supabase
        .from('store_faqs')
        .delete()
        .eq('id', faqId);

      if (error) {
        console.error('Error deleting FAQ:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFAQ:', error);
      return false;
    }
  }

  /**
   * Get complete shipping page data
   */
  async getCompleteShippingData(userId) {
    try {
      const [
        localShipping,
        internationalShipping,
        shippingRates,
        returnPolicy,
        faqs
      ] = await Promise.all([
        this.getLocalShipping(userId),
        this.getInternationalShipping(userId),
        this.getShippingRates(userId),
        this.getReturnPolicy(userId),
        this.getFAQs(userId)
      ]);

      return {
        localShipping,
        internationalShipping,
        shippingRates,
        returnPolicy,
        faqs
      };
    } catch (error) {
      console.error('Error in getCompleteShippingData:', error);
      return {};
    }
  }

  // ============================================
  // CUSTOMER SUPPORT METHODS
  // ============================================

  /**
   * Get WhatsApp settings
   */
  async getWhatsAppSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('store_whatsapp_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getWhatsAppSettings:', error);
      return null;
    }
  }

  /**
   * Update WhatsApp settings
   */
  async upsertWhatsAppSettings(userId, whatsappData) {
    try {
      const { data, error } = await supabase
        .from('store_whatsapp_settings')
        .upsert([{
          user_id: userId,
          ...whatsappData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting WhatsApp settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertWhatsAppSettings:', error);
      return null;
    }
  }

  /**
   * Get Gmail settings
   */
  async getGmailSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('store_gmail_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Gmail settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getGmailSettings:', error);
      return null;
    }
  }

  /**
   * Update Gmail settings
   */
  async upsertGmailSettings(userId, gmailData) {
    try {
      const { data, error } = await supabase
        .from('store_gmail_settings')
        .upsert([{
          user_id: userId,
          ...gmailData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting Gmail settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertGmailSettings:', error);
      return null;
    }
  }

  /**
   * Get FAQ Chatbot settings
   */
  async getFAQChatbotSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('store_faq_chatbot_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching FAQ Chatbot settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getFAQChatbotSettings:', error);
      return null;
    }
  }

  /**
   * Update FAQ Chatbot settings
   */
  async upsertFAQChatbotSettings(userId, chatbotData) {
    try {
      const { data, error } = await supabase
        .from('store_faq_chatbot_settings')
        .upsert([{
          user_id: userId,
          ...chatbotData
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting FAQ Chatbot settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertFAQChatbotSettings:', error);
      return null;
    }
  }

  /**
   * Get FAQ Chatbot items
   */
  async getFAQChatbotItems(userId) {
    try {
      const { data, error } = await supabase
        .from('store_faq_chatbot_items')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQ Chatbot items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFAQChatbotItems:', error);
      return [];
    }
  }

  /**
   * Create FAQ Chatbot item
   */
  async createFAQChatbotItem(userId, itemData) {
    try {
      const { data, error } = await supabase
        .from('store_faq_chatbot_items')
        .insert([{
          user_id: userId,
          ...itemData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating FAQ Chatbot item:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createFAQChatbotItem:', error);
      return null;
    }
  }

  /**
   * Update FAQ Chatbot item
   */
  async updateFAQChatbotItem(itemId, updateData) {
    try {
      const { data, error } = await supabase
        .from('store_faq_chatbot_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error updating FAQ Chatbot item:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateFAQChatbotItem:', error);
      return null;
    }
  }

  /**
   * Delete FAQ Chatbot item
   */
  async deleteFAQChatbotItem(itemId) {
    try {
      const { error } = await supabase
        .from('store_faq_chatbot_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting FAQ Chatbot item:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFAQChatbotItem:', error);
      return false;
    }
  }

  /**
   * Get complete customer support data
   */
  async getCompleteCustomerSupportData(userId) {
    try {
      const [
        whatsappSettings,
        gmailSettings,
        faqChatbotSettings,
        faqChatbotItems
      ] = await Promise.all([
        this.getWhatsAppSettings(userId),
        this.getGmailSettings(userId),
        this.getFAQChatbotSettings(userId),
        this.getFAQChatbotItems(userId)
      ]);

      return {
        whatsappSettings,
        gmailSettings,
        faqChatbotSettings,
        faqChatbotItems
      };
    } catch (error) {
      console.error('Error in getCompleteCustomerSupportData:', error);
      return {};
    }
  }

  // ============================================
  // EVENTS METHODS
  // ============================================

  /**
   * Get all events for a user
   */
  async getEvents(userId) {
    try {
      const { data, error } = await supabase
        .from('store_events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  /**
   * Get active events (for public storefront)
   */
  async getActiveEvents(userId) {
    try {
      const { data, error } = await supabase
        .from('store_events')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0]) // Only future events
        .order('event_date', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching active events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveEvents:', error);
      return [];
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('store_events')
        .select('*')
        .eq('id', eventId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getEventById:', error);
      return null;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(userId, eventData) {
    try {
      const { data, error } = await supabase
        .from('store_events')
        .insert([{
          user_id: userId,
          ...eventData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      return null;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(eventId, userId, eventData) {
    try {
      const { data, error } = await supabase
        .from('store_events')
        .update(eventData)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('store_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      return false;
    }
  }
}

module.exports = new StorePagesService();

