const Order     = require('../models/Order');
const Product   = require('../models/Product');
const Inventory = require('../models/Inventory');
const whatsappService = require('../services/whatsappService');

/* ---- CREATE ORDER ---- */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, isBulkOrder, bulkOrderNote, discount = 0 } = req.body;

    if (!items?.length)          return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    if (!shippingAddress?.street) return res.status(400).json({ success: false, message: 'Shipping address is required' });
    if (!paymentMethod)           return res.status(400).json({ success: false, message: 'Payment method is required' });

    /* Validate and price all items */
    let subtotal    = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.product)  throw new Error('Each item must have a product ID');
      if (!item.quantity || item.quantity < 1) throw new Error('Quantity must be at least 1');

      const product = await Product.findById(item.product).select('name sku price stock images isActive');
      if (!product)           return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (!product.isActive)  return res.status(400).json({ success: false, message: `"${product.name}" is no longer available` });
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" only has ${product.stock} unit${product.stock === 1 ? '' : 's'} available`,
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product:  product._id,
        name:     product.name,
        sku:      product.sku,
        price:    product.price,
        quantity: item.quantity,
        image:    product.images?.[0]?.url || '',
        subtotal: itemSubtotal,
      });
    }

    const discountAmount = Math.min(Number(discount) || 0, subtotal);
    const shippingCost   = (subtotal - discountAmount) >= 50000 ? 0 : 2000;
    const tax            = (subtotal - discountAmount) * 0.075;
    const total          = subtotal - discountAmount + shippingCost + tax;

    const order = await Order.create({
      user:            req.user.id,
      items:           orderItems,
      shippingAddress,
      billingAddress:  billingAddress || shippingAddress,
      subtotal,
      discount:        discountAmount,
      shippingCost,
      tax,
      total,
      paymentMethod,
      couponCode:      couponCode || undefined,
      isBulkOrder:     !!isBulkOrder,
      bulkOrderNote:   bulkOrderNote || undefined,
      deliveryTracking: [{ status: 'pending', message: 'Order placed successfully', timestamp: new Date() }],
    });

    /* Deduct stock atomically — one write per product */
    await Promise.all(orderItems.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSold: item.quantity }
      })
    ));

    /* Log inventory */
    await Promise.all(orderItems.map(item =>
      Inventory.create({
        product:     item.product,
        type:        'stock_out',
        quantity:    item.quantity,
        order:       order._id,
        reason:      'Customer order',
        performedBy: req.user.id,
      })
    ));

    /* WhatsApp notification — don't let it fail the request */
    whatsappService.sendOrderConfirmation(order, req.user).catch(e =>
      console.warn('[WhatsApp] Order confirmation failed:', e.message)
    );

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

/* ---- MY ORDERS ---- */
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, page: Number(page), orders });
  } catch (err) { next(err); }
};

/* ---- SINGLE ORDER ---- */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images slug price')
      .populate('user', 'name email phone')
      .lean();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    /* Customers can only see their own orders */
    if (req.user.role === 'customer' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

/* ---- UPDATE STATUS (admin/warehouse) ---- */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message, location } = req.body;

    const VALID_STATUSES = ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','refunded'];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    /* Prevent going backwards (e.g. delivered → pending) */
    const STATUS_ORDER = ['pending','confirmed','processing','packed','shipped','out_for_delivery','delivered'];
    const currentIdx   = STATUS_ORDER.indexOf(order.status);
    const newIdx       = STATUS_ORDER.indexOf(status);
    if (newIdx !== -1 && currentIdx !== -1 && newIdx < currentIdx && !['cancelled','refunded'].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change status from "${order.status}" back to "${status}"` });
    }

    order.status = status;
    order.deliveryTracking.push({
      status,
      message:   message || `Order ${status.replace(/_/g, ' ')}`,
      location:  location || '',
      timestamp: new Date(),
    });

    if (status === 'delivered') {
      order.deliveredAt    = new Date();
      order.paymentStatus  = order.paymentMethod === 'cash_on_delivery' ? 'paid' : order.paymentStatus;

      /* Update customer stats */
      await require('../models/User').findByIdAndUpdate(order.user, {
        $inc: { totalOrders: 1, totalSpent: order.total }
      });
    }

    /* Restore stock on cancel */
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await Promise.all(order.items.map(item =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, totalSold: -item.quantity }
        })
      ));
    }

    await order.save();

    whatsappService.sendStatusUpdate(order).catch(e =>
      console.warn('[WhatsApp] Status update failed:', e.message)
    );

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

/* ---- ALL ORDERS (admin) ---- */
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search, paymentStatus, startDate, endDate } = req.query;
    const query = {};

    if (status)        query.status        = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(endDate);
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name sku images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), orders });
  } catch (err) { next(err); }
};

/* ---- CANCEL ORDER (customer) ---- */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}". Contact support for help.`,
      });
    }

    order.status = 'cancelled';
    order.deliveryTracking.push({ status: 'cancelled', message: 'Cancelled by customer', timestamp: new Date() });

    /* Restore stock */
    await Promise.all(order.items.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity }
      })
    ));

    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (err) { next(err); }
};