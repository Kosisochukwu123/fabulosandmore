const express = require('express');
const router  = express.Router();
const { getSettings, updateSettings, addCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                     getSettings);
router.post('/validate-coupon',     protect, validateCoupon);
router.put('/',                     protect, authorize('admin'), updateSettings);
router.post('/coupons',             protect, authorize('admin'), addCoupon);
router.put('/coupons/:couponId',    protect, authorize('admin'), updateCoupon);
router.delete('/coupons/:couponId', protect, authorize('admin'), deleteCoupon);

module.exports = router;
