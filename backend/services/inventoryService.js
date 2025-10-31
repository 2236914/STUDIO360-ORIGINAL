const { supabase } = require('./supabaseClient');
const emailService = require('./emailService');

class InventoryService {
  // ============================================
  // PRODUCT METHODS
  // ============================================

  /**
   * Get all products for a user
   */
  async getProducts(userId, filters = {}) {
    try {
      let query = supabase
        .from('inventory_products')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.stock && filters.stock.length > 0) {
        query = query.in('stock_status', filters.stock);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId, userId) {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*')
        .eq('id', productId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  /**
   * Get public product by slug for a user
   */
  async getProductBySlug(userId, slug) {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*')
        .eq('user_id', userId)
        .eq('slug', slug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // not found
        console.error('Error fetching product by slug:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProductBySlug:', error);
      return null;
    }
  }

  /**
   * Create product
   */
  async createProduct(userId, productData) {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .insert([{
          user_id: userId,
          ...productData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        return null;
      }

      // Create stock movement record
      if (productData.stock_quantity > 0) {
        await this.createStockMovement(userId, {
          product_id: data.id,
          movement_type: 'purchase',
          quantity: productData.stock_quantity,
          previous_quantity: 0,
          new_quantity: productData.stock_quantity,
          reference_type: 'manual',
          notes: 'Initial stock',
        });
      }

      return data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      return null;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, userId, updateData) {
    try {
      // Get current product to track stock changes
      const currentProduct = await this.getProductById(productId, userId);
      
      const { data, error } = await supabase
        .from('inventory_products')
        .update(updateData)
        .eq('id', productId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }

      // Track stock movement if quantity changed
      if (currentProduct && updateData.stock_quantity !== undefined && 
          updateData.stock_quantity !== currentProduct.stock_quantity) {
        const quantityDiff = updateData.stock_quantity - currentProduct.stock_quantity;
        await this.createStockMovement(userId, {
          product_id: productId,
          movement_type: 'adjustment',
          quantity: Math.abs(quantityDiff),
          previous_quantity: currentProduct.stock_quantity,
          new_quantity: updateData.stock_quantity,
          reference_type: 'manual',
          notes: quantityDiff > 0 ? 'Stock increased' : 'Stock decreased',
        });
      }

      // Check for low stock and send alert if needed
      if (data && data.stock_quantity !== undefined && data.low_stock_threshold) {
        if (data.stock_quantity <= data.low_stock_threshold) {
          try {
            // Get user info for email
            const { data: userInfo } = await supabase
              .from('user_model')
              .select('email, name')
              .eq('id', userId)
              .single();

            if (userInfo) {
              const emailData = {
                productId: data.id,
                productName: data.name,
                currentStock: data.stock_quantity,
                minStockLevel: data.low_stock_threshold,
                ownerEmail: userInfo.email,
                ownerName: userInfo.name
              };
              await emailService.sendLowStockAlert(userId, emailData);
              console.log(`📧 Low stock alert sent for product: ${data.name}`);
            }
          } catch (emailError) {
            console.error('Error sending low stock alert:', emailError);
            // Don't fail product update if email fails
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return null;
    }
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(productId, userId) {
    try {
      const { error } = await supabase
        .from('inventory_products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', productId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  }

  /**
   * Delete multiple products
   */
  async deleteProducts(productIds, userId) {
    try {
      const { error } = await supabase
        .from('inventory_products')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', productIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting products:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProducts:', error);
      return false;
    }
  }

  // ============================================
  // PRODUCT VARIATIONS METHODS
  // ============================================

  /**
   * Get variations for a product
   */
  async getProductVariations(productId, userId) {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching variations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProductVariations:', error);
      return [];
    }
  }

  /**
   * Create product variation
   */
  async createVariation(userId, variationData) {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .insert([{
          user_id: userId,
          ...variationData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating variation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createVariation:', error);
      return null;
    }
  }

  /**
   * Update product variation
   */
  async updateVariation(variationId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .update(updateData)
        .eq('id', variationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating variation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateVariation:', error);
      return null;
    }
  }

  /**
   * Delete product variation
   */
  async deleteVariation(variationId, userId) {
    try {
      const { error } = await supabase
        .from('product_variations')
        .delete()
        .eq('id', variationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting variation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVariation:', error);
      return false;
    }
  }

  // ============================================
  // WHOLESALE PRICING METHODS
  // ============================================

  /**
   * Get wholesale pricing for a product
   */
  async getWholesalePricing(productId, userId) {
    try {
      const { data, error } = await supabase
        .from('wholesale_pricing')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .order('min_quantity', { ascending: true });

      if (error) {
        console.error('Error fetching wholesale pricing:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWholesalePricing:', error);
      return [];
    }
  }

  /**
   * Create wholesale price tier
   */
  async createWholesaleTier(userId, tierData) {
    try {
      const { data, error } = await supabase
        .from('wholesale_pricing')
        .insert([{
          user_id: userId,
          ...tierData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating wholesale tier:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createWholesaleTier:', error);
      return null;
    }
  }

  /**
   * Update wholesale price tier
   */
  async updateWholesaleTier(tierId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('wholesale_pricing')
        .update(updateData)
        .eq('id', tierId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating wholesale tier:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateWholesaleTier:', error);
      return null;
    }
  }

  /**
   * Delete wholesale price tier
   */
  async deleteWholesaleTier(tierId, userId) {
    try {
      const { error } = await supabase
        .from('wholesale_pricing')
        .delete()
        .eq('id', tierId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting wholesale tier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWholesaleTier:', error);
      return false;
    }
  }

  // ============================================
  // CATEGORIES METHODS
  // ============================================

  /**
   * Get all categories for a user
   */
  async getCategories(userId) {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
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
      const { data, error } = await supabase
        .from('inventory_categories')
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
  async updateCategory(categoryId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .update(updateData)
        .eq('id', categoryId)
        .eq('user_id', userId)
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
  async deleteCategory(categoryId, userId) {
    try {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

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

  // ============================================
  // STOCK MOVEMENTS METHODS
  // ============================================

  /**
   * Create stock movement record
   */
  async createStockMovement(userId, movementData) {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          user_id: userId,
          ...movementData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating stock movement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createStockMovement:', error);
      return null;
    }
  }

  /**
   * Get stock movements for a product
   */
  async getStockMovements(productId, userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching stock movements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStockMovements:', error);
      return [];
    }
  }

  // ============================================
  // STATISTICS METHODS
  // ============================================

  /**
   * Get inventory statistics
   */
  async getInventoryStats(userId) {
    try {
      const { data, error } = await supabase
        .from('inventory_products')
        .select('stock_quantity, stock_status, price, cost, status')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching inventory stats:', error);
        return {
          totalProducts: 0,
          activeProducts: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
        };
      }

      const stats = {
        totalProducts: data.length,
        activeProducts: data.filter(p => p.status === 'active').length,
        totalValue: data.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0),
        lowStockItems: data.filter(p => p.stock_status === 'low stock').length,
        outOfStockItems: data.filter(p => p.stock_status === 'out of stock').length,
      };

      return stats;
    } catch (error) {
      console.error('Error in getInventoryStats:', error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      };
    }
  }
}

module.exports = new InventoryService();

