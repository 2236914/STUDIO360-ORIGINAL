const { supabase } = require('./supabaseClient');
const emailService = require('./emailService');

class OrdersService {
  // ============================================
  // ORDER METHODS
  // ============================================

  /**
   * Get all orders for a user with optional filters
   */
  async getOrders(userId, filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('order_date', { ascending: false });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrders:', error);
      return [];
    }
  }

  /**
   * Build general journal payload from order (accrual on completion)
   */
  buildJournalFromOrder(order) {
    if (!order) return null;
    try {
      const orderNumber = String(order.order_number || order.id || '').trim();
      const ref = orderNumber ? `ORD-${orderNumber}` : null;
      const date = (order.order_date || order.created_at || new Date().toISOString()).toString().slice(0, 10);
      const customer = String(order.customer_name || '').trim();
      const subtotal = Number(order.subtotal || 0);
      const shipping = Number(order.shipping_fee || 0);
      const tax = Number(order.tax || 0); // reserved; not split without tax account config
      const discount = Number(order.discount || 0);
      const total = Number(order.total || (subtotal + shipping + tax - discount));
      const netSales = Math.max(0, subtotal - discount);
      const lines = [];
      // Dr Accounts Receivable (103) = total
      if (total > 0) lines.push({ code: '103', debit: total, credit: 0, description: `A/R – Order ${orderNumber}` });
      // Cr Net Sales (401)
      if (netSales > 0) lines.push({ code: '401', debit: 0, credit: netSales, description: 'Net Sales' });
      // Cr Other Income (Shipping) (402)
      if (shipping > 0) lines.push({ code: '402', debit: 0, credit: shipping, description: 'Shipping Income' });
      // Note: tax handling can be added later when tax-liability account is defined
      if (lines.length < 2) return null;
      const particulars = `Order #${orderNumber}${customer ? ' – ' + customer : ''}`;
      return { date, ref, particulars, lines };
    } catch (e) {
      return null;
    }
  }

  /**
   * Build cash receipt payload from order (clear A/R on payment)
   */
  buildReceiptFromOrder(order, amountReceived) {
    if (!order) return null;
    try {
      const orderNumber = String(order.order_number || order.id || '').trim();
      const referenceNo = orderNumber ? `RCPT-${orderNumber}` : null;
      const date = new Date().toISOString().slice(0, 10);
      const customer = String(order.customer_name || '').trim();
      const amt = Number(amountReceived || order.total || 0);
      if (amt <= 0) return null;
      return {
        date,
        referenceNo,
        customer,
        cashDebit: amt,
        arCredit: amt,
        remarks: `Payment received for Order #${orderNumber}`,
      };
    } catch (e) {
      return null;
    }
  }
  /**
   * Get order by ID with all related data
   */
  async getOrderById(orderId, userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_status_history (*),
          order_notes (*),
          order_refunds (*)
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return null;
    }
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber, userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          order_status_history (*),
          order_notes (*),
          order_refunds (*)
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching order by number:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderByNumber:', error);
      return null;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(userId, orderData) {
    try {
      // Generate order number if not provided
      if (!orderData.order_number) {
        const { data: orderNumberData, error: orderNumberError } = await supabase
          .rpc('generate_order_number', { user_uuid: userId });

        if (orderNumberError) {
          console.error('Error generating order number:', orderNumberError);
          return null;
        }

        orderData.order_number = orderNumberData;
      }

      // Extract order items
      const items = orderData.items || [];
      delete orderData.items;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          ...orderData
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Create order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          user_id: userId,
          ...item
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
          // Rollback: delete the order
          await this.deleteOrder(order.id, userId);
          return null;
        }
      }

      // Fetch complete order with items
      const completeOrder = await this.getOrderById(order.id, userId);
      
      // Return order immediately - emails will be sent asynchronously via sendOrderEmails
      return completeOrder;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  }

  /**
   * Send order confirmation emails asynchronously (non-blocking)
   * This should be called after the HTTP response is sent
   */
  async sendOrderEmails(orderId, userId) {
    // Run in background - don't await, don't block
    setImmediate(async () => {
      try {
        const order = await this.getOrderById(orderId, userId);
        if (!order) {
          console.error(`[Email] Order ${orderId} not found for email sending`);
          return;
        }

        const orderItems = await this.getOrderItems(orderId, userId);

        // Send order confirmation email to customer
        try {
          const emailData = {
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            orderDate: new Date(order.order_date || order.created_at).toLocaleDateString(),
            orderItems: orderItems,
            orderTotal: `$${order.total?.toFixed(2) || '0.00'}`,
            shippingAddress: `${order.shipping_street || ''}, ${order.shipping_city || ''}, ${order.shipping_province || ''} ${order.shipping_zip_code || ''}`.trim()
          };
          await emailService.sendOrderConfirmation(userId, emailData);
          console.log(`[Email] Order confirmation sent for order ${order.order_number}`);
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError);
        }
        
        // Send new order alert to seller
        try {
          const emailData = {
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            orderDate: new Date(order.order_date || order.created_at).toLocaleDateString(),
            orderItems: orderItems,
            orderTotal: `$${order.total?.toFixed(2) || '0.00'}`,
            sellerEmail: order.seller_email,
            sellerName: order.seller_name || 'Seller'
          };
          await emailService.sendNewOrderAlert(userId, emailData);
          console.log(`[Email] New order alert sent for order ${order.order_number}`);
        } catch (emailError) {
          console.error('Error sending new order alert:', emailError);
        }
      } catch (error) {
        console.error('Error in sendOrderEmails background task:', error);
      }
    });
  }

  /**
   * Update order
   */
  async updateOrder(orderId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, userId, newStatus, notes = null) {
    try {
      const updateData = { status: newStatus };

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        return null;
      }

      // Add note if provided
      if (notes) {
        await this.addOrderNote(orderId, userId, {
          note: notes,
          is_internal: true,
        });
      }

      // Send order status update email to customer
      try {
        const customerInfo = await this.getOrderById(orderId, userId);
        if (customerInfo) {
          const emailData = {
            orderNumber: customerInfo.order_number,
            customerName: customerInfo.customer_name,
            customerEmail: customerInfo.customer_email,
            orderStatus: newStatus,
            trackingNumber: customerInfo.tracking_number,
            notes: notes
          };
          await emailService.sendOrderStatusUpdate(userId, emailData);
        }
      } catch (emailError) {
        console.error('Error sending order status update email:', emailError);
        // Don't fail status update if email fails
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return null;
    }
  }

  /**
   * Update multiple orders' status
   */
  async updateOrdersStatus(orderIds, userId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .in('id', orderIds)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select();

      if (error) {
        console.error('Error updating orders status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateOrdersStatus:', error);
      return false;
    }
  }

  /**
   * Delete order (soft delete)
   */
  async deleteOrder(orderId, userId) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      return false;
    }
  }

  /**
   * Delete multiple orders
   */
  async deleteOrders(orderIds, userId) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', orderIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting orders:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOrders:', error);
      return false;
    }
  }

  // ============================================
  // ORDER ITEMS METHODS
  // ============================================

  /**
   * Get order items for an order
   */
  async getOrderItems(orderId, userId) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching order items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrderItems:', error);
      return [];
    }
  }

  /**
   * Add item to order
   */
  async addOrderItem(userId, itemData) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert([{
          user_id: userId,
          ...itemData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding order item:', error);
        return null;
      }

      // Update order total
      await this.recalculateOrderTotal(itemData.order_id, userId);

      return data;
    } catch (error) {
      console.error('Error in addOrderItem:', error);
      return null;
    }
  }

  /**
   * Update order item
   */
  async updateOrderItem(itemId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order item:', error);
        return null;
      }

      // Update order total
      if (data) {
        await this.recalculateOrderTotal(data.order_id, userId);
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrderItem:', error);
      return null;
    }
  }

  /**
   * Delete order item
   */
  async deleteOrderItem(itemId, userId) {
    try {
      // Get item to find order_id
      const { data: item } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting order item:', error);
        return false;
      }

      // Update order total
      if (item) {
        await this.recalculateOrderTotal(item.order_id, userId);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteOrderItem:', error);
      return false;
    }
  }

  /**
   * Recalculate order total
   */
  async recalculateOrderTotal(orderId, userId) {
    try {
      const items = await this.getOrderItems(orderId, userId);
      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);

      const { data: order } = await supabase
        .from('orders')
        .select('shipping_fee, tax, discount')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (order) {
        const total = subtotal + 
          parseFloat(order.shipping_fee || 0) + 
          parseFloat(order.tax || 0) - 
          parseFloat(order.discount || 0);

        await supabase
          .from('orders')
          .update({ subtotal, total })
          .eq('id', orderId)
          .eq('user_id', userId);
      }

      return true;
    } catch (error) {
      console.error('Error in recalculateOrderTotal:', error);
      return false;
    }
  }

  // ============================================
  // ORDER NOTES METHODS
  // ============================================

  /**
   * Add order note
   */
  async addOrderNote(orderId, userId, noteData) {
    try {
      const { data, error } = await supabase
        .from('order_notes')
        .insert([{
          order_id: orderId,
          user_id: userId,
          ...noteData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding order note:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addOrderNote:', error);
      return null;
    }
  }

  /**
   * Get order notes
   */
  async getOrderNotes(orderId, userId) {
    try {
      const { data, error } = await supabase
        .from('order_notes')
        .select('*')
        .eq('order_id', orderId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching order notes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrderNotes:', error);
      return [];
    }
  }

  // ============================================
  // ORDER STATISTICS METHODS
  // ============================================

  /**
   * Get order statistics
   */
  async getOrderStats(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total, payment_status')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching order stats:', error);
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
        };
      }

      const stats = {
        totalOrders: data.length,
        pendingOrders: data.filter(o => o.status === 'pending').length,
        completedOrders: data.filter(o => o.status === 'completed').length,
        cancelledOrders: data.filter(o => o.status === 'cancelled').length,
        totalRevenue: data
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
      };
    }
  }
}

module.exports = new OrdersService();

