require('dotenv').config();
const express      = require('express');
const http         = require('http');
const path         = require('path');
const socketIo     = require('socket.io');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cron         = require('node-cron');

const connectDB      = require('./config/database');
const errorHandler   = require('./middleware/errorHandler');

/* ---- Routes ---- */
const authRoutes      = require('./routes/auth');
const productRoutes   = require('./routes/products');
const orderRoutes     = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes   = require('./routes/payment');
const supplierRoutes  = require('./routes/suppliers');
const aiRoutes        = require('./routes/ai');
const settingsRoutes  = require('./routes/settings');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
  transports: ['websocket', 'polling'],
});

/* ---- Connect DB ---- */
connectDB();

/* ================================================================
   SECURITY MIDDLEWARE
   ================================================================ */

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,   /* Allow images from any origin */
}));

/* CORS */
const allowedOrigins = [
  process.env.CLIENT_URL   || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5000',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(mongoSanitize()); /* Prevent NoSQL injection */

/* Logging */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

/* ================================================================
   RATE LIMITING
   ================================================================ */

/* Auth endpoints — strict */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

/* General API — generous */
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      600,
  message:  { success: false, message: 'Too many requests — slow down!' },
  skip: (req) => req.path.startsWith('/uploads') || req.method === 'OPTIONS',
}));

/* ================================================================
   BODY PARSING
   ================================================================ */

/* Stripe webhook needs raw body */
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ================================================================
   SOCKET.IO
   ================================================================ */

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('join-admin', () => { socket.join('admin-room'); });
  socket.on('disconnect', () => { console.log('🔌 Client disconnected:', socket.id); });
});
app.set('io', io);

/* ================================================================
   STATIC FILES
   ================================================================ */

/* Serve uploaded product images with CORS headers */
app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cache-Control', 'public, max-age=604800, immutable'); /* 7 days */
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge:  '7d',
  etag:    true,
  lastModified: true,
}));

/* ================================================================
   API ROUTES
   ================================================================ */

app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment',   paymentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/settings',  settingsRoutes);

/* Health check */
app.get('/api/health', (req, res) => res.json({
  success:   true,
  status:    'OK',
  message:   'Fabulous & More API Running',
  timestamp: new Date().toISOString(),
  uptime:    Math.floor(process.uptime()),
  env:       process.env.NODE_ENV || 'development',
}));

/* ================================================================
   SCHEDULED JOBS
   ================================================================ */

/* Low stock alert — 9 AM daily */
cron.schedule('0 9 * * *', async () => {
  try {
    const Product = require('./models/Product');
    const lowStock = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true,
      stock:    { $gt: 0 },
    }).select('name sku stock lowStockThreshold');

    if (lowStock.length > 0) {
      const whatsappService = require('./services/whatsappService');
      await whatsappService.sendLowStockAlert(lowStock).catch(() => {});
      io.to('admin-room').emit('low-stock-alert', {
        count:    lowStock.length,
        products: lowStock,
      });
      console.log(`[Cron] Low stock alert: ${lowStock.length} products`);
    }
  } catch (err) {
    console.error('[Cron] Low stock job failed:', err.message);
  }
});

/* Clean expired password reset tokens — midnight daily */
cron.schedule('0 0 * * *', async () => {
  try {
    const User = require('./models/User');
    await User.updateMany(
      { resetPasswordExpires: { $lt: new Date() } },
      { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
    );
  } catch (err) {
    console.error('[Cron] Token cleanup failed:', err.message);
  }
});

/* ================================================================
   ERROR HANDLING
   ================================================================ */

/* 404 handler for unknown API routes */
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

/* Global error handler */
app.use(errorHandler);

/* ================================================================
   PRODUCTION — Serve React build
   ================================================================ */

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

/* ================================================================
   START SERVER
   ================================================================ */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Fabulous & More API on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`📦 Uploads served at: http://localhost:${PORT}/uploads`);
});

/* Handle unhandled rejections */
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

/* Handle uncaught exceptions */
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = { app, server };