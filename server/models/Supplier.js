const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  whatsapp: { type: String },
  address: { street: String, city: String, state: String, country: String },
  contactPerson: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  rating: { type: Number, default: 5, min: 1, max: 5 },
  leadTimeDays: { type: Number, default: 7 },
  minimumOrderValue: { type: Number, default: 0 },
  paymentTerms: String,
  notes: String,
  isActive: { type: Boolean, default: true },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
