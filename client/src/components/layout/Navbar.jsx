import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart, FiSearch, FiMenu, FiX,
  FiUser, FiPackage, FiLogOut, FiSettings, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/Navbar.css';

const NAV_LINKS = [
  { label: 'Kitchen Utensils', path: '/catalog?category=Kitchen%20Utensils' },
  { label: 'Cookware',         path: '/catalog?category=Cookware'           },
  { label: 'Bakeware',         path: '/catalog?category=Bakeware'           },
  { label: 'Storage',          path: '/catalog?category=Storage%20Solutions' },
  { label: 'Cleaning',         path: '/catalog?category=Cleaning%20Tools'   },
  { label: 'Appliances',       path: '/catalog?category=Small%20Appliances' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropOpen,    setDropOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  const dropRef   = useRef(null);
  const searchRef = useRef(null);

  /* Close menu on route change */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Auto-focus search input */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`nav-root ${scrolled ? 'nav-scrolled' : ''}`}>

      {/* ---- Announcement bar ---- */}
      <div className="nav-topbar">
        Free delivery on orders over ₦50,000 &nbsp;·&nbsp; WhatsApp: +234 800 000 0000
      </div>

      {/* ---- Main row ---- */}
      <div className="nav-inner">

        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="Fabulous & More home">
          <span className="nav-logo-main">FABULOUS</span>
          <span className="nav-logo-sub">& MORE</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links" role="list">
          {NAV_LINKS.map(({ label, path }) => (
            <li key={label}>
              <Link
                to={path}
                className={`nav-link ${location.search.includes(encodeURIComponent(label)) ? 'active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/catalog" className="nav-link nav-link-gold">
              All Products
            </Link>
          </li>
        </ul>

        {/* Right actions */}
        <div className="nav-actions">

          {/* Search */}
          <button
            className={`nav-icon-btn ${searchOpen ? 'active' : ''}`}
            onClick={() => setSearchOpen(s => !s)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            {searchOpen ? <FiX /> : <FiSearch />}
          </button>

          {/* Cart */}
          <Link to="/cart" className="nav-cart-btn" aria-label={`Cart (${cartCount} items)`}>
            <FiShoppingCart />
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>

          {/* User area */}
          {user ? (
            <div className="nav-user-wrap" ref={dropRef}>
              <button
                className="nav-avatar"
                onClick={() => setDropOpen(o => !o)}
                aria-label="Account menu"
                aria-expanded={dropOpen}
              >
                {user.name?.[0]?.toUpperCase()}
                <FiChevronDown className={`nav-avatar-chevron ${dropOpen ? 'open' : ''}`} />
              </button>

              {dropOpen && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-name">{user.name}</div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>
                  <div className="nav-dropdown-body">
                    <Link to="/profile" className="nav-dd-item" role="menuitem"
                      onClick={() => setDropOpen(false)}>
                      <FiUser size={14} /> My Profile
                    </Link>
                    <Link to="/orders" className="nav-dd-item" role="menuitem"
                      onClick={() => setDropOpen(false)}>
                      <FiPackage size={14} /> My Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="nav-dd-item" role="menuitem"
                        onClick={() => setDropOpen(false)}>
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="nav-dropdown-footer">
                    <button
                      className="nav-dd-item nav-dd-logout"
                      role="menuitem"
                      onClick={() => { logout(); setDropOpen(false); }}
                    >
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">
              Sign In
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* ---- Search panel ---- */}
      {searchOpen && (
        <div className="nav-search-panel">
          <form className="nav-search-form" onSubmit={handleSearch}>
            <div className="nav-search-input-wrap">
              <FiSearch className="nav-search-icon" />
              <input
                ref={searchRef}
                className="nav-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for pots, knives, bakeware..."
              />
              {searchQuery && (
                <button type="button" className="nav-search-clear"
                  onClick={() => setSearchQuery('')}>
                  <FiX />
                </button>
              )}
            </div>
            <button type="submit" className="nav-search-btn">Search</button>
          </form>
          <div className="nav-search-hints">
            {['Non-stick pan', 'Knife set', 'Glass containers', 'Electric kettle'].map(hint => (
              <button
                key={hint}
                type="button"
                className="nav-search-hint"
                onClick={() => { setSearchQuery(hint); searchRef.current?.focus(); }}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Mobile menu ---- */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="nav-mobile-links">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="nav-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link to="/catalog" className="nav-mobile-link nav-mobile-link-gold"
            onClick={() => setMenuOpen(false)}>
            View All Products →
          </Link>
          <Link to="/bulk-orders" className="nav-mobile-link"
            onClick={() => setMenuOpen(false)}>
            Bulk Orders
          </Link>
        </div>
        {/* Mobile user section */}
        <div className="nav-mobile-user">
          {user ? (
            <>
              <div className="nav-mobile-user-info">
                <div className="nav-mobile-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="nav-mobile-name">{user.name}</div>
                  <div className="nav-mobile-email">{user.email}</div>
                </div>
              </div>
              <div className="nav-mobile-user-links">
                <Link to="/profile" className="nav-mobile-user-link" onClick={() => setMenuOpen(false)}>
                  <FiUser size={14} /> Profile
                </Link>
                <Link to="/orders" className="nav-mobile-user-link" onClick={() => setMenuOpen(false)}>
                  <FiPackage size={14} /> Orders
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-mobile-user-link" onClick={() => setMenuOpen(false)}>
                    <FiSettings size={14} /> Admin
                  </Link>
                )}
                <button className="nav-mobile-user-link nav-mobile-logout"
                  onClick={() => { logout(); setMenuOpen(false); }}>
                  <FiLogOut size={14} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="nav-mobile-auth-btns">
              <Link to="/login" className="nav-mobile-login" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="nav-mobile-register" onClick={() => setMenuOpen(false)}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ---- Mobile overlay ---- */}
      {menuOpen && (
        <div className="nav-mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  );
}