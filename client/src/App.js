import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CookieBanner from './components/CookieBanner';
import ScrollToTop from './components/ScrollToTop';

/* ---- Global styles ---- */
import './styles/global.css';
import './styles/Navbar.css';
import './styles/Footer.css';
import './styles/Home.css';
import './styles/CatalogPage.css';
import './styles/ProductPage.css';
import './styles/CartPage.css';
import './styles/CheckoutPage.css';
import './styles/OrdersPage.css';
import './styles/ProfilePage.css';
import './styles/BulkOrderPage.css';
import './styles/AdminDashboard.css';
import './styles/AdminProducts.css';
import './styles/AdminOrders.css';
import './styles/AdminSuppliers.css';
import './styles/AdminInventory.css';
import './styles/ImageUploader.css';
import './styles/AIRecommendations.css';
import './styles/CookieBanner.css';

/* ---- Customer pages ---- */
const HomePage          = lazy(() => import('./pages/HomePage'));
const CatalogPage       = lazy(() => import('./pages/CatalogPage'));
const ProductPage       = lazy(() => import('./pages/ProductPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const BulkOrderPage     = lazy(() => import('./pages/BulkOrderPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'));
const LegalPage         = lazy(() => import('./pages/LegalPage'));
const AboutPage         = lazy(() => import('./pages/AboutPage'));
const ContactPage       = lazy(() => import('./pages/ContactPage'));

/* ---- Admin ---- */
const AdminLayout       = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductsAdminPage = lazy(() => import('./pages/admin/ProductsAdminPage'));
const OrdersAdminPage   = lazy(() => import('./pages/admin/OrdersAdminPage'));
const SuppliersPage     = lazy(() => import('./pages/admin/SuppliersPage'));
const InventoryPage     = lazy(() => import('./pages/admin/InventoryPage'));
const SettingsPage      = lazy(() => import('./pages/admin/SettingsPage'));  // ← this line

/* ---- Helpers ---- */
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" />
      <p style={{ color: '#888', fontSize: '14px' }}>Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppLayout({ children, noFooter = false }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#D4AF37', secondary: '#1A1A1A' } }
            }}
          />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* ---- Public ---- */}
              <Route path="/"                 element={<AppLayout><HomePage /></AppLayout>} />
              <Route path="/catalog"          element={<AppLayout><CatalogPage /></AppLayout>} />
              <Route path="/product/:id"      element={<AppLayout><ProductPage /></AppLayout>} />
              <Route path="/cart"             element={<AppLayout><CartPage /></AppLayout>} />
              <Route path="/bulk-orders"      element={<AppLayout><BulkOrderPage /></AppLayout>} />
              <Route path="/login"            element={<AppLayout noFooter><LoginPage /></AppLayout>} />
              <Route path="/register"         element={<AppLayout noFooter><RegisterPage /></AppLayout>} />
              <Route path="/forgot-password"  element={<AppLayout noFooter><ForgotPasswordPage /></AppLayout>} />
              <Route path="/legal/:type"       element={<AppLayout><LegalPage /></AppLayout>} />
              <Route path="/about"            element={<AppLayout><AboutPage /></AppLayout>} />
              <Route path="/contact"          element={<AppLayout><ContactPage /></AppLayout>} />

              {/* ---- Protected customer ---- */}
              <Route path="/checkout"   element={<ProtectedRoute><AppLayout><CheckoutPage /></AppLayout></ProtectedRoute>} />
              <Route path="/orders"     element={<ProtectedRoute><AppLayout><OrdersPage /></AppLayout></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><AppLayout><OrdersPage /></AppLayout></ProtectedRoute>} />
              <Route path="/profile"    element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

              {/* ---- Admin — nested, sidebar persists ---- */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route index            element={<AdminDashboard />} />
                <Route path="products"  element={<ProductsAdminPage />} />
                <Route path="orders"    element={<OrdersAdminPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="settings"  element={<SettingsPage />} />  {/* ← this line */}

              </Route>

              {/* ---- 404 ---- */}
              <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />

            </Routes>
            <CookieBanner />
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}