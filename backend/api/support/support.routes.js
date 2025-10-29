const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const { authenticateTokenHybrid, requireAdmin } = require('../../middleware/auth');
const supportRepo = require('../../services/supportRepo');
const cloudinary = require('../../config/cloudinary');

// GET /api/support/messages/recent
router.get('/messages/recent', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const data = await supportRepo.listRecentMessages(userId, 10);
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/support/tickets
router.get('/tickets', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const data = await supportRepo.listTickets(userId);
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/support/tickets
router.post('/tickets', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { subject, category, body } = req.body || {};
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!subject || !category || !body) return res.status(400).json({ success: false, message: 'Missing fields' });
    const ticket = await supportRepo.createTicket({ sellerId: userId, subject, category, body });
    res.status(201).json({ success: true, data: ticket });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/support/tickets/:ticketId/messages
router.post('/tickets/:ticketId/messages', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ticketId } = req.params;
    const { body } = req.body || {};
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!body) return res.status(400).json({ success: false, message: 'Message body required' });
    const message = await supportRepo.addMessage({ ticketId, authorId: userId, body });
    res.status(201).json({ success: true, data: message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/support/tickets/:ticketId/attachments
router.post('/tickets/:ticketId/attachments', authenticateTokenHybrid, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ticketId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'support' }, async (error, result) => {
      if (error) {
        console.error('Cloudinary error:', error);
        return res.status(500).json({ success: false, message: 'Upload failed' });
      }
      const record = await supportRepo.addAttachment({
        ticketId,
        cloudinaryPublicId: result.public_id,
        cloudinaryUrl: result.secure_url,
        resourceType: result.resource_type,
        bytes: result.bytes,
      });
      res.status(201).json({ success: true, data: record });
    });

    uploadStream.end(req.file.buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/support/tickets/:ticketId/attachments/url
router.post('/tickets/:ticketId/attachments/url', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ticketId } = req.params;
    const { url } = req.body || {};
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!url || typeof url !== 'string') return res.status(400).json({ success: false, message: 'URL required' });

    const result = await cloudinary.uploader.upload(url, { folder: 'support' });
    const record = await supportRepo.addAttachment({
      ticketId,
      cloudinaryPublicId: result.public_id,
      cloudinaryUrl: result.secure_url,
      resourceType: result.resource_type,
      bytes: result.bytes,
    });
    res.status(201).json({ success: true, data: record });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/support/admin/tickets - list all tickets (admin only)
router.get('/admin/tickets', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const data = await supportRepo.listAllTickets();
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/support/admin/tickets/:ticketId - get ticket details
router.get('/admin/tickets/:ticketId', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const data = await supportRepo.getTicketDetails(ticketId);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/support/admin/tickets/:ticketId - update ticket status/priority
router.patch('/admin/tickets/:ticketId', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;
    
    if (!status && !priority) {
      return res.status(400).json({ success: false, message: 'Status or priority required' });
    }
    
    const data = await supportRepo.updateTicketStatus(ticketId, status, priority);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/support/admin/stats - get ticket statistics
router.get('/admin/stats', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const data = await supportRepo.getTicketStats();
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/support/admin/tickets/:ticketId/reply - admin can reply to ticket
router.post('/admin/tickets/:ticketId/reply', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { body } = req.body || {};
    if (!body) return res.status(400).json({ success: false, message: 'Message body required' });
    
    const message = await supportRepo.addMessage({ ticketId, authorId: req.user.id, body });
    res.status(201).json({ success: true, data: message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;


