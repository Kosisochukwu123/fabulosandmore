import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import '../styles/Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate — real implementation sends reset email via nodemailer
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo-main">FABULOUS</div>
            <span className="auth-logo-sub">& MORE</span>
          </Link>
          <h1 className="auth-title">
            {sent ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p className="auth-subtitle">
            {sent
              ? `We sent a reset link to ${email}`
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
          <div className="auth-divider" />
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px', color: '#16a34a' }}>
              <FiCheck />
            </div>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.7', marginBottom: '24px' }}>
              If an account with that email exists, you'll receive a password reset link within a few minutes. Check your spam folder too.
            </p>
            <Link to="/login" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">
                  <FiMail size={13} /> Email Address
                </label>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-or">or</div>

            <a
              href="https://wa.me/2348000000000?text=Hi! I need help resetting my Fabulous %26 More account password."
              target="_blank" rel="noreferrer"
              className="auth-whatsapp-btn"
            >
              <FaWhatsapp size={18} /> Reset via WhatsApp
            </a>

            <p className="auth-switch">
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}