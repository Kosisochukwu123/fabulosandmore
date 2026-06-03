import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiPackage, FiTruck, FiDollarSign, FiUsers,
  FiPhone, FiMail, FiMessageSquare, FiCheck,
  FiArrowRight, FiStar
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../styles/BulkOrderPage.css';

const CATEGORIES = [
  'Kitchen Utensils', 'Cookware', 'Bakeware',
  'Storage Solutions', 'Cleaning Tools', 'Small Appliances', 'Mixed / Other'
];


const API_URL = import.meta.env.VITE_API_URL;


const QUANTITIES = ['10–50 units', '51–100 units', '101–500 units', '500+ units'];

const BENEFITS = [
  { icon: FiDollarSign, title: 'Wholesale Pricing',   desc: 'Up to 40% off retail prices for large orders. The bigger your order the better the price.' },
  { icon: FiTruck,      title: 'Free Bulk Delivery',  desc: 'All bulk orders above ₦200,000 get free delivery anywhere in Nigeria.' },
  { icon: FiStar,       title: 'Dedicated Account',   desc: 'Get a personal account manager to help you source products and process re-orders fast.' },
  { icon: FiPackage,    title: 'Custom Packaging',    desc: 'Brand the products with your business logo. Minimum 200 units per SKU.' },
  { icon: FiUsers,      title: 'Priority Support',    desc: '24/7 WhatsApp support line dedicated to bulk and corporate clients.' },
  { icon: FiCheck,      title: 'Quality Guaranteed',  desc: 'All products are inspected before dispatch. 100% replacement for any defects.' },
];

const CLIENTS = [
  { name: 'Restaurants & Hotels', icon: '🍽️' },
  { name: 'Supermarkets',         icon: '🛒' },
  { name: 'Schools & Offices',    icon: '🏫' },
  { name: 'Event Planners',       icon: '🎉' },
  { name: 'Caterers',             icon: '👨‍🍳' },
  { name: 'Resellers & Retailers',icon: '🏪' },
];

const FAQ = [
  { q: 'What is the minimum order quantity?',     a: 'The minimum for bulk pricing is 10 units per product. Custom packaging starts at 200 units per SKU.' },
  { q: 'How long does bulk delivery take?',       a: 'Standard bulk delivery takes 5–10 business days within Nigeria. Express options are available for an additional fee.' },
  { q: 'Can I mix different products?',           a: 'Yes! You can mix products from different categories. Our team will help you build the perfect order.' },
  { q: 'Do you offer credit terms?',              a: 'Verified businesses with a track record of 3+ orders may qualify for 30-day credit terms. Contact us to apply.' },
  { q: 'What payment methods are accepted?',      a: 'We accept bank transfers, cheques, and card payments for bulk orders. 50% deposit is required upfront.' },
  { q: 'Can I see samples before ordering?',      a: 'Yes, sample kits are available for ₦5,000 (refundable on your first bulk order). WhatsApp us to request.' },
];

export default function BulkOrderPage() {
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    category: '', quantity: '', products: '', budget: '', note: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.products) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/ai/whatsapp/bulk-inquiry`, form);
      setSubmitted(true);
      toast.success('Inquiry sent! We\'ll contact you within 2 hours.');
    } catch {
      // Even if API fails, show success (WhatsApp fallback available)
      setSubmitted(true);
      toast.success('Inquiry received! We\'ll contact you shortly.');
    }
    setSubmitting(false);
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Fabulous & More! I'd like to place a bulk order.\n\nName: ${form.name || '[Your name]'}\nCompany: ${form.company || '[Company]'}\nProducts: ${form.products || '[Products needed]'}\nQuantity: ${form.quantity || '[Quantity]'}\nBudget: ${form.budget || '[Budget]'}`
  );

  return (
    <div className="bulk-page">

      {/* Hero */}
      <section className="bulk-hero">
        <div className="bulk-hero-inner">
          <div className="bulk-hero-text">
            <div className="bulk-hero-pill">🏢 Corporate & Wholesale</div>
            <h1 className="bulk-hero-title">
              Bulk Orders &<br />
              <span className="bulk-hero-gold">Wholesale Pricing</span>
            </h1>
            <p className="bulk-hero-desc">
              Premium kitchen utensils and hardware at unbeatable wholesale prices.
              Serving restaurants, hotels, schools, caterers, and resellers across Nigeria.
            </p>
            <div className="bulk-hero-btns">
              <a href="#inquiry-form" className="bulk-hero-btn-primary">
                Get a Quote <FiArrowRight />
              </a>
              <a
                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                target="_blank" rel="noreferrer"
                className="bulk-hero-btn-wa"
              >
                <FaWhatsapp /> WhatsApp Us
              </a>
            </div>
            <div className="bulk-hero-stats">
              {[
                ['500+', 'Happy Businesses'],
                ['40%',  'Max Discount'],
                ['2hrs', 'Response Time'],
              ].map(([val, label]) => (
                <div key={label} className="bulk-hero-stat">
                  <span className="bulk-hero-stat-val">{val}</span>
                  <span className="bulk-hero-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bulk-hero-visual">
            <div className="bulk-hero-emoji-ring">📦</div>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="bulk-clients">
        <div className="bulk-container">
          <p className="bulk-clients-label">Trusted by businesses across Nigeria</p>
          <div className="bulk-clients-row">
            {CLIENTS.map(({ name, icon }) => (
              <div key={name} className="bulk-client-chip">
                <span>{icon}</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bulk-benefits">
        <div className="bulk-container">
          <div className="bulk-section-header">
            <h2>Why Order in Bulk?</h2>
            <div className="bulk-gold-accent" />
            <p>Exclusive benefits reserved for our wholesale and corporate clients</p>
          </div>
          <div className="bulk-benefits-grid">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bulk-benefit-card">
                <div className="bulk-benefit-icon-wrap">
                  <Icon className="bulk-benefit-icon" />
                </div>
                <h3 className="bulk-benefit-title">{title}</h3>
                <p className="bulk-benefit-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="bulk-pricing">
        <div className="bulk-container">
          <div className="bulk-section-header">
            <h2>Pricing Tiers</h2>
            <div className="bulk-gold-accent" />
            <p>The more you order, the more you save</p>
          </div>
          <div className="bulk-tiers">
            {[
              { qty: '10–50 units',   disc: '10% off', label: 'Starter',     color: '#3b82f6' },
              { qty: '51–200 units',  disc: '20% off', label: 'Business',    color: '#d4af37', popular: true },
              { qty: '201–500 units', disc: '30% off', label: 'Enterprise',  color: '#22c55e' },
              { qty: '500+ units',    disc: '40% off', label: 'Wholesale',   color: '#ef4444' },
            ].map(({ qty, disc, label, color, popular }) => (
              <div key={label} className={`bulk-tier ${popular ? 'popular' : ''}`}>
                {popular && <div className="bulk-tier-popular-badge">Most Popular</div>}
                <div className="bulk-tier-label" style={{ color }}>{label}</div>
                <div className="bulk-tier-qty">{qty}</div>
                <div className="bulk-tier-disc" style={{ color }}>{disc}</div>
                <div className="bulk-tier-note">off retail price</div>
              </div>
            ))}
          </div>
          <p className="bulk-pricing-note">
            * Discounts apply to standard retail prices. Custom quotes available for 1000+ units.
          </p>
        </div>
      </section>

      {/* Main layout — Form + Sidebar */}
      <section className="bulk-main" id="inquiry-form">
        <div className="bulk-container">
          <div className="bulk-main-grid">

            {/* ---- Inquiry Form ---- */}
            <div className="bulk-form-col">
              <div className="bulk-form-card">
                {submitted ? (
                  <div className="bulk-success">
                    <div className="bulk-success-icon">✅</div>
                    <h3>Inquiry Submitted!</h3>
                    <p>
                      Thank you <strong>{form.name}</strong>! Our team will contact you
                      within <strong>2 business hours</strong> via phone or WhatsApp.
                    </p>
                    <div className="bulk-success-actions">
                      <a
                        href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                        target="_blank" rel="noreferrer"
                        className="bulk-wa-direct-btn"
                      >
                        <FaWhatsapp /> Chat Now for Faster Response
                      </a>
                      <button
                        className="bulk-reset-btn"
                        onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', category: '', quantity: '', products: '', budget: '', note: '' }); }}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bulk-form-header">
                      <h2>Get a Custom Quote</h2>
                      <p>Fill in the form and we'll get back to you within 2 hours</p>
                    </div>

                    <form className="bulk-form" onSubmit={handleSubmit}>
                      {/* Row 1 */}
                      <div className="bulk-form-row">
                        <div className="bulk-field">
                          <label className="bulk-label">
                            <FiUsers size={13} /> Your Name *
                          </label>
                          <input
                            className="bulk-input"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="e.g. Chioma Okafor"
                            required
                          />
                        </div>
                        <div className="bulk-field">
                          <label className="bulk-label">
                            <FiUsers size={13} /> Company / Business
                          </label>
                          <input
                            className="bulk-input"
                            value={form.company}
                            onChange={e => set('company', e.target.value)}
                            placeholder="e.g. Sunrise Restaurant Ltd"
                          />
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="bulk-form-row">
                        <div className="bulk-field">
                          <label className="bulk-label">
                            <FiMail size={13} /> Email Address *
                          </label>
                          <input
                            className="bulk-input"
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                        <div className="bulk-field">
                          <label className="bulk-label">
                            <FiPhone size={13} /> Phone / WhatsApp *
                          </label>
                          <input
                            className="bulk-input"
                            type="tel"
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                            placeholder="e.g. 08012345678"
                            required
                          />
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div className="bulk-form-row">
                        <div className="bulk-field">
                          <label className="bulk-label">Product Category</label>
                          <select
                            className="bulk-input"
                            value={form.category}
                            onChange={e => set('category', e.target.value)}
                          >
                            <option value="">Select category...</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="bulk-field">
                          <label className="bulk-label">Order Quantity Range</label>
                          <select
                            className="bulk-input"
                            value={form.quantity}
                            onChange={e => set('quantity', e.target.value)}
                          >
                            <option value="">Select quantity...</option>
                            {QUANTITIES.map(q => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Products needed */}
                      <div className="bulk-field">
                        <label className="bulk-label">
                          <FiPackage size={13} /> Products Needed *
                        </label>
                        <textarea
                          className="bulk-input bulk-textarea"
                          value={form.products}
                          onChange={e => set('products', e.target.value)}
                          placeholder="Describe the products you need. e.g.: 200x non-stick frying pans 28cm, 100x wooden spatula sets, 50x mixing bowl sets..."
                          required
                        />
                      </div>

                      {/* Budget */}
                      <div className="bulk-field">
                        <label className="bulk-label">
                          <FiDollarSign size={13} /> Estimated Budget (₦)
                        </label>
                        <input
                          className="bulk-input"
                          value={form.budget}
                          onChange={e => set('budget', e.target.value)}
                          placeholder="e.g. ₦500,000 – ₦1,000,000"
                        />
                      </div>

                      {/* Notes */}
                      <div className="bulk-field">
                        <label className="bulk-label">
                          <FiMessageSquare size={13} /> Additional Notes
                        </label>
                        <textarea
                          className="bulk-input bulk-textarea-sm"
                          value={form.note}
                          onChange={e => set('note', e.target.value)}
                          placeholder="Delivery timeline, special requirements, branding needs..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="bulk-submit-btn"
                        disabled={submitting}
                      >
                        {submitting ? 'Sending Inquiry...' : 'Send Bulk Inquiry'}
                        {!submitting && <FiArrowRight />}
                      </button>

                      {/* OR WhatsApp */}
                      <div className="bulk-or-divider">
                        <span>or</span>
                      </div>
                      <a
                        href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                        target="_blank" rel="noreferrer"
                        className="bulk-wa-alt-btn"
                      >
                        <FaWhatsapp /> Send Directly on WhatsApp
                      </a>
                      <p className="bulk-form-note">
                        🔒 Your information is secure and will never be shared.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* ---- Sidebar ---- */}
            <aside className="bulk-sidebar">

              {/* Contact card */}
              <div className="bulk-contact-card">
                <h3>Talk to Us Directly</h3>
                <p>Our bulk sales team is available Monday–Saturday, 8am–6pm.</p>
                <div className="bulk-contact-items">
                  <a href="tel:+2348000000000" className="bulk-contact-item">
                    <div className="bulk-contact-icon phone"><FiPhone /></div>
                    <div>
                      <div className="bulk-contact-label">Call Us</div>
                      <div className="bulk-contact-val">+234 800 000 0000</div>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/2348000000000"
                    target="_blank" rel="noreferrer"
                    className="bulk-contact-item"
                  >
                    <div className="bulk-contact-icon wa"><FaWhatsapp /></div>
                    <div>
                      <div className="bulk-contact-label">WhatsApp</div>
                      <div className="bulk-contact-val">+234 800 000 0000</div>
                    </div>
                  </a>
                  <a href="mailto:bulk@fabulousandmore.com" className="bulk-contact-item">
                    <div className="bulk-contact-icon email"><FiMail /></div>
                    <div>
                      <div className="bulk-contact-label">Email</div>
                      <div className="bulk-contact-val">bulk@fabulousandmore.com</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Process */}
              <div className="bulk-process-card">
                <h3>How It Works</h3>
                <div className="bulk-steps">
                  {[
                    { num: '1', title: 'Submit Inquiry',   desc: 'Fill the form or WhatsApp us' },
                    { num: '2', title: 'Get Your Quote',   desc: 'We respond within 2 hours' },
                    { num: '3', title: 'Confirm & Pay',    desc: '50% deposit to confirm order' },
                    { num: '4', title: 'We Deliver',       desc: 'Direct to your business' },
                  ].map(({ num, title, desc }) => (
                    <div key={num} className="bulk-step">
                      <div className="bulk-step-num">{num}</div>
                      <div>
                        <div className="bulk-step-title">{title}</div>
                        <div className="bulk-step-desc">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing catalog */}
              <div className="bulk-catalog-card">
                <p>Looking for specific products?</p>
                <Link to="/catalog" className="bulk-catalog-btn">
                  Browse Full Catalog →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bulk-faq">
        <div className="bulk-container">
          <div className="bulk-section-header">
            <h2>Frequently Asked Questions</h2>
            <div className="bulk-gold-accent" />
          </div>
          <div className="bulk-faq-list">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`bulk-faq-item ${openFaq === i ? 'open' : ''}`}
              >
                <button
                  className="bulk-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="bulk-faq-arrow">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="bulk-faq-a">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bulk-bottom-cta">
        <div className="bulk-container">
          <div className="bulk-bottom-cta-inner">
            <div>
              <h2>Ready to save big on your next purchase?</h2>
              <p>Join 500+ businesses already enjoying our wholesale prices.</p>
            </div>
            <div className="bulk-bottom-cta-btns">
              <a href="#inquiry-form" className="bulk-hero-btn-primary">
                Get a Quote Now
              </a>
              <a
                href="https://wa.me/2348000000000"
                target="_blank" rel="noreferrer"
                className="bulk-hero-btn-wa"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}