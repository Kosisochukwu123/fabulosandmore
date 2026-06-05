import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok, FaLinkedin } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';
import '../styles/ContactPage.css';

const SOCIAL_META = {
  facebook:  { Icon: FaFacebook,  color: '#1877f2' },
  instagram: { Icon: FaInstagram, color: '#e1306c' },
  twitter:   { Icon: FaTwitter,   color: '#1da1f2' },
  youtube:   { Icon: FaYoutube,   color: '#ff0000' },
  tiktok:    { Icon: FaTiktok,    color: '#000000' },
  linkedin:  { Icon: FaLinkedin,  color: '#0a66c2' },
};

export default function ContactPage() {
  const { settings }  = useSettings();
  const { business = {}, address = {}, hours = {}, social = {} } = settings;

  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v)          => setForm(f => ({ ...f, [k]: v }));

  const waNumber = (business?.whatsapp || '').replace(/[^0-9]/g, '');
  const waText   = business?.whatsappText || 'Hi! I need help.';
  const waLink   = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success("Message sent! We'll reply within 2 hours.");
  };

  const contactItems = [
    business?.phone    && { Icon: FiPhone,   label: 'Phone',    value: business.phone,    href: `tel:${business.phone}` },
    waNumber           && { Icon: FaWhatsapp, label: 'WhatsApp', value: business?.whatsapp, href: waLink, color: '#25d366' },
    business?.email    && { Icon: FiMail,    label: 'Email',    value: business.email,    href: `mailto:${business.email}` },
    address?.street    && { Icon: FiMapPin,  label: 'Address',  value: [address.street, address.city, address.state, address.country].filter(Boolean).join(', '), href: address?.mapLink || null },
    hours?.weekdays    && { Icon: FiClock,   label: 'Hours',    value: hours.weekdays,    href: null },
    hours?.weekends    && { Icon: FiClock,   label: '',         value: hours.weekends,    href: null },
  ].filter(Boolean);

  const activeSocials = Object.entries(SOCIAL_META).filter(([k]) => social?.[k]);

  return (
    <div className="contact-page">

      {/* Hero header */}
      <section className="contact-hero">
        <h1 className="contact-hero-title">Get in Touch</h1>
        <p className="contact-hero-sub">
          We're here to help. Reach out via any channel and we'll respond within 2 hours during business hours.
        </p>
      </section>

      <section className="contact-body">
        <div className="contact-container">
          <div className="contact-layout">

            {/* Left — contact info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Contact Information</h2>
              <div className="contact-info-accent" />

              <div className="contact-info-items">
                {contactItems.map(({ Icon, label, value, href, color }, i) => (
                  <div key={i} className="contact-info-item">
                    <div className="contact-info-icon-wrap">
                      <Icon style={{ color: color || '#d4af37', fontSize: '18px' }} />
                    </div>
                    <div className="contact-info-text">
                      {label && <div className="contact-info-label">{label}</div>}
                      {href ? (
                        <a href={href}
                          target={href.startsWith('http') ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="contact-info-value link">
                          {value}
                        </a>
                      ) : (
                        <span className="contact-info-value">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socials */}
              {activeSocials.length > 0 && (
                <div className="contact-socials">
                  <div className="contact-socials-label">Follow Us</div>
                  <div className="contact-socials-row">
                    {activeSocials.map(([key, { Icon, color }]) => (
                      <a key={key} href={social[key]}
                        target="_blank" rel="noreferrer"
                        className="contact-social-btn"
                        style={{ '--social-color': color }}
                        aria-label={key}>
                        <Icon />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp CTA */}
              {waNumber && (
                <a href={waLink} target="_blank" rel="noreferrer" className="contact-wa-cta">
                  <FaWhatsapp size={22} />
                  <div>
                    <div className="contact-wa-cta-title">Chat on WhatsApp</div>
                    <div className="contact-wa-cta-sub">Usually under 10 mins response</div>
                  </div>
                </a>
              )}
            </div>

            {/* Right — form */}
            <div className="contact-form-card">
              {sent ? (
                <div className="contact-success">
                  <div className="contact-success-icon"><FiCheck /></div>
                  <h3 className="contact-success-title">Message Sent!</h3>
                  <p className="contact-success-text">
                    Thank you, <strong>{form.name}</strong>! We'll reply to{' '}
                    <strong>{form.email}</strong> within 2 hours.
                  </p>
                  <button
                    className="contact-success-reset"
                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="contact-form-title">Send a Message</h2>
                  <p className="contact-form-sub">We reply within 2 business hours</p>

                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label className="contact-label">Full Name *</label>
                        <input className="contact-input" type="text"
                          value={form.name} onChange={e => set('name', e.target.value)}
                          placeholder="Your name" required />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Email *</label>
                        <input className="contact-input" type="email"
                          value={form.email} onChange={e => set('email', e.target.value)}
                          placeholder="your@email.com" required />
                      </div>
                    </div>

                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label className="contact-label">Phone</label>
                        <input className="contact-input" type="tel"
                          value={form.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="e.g. 08012345678" />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Subject *</label>
                        <input className="contact-input" type="text"
                          value={form.subject} onChange={e => set('subject', e.target.value)}
                          placeholder="What is this about?" required />
                      </div>
                    </div>

                    <div className="contact-field">
                      <label className="contact-label">Message *</label>
                      <textarea className="contact-input contact-textarea"
                        value={form.message} onChange={e => set('message', e.target.value)}
                        placeholder="Tell us how we can help..." required rows={5} />
                    </div>

                    <button type="submit" className="contact-submit-btn" disabled={loading}>
                      <FiSend /> {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
