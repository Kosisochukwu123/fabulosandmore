const SiteSettings = require("../models/SiteSettings");

/* ---- GET settings (public) ---- */
exports.getSettings = async (req, res, next) => {
  try {
    /* Cache for 2 minutes at the HTTP level — CDN and browser both benefit */
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");

    const settings = await SiteSettings.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/* ---- UPDATE settings (admin only) ---- */
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { singleton: "main" },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/* ---- ADD coupon ---- */
exports.addCoupon = async (req, res, next) => {
  try {
    const { code, discount, expiresAt, maxUses, description } = req.body;
    if (!code || !discount)
      return res
        .status(400)
        .json({ success: false, message: "Code and discount are required" });
    const settings = await SiteSettings.getSettings();
    if (settings.coupons.find((c) => c.code === code.toUpperCase()))
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    settings.coupons.push({
      code: code.toUpperCase(),
      discount,
      expiresAt,
      maxUses: maxUses || 0,
      description,
    });
    await settings.save();
    res.status(201).json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/* ---- UPDATE coupon ---- */
exports.updateCoupon = async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings();
    const coupon = settings.coupons.id(req.params.couponId);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    Object.assign(coupon, req.body);
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/* ---- DELETE coupon ---- */
exports.deleteCoupon = async (req, res, next) => {
  try {
    const settings = await SiteSettings.getSettings();
    settings.coupons.pull(req.params.couponId);
    await settings.save();
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

/* ---- VALIDATE coupon (cart) ---- */
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Coupon code required" });
    const settings = await SiteSettings.getSettings();
    const coupon = settings.coupons.find(
      (c) => c.code === code.toUpperCase() && c.isActive,
    );
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Invalid coupon code" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired" });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
      return res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached" });
    const discountAmount = Math.round(
      (cartTotal || 0) * (coupon.discount / 100),
    );
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        discountAmount,
        description: coupon.description || `${coupon.discount}% off`,
      },
    });
  } catch (err) {
    next(err);
  }
};
