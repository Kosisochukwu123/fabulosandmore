const https = require('https');

const sendWhatsAppMessage = async (to, message) => {
  const phone = to.replace(/[^0-9]/g, '');
  const body = JSON.stringify({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.facebook.com',
      path: `/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

exports.sendOrderConfirmation = async (order, user) => {
  if (!user.whatsappNumber) return;
  const message = `🎉 *Order Confirmed!* - Fabulous & More\n\n` +
    `Hi ${user.name}! Your order *#${order.orderNumber}* has been confirmed.\n\n` +
    `💰 Total: ₦${order.total.toLocaleString()}\n` +
    `📦 Items: ${order.items.length}\n` +
    `🚚 Estimated delivery: 3-5 business days\n\n` +
    `Track your order at: ${process.env.CLIENT_URL}/orders/${order._id}\n\n` +
    `Thank you for shopping with us! 🏪`;
  return sendWhatsAppMessage(user.whatsappNumber, message);
};

exports.sendStatusUpdate = async (order) => {
  const user = await require('../models/User').findById(order.user);
  if (!user?.whatsappNumber) return;
  const emojis = { confirmed: '✅', processing: '⚙️', packed: '📦', shipped: '🚚', out_for_delivery: '🏃', delivered: '🎊', cancelled: '❌' };
  const message = `${emojis[order.status] || '📋'} *Order Update* - Fabulous & More\n\n` +
    `Order *#${order.orderNumber}* is now *${order.status.replace(/_/g, ' ').toUpperCase()}*\n\n` +
    `Track: ${process.env.CLIENT_URL}/orders/${order._id}`;
  return sendWhatsAppMessage(user.whatsappNumber, message);
};

exports.sendLowStockAlert = async (products) => {
  const adminPhone = process.env.ADMIN_WHATSAPP || '';
  if (!adminPhone) return;
  const list = products.map(p => `• ${p.name} (SKU: ${p.sku}): ${p.stock} left`).join('\n');
  const message = `⚠️ *Low Stock Alert* - Fabulous & More\n\n${products.length} products are running low:\n\n${list}\n\nVisit the admin panel to reorder.`;
  return sendWhatsAppMessage(adminPhone, message);
};

exports.sendBulkOrderInquiry = async (data) => {
  const adminPhone = process.env.ADMIN_WHATSAPP || '';
  if (!adminPhone) return;
  const message = `🏢 *Bulk Order Inquiry*\n\nFrom: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nProducts: ${data.products}\nQuantity: ${data.quantity}\nNote: ${data.note || 'N/A'}`;
  return sendWhatsAppMessage(adminPhone, message);
};
