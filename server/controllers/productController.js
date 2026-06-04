const Product = require("../models/Product");

exports.getProducts = async (req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=60");
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      featured,
      inStock,
    } = req.query;
    const isAdmin =
      req.user?.role === "admin" || req.user?.role === "warehouse";
    const query = isAdmin ? {} : { isActive: true };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (featured === "true") query.isFeatured = true;
    if (inStock === "true") query.stock = { $gt: 0 };

    const sortOptions = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      newest: { createdAt: -1 },
      popular: { totalSold: -1 },
      rating: { "ratings.average": -1 },
    };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("supplier", "name")
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-reviews");
    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    const isId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const product = await Product.findOne(
      isId ? { _id: req.params.id } : { slug: req.params.id },
    )
      .populate("supplier", "name leadTimeDays")
      .populate("reviews.user", "name avatar");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.name)
      return res
        .status(400)
        .json({ success: false, message: "Product name is required" });
    if (!body.category)
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });
    if (!body.sku)
      return res
        .status(400)
        .json({ success: false, message: "SKU is required" });
    if (!body.price)
      return res
        .status(400)
        .json({ success: false, message: "Price is required" });
    if (body.stock === undefined || body.stock === "")
      return res
        .status(400)
        .json({ success: false, message: "Stock is required" });

    const slug =
      body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    /* Cloudinary returns f.path as the full URL; local disk uses SERVER_URL */
    const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
    const images = (req.files || []).map((f) => ({
      url: f.path || `${serverUrl}/uploads/${f.filename}`,
      publicId: f.filename || f.public_id || "",
      alt: body.name,
    }));
    const features = Array.isArray(body.features)
      ? body.features
      : (body.features || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
    const tags = Array.isArray(body.tags)
      ? body.tags
      : (body.tags || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    const description =
      body.description ||
      body.shortDescription ||
      `${body.name} — ${body.category}`;

    const product = await Product.create({
      name: body.name,
      slug,
      description,
      shortDescription: body.shortDescription || "",
      category: body.category,
      subcategory: body.subcategory || "",
      brand: body.brand || "",
      sku: body.sku,
      barcode: body.barcode || undefined,
      price: Number(body.price),
      comparePrice: body.comparePrice ? Number(body.comparePrice) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      stock: Number(body.stock) || 0,
      lowStockThreshold: Number(body.lowStockThreshold) || 10,
      warehouseLocation: body.warehouseLocation || "",
      weight: body.weight ? Number(body.weight) : undefined,
      features,
      tags,
      images,
      isFeatured: body.isFeatured === true || body.isFeatured === "true",
      isBulkAvailable:
        body.isBulkAvailable === true || body.isBulkAvailable === "true",
      isActive: body.isActive !== false && body.isActive !== "false",
      supplier: body.supplier || undefined,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `A product with this ${field} already exists`,
      });
    }
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.features === "string")
      body.features = body.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    if (typeof body.tags === "string")
      body.tags = body.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (req.files?.length) {
      const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
      const newImgs = req.files.map((f) => ({
        url: f.path || `${serverUrl}/uploads/${f.filename}`,
        publicId: f.filename || f.public_id || "",
        alt: body.name || "Product image",
      }));
      const existing = Array.isArray(body.images) ? body.images : [];
      body.images = [...existing, ...newImgs];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: false,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Product deactivated" });
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    if (product.reviews.find((r) => r.user.toString() === req.user.id))
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    product.reviews.push({ user: req.user.id, rating, comment });
    product.ratings.count = product.reviews.length;
    product.ratings.average =
      product.reviews.reduce((a, r) => a + r.rating, 0) /
      product.reviews.length;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      isActive: true,
    })
      .select("name sku stock lowStockThreshold images category")
      .populate("supplier", "name phone");
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};
