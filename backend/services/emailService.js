const nodemailer = require('nodemailer');

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
