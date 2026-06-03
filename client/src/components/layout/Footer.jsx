import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const QUICK_LINKS = [
  ['Home',        '/'],
  ['Catalog',     '/catalog'],
  ['Bulk Orders', '/bulk-orders'],
  ['About Us',    '/about'],
  ['Contact',     '/contact'],
];

const CATEGORIES = [
  'Kitchen Utensils', 'Cookware', 'Bakeware',
  'Storage Solutions', 'Cleaning Tools', 'Small Appliances',
];

const LEGAL_LINKS = [
  ['Privacy Policy',  '/legal/privacy'],
  ['Terms of Service', '/legal/terms'],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Grid */}
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-main">FABULOUS</div>
              <div className="footer-logo-sub">& MORE</div>
            </Link>
            <p className="footer-tagline">
              Premium kitchen utensils and hardware for the modern Nigerian home.
              Quality you can trust, prices you'll love.
            </p>
            <div className="footer-socials">
              <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="footer-social wa" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
              <a href="#" className="footer-social fb" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="footer-social ig" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="footer-social tw" aria-label="Twitter">
                <FaTwitter />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {QUICK_LINKS.map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    to={`/catalog?category=${encodeURIComponent(cat)}`}
                    className="footer-link"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <FiMapPin className="footer-contact-icon" />
                <span>123 Market Street, Lagos, Nigeria</span>
              </div>
              <div className="footer-contact-item">
                <FiPhone className="footer-contact-icon" />
                <a href="tel:+2348000000000" className="footer-contact-link">+234 800 000 0000</a>
              </div>
              <div className="footer-contact-item">
                <FiMail className="footer-contact-icon" />
                <a href="mailto:hello@fabulousandmore.com" className="footer-contact-link">hello@fabulousandmore.com</a>
              </div>
              <div className="footer-contact-item">
                <FaWhatsapp className="footer-contact-icon" style={{ color: '#25d366' }} />
                <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="footer-contact-link">
                  +234 800 000 0000
                </a>
              </div>
            </div>
            <div className="footer-hours">
              🕐 Mon–Sat: 8am – 6pm WAT
            </div>
            <a
              href="https://wa.me/2348000000000?text=Hello%2C%20I%20need%20help"
              target="_blank"
              rel="noreferrer"
              className="footer-wa-btn"
            >
              <FaWhatsapp /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Fabulous & More. All rights reserved.</p>
          <div className="footer-legal-links">
            {LEGAL_LINKS.map(([label, path]) => (
              <Link key={path} to={path} className="footer-legal-link">{label}</Link>
            ))}
          </div>
          <div className="footer-payments">
            <span className="footer-payments-label">Secure payments:</span>
            {['💳 Card', '🏦 Bank', '💵 COD'].map(p => (
              <span key={p} className="footer-payment-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}