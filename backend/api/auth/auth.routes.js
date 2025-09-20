const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
	res.json({ success: true, service: 'auth', status: 'ok' });
});

module.exports = router;
