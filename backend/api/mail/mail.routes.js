const express = require('express');
const router = express.Router();
const mailService = require('../../services/mailService');
const emailService = require('../../services/emailService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

// ============================================
// MAIL ROUTES
// ============================================

/**
 * @route GET /api/mail
 * @desc Get all mail with optional filters
 * @access Private
 */
router.get('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const filters = {
      label: req.query.label,
      status: req.query.status,
      type: req.query.type,
      is_read: req.query.is_read === 'true' ? true : req.query.is_read === 'false' ? false : undefined,
      is_starred: req.query.is_starred === 'true' ? true : req.query.is_starred === 'false' ? false : undefined,
      search: req.query.search,
    };

    const mail = await mailService.getMail(userId, filters);
    
    res.json({
      success: true,
      data: mail
    });
  } catch (error) {
    console.error('Error fetching mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/mail/:id
 * @desc Get mail by ID
 * @access Private
 */
router.get('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const mail = await mailService.getMailById(id, userId);
    
    if (!mail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found' 
      });
    }
    
    res.json({
      success: true,
      data: mail
    });
  } catch (error) {
    console.error('Error fetching mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/mail
 * @desc Create new mail/support ticket
 * @access Private
 */
router.post('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const mailData = req.body;
    
    if (!mailData.from_name || !mailData.from_email || !mailData.subject || !mailData.message) {
      return res.status(400).json({ 
        success: false, 
        message: 'From name, email, subject, and message are required' 
      });
    }

    const newMail = await mailService.createMail(userId, mailData);
    
    if (newMail.error) {
      return res.status(400).json({ 
        success: false, 
        message: newMail.error 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newMail,
      message: 'Mail created successfully'
    });
  } catch (error) {
    console.error('Error creating mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/:id
 * @desc Update mail
 * @access Private
 */
router.put('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updateData = req.body;
    const updatedMail = await mailService.updateMail(id, userId, updateData);
    
    if (updatedMail.error) {
      return res.status(400).json({ 
        success: false, 
        message: updatedMail.error 
      });
    }
    
    res.json({
      success: true,
      data: updatedMail,
      message: 'Mail updated successfully'
    });
  } catch (error) {
    console.error('Error updating mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/mail/:id
 * @desc Delete mail
 * @access Private
 */
router.delete('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await mailService.deleteMail(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Mail deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/mail
 * @desc Delete multiple mails
 * @access Private
 */
router.delete('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mail IDs array is required' 
      });
    }

    const success = await mailService.deleteMails(ids, userId);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete mails' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} mail(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting mails:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/:id/read
 * @desc Mark mail as read/unread
 * @access Private
 */
router.put('/:id/read', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { is_read } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedMail = await mailService.markAsRead(id, userId, is_read);
    
    if (!updatedMail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedMail,
      message: `Mail marked as ${is_read ? 'read' : 'unread'}`
    });
  } catch (error) {
    console.error('Error marking mail as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/bulk/read
 * @desc Mark multiple mails as read/unread
 * @access Private
 */
router.put('/bulk/read', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ids, is_read } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mail IDs array is required' 
      });
    }

    const success = await mailService.markMailsAsRead(ids, userId, is_read);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update mails' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} mail(s) marked as ${is_read ? 'read' : 'unread'}`
    });
  } catch (error) {
    console.error('Error marking mails as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/:id/star
 * @desc Toggle mail star
 * @access Private
 */
router.put('/:id/star', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedMail = await mailService.toggleStar(id, userId);
    
    if (!updatedMail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedMail,
      message: `Mail ${updatedMail.is_starred ? 'starred' : 'unstarred'}`
    });
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/:id/labels
 * @desc Update mail labels
 * @access Private
 */
router.put('/:id/labels', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { labels } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!Array.isArray(labels)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Labels must be an array' 
      });
    }

    const updatedMail = await mailService.updateLabels(id, userId, labels);
    
    if (!updatedMail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedMail,
      message: 'Mail labels updated'
    });
  } catch (error) {
    console.error('Error updating labels:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/mail/:id/status
 * @desc Update mail status
 * @access Private
 */
router.put('/:id/status', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedMail = await mailService.updateStatus(id, userId, status);
    
    if (!updatedMail) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mail not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedMail,
      message: 'Mail status updated'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// MAIL REPLIES ROUTES
// ============================================

/**
 * @route GET /api/mail/:id/replies
 * @desc Get replies for a mail
 * @access Private
 */
router.get('/:id/replies', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const replies = await mailService.getReplies(id, userId);
    
    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/mail/:id/replies
 * @desc Create reply
 * @access Private
 */
router.post('/:id/replies', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const replyData = {
      mail_id: id,
      ...req.body
    };

    const newReply = await mailService.createReply(userId, replyData);
    
    if (newReply.error) {
      return res.status(400).json({ 
        success: false, 
        message: newReply.error 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newReply,
      message: 'Reply created successfully'
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// LABELS ROUTES
// ============================================

/**
 * @route GET /api/mail/labels/all
 * @desc Get all labels
 * @access Private
 */
router.get('/labels/all', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const labels = await mailService.getLabels(userId);
    
    res.json({
      success: true,
      data: labels
    });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/mail/labels/counts
 * @desc Get label counts
 * @access Private
 */
router.get('/labels/counts', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const counts = await mailService.getLabelCounts(userId);
    
    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error fetching label counts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/mail/labels/create
 * @desc Create custom label
 * @access Private
 */
router.post('/labels/create', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const labelData = req.body;
    const newLabel = await mailService.createLabel(userId, labelData);
    
    if (newLabel.error) {
      return res.status(400).json({ 
        success: false, 
        message: newLabel.error 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newLabel,
      message: 'Label created successfully'
    });
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// TEMPLATES ROUTES
// ============================================

/**
 * @route GET /api/mail/templates/all
 * @desc Get all templates
 * @access Private
 */
router.get('/templates/all', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const templates = await mailService.getTemplates(userId);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/mail/templates/create
 * @desc Create template
 * @access Private
 */
router.post('/templates/create', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const templateData = req.body;
    const newTemplate = await mailService.createTemplate(userId, templateData);
    
    if (newTemplate.error) {
      return res.status(400).json({ 
        success: false, 
        message: newTemplate.error 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/mail/send-email
 * @desc Send email via SMTP
 * @access Private
 */
router.post('/send-email', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { toEmail, toName, subject, message, fromName } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!toEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'toEmail, subject, and message are required'
      });
    }

    console.log(`[Email Service] Sending email to ${toEmail}`);
    
    const emailResult = await emailService.sendEmail({
      to: toEmail,
      subject: subject,
      html: message,
      text: message.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: emailResult.error 
      });
    }

    // Save sent email to database
    const mailData = {
      from_name: fromName || 'Support Team',
      from_email: process.env.SMTP_USER,
      to_name: toName,
      to_email: toEmail,
      subject: subject,
      message: message,
      type: 'sent',
      source: 'manual',
      status: 'pending',
      labels: ['sent'],
      is_read: true,
      sent_at: new Date().toISOString(),
    };

    await mailService.createMail(userId, mailData);

    res.json({
      success: true,
      data: { messageId: emailResult.messageId },
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error in send mail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

