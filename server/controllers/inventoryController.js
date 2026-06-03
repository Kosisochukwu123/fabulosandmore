const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

exports.getInventoryLogs = async (req, res) => {
  try {
    const { product, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    const total = await Inventory.countDocuments(query);
    const logs = await Inventory.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, logs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.stockAdjustment = async (req, res) => {
  try {
    const { product: productId, type, quantity, reason, purchasePrice, warehouseLocation, notes, batchNumber, supplier } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stock;
    let newStock = previousStock;
    if (['stock_in', 'return'].includes(type)) newStock += quantity;
    else if (['stock_out', 'damage'].includes(type)) newStock -= quantity;
    else if (type === 'adjustment') newStock = quantity;

    if (newStock < 0) return res.status(400).json({ success: false, message: 'Stock cannot go below 0' });

    await Product.findByIdAndUpdate(productId, { stock: newStock, ...(warehouseLocation && { warehouseLocation }) });
    const log = await Inventory.create({ product: productId, type, quantity, previousStock, newStock, reason, purchasePrice, warehouseLocation, notes, batchNumber, supplier, performedBy: req.user.id });
    res.status(201).json({ success: true, log, newStock });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getWarehouseDashboard = async (req, res) => {
  try {
    const [totalProducts, lowStock, outOfStock, totalValue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true, stock: { $gt: 0 } }),
      Product.countDocuments({ stock: 0, isActive: true }),
      Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, value: { $sum: { $multiply: ['$stock', '$costPrice'] } } } }])
    ]);
    const recentLogs = await Inventory.find().populate('product', 'name sku').sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, stats: { totalProducts, lowStock, outOfStock, totalInventoryValue: totalValue[0]?.value || 0 }, recentLogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getBarcodeProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
