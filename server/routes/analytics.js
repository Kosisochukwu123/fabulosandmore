const express = require('express');
const router = express.Router();
const { getSalesDashboard } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getSalesDashboard);

module.exports = router;
