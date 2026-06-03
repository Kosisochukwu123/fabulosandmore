import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CONTENT = {
  terms: {
    title: 'Terms of Service',
    icon: '📋',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By accessing and using Fabulous & More, you accept and agree to be bound by the terms and provisions of this agreement.' },
      { heading: '2. Products and Pricing', body: 'All prices are listed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to limit quantities and refuse service.' },
      { heading: '3. Payment', body: 'We accept card payments via Stripe, bank transfers, and cash on delivery. Payment must be received before goods are dispatched.' },
      { heading: '4. Delivery', body: 'Standard delivery takes 3–5 business days within Nigeria. Free delivery applies to orders above ₦50,000.' },
      { heading: '5. Returns & Refunds', body: 'You may return any product within 30 days of delivery in its original condition for a full refund or exchange. Contact us via WhatsApp to initiate a return.' },
      { heading: '6. Privacy', body: 'Your personal information is protected in accordance with our Privacy Policy. We never sell your data to third parties.' },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: '🔒',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect your name, email address, phone number, delivery address, and order history when you create an account or place an order.' },
      { heading: '2. How We Use Your Information', body: 'Your information is used to process orders, send order updates via WhatsApp/email, and improve our service. We never sell your data.' },
      { heading: '3. WhatsApp Notifications', body: 'If you provide your WhatsApp number, we may send order confirmations, delivery updates, and occasional promotional messages. You can opt out at any time.' },
      { heading: '4. Data Security', body: 'All data is encrypted in transit using SSL/TLS. Passwords are hashed using bcrypt and never stored in plain text.' },
      { heading: '5. Cookies', body: 'We use essential cookies for authentication and cart functionality. No tracking or advertising cookies are used.' },
      { heading: '6. Your Rights', body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us.' },
    ]
  }
};

export default function LegalPage() {
  const { type } = useParams();
  const page = CONTENT[type] || CONTENT.terms;

  return (
    <div style={{ minHeight: '80vh', background: '#f9f9f9', padding: '60px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{page.icon}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#1a1a1a', marginBottom: '8px' }}>
            {page.title}
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Last updated: January 2024</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '18px', padding: '40px', border: '1px solid #e8e8e8', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          {page.sections.map(({ heading, body }, i) => (
            <div key={i} style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: i < page.sections.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#1a1a1a', marginBottom: '10px' }}>
                {heading}
              </h2>
              <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.8' }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>
            Questions? Contact us at{' '}
            <a href="mailto:hello@fabulousandmore.com" style={{ color: '#d4af37', fontWeight: 600 }}>
              hello@fabulousandmore.com
            </a>
          </p>
          <Link to="/" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}