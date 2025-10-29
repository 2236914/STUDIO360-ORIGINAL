const nodemailer = require('nodemailer');
const { supabase } = require('./supabaseClient');
const EmailTemplates = require('./emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail({ to, from, subject, text, html, replyTo }) {
    try {
      const mailOptions = {
        from: from || process.env.SMTP_USER,
        to: to,
        subject: subject,
        text: text,
        html: html,
        replyTo: replyTo
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification email with logging
   */
  async sendNotification({ 
    userId, 
    notificationType, 
    recipientEmail, 
    recipientName, 
    subject, 
    html, 
    text, 
    metadata = {} 
  }) {
    try {
      // Check if notifications are enabled for this user and type
      if (userId) {
        const shouldSend = await this.shouldSendNotification(userId, notificationType);
        if (!shouldSend) {
          console.log(`📧 Email skipped: User ${userId} has disabled ${notificationType} notifications`);
          return { success: true, skipped: true, message: 'Notification disabled by user preference' };
        }
      }

      // Send email
      const result = await this.sendEmail({
        to: recipientEmail,
        subject: subject,
        html: html,
        text: text
      });

      if (result.success) {
        // Log notification to database
        await this.logNotification({
          userId,
          notificationType,
          recipientEmail,
          recipientName,
          subject,
          emailBodyHtml: html,
          emailBodyText: text,
          status: 'sent',
          sentAt: new Date().toISOString(),
          metadata
        });
      } else {
        // Log failed notification
        await this.logNotification({
          userId,
          notificationType,
          recipientEmail,
          recipientName,
          subject,
          emailBodyHtml: html,
          emailBodyText: text,
          status: 'failed',
          errorMessage: result.error,
          metadata
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Notification email failed:', error);
      
      // Log error
      try {
        await this.logNotification({
          userId,
          notificationType,
          recipientEmail,
          recipientName,
          subject,
          emailBodyHtml: html,
          emailBodyText: text,
          status: 'failed',
          errorMessage: error.message,
          metadata
        });
      } catch (logError) {
        console.error('Failed to log notification:', logError);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(userId, orderData) {
    const template = EmailTemplates.getOrderConfirmationTemplate(orderData);
    
    return await this.sendNotification({
      userId,
      notificationType: 'order_confirmation',
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { orderNumber: orderData.orderNumber, orderId: orderData.orderId }
    });
  }

  /**
   * Send new order alert to seller
   */
  async sendNewOrderAlert(sellerUserId, orderData) {
    const template = EmailTemplates.getNewOrderAlertTemplate(orderData);
    
    return await this.sendNotification({
      userId: sellerUserId,
      notificationType: 'new_order_alert',
      recipientEmail: orderData.sellerEmail,
      recipientName: orderData.sellerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { orderNumber: orderData.orderNumber, orderId: orderData.orderId }
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(userId, orderData) {
    const template = EmailTemplates.getOrderStatusUpdateTemplate(orderData);
    
    return await this.sendNotification({
      userId,
      notificationType: 'order_status_update',
      recipientEmail: orderData.customerEmail,
      recipientName: orderData.customerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { orderNumber: orderData.orderNumber, orderStatus: orderData.orderStatus }
    });
  }

  /**
   * Send low stock alert
   */
  async sendLowStockAlert(userId, productData) {
    const template = EmailTemplates.getLowStockAlertTemplate(productData);
    
    return await this.sendNotification({
      userId,
      notificationType: 'low_stock_alert',
      recipientEmail: productData.ownerEmail,
      recipientName: productData.ownerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { productId: productData.productId, productName: productData.productName }
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userId, userData) {
    const template = EmailTemplates.getWelcomeEmailTemplate(userData);
    
    return await this.sendNotification({
      userId,
      notificationType: 'welcome',
      recipientEmail: userData.accountEmail,
      recipientName: userData.customerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: { userId }
    });
  }

  /**
   * Log notification to database
   */
  async logNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) {
        console.error('Error logging notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in logNotification:', error);
      return null;
    }
  }

  /**
   * Check if user wants to receive this type of notification
   */
  async shouldSendNotification(userId, notificationType) {
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default to sending if no preferences found
        return true;
      }

      // Map notification types to preference fields
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

      return data[preferenceField] !== false;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending on error
    }
  }

  /**
   * Send reply to customer
   */
  async sendReply({ toEmail, toName, fromEmail, fromName, subject, message, originalMessage }) {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Dear ${toName},</p>
          
          <p>${message}</p>
          
          ${originalMessage ? `
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              <strong>Original Message:</strong><br>
              ${originalMessage}
            </p>
          ` : ''}
          
          <p style="margin-top: 20px;">Best regards,<br>${fromName || 'Support Team'}</p>
        </div>
      `;

      return await this.sendEmail({
        to: toEmail,
        from: fromEmail || process.env.SMTP_USER,
        subject: subject,
        html: htmlContent,
        text: message,
        replyTo: fromEmail
      });
    } catch (error) {
      console.error('❌ Reply email failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test SMTP connection
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP server is ready');
      return { success: true };
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
