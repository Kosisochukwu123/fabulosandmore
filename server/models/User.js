const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:  { type: String, required: [true, 'Name is required'], trim: true, maxlength: [100, 'Name cannot exceed 100 characters'] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  phone:          { type: String, trim: true },
  role:           { type: String, enum: ['customer', 'admin', 'warehouse'], default: 'customer' },
  address: [{
    label:    { type: String, trim: true },
    street:   { type: String, trim: true },
    city:     { type: String, trim: true },
    state:    { type: String, trim: true },
    zipCode:  { type: String, trim: true },
    country:  { type: String, default: 'Nigeria' },
    isDefault:{ type: Boolean, default: false },
  }],
  whatsappNumber:       { type: String, trim: true },
  isVerified:           { type: Boolean, default: false },
  isActive:             { type: Boolean, default: true },
  avatar:               { type: String },
  loyaltyPoints:        { type: Number, default: 0, min: 0 },
  totalOrders:          { type: Number, default: 0, min: 0 },
  totalSpent:           { type: Number, default: 0, min: 0 },
  wishlist:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },
  lastLoginAt:          { type: Date },
}, { timestamps: true });

/* Hash password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* Update lastLoginAt (called manually after successful login) */
userSchema.methods.recordLogin = async function () {
  this.lastLoginAt = new Date();
  return this.save({ validateBeforeSave: false });
};

/* Compare password */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* Indexes */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);