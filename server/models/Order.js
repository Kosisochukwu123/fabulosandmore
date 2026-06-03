const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'User is required'] },
  items:  [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:     { type: String, required: true },
    sku:      String,
    price:    { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image:    String,
    subtotal: { type: Number, required: true, min: 0 },
  }],
  shippingAddress: {
    name:    { type: String, required: [true, 'Recipient name is required'] },
    street:  { type: String, required: [true, 'Street address is required'] },
    city:    { type: String, required: [true, 'City is required'] },
    state:   { type: String, required: [true, 'State is required'] },
    zipCode: String,
    country: { type: String, default: 'Nigeria' },
    phone:   String,
  },
  billingAddress: {
    name: String, street: String, city: String,
    state: String, zipCode: String, country: String,
  },
  subtotal:      { type: Number, required: true, min: 0 },
  shippingCost:  { type: Number, default: 0,  min: 0 },
  tax:           { type: Number, default: 0,  min: 0 },
  discount:      { type: Number, default: 0,  min: 0 },
  total:         { type: Number, required: true, min: 0 },
  couponCode:    String,
  status: {
    type: String,
    enum: ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending','paid','failed','refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe','bank_transfer','cash_on_delivery','whatsapp_pay'],
  },
  paymentReference:      String,
  stripePaymentIntentId: String,
  isBulkOrder:           { type: Boolean, default: false },
  bulkOrderNote:         String,
  deliveryTracking: [{
    status:    String,
    message:   String,
    location:  String,
    timestamp: { type: Date, default: Date.now },
  }],
  estimatedDelivery: Date,
  deliveredAt:       Date,
  cancelledAt:       Date,
  notes:             String,
  whatsappNotified:  { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true } });

/* Auto-generate order number */
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FAB-${String(count + 1).padStart(5, '0')}-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

/* Virtual: total items count */
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

/* Indexes */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);