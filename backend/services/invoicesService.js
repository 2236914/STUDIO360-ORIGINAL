const { supabase } = require('./supabaseClient');

class InvoicesService {
  // ============================================
  // INVOICE METHODS
  // ============================================

  /**
   * Get all invoices for a user with optional filters
   */
  async getInvoices(userId, filters = {}) {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('invoice_date', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.service && filters.service.length > 0) {
        // Filter by service through invoice_items
        const { data: itemsWithService } = await supabase
          .from('invoice_items')
          .select('invoice_id')
          .in('service', filters.service)
          .eq('user_id', userId);
        
        if (itemsWithService && itemsWithService.length > 0) {
          const invoiceIds = [...new Set(itemsWithService.map(item => item.invoice_id))];
          query = query.in('id', invoiceIds);
        }
      }

      if (filters.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,invoice_to_name.ilike.%${filters.search}%,invoice_to_email.ilike.%${filters.search}%`
        );
      }

      if (filters.startDate) {
        query = query.gte('invoice_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('invoice_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvoices:', error);
      return [];
    }
  }

  /**
   * Get invoice by ID with all related data
   */
  async getInvoiceById(invoiceId, userId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*),
          invoice_payments (*)
        `)
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      return null;
    }
  }

  /**
   * Get invoice by invoice number
   */
  async getInvoiceByNumber(invoiceNumber, userId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*),
          invoice_payments (*)
        `)
        .eq('invoice_number', invoiceNumber)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching invoice by number:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getInvoiceByNumber:', error);
      return null;
    }
  }

  /**
   * Create a new invoice
   */
  async createInvoice(userId, invoiceData) {
    try {
      // Generate invoice number if not provided
      if (!invoiceData.invoice_number) {
        const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
          .rpc('generate_invoice_number', { user_uuid: userId });

        if (invoiceNumberError) {
          console.error('Error generating invoice number:', invoiceNumberError);
          return null;
        }

        invoiceData.invoice_number = invoiceNumberData;
      }

      // Extract invoice items
      const items = invoiceData.items || [];
      delete invoiceData.items;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: userId,
          ...invoiceData
        }])
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return null;
      }

      // Create invoice items
      if (items.length > 0) {
        const invoiceItems = items.map((item, index) => ({
          invoice_id: invoice.id,
          user_id: userId,
          display_order: index,
          ...item
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
          // Rollback: delete the invoice
          await this.deleteInvoice(invoice.id, userId);
          return null;
        }
      }

      // Fetch complete invoice with items
      return await this.getInvoiceById(invoice.id, userId);
    } catch (error) {
      console.error('Error in createInvoice:', error);
      return null;
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(invoiceId, userId, updateData) {
    try {
      console.log('updateInvoice called with:', { invoiceId, userId, updateData });
      
      // Extract items if present
      const items = updateData.items;
      delete updateData.items;

      // Update invoice
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating invoice:', error);
        return null;
      }

      console.log('Invoice updated successfully:', data);

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId)
          .eq('user_id', userId);

        // Insert new items
        if (items.length > 0) {
          const invoiceItems = items.map((item, index) => ({
            invoice_id: invoiceId,
            user_id: userId,
            display_order: index,
            ...item
          }));

          await supabase
            .from('invoice_items')
            .insert(invoiceItems);
        }
      }

      return await this.getInvoiceById(invoiceId, userId);
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      return null;
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId, userId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating invoice status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateInvoiceStatus:', error);
      return null;
    }
  }

  /**
   * Mark invoice as sent
   */
  async markInvoiceAsSent(invoiceId, userId) {
    try {
      // Get current sent count
      const { data: invoice } = await supabase
        .from('invoices')
        .select('sent')
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .single();

      if (!invoice) return null;

      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          sent: (invoice.sent || 0) + 1,
          status: 'pending' // Update status to pending if it was draft
        })
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error marking invoice as sent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in markInvoiceAsSent:', error);
      return null;
    }
  }

  /**
   * Delete invoice (soft delete)
   */
  async deleteInvoice(invoiceId, userId) {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting invoice:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      return false;
    }
  }

  /**
   * Delete multiple invoices
   */
  async deleteInvoices(invoiceIds, userId) {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', invoiceIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting invoices:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteInvoices:', error);
      return false;
    }
  }

  // ============================================
  // INVOICE ITEMS METHODS
  // ============================================

  /**
   * Get invoice items for an invoice
   */
  async getInvoiceItems(invoiceId, userId) {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching invoice items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvoiceItems:', error);
      return [];
    }
  }

  // ============================================
  // INVOICE PAYMENTS METHODS
  // ============================================

  /**
   * Add payment to invoice
   */
  async addInvoicePayment(userId, paymentData) {
    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .insert([{
          user_id: userId,
          ...paymentData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding invoice payment:', error);
        return null;
      }

      // Check if invoice is fully paid and update status
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', paymentData.invoice_id)
        .single();

      if (invoice) {
        const { data: payments } = await supabase
          .from('invoice_payments')
          .select('amount')
          .eq('invoice_id', paymentData.invoice_id);

        const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

        if (totalPaid >= parseFloat(invoice.total_amount)) {
          await this.updateInvoiceStatus(paymentData.invoice_id, userId, 'paid');
        }
      }

      return data;
    } catch (error) {
      console.error('Error in addInvoicePayment:', error);
      return null;
    }
  }

  /**
   * Get invoice payments
   */
  async getInvoicePayments(invoiceId, userId) {
    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching invoice payments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvoicePayments:', error);
      return [];
    }
  }

  // ============================================
  // STATISTICS METHODS
  // ============================================

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(userId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('status, total_amount')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching invoice stats:', error);
        return {
          totalInvoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          totalRevenue: 0,
          pendingRevenue: 0,
        };
      }

      const stats = {
        totalInvoices: data.length,
        paidInvoices: data.filter(i => i.status === 'paid').length,
        pendingInvoices: data.filter(i => i.status === 'pending').length,
        overdueInvoices: data.filter(i => i.status === 'overdue').length,
        draftInvoices: data.filter(i => i.status === 'draft').length,
        totalRevenue: data
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0),
        pendingRevenue: data
          .filter(i => i.status === 'pending' || i.status === 'overdue')
          .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error('Error in getInvoiceStats:', error);
      return {
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
      };
    }
  }
}

module.exports = new InvoicesService();

