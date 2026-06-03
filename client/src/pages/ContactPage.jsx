import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CONTACT_INFO = [
  { icon: FiPhone,  label: 'Phone',    value: '+234 800 000 0000',             href: 'tel:+2348000000000' },
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+234 800 000 0000',           href: 'https://wa.me/2348000000000' },
  { icon: FiMail,   label: 'Email',    value: 'hello@fabulousandmore.com',     href: 'mailto:hello@fabulousandmore.com' },
  { icon: FiMapPin, label: 'Address',  value: '123 Market Street, Lagos, Nigeria', href: null },
  { icon: FiClock,  label: 'Hours',    value: 'Mon–Sat: 8am – 6pm WAT',       href: null },
];

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v)        => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success('Message sent! We\'ll reply within 2 hours.');
  };

  return (
    <div style={{ minHeight: '80vh' }}>

      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', padding: '64px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#d4af37', fontSize: 'clamp(28px, 4vw, 48px)', marginBottom: '12px' }}>
          Get in Touch
        </h1>
        <p style={{ color: '#aaa', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' }}>
          We're here to help. Reach out via any channel and we'll respond within 2 hours during business hours.
        </p>
      </section>

      <section style={{ padding: '72px 24px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '48px', alignItems: 'flex-start' }}>

          {/* Left — Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#1a1a1a', marginBottom: '8px' }}>Contact Information</h2>
              <div style={{ width: '48px', height: '3px', background: '#d4af37', borderRadius: '2px', marginBottom: '24px' }} />
            </div>

            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: '#fbf5e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ color: '#d4af37', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer"
                      style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500, textDecoration: 'none', transition: 'color 0.18s' }}
                      onMouseEnter={e => e.target.style.color = '#d4af37'}
                      onMouseLeave={e => e.target.style.color = '#1a1a1a'}>
                      {value}
                    </a>
                  ) : (
                    <span style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>{value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Social */}
            <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '20px', marginTop: '4px' }}>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 600, marginBottom: '14px' }}>Follow Us</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  [FaWhatsapp,  'https://wa.me/2348000000000', '#25d366'],
                  [FaFacebook,  '#', '#1877f2'],
                  [FaInstagram, '#', '#e1306c'],
                  [FaTwitter,   '#', '#1da1f2'],
                ].map(([Icon, href, color], i) => (
                  <a key={i} href={href} target="_blank" rel="noreferrer"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1.5px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '18px', textDecoration: 'none', transition: 'border-color 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.transform = ''; }}>
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/2348000000000?text=Hi! I need some help."
              target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', background: '#25d366', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#128c3e'}
              onMouseLeave={e => e.currentTarget.style.background = '#25d366'}>
              <FaWhatsapp size={22} />
              <div>
                <div>Chat on WhatsApp</div>
                <div style={{ fontSize: '12px', fontWeight: 400, opacity: 0.85 }}>Fastest response — usually under 10 mins</div>
              </div>
            </a>
          </div>

          {/* Right — Contact form */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', border: '1px solid #e8e8e8', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px', color: '#16a34a' }}>
                  <FiCheck />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '24px' }}>
                  Thank you, <strong>{form.name}</strong>! We'll get back to you at <strong>{form.email}</strong> within 2 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  style={{ padding: '11px 22px', border: '1.5px solid #e8e8e8', borderRadius: '9px', background: '#fff', color: '#555', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '6px' }}>Send a Message</h2>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>We reply within 2 business hours</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { key: 'name',  label: 'Full Name *', placeholder: 'Your name',  type: 'text',  required: true },
                      { key: 'email', label: 'Email *',     placeholder: 'your@email.com', type: 'email', required: true },
                    ].map(({ key, label, placeholder, type, required }) => (
                      <div key={key}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '7px' }}>{label}</label>
                        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                          placeholder={placeholder} required={required}
                          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#d4af37'}
                          onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                      </div>
                    ))}
                  </div>

                  {[
                    { key: 'phone',   label: 'Phone Number',     placeholder: 'e.g. 08012345678',      type: 'tel'  },
                    { key: 'subject', label: 'Subject *',        placeholder: 'What is this about?',   type: 'text', required: true },
                  ].map(({ key, label, placeholder, type, required }) => (
                    <div key={key}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '7px' }}>{label}</label>
                      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                        placeholder={placeholder} required={required}
                        style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8e8e8', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#d4af37'}
                        onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '7px' }}>Message *</label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)}
                      placeholder="Tell us how we can help you..." required
                      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e8e8', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', minHeight: '130px', resize: 'vertical', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#d4af37'}
                      onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                  </div>

                  <button type="submit" disabled={loading}
                    style={{ padding: '15px', background: 'linear-gradient(135deg,#d4af37,#b8941f)', color: '#1a1a1a', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(212,175,55,0.3)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}>
                    <FiSend /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}