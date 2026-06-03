# 🍳 Fabulous & More — Full-Stack MERN E-Commerce + Inventory System

> Premium Kitchen Utensils & Home Hardware Store
> Colors: **Gold (#D4AF37)** & **Black (#1A1A1A)** on White

---

## 📁 Project Structure

```
fabulous-and-more/
├── client/                          ← React Frontend (Port 3000)
│   ├── public/
│   │   └── index.html               ← HTML entry point
│   └── src/
│       ├── App.js                   ← Router & App shell
│       ├── index.js                 ← React entry point
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx       ← Gold/Black sticky nav + search
│       │   │   └── Footer.jsx       ← Links, social, WhatsApp CTA
│       │   ├── admin/               ← Admin-only components
│       │   ├── ai/                  ← AI chat widget
│       │   ├── auth/                ← Login/Register forms
│       │   ├── cart/                ← Cart drawer/page
│       │   ├── catalog/             ← Product grid, filters
│       │   ├── checkout/            ← Multi-step checkout
│       │   ├── dashboard/           ← Customer dashboard
│       │   ├── delivery/            ← Delivery tracking UI
│       │   ├── inventory/           ← Inventory components
│       │   ├── payment/             ← Stripe payment form
│       │   └── whatsapp/            ← WhatsApp integration UI
│       ├── pages/
│       │   ├── HomePage.jsx         ✅ Hero, categories, featured, AI chat
│       │   ├── CatalogPage.jsx      ✅ Products + filters + search + sort
│       │   ├── ProductPage.jsx      → Build: product detail, reviews, add to cart
│       │   ├── CartPage.jsx         → Build: cart items, totals, checkout CTA
│       │   ├── CheckoutPage.jsx     → Build: address, payment, Stripe
│       │   ├── OrdersPage.jsx       → Build: order list + tracking
│       │   ├── ProfilePage.jsx      → Build: user profile, addresses
│       │   ├── BulkOrderPage.jsx    → Build: bulk inquiry form
│       │   └── admin/
│       │       ├── AdminDashboard.jsx ✅ Stats, revenue chart, top products
│       │       ├── InventoryPage.jsx  ✅ Stock tracking, barcode, adjustments
│       │       ├── OrdersAdminPage.jsx → Build: all orders, status updates
│       │       ├── ProductsAdminPage.jsx → Build: product CRUD
│       │       └── SuppliersPage.jsx  → Build: supplier management
│       ├── context/
│       │   ├── AuthContext.js       ✅ Login, register, token management
│       │   └── CartContext.js       ✅ Cart state (localStorage)
│       ├── hooks/                   → Custom React hooks
│       ├── utils/                   → Helper functions
│       └── styles/
│           └── global.css           ✅ Gold/Black theme, components
│
├── server/                          ← Express Backend (Port 5000)
│   ├── index.js                     ✅ Express + Socket.IO + Cron jobs
│   ├── config/
│   │   ├── database.js              ✅ MongoDB connection
│   │   └── cloudinary.js            ✅ Image upload config
│   ├── models/
│   │   ├── User.js                  ✅ Auth, roles, wishlist, loyalty
│   │   ├── Product.js               ✅ Full product with barcode, bulk pricing
│   │   ├── Order.js                 ✅ Orders + delivery tracking
│   │   ├── Supplier.js              ✅ Supplier management
│   │   └── Inventory.js             ✅ Stock movement logs
│   ├── controllers/
│   │   ├── authController.js        ✅ Register, login, profile
│   │   ├── productController.js     ✅ CRUD, search, reviews, low stock
│   │   ├── orderController.js       ✅ Create, track, status updates
│   │   ├── inventoryController.js   ✅ Stock adjust, barcode, dashboard
│   │   ├── analyticsController.js   ✅ Sales dashboard, revenue charts
│   │   └── paymentController.js     ✅ Stripe payment + webhook
│   ├── middleware/
│   │   ├── auth.js                  ✅ JWT protect + role authorize
│   │   ├── upload.js                ✅ Multer + Cloudinary
│   │   └── errorHandler.js          ✅ Centralized error handling
│   ├── routes/
│   │   ├── auth.js                  ✅ /api/auth/*
│   │   ├── products.js              ✅ /api/products/*
│   │   ├── orders.js                ✅ /api/orders/*
│   │   ├── inventory.js             ✅ /api/inventory/*
│   │   ├── analytics.js             ✅ /api/analytics/*
│   │   ├── payment.js               ✅ /api/payment/*
│   │   ├── suppliers.js             ✅ /api/suppliers/*
│   │   └── ai.js                    ✅ /api/ai/* (recommendations, chat)
│   └── services/
│       ├── whatsappService.js       ✅ Order confirmations, alerts
│       └── aiService.js             ✅ Claude AI recommendations
│
├── package.json                     ✅ Root scripts (dev, build)
├── .env.example                     ✅ All environment variables
├── .gitignore                       ✅
└── README.md                        ✅ This file
```

---

## 🚀 Quick Start (Windows)

### 1. Prerequisites
```bash
# Install these first:
# Node.js v18+ → https://nodejs.org
# MongoDB Community → https://www.mongodb.com/try/download/community
# Git → https://git-scm.com
```

### 2. Setup
```bash
# In the project folder
cd fabulous-and-more

# Copy env file
copy .env.example .env

# Edit .env with your values (see below)
notepad .env

# Install all dependencies
npm run install-all
```

### 3. Run Development
```bash
# Starts both server (5000) + client (3000)
npm run dev
```
Open: http://localhost:3000

---

## 🔧 Environment Variables (.env)

```env
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/fabulous-and-more
JWT_SECRET=make-this-long-and-random-abc123xyz

# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# WhatsApp Business API (Meta Developer Console)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...

# Anthropic AI (console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password  # Gmail App Password, not main password

CLIENT_URL=http://localhost:3000
ADMIN_WHATSAPP=+2348000000000  # Admin WhatsApp for alerts
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login → JWT token |
| GET | /api/auth/me | Get current user (auth required) |
| PUT | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List + filter + search + paginate |
| GET | /api/products/categories | All categories |
| GET | /api/products/low-stock | Low stock alert list (admin) |
| GET | /api/products/:id | Single product detail |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Deactivate product (admin) |
| POST | /api/products/:id/reviews | Add review (customer) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders/my-orders | My order history |
| GET | /api/orders | All orders (admin) |
| GET | /api/orders/:id | Single order |
| PUT | /api/orders/:id/status | Update status + WhatsApp notify |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | All movement logs |
| GET | /api/inventory/dashboard | Warehouse stats |
| GET | /api/inventory/barcode/:code | Barcode lookup |
| POST | /api/inventory/adjust | Stock in/out/adjust |

### AI & WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/recommendations | Product recommendations |
| POST | /api/ai/chat | AI chatbot |
| GET | /api/ai/inventory-insights | AI stock analysis |
| POST | /api/ai/whatsapp/bulk-inquiry | Send bulk order to admin |

---

## 🎨 Design System
- **Primary Gold:** `#D4AF37` — buttons, accents, logo
- **Black:** `#1A1A1A` — navbar, dark sections, text
- **White:** `#FFFFFF` — background, cards
- **Fonts:** Playfair Display (headings) + Inter (body)

---

## 📱 Features Checklist

### E-Commerce
- [x] Product catalog with search & filters
- [x] Category navigation
- [x] Product detail with reviews
- [x] Shopping cart (localStorage)
- [x] Stripe payment integration
- [x] Order tracking with delivery status
- [x] Bulk order system with WhatsApp

### Inventory
- [x] Real-time stock tracking
- [x] Low stock alerts (auto-cron daily 9AM)
- [x] Barcode lookup system
- [x] Supplier management
- [x] Inventory movement logs
- [x] Warehouse location tracking

### Admin
- [x] Sales analytics dashboard
- [x] Revenue charts (Recharts)
- [x] Order management
- [x] Product CRUD + image upload
- [x] Supplier management

### AI & WhatsApp
- [x] AI product recommendations (Claude)
- [x] AI customer chatbot
- [x] AI inventory insights
- [x] WhatsApp order confirmations
- [x] WhatsApp status updates
- [x] WhatsApp low stock alerts
- [x] WhatsApp bulk order inquiries

---

## 🔑 User Roles
| Role | Access |
|------|--------|
| `customer` | Shop, cart, orders, profile |
| `warehouse` | Inventory, orders view |
| `admin` | Everything + analytics |

Create admin: update user role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
