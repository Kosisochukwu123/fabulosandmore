const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['stock_in','stock_out','adjustment','return','damage'], required: true },
  quantity: { type: Number, required: true },
  previousStock: Number,
  newStock: Number,
  reason: String,
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  purchasePrice: Number,
  warehouseLocation: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  batchNumber: String,
  expiryDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
