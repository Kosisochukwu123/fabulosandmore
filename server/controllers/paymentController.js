const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to kobo/cents
      currency: 'ngn',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber, userId: req.user.id }
    });

    await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: paymentIntent.id });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const { orderId } = event.data.object.metadata;
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      $push: { deliveryTracking: { status: 'confirmed', message: 'Payment confirmed, order processing started', timestamp: new Date() } }
    });
  } else if (event.type === 'payment_intent.payment_failed') {
    const { orderId } = event.data.object.metadata;
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
  }
  res.json({ received: true });
};
