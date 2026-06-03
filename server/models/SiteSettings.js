const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'main', unique: true },
  business: {
    name:         { type: String, default: 'Fabulous & More' },
    tagline:      { type: String, default: 'Premium Kitchen Utensils & Hardware' },
    description:  { type: String, default: 'Premium kitchen utensils and hardware for the modern Nigerian home.' },
    logo:         { type: String, default: '' },
    email:        { type: String, default: 'hello@fabulousandmore.com' },
    supportEmail: { type: String, default: 'support@fabulousandmore.com' },
    phone:        { type: String, default: '+234 800 000 0000' },
    whatsapp:     { type: String, default: '+2348000000000' },
    whatsappText: { type: String, default: 'Hi! I need help with my order.' },
  },
  address: {
    street:  { type: String, default: '123 Market Street' },
    city:    { type: String, default: 'Lagos' },
    state:   { type: String, default: 'Lagos State' },
    country: { type: String, default: 'Nigeria' },
    mapLink: { type: String, default: '' },
  },
  hours: {
    weekdays: { type: String, default: 'Monday – Saturday: 8am – 6pm WAT' },
    weekends: { type: String, default: 'Sunday: Closed' },
    timezone: { type: String, default: 'WAT (UTC+1)' },
  },
  social: {
    facebook:  { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter:   { type: String, default: '' },
    youtube:   { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    linkedin:  { type: String, default: '' },
  },
  shipping: {
    freeShippingThreshold: { type: Number, default: 50000 },
    standardCost:          { type: Number, default: 2000 },
    estimatedDays:         { type: String, default: '3–5 business days' },
    expressAvailable:      { type: Boolean, default: false },
    expressCost:           { type: Number, default: 5000 },
    expressEstimatedDays:  { type: String, default: '1–2 business days' },
  },
  announcement: {
    enabled:   { type: Boolean, default: true },
    text:      { type: String, default: 'Free delivery on orders over ₦50,000 · WhatsApp: +234 800 000 0000' },
    link:      { type: String, default: '' },
    bgColor:   { type: String, default: '#D4AF37' },
    textColor: { type: String, default: '#1A1A1A' },
  },
  seo: {
    metaTitle:       { type: String, default: 'Fabulous & More — Premium Kitchen Utensils Nigeria' },
    metaDescription: { type: String, default: 'Shop premium kitchen utensils, cookware and bakeware in Nigeria.' },
    keywords:        { type: String, default: 'kitchen utensils nigeria, cookware, bakeware' },
  },
  coupons: [{
    code:        { type: String, uppercase: true, trim: true },
    discount:    { type: Number, min: 0, max: 100 },
    isActive:    { type: Boolean, default: true },
    expiresAt:   Date,
    maxUses:     { type: Number, default: 0 },
    usedCount:   { type: Number, default: 0 },
    description: String,
  }],
}, { timestamps: true });

siteSettingsSchema.statics.getSettings = async function () {
  let s = await this.findOne({ singleton: 'main' });
  if (!s) s = await this.create({ singleton: 'main' });
  return s;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
