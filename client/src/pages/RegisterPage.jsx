import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [agreed, setAgreed]     = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* Password strength */
  const strength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const pwdStr      = strength(form.password);
  const strLabel    = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStr];
  const strColor    = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][pwdStr];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (!agreed) {
      setError('Please accept the terms to continue'); return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo-main">FABULOUS</div>
            <span className="auth-logo-sub">& MORE</span>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of happy customers</p>
          <div className="auth-divider" />
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-banner error">⚠️ {error}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="auth-field">
            <label className="auth-label"><FiUser size={13} /> Full Name</label>
            <input
              className="auth-input"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Amara Johnson"
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label"><FiMail size={13} /> Email Address</label>
            <input
              className="auth-input"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label className="auth-label"><FiPhone size={13} /> Phone Number</label>
            <div className="auth-phone-wrap">
              <span className="auth-phone-prefix">🇳🇬 +234</span>
              <input
                className="auth-input"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="8012345678"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label"><FiLock size={13} /> Password</label>
            <div className="auth-password-wrap">
              <input
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
              />
              <button type="button" className="auth-password-toggle"
                onClick={() => setShowPwd(s => !s)}>
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {/* Strength meter */}
            {form.password && (
              <div className="auth-pwd-strength">
                <div className="auth-pwd-bar">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="auth-pwd-segment"
                      style={{ background: i <= pwdStr ? strColor : '#e8e8e8' }} />
                  ))}
                </div>
                <span style={{ color: strColor, fontSize: '12px', fontWeight: 600 }}>
                  {strLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <label className="auth-label"><FiLock size={13} /> Confirm Password</label>
            <div className="auth-password-wrap">
              <input
                className={`auth-input ${form.confirmPassword && form.confirmPassword !== form.password ? 'error' : ''}`}
                type={showConf ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
              <button type="button" className="auth-password-toggle"
                onClick={() => setShowConf(s => !s)}>
                {showConf ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {form.confirmPassword && form.confirmPassword === form.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>
                <FiCheck size={12} /> Passwords match
              </div>
            )}
          </div>

          {/* Terms */}
          <label className="auth-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            I agree to the{' '}
            <Link to="/legal/terms">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/legal/privacy">Privacy Policy</Link>
          </label>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !agreed}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* OR */}
        <div className="auth-or">or</div>

        <a
          href="https://wa.me/2348000000000?text=Hi! I'd like to create an account on Fabulous %26 More."
          target="_blank"
          rel="noreferrer"
          className="auth-whatsapp-btn"
        >
          <FaWhatsapp size={18} /> Register via WhatsApp
        </a>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}