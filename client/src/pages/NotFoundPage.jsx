import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '120px', fontWeight: 700, color: '#e8e8e8', lineHeight: 1, marginBottom: '8px' }}>
          404
        </div>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1a1a1a', marginBottom: '12px' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.7', marginBottom: '36px' }}>
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1.5px solid #e8e8e8', borderRadius: '9px', background: '#fff', color: '#555', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.color = '#d4af37'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#555'; }}
          >
            <FiArrowLeft /> Go Back
          </button>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg,#d4af37,#b8941f)', color: '#1a1a1a', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}>
            <FiHome /> Go Home
          </Link>
          <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#1a1a1a', color: '#d4af37', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            <FiSearch /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}