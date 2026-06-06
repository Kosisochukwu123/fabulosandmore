require('dotenv').config();
const express       = require('express');
const http          = require('http');
const path          = require('path');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const compression   = require('compression');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB    = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

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

let io;
try {
  const socketIo = require('socket.io');
  io = socketIo(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true } });
  io.on('connection', socket => {
    socket.on('join-admin', () => socket.join('admin-room'));
  });
  app.set('io', io);
} catch (e) {
  console.warn('[Socket.IO] Not available:', e.message);
}

connectDB();

/* ---- Security ---- */
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));

const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000', 'https://fabulosandmore.vercel.app', 'http://localhost:3000', 'http://localhost:5000', 'https://fabulosandmore.onrender.com'];
app.use(cors({
  origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) cb(null, true); else cb(new Error(`CORS: ${origin} not allowed`)); },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(compression());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ---- Rate limiting ---- */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' } });
app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600, message: { success: false, message: 'Too many requests.' } }));

/* ---- Body parsing ---- */
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---- Static uploads ---- */
app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Cache-Control', 'public, max-age=604800, immutable');
  next();
}, express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', etag: true }));

/* ---- Routes ---- */
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment',   paymentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/settings',  settingsRoutes);

app.get('/api/health', (req, res) => res.json({
  success: true, status: 'OK', message: 'Fabulous & More API Running',
  timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()),
}));

/* ---- 404 for unknown API routes ---- */
app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

/* ---- Production: serve React ---- */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

/* ---- Global error handler ---- */
app.use(errorHandler);

/* ---- Start ---- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Uploads: http://localhost:${PORT}/uploads`);
});

process.on('unhandledRejection', err => { console.error('💥 Unhandled Rejection:', err.message); server.close(() => process.exit(1)); });
process.on('uncaughtException',  err => { console.error('💥 Uncaught Exception:',  err.message); process.exit(1); });

module.exports = { app, server };

module.exports = app;