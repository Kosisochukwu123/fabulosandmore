const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:             { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [200, 'Name cannot exceed 200 characters'] },
  slug:             { type: String, unique: true, lowercase: true },
  description:      { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: [500, 'Short description cannot exceed 500 characters'] },
  category:         { type: String, required: [true, 'Category is required'], enum: {
    values: ['Kitchen Utensils', 'Cookware', 'Bakeware', 'Storage Solutions', 'Cleaning Tools', 'Small Appliances'],
    message: '{VALUE} is not a valid category'
  }},
  subcategory:      { type: String, trim: true },
  brand:            { type: String, trim: true },
  sku:              { type: String, required: [true, 'SKU is required'], unique: true, uppercase: true, trim: true },
  barcode:          { type: String, sparse: true, trim: true },
  price:            { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  comparePrice:     { type: Number, min: [0, 'Compare price cannot be negative'] },
  costPrice:        { type: Number, min: [0, 'Cost price cannot be negative'] },
  currency:         { type: String, default: 'NGN' },
  images:           [{ url: { type: String, required: true }, publicId: String, alt: String }],
  stock:            { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
  lowStockThreshold:{ type: Number, default: 10, min: 0 },
  warehouseLocation:{ type: String, trim: true },
  weight:           { type: Number, min: 0 },
  dimensions:       { length: Number, width: Number, height: Number },
  tags:             [{ type: String, trim: true, lowercase: true }],
  features:         [{ type: String, trim: true }],
  specifications:   [{ key: { type: String, trim: true }, value: { type: String, trim: true } }],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0, min: 0 },
  },
  reviews: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  }],
  supplier:         { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  isFeatured:       { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  isBulkAvailable:  { type: Boolean, default: false },
  bulkPricing:      [{ minQty: { type: Number, min: 1 }, price: { type: Number, min: 0 } }],
  totalSold:        { type: Number, default: 0, min: 0 },
  viewCount:        { type: Number, default: 0, min: 0 },
}, {
  timestamps: true,
  /* Virtual for discount percentage */
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

/* Virtuals */
productSchema.virtual('discountPercent').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

productSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

/* Auto-generate slug before save */
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  }
  /* Auto uppercase SKU */
  if (this.isModified('sku')) {
    this.sku = this.sku.toUpperCase();
  }
  next();
});

/* Indexes for common queries */
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);