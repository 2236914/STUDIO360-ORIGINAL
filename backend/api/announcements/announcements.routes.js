const express = require('express');
const router = express.Router();

const { authenticateTokenHybrid, requireAdmin } = require('../../middleware/auth');
const announcementRepo = require('../../services/announcementRepo');

// GET /api/announcements/system - get active system announcements (public, no auth required)
router.get('/system', async (req, res) => {
  try {
    const data = await announcementRepo.listSystemAnnouncements();
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/announcements/system/all - get all announcements (authenticated users)
router.get('/system/all', authenticateTokenHybrid, async (req, res) => {
  try {
    const data = await announcementRepo.listAllSystemAnnouncements();
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/announcements/admin/list - get all announcements (admin only)
router.get('/admin/list', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const data = await announcementRepo.listAllSystemAnnouncements();
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/announcements/admin/:id - get announcement by id (admin only)
router.get('/admin/:id', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await announcementRepo.getSystemAnnouncement(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/announcements/admin - create announcement (admin only)
router.post('/admin', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { title, message, type, isActive, expiresAt } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message required' });
    }
    
    const data = await announcementRepo.createSystemAnnouncement({
      title,
      message,
      type,
      isActive,
      expiresAt,
      createdBy: req.user.id,
    });
    
    if (!data) {
      return res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
    
    res.status(201).json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH /api/announcements/admin/:id - update announcement (admin only)
router.patch('/admin/:id', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, isActive, expiresAt } = req.body;
    
    const data = await announcementRepo.updateSystemAnnouncement(id, {
      title,
      message,
      type,
      isActive,
      expiresAt,
    });
    
    if (!data) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/announcements/admin/:id - delete announcement (admin only)
router.delete('/admin/:id', authenticateTokenHybrid, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await announcementRepo.deleteSystemAnnouncement(id);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

