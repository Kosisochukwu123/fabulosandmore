const express = require('express');
const router = express.Router();
const { getInventoryLogs, stockAdjustment, getWarehouseDashboard, getBarcodeProduct } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'warehouse'), getInventoryLogs);
router.get('/dashboard', protect, authorize('admin', 'warehouse'), getWarehouseDashboard);
router.get('/barcode/:barcode', protect, authorize('admin', 'warehouse'), getBarcodeProduct);
router.post('/adjust', protect, authorize('admin', 'warehouse'), stockAdjustment);

module.exports = router;
