const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');

router.post('/recommendations', protect, async (req, res) => {
  try {
    const { browsedProducts, currentProduct } = req.body;
    const user = req.user;
    const data = await aiService.getProductRecommendations([], browsedProducts, currentProduct);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await aiService.chatAssistant(message, history);
    res.json({ success: true, reply });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/inventory-insights', protect, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const lowStock = await Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true }).limit(10).select('name sku stock');
    const data = await aiService.getInventoryInsights(lowStock, []);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/whatsapp/bulk-inquiry', async (req, res) => {
  try {
    const whatsappService = require('../services/whatsappService');
    await whatsappService.sendBulkOrderInquiry(req.body);
    res.json({ success: true, message: 'Inquiry sent to admin via WhatsApp' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
