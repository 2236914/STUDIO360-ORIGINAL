const { supabase } = require('./supabaseClient');

class MailService {
  // ============================================
  // MAIL METHODS
  // ============================================

  /**
   * Get all mail for a user with optional filters
   */
  async getMail(userId, filters = {}) {
    try {
      let query = supabase
        .from('mail')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('received_at', { ascending: false });

      // Apply filters
      if (filters.label) {
        query = query.contains('labels', [filters.label]);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }

      if (filters.is_starred !== undefined) {
        query = query.eq('is_starred', filters.is_starred);
      }

      if (filters.search) {
        query = query.or(
          `subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%,from_name.ilike.%${filters.search}%,from_email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching mail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMail:', error);
      return [];
    }
  }

  /**
   * Get mail by ID
   */
  async getMailById(mailId, userId) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .select('*')
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching mail:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMailById:', error);
      return null;
    }
  }

  /**
   * Create new mail/support ticket
   */
  async createMail(userId, mailData) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .insert([{
          user_id: userId,
          ...mailData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating mail:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in createMail:', error);
      return { error: 'Failed to create mail' };
    }
  }

  /**
   * Update mail
   */
  async updateMail(mailId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .update(updateData)
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating mail:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in updateMail:', error);
      return { error: 'Failed to update mail' };
    }
  }

  /**
   * Delete mail (soft delete)
   */
  async deleteMail(mailId, userId) {
    try {
      const { error } = await supabase
        .from('mail')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting mail:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMail:', error);
      return false;
    }
  }

  /**
   * Delete multiple mails
   */
  async deleteMails(mailIds, userId) {
    try {
      const { error } = await supabase
        .from('mail')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', mailIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error deleting mails:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMails:', error);
      return false;
    }
  }

  /**
   * Mark mail as read/unread
   */
  async markAsRead(mailId, userId, isRead = true) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .update({ is_read: isRead })
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error marking mail as read:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return null;
    }
  }

  /**
   * Mark multiple mails as read/unread
   */
  async markMailsAsRead(mailIds, userId, isRead = true) {
    try {
      const { error } = await supabase
        .from('mail')
        .update({ is_read: isRead })
        .in('id', mailIds)
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error marking mails as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markMailsAsRead:', error);
      return false;
    }
  }

  /**
   * Star/unstar mail
   */
  async toggleStar(mailId, userId) {
    try {
      // Get current starred status
      const mail = await this.getMailById(mailId, userId);
      if (!mail) return null;

      const { data, error } = await supabase
        .from('mail')
        .update({ is_starred: !mail.is_starred })
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error toggling star:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in toggleStar:', error);
      return null;
    }
  }

  /**
   * Update mail labels
   */
  async updateLabels(mailId, userId, labels) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .update({ labels })
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating labels:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateLabels:', error);
      return null;
    }
  }

  /**
   * Update mail status
   */
  async updateStatus(mailId, userId, status) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .update({ status })
        .eq('id', mailId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        console.error('Error updating status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return null;
    }
  }

  // ============================================
  // MAIL REPLIES METHODS
  // ============================================

  /**
   * Get replies for a mail
   */
  async getReplies(mailId, userId) {
    try {
      const { data, error } = await supabase
        .from('mail_replies')
        .select('*')
        .eq('mail_id', mailId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReplies:', error);
      return [];
    }
  }

  /**
   * Create reply
   */
  async createReply(userId, replyData) {
    try {
      const { data, error } = await supabase
        .from('mail_replies')
        .insert([{
          user_id: userId,
          ...replyData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating reply:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in createReply:', error);
      return { error: 'Failed to create reply' };
    }
  }

  // ============================================
  // MAIL LABELS METHODS
  // ============================================

  /**
   * Get all labels for a user
   */
  async getLabels(userId) {
    try {
      const { data, error } = await supabase
        .from('mail_labels')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching labels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLabels:', error);
      return [];
    }
  }

  /**
   * Create custom label
   */
  async createLabel(userId, labelData) {
    try {
      const { data, error } = await supabase
        .from('mail_labels')
        .insert([{
          user_id: userId,
          ...labelData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating label:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in createLabel:', error);
      return { error: 'Failed to create label' };
    }
  }

  /**
   * Update label
   */
  async updateLabel(labelId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('mail_labels')
        .update(updateData)
        .eq('id', labelId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating label:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in updateLabel:', error);
      return { error: 'Failed to update label' };
    }
  }

  /**
   * Delete label
   */
  async deleteLabel(labelId, userId) {
    try {
      const { error } = await supabase
        .from('mail_labels')
        .delete()
        .eq('id', labelId)
        .eq('user_id', userId)
        .eq('is_system', false); // Can't delete system labels

      if (error) {
        console.error('Error deleting label:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteLabel:', error);
      return false;
    }
  }

  /**
   * Get label counts (unread per label)
   */
  async getLabelCounts(userId) {
    try {
      const { data, error } = await supabase
        .from('mail')
        .select('labels, is_read')
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching label counts:', error);
        return {};
      }

      // Calculate unread count per label
      const counts = {};
      data.forEach(mail => {
        if (mail.labels && Array.isArray(mail.labels)) {
          mail.labels.forEach(label => {
            if (!counts[label]) {
              counts[label] = { total: 0, unread: 0 };
            }
            counts[label].total++;
            if (!mail.is_read) {
              counts[label].unread++;
            }
          });
        }
      });

      return counts;
    } catch (error) {
      console.error('Error in getLabelCounts:', error);
      return {};
    }
  }

  // ============================================
  // MAIL TEMPLATES METHODS
  // ============================================

  /**
   * Get all templates for a user
   */
  async getTemplates(userId) {
    try {
      const { data, error } = await supabase
        .from('mail_templates')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTemplates:', error);
      return [];
    }
  }

  /**
   * Create template
   */
  async createTemplate(userId, templateData) {
    try {
      const { data, error } = await supabase
        .from('mail_templates')
        .insert([{
          user_id: userId,
          ...templateData
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in createTemplate:', error);
      return { error: 'Failed to create template' };
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('mail_templates')
        .update(updateData)
        .eq('id', templateId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        return { error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      return { error: 'Failed to update template' };
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId, userId) {
    try {
      const { error } = await supabase
        .from('mail_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      return false;
    }
  }
}

module.exports = new MailService();

