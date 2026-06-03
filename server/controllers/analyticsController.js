const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

exports.getSalesDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthSales, lastMonthSales, totalOrders, totalCustomers, topProducts, salesByStatus, dailySales] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.find({ isActive: true }).sort({ totalSold: -1 }).limit(5).select('name totalSold price images'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const thisMonth = thisMonthSales[0] || { total: 0, count: 0 };
    const lastMonth = lastMonthSales[0]?.total || 0;
    const growth = lastMonth ? (((thisMonth.total - lastMonth) / lastMonth) * 100).toFixed(1) : 0;

    res.json({ success: true, data: { thisMonthRevenue: thisMonth.total, thisMonthOrders: thisMonth.count, revenueGrowth: growth, totalOrders, totalCustomers, topProducts, salesByStatus, dailySales } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
