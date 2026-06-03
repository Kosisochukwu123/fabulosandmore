import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  FiPackage, FiShoppingCart, FiUsers, FiTrendingUp,
  FiBox, FiExternalLink, FiMenu, FiX, FiLogOut,
  FiBarChart2, FiTruck
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';

const NAV_LINKS = [
  { label: 'Overview',  icon: FiTrendingUp,  path: '/admin'           },
  { label: 'Inventory', icon: FiBox,         path: '/admin/inventory' },
  { label: 'Orders',    icon: FiShoppingCart,path: '/admin/orders'    },
  { label: 'Products',  icon: FiPackage,     path: '/admin/products'  },
  { label: 'Suppliers', icon: FiTruck,       path: '/admin/suppliers' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar whenever route changes
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="adm-shell">

      {/* Dark overlay — mobile only */}
      {sidebarOpen && (
        <div
          className="adm-sidebar-overlay open"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Brand */}
        <div className="adm-sidebar-brand">
          <div className="adm-sidebar-brand-name">FABULOUS</div>
          <div className="adm-sidebar-brand-sub">& MORE — Admin</div>
        </div>

        {/* Nav links */}
        <nav className="adm-sidebar-nav">
          <div className="adm-sidebar-section">Main Menu</div>

          {NAV_LINKS.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              className={`adm-sidebar-link ${isActive(path) ? 'active' : ''}`}
            >
              <Icon className="adm-sidebar-link-icon" />
              {label}
            </Link>
          ))}

          <div className="adm-sidebar-section" style={{ marginTop: '8px' }}>
            Store
          </div>

          <Link to="/" className="adm-sidebar-link">
            <FiExternalLink className="adm-sidebar-link-icon" />
            View Store
          </Link>

          <button
            className="adm-sidebar-link"
            onClick={logout}
            style={{ color: '#ef4444' }}
          >
            <FiLogOut
              className="adm-sidebar-link-icon"
              style={{ color: '#ef4444' }}
            />
            Logout
          </button>
        </nav>

        {/* User info at bottom */}
        <div className="adm-sidebar-user">
          <div className="adm-sidebar-user-avatar">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="adm-sidebar-user-name">{user?.name}</div>
            <div className="adm-sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </aside>

      {/* ============ MAIN AREA ============ */}
      <main className="adm-main">

        {/* Sticky top bar */}
        <div className="adm-topbar">
          <div className="adm-topbar-left">
            {/* Hamburger — visible on mobile only via CSS */}
            <button
              className="adm-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Current page label */}
            <h1 className="adm-topbar-title">
              {NAV_LINKS.find(n => isActive(n.path))?.label || 'Admin'}
            </h1>
          </div>

          <div className="adm-topbar-actions">
            <Link to="/admin/products" className="adm-topbar-btn">
              <FiPackage /> <span>Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="adm-topbar-btn"
              style={{ background: '#1a1a1a', color: '#d4af37', boxShadow: 'none' }}
            >
              <FiShoppingCart /> <span>Orders</span>
            </Link>
          </div>
        </div>

        {/* ---- Page content rendered here via <Outlet> ---- */}
        <Outlet />
      </main>
    </div>
  );
}