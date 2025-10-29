/**
 * Email Templates Service
 * Provides email templates for various notification types
 */

class EmailTemplates {
  /**
   * Order Confirmation Email (Customer)
   */
  static getOrderConfirmationTemplate(data) {
    const { orderNumber, customerName, orderItems, orderTotal, shippingAddress, orderDate } = data;
    
    return {
      subject: `Order Confirmation - #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h1 style="color: #333; margin-top: 0;">Thank you for your order!</h1>
            <p>Dear ${customerName},</p>
            <p>We have received your order and it is being processed. Below are your order details:</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Order #${orderNumber}</h2>
              <p style="margin: 0; color: #666;">Order Date: ${orderDate}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Items</h3>
              ${this.formatOrderItems(orderItems)}
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #333;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                  <span>Total:</span>
                  <span>${orderTotal}</span>
                </div>
              </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Address</h3>
              <p style="margin: 5px 0;">${shippingAddress}</p>
            </div>
            
            <p>We will send you another email once your order has been shipped. If you have any questions, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>The Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Thank you for your order!

Dear ${customerName},

We have received your order and it is being processed.

Order #${orderNumber}
Order Date: ${orderDate}

Order Items:
${this.formatOrderItemsText(orderItems)}

Total: ${orderTotal}

Shipping Address:
${shippingAddress}

We will send you another email once your order has been shipped. If you have any questions, please don't hesitate to contact us.

Best regards,
The Team
      `
    };
  }

  /**
   * New Order Alert (Seller)
   */
  static getNewOrderAlertTemplate(data) {
    const { orderNumber, customerName, customerEmail, orderItems, orderTotal, orderDate } = data;
    
    return {
      subject: `New Order Received - #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h1 style="color: #856404; margin-top: 0;">🎉 New Order Received!</h1>
            <p>You have received a new order. Please review and process it as soon as possible.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Order #${orderNumber}</h2>
              <p style="margin: 0; color: #666;">Order Date: ${orderDate}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Items</h3>
              ${this.formatOrderItems(orderItems)}
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #333;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #28a745;">
                  <span>Total:</span>
                  <span>${orderTotal}</span>
                </div>
              </div>
            </div>
            
            <p style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <strong>Next Steps:</strong> Please log in to your dashboard to view order details and update the status.
            </p>
            
            <p style="margin-top: 30px;">Best regards,<br>STUDIO360 Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
NEW ORDER RECEIVED!

You have received a new order. Please review and process it as soon as possible.

Order #${orderNumber}
Order Date: ${orderDate}

Customer Information:
Name: ${customerName}
Email: ${customerEmail}

Order Items:
${this.formatOrderItemsText(orderItems)}

Total: ${orderTotal}

Next Steps: Please log in to your dashboard to view order details and update the status.

Best regards,
STUDIO360 Team
      `
    };
  }

  /**
   * Order Status Update Email
   */
  static getOrderStatusUpdateTemplate(data) {
    const { orderNumber, customerName, orderStatus, trackingNumber, notes } = data;
    
    return {
      subject: `Order Update - #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h1 style="color: #333; margin-top: 0;">Order Status Update</h1>
            <p>Dear ${customerName},</p>
            <p>Your order status has been updated.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Order #${orderNumber}</h2>
              <p style="margin: 10px 0;"><strong>New Status:</strong> <span style="color: #28a745; font-weight: bold;">${orderStatus}</span></p>
              ${trackingNumber ? `<p style="margin: 10px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
            </div>
            
            ${notes ? `
              <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Additional Information</h3>
                <p style="margin: 0;">${notes}</p>
              </div>
            ` : ''}
            
            <p>If you have any questions about your order, please contact our support team.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>The Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
Order Status Update

Dear ${customerName},

Your order status has been updated.

Order #${orderNumber}
New Status: ${orderStatus}
${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}

${notes ? `Additional Information:\n${notes}\n` : ''}

If you have any questions about your order, please contact our support team.

Best regards,
The Team
      `
    };
  }

  /**
   * Low Stock Alert (Seller)
   */
  static getLowStockAlertTemplate(data) {
    const { productName, currentStock, minStockLevel, productId } = data;
    
    return {
      subject: `Low Stock Alert - ${productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Low Stock Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fff3cd; padding: 20px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h1 style="color: #856404; margin-top: 0;">⚠️ Low Stock Alert</h1>
            <p>One of your products is running low on stock. Please consider restocking.</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">${productName}</h2>
              <p style="margin: 10px 0;"><strong>Current Stock:</strong> <span style="color: #dc3545; font-weight: bold;">${currentStock} units</span></p>
              <p style="margin: 10px 0;"><strong>Minimum Stock Level:</strong> ${minStockLevel} units</p>
              <p style="margin: 10px 0; color: #666;">Product ID: ${productId}</p>
            </div>
            
            <p style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <strong>Action Required:</strong> Please check your inventory and restock if necessary.
            </p>
            
            <p style="margin-top: 30px;">Best regards,<br>STUDIO360 Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
LOW STOCK ALERT

One of your products is running low on stock. Please consider restocking.

Product: ${productName}
Current Stock: ${currentStock} units
Minimum Stock Level: ${minStockLevel} units
Product ID: ${productId}

Action Required: Please check your inventory and restock if necessary.

Best regards,
STUDIO360 Team
      `
    };
  }

  /**
   * Welcome Email
   */
  static getWelcomeEmailTemplate(data) {
    const { customerName, accountEmail } = data;
    
    return {
      subject: 'Welcome to STUDIO360!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 5px; text-align: center;">
            <h1 style="color: white; margin-top: 0;">Welcome to STUDIO360!</h1>
          </div>
          
          <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <p>Dear ${customerName},</p>
            <p>Thank you for joining STUDIO360! We're excited to have you on board.</p>
            
            <p>Your account has been successfully created with the email: <strong>${accountEmail}</strong></p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">What's Next?</h2>
              <ul style="text-align: left;">
                <li>Explore our dashboard</li>
                <li>Start managing your orders</li>
                <li>Update your profile settings</li>
                <li>Browse our products</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>The STUDIO360 Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to STUDIO360!

Dear ${customerName},

Thank you for joining STUDIO360! We're excited to have you on board.

Your account has been successfully created with the email: ${accountEmail}

What's Next?
- Explore our dashboard
- Start managing your orders
- Update your profile settings
- Browse our products

If you have any questions or need assistance, our support team is here to help.

Best regards,
The STUDIO360 Team
      `
    };
  }

  /**
   * Helper method to format order items
   */
  static formatOrderItems(items) {
    if (!items || items.length === 0) {
      return '<p>No items in order</p>';
    }
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: #f8f9fa; border-bottom: 2px solid #333;"><th style="text-align: left; padding: 10px;">Item</th><th style="text-align: center; padding: 10px;">Qty</th><th style="text-align: right; padding: 10px;">Price</th></tr></thead>';
    html += '<tbody>';
    
    items.forEach(item => {
      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${item.name}</td>
          <td style="text-align: center; padding: 10px;">${item.quantity}</td>
          <td style="text-align: right; padding: 10px;">${item.price}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    return html;
  }

  /**
   * Helper method to format order items as text
   */
  static formatOrderItemsText(items) {
    if (!items || items.length === 0) {
      return 'No items in order';
    }
    
    let text = '';
    items.forEach(item => {
      text += `- ${item.name} (Qty: ${item.quantity}) - ${item.price}\n`;
    });
    
    return text;
  }
}

module.exports = EmailTemplates;

