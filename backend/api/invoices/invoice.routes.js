const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
	res.json({ success: true, service: 'invoices', status: 'ok' });
});

module.exports = router;
