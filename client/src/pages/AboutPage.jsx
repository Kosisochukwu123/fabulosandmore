import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiTruck, FiUsers, FiHeart, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const STATS = [
  { value: '5,000+', label: 'Products' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '5+', label: 'Years in Business' },
];

const VALUES = [
  { icon: FiAward,  title: 'Quality First',    desc: 'We source only premium products from verified suppliers. Every item is inspected before it reaches you.' },
  { icon: FiTruck,  title: 'Fast Delivery',    desc: 'Free delivery on orders above ₦50,000. Standard 3–5 day delivery across Nigeria with real-time tracking.' },
  { icon: FiUsers,  title: 'Customer Focus',   desc: 'Our team is available 7 days a week via WhatsApp and phone. Your satisfaction is our top priority.' },
  { icon: FiHeart,  title: 'Community Driven', desc: 'We believe in supporting Nigerian homes and businesses with affordable, quality kitchen and home solutions.' },
];

const TEAM = [
  { name: 'Chioma Adeyemi', role: 'Founder & CEO',        emoji: '👩🏾‍💼' },
  { name: 'Emeka Okafor',   role: 'Head of Operations',   emoji: '👨🏿‍💼' },
  { name: 'Amara Nwosu',    role: 'Customer Experience',  emoji: '👩🏾‍💻' },
  { name: 'Tunde Balogun',  role: 'Logistics Manager',    emoji: '👨🏾‍🚀' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '80vh' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '13px', color: '#d4af37', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Our Story
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', color: '#fff', lineHeight: 1.2, marginBottom: '20px' }}>
            Making Every Kitchen <span style={{ color: '#d4af37' }}>Fabulous</span>
          </h1>
          <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
            Founded in 2019, Fabulous & More started with a simple mission: bring premium kitchen utensils and home hardware to Nigerian homes at prices everyone can afford.
          </p>
          <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'linear-gradient(135deg,#d4af37,#b8941f)', color: '#1a1a1a', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            Shop Our Collection
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#d4af37', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '14px', color: '#3d3d3d', marginTop: '6px', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3vw, 38px)', color: '#1a1a1a', marginBottom: '20px' }}>
              How We Started
            </h2>
            <div style={{ width: '48px', height: '3px', background: '#d4af37', borderRadius: '2px', marginBottom: '20px' }} />
            <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.85', marginBottom: '16px' }}>
              It started in a small Lagos kitchen. Our founder, Chioma, was frustrated by the lack of quality kitchen products available locally — either the quality was poor or prices were sky-high for imported goods.
            </p>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.85', marginBottom: '16px' }}>
              She decided to do something about it. After months of sourcing and testing hundreds of products, Fabulous & More was born — a store that puts quality and affordability first.
            </p>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.85', marginBottom: '28px' }}>
              Today we serve over 10,000 happy customers across Nigeria, from individual home cooks to hotels, restaurants, and catering businesses.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['ISO-certified suppliers only', 'Every product quality-tested', '30-day hassle-free returns', 'Same-day WhatsApp support'].map(item => (
                <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#444', alignItems: 'center' }}>
                  <FiCheck style={{ color: '#d4af37', flexShrink: 0, fontSize: '16px' }} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fbf5e0, #fff)', borderRadius: '20px', padding: '48px', textAlign: 'center', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🍳</div>
            <blockquote style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1a1a1a', lineHeight: '1.6', fontStyle: 'italic', margin: '0 0 16px' }}>
              "Every great meal starts with the right tools. We make sure you have them."
            </blockquote>
            <div style={{ fontWeight: 700, color: '#d4af37', fontSize: '15px' }}>— Chioma Adeyemi, Founder</div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 24px', background: '#f9f9f9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3vw, 38px)', color: '#1a1a1a' }}>Our Values</h2>
            <div style={{ width: '48px', height: '3px', background: '#d4af37', borderRadius: '2px', margin: '14px auto 0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e8e8e8', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: '48px', height: '48px', background: '#fbf5e0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon style={{ fontSize: '22px', color: '#d4af37' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a1a', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3vw, 38px)', color: '#1a1a1a' }}>Meet the Team</h2>
            <div style={{ width: '48px', height: '3px', background: '#d4af37', borderRadius: '2px', margin: '14px auto 0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
            {TEAM.map(({ name, role, emoji }) => (
              <div key={name} style={{ textAlign: 'center', padding: '32px 20px', background: '#f9f9f9', borderRadius: '16px', border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: '56px', marginBottom: '14px' }}>{emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a', marginBottom: '5px' }}>{name}</div>
                <div style={{ fontSize: '13px', color: '#d4af37', fontWeight: 600 }}>{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#d4af37', fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: '12px' }}>
          Ready to Upgrade Your Kitchen?
        </h2>
        <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
          Browse our collection of premium kitchen utensils and home hardware.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/catalog" style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#d4af37,#b8941f)', color: '#1a1a1a', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            Shop Now
          </Link>
          <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', border: '2px solid #25d366', color: '#25d366', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            <FaWhatsapp /> Chat with Us
          </a>
        </div>
      </section>
    </div>
  );
}