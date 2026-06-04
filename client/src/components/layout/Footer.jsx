import React from "react";
import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
} from "react-icons/fa";
import { useSettings } from "../../context/SettingsContext";

const QUICK_LINKS = [
  ["Home", "/"],
  ["Catalog", "/catalog"],
  ["Bulk Orders", "/bulk-orders"],
  ["About Us", "/about"],
  ["Contact", "/contact"],
];

const CATEGORIES = [
  "Kitchen Utensils",
  "Cookware",
  "Bakeware",
  "Storage Solutions",
  "Cleaning Tools",
  "Small Appliances",
];

const SOCIAL_CONFIG = [
  { key: "facebook",  Icon: FaFacebook,  className: "footer-social fb" },
  { key: "instagram", Icon: FaInstagram, className: "footer-social ig" },
  { key: "twitter",   Icon: FaTwitter,   className: "footer-social tw" },
  { key: "youtube",   Icon: FaYoutube,   className: "footer-social yt" },
  { key: "tiktok",    Icon: FaTiktok,    className: "footer-social tk" },
  { key: "linkedin",  Icon: FaLinkedin,  className: "footer-social li" },
];

export default function Footer() {
  const { settings = {} } = useSettings() || {};

  const {
    business = {},
    address  = {},
    hours    = {},
    social   = {},
  } = settings;

  const phone    = business?.phone    || "";
  const whatsapp = business?.whatsapp || "";
  const email    = business?.email    || "";
  const waText   = business?.whatsappText || "Hi! I need help.";
  const waNumber = whatsapp.replace(/[^0-9]/g, "");
  const waLink   = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
    : "#";

  const activeSocials = SOCIAL_CONFIG.filter(({ key }) => social?.[key]);

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-grid">

          {/* ---- Brand ---- */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-main">FABULOUS</div>
              <div className="footer-logo-sub">& MORE</div>
            </Link>
            <p className="footer-tagline">
              {business?.description ||
                "Premium kitchen utensils and hardware for the modern Nigerian home."}
            </p>

            {/* Social icons */}
            <div className="footer-socials">
              {waNumber && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social wa"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
              {activeSocials.map(({ key, Icon, className }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                  aria-label={key}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ---- Quick Links ---- */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {QUICK_LINKS.map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Categories ---- */}
          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links">
              {CATEGORIES.map((cat) => (
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

          {/* ---- Contact ---- */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <div className="footer-contact-list">
              {address?.street && (
                <div className="footer-contact-item">
                  <FiMapPin className="footer-contact-icon" />
                  <span>
                    {address.street}
                    {address.city    && `, ${address.city}`}
                    {address.state   && `, ${address.state}`}
                    {address.country && `, ${address.country}`}
                  </span>
                </div>
              )}

              {phone && (
                <div className="footer-contact-item">
                  <FiPhone className="footer-contact-icon" />
                  <a href={`tel:${phone}`} className="footer-contact-link">
                    {phone}
                  </a>
                </div>
              )}

              {email && (
                <div className="footer-contact-item">
                  <FiMail className="footer-contact-icon" />
                  <a href={`mailto:${email}`} className="footer-contact-link">
                    {email}
                  </a>
                </div>
              )}

              {whatsapp && (
                <div className="footer-contact-item">
                  <FaWhatsapp
                    className="footer-contact-icon"
                    style={{ color: "#25d366" }}
                  />
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-contact-link"
                  >
                    {whatsapp}
                  </a>
                </div>
              )}
            </div>

            {/* Hours */}
            {(hours?.weekdays || hours?.weekends) && (
              <div className="footer-hours">
                🕐 {hours.weekdays}
                {hours.weekends && (
                  <>
                    <br />
                    {hours.weekends}
                  </>
                )}
              </div>
            )}

            {/* WhatsApp CTA */}
            {waNumber && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="footer-wa-btn"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} {business?.name || "Fabulous & More"}.
            All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/legal/privacy" className="footer-legal-link">
              Privacy Policy
            </Link>
            <Link to="/legal/terms" className="footer-legal-link">
              Terms of Service
            </Link>
          </div>
          <div className="footer-payments">
            <span className="footer-payments-label">Secure payments:</span>
            {["💳 Card", "🏦 Bank", "💵 COD"].map((p) => (
              <span key={p} className="footer-payment-badge">
                {p}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
