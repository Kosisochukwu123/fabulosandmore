import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiTruck, FiStar, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useSettings } from '../context/SettingsContext';
import '../styles/AboutPage.css';

const VALUES = [
  { icon: FiShield,  title: 'Genuine Products',  desc: 'Every item we sell is 100% authentic. We source directly from verified manufacturers and trusted suppliers.' },
  { icon: FiStar,    title: 'Premium Quality',    desc: 'We curate only the best kitchen utensils and hardware built to last — not cheaply made items that break.' },
  { icon: FiTruck,   title: 'Fast Delivery',      desc: 'Free delivery on orders over ₦50,000 with standard 3–5 day delivery across Nigeria.' },
  { icon: FiUsers,   title: 'Customer First',     desc: 'Our customers are the heart of our business. We offer 30-day returns and 24/7 WhatsApp support.' },
];

const STATS = [
  { value: '5,000+',  label: 'Products'       },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '99%',     label: 'Satisfaction'    },
  { value: '3+ yrs',  label: 'In Business'     },
];

export default function AboutPage() {
  const { settings } = useSettings();
  const { business = {}, address = {} } = settings;

  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-hero-tag">Our Story</span>
          <h1 className="about-hero-title">
            Equipping Nigerian Kitchens<br />with Premium Tools
          </h1>
          <p className="about-hero-sub">
            {business?.description ||
              'Fabulous & More was born from a simple belief — every Nigerian home deserves premium kitchen tools that make cooking easier, faster and more enjoyable.'}
          </p>
          <div className="about-hero-btns">
            <Link to="/catalog" className="about-btn-primary">
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/contact" className="about-btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats-grid">
            {STATS.map(({ value, label }) => (
              <div key={label} className="about-stat">
                <div className="about-stat-value">{value}</div>
                <div className="about-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="about-container">
          <div className="about-mission-layout">
            <div className="about-mission-text">
              <span className="about-section-tag">Our Mission</span>
              <h2 className="about-section-title">Making Great Cooking Accessible</h2>
              <div className="about-section-accent" />
              <p className="about-mission-para">
                At {business?.name || 'Fabulous & More'}, we believe the right kitchen tools transform cooking
                from a chore into a joy. We started because we were tired of overpriced imports
                and poor quality local alternatives.
              </p>
              <p className="about-mission-para">
                Today we serve thousands of homes, restaurants, hotels and businesses across
                Nigeria — from Lagos to Abuja, Port Harcourt to Kano. Every product we stock
                has been personally reviewed for quality, durability and value.
              </p>
              {address?.street && (
                <div className="about-address">
                  📍 {[address.street, address.city, address.state].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
            <div className="about-mission-img-wrap">
              <img
                src="/images/hero-kitchen.jpg"
                alt="Premium kitchen setup"
                className="about-mission-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-tag">Why Choose Us</span>
            <h2 className="about-section-title">Our Core Values</h2>
            <div className="about-section-accent" />
          </div>
          <div className="about-values-grid">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="about-value-card">
                <div className="about-value-icon">
                  <Icon size={24} />
                </div>
                <h3 className="about-value-title">{title}</h3>
                <p className="about-value-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta" style={{ backgroundImage: "url(/images/hero-kitchen.jpg)" }}>
        <div className="about-cta-overlay" />
        <div className="about-cta-content">
          <h2 className="about-cta-title">Ready to Upgrade Your Kitchen?</h2>
          <p className="about-cta-sub">
            Browse thousands of premium kitchen products with free delivery on orders over ₦50,000.
          </p>
          <div className="about-cta-btns">
            <Link to="/catalog" className="about-btn-primary">
              Shop All Products <FiArrowRight />
            </Link>
            <Link to="/bulk-orders" className="about-btn-secondary">
              Bulk Orders
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
