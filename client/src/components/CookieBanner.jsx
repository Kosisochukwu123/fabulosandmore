import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiCheck, FiShield } from 'react-icons/fi';
import { registerSW, prefetchAllImages } from '../utils/serviceWorker';
import '../styles/CookieBanner.css';

const COOKIE_KEY = 'fab_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible]     = useState(false);
  const [animOut, setAnimOut]     = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchDone, setPrefetchDone] = useState(false);

  useEffect(() => {
    /* Register SW regardless of consent — for offline support */
    registerSW();

    const consent = localStorage.getItem(COOKIE_KEY);

    if (!consent) {
      /* Show banner after a short delay so it doesn't flash immediately */
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }

    if (consent === 'accepted') {
      /* Already accepted — silently prefetch in background */
      setTimeout(() => prefetchAllImages(), 3000);
    }
  }, []);

  const dismiss = (type) => {
    setAnimOut(true);
    setTimeout(() => setVisible(false), 380);
    localStorage.setItem(COOKIE_KEY, type);
  };

  const handleAccept = async () => {
    dismiss('accepted');
    setPrefetching(true);

    /* Short delay so the banner animates out first */
    await new Promise(r => setTimeout(r, 500));
    await prefetchAllImages();

    setPrefetching(false);
    setPrefetchDone(true);
    setTimeout(() => setPrefetchDone(false), 4000);
  };

  const handleDecline = () => dismiss('declined');

  return (
    <>
      {/* ---- Cookie Banner ---- */}
      {visible && (
        <div className={`cookie-banner ${animOut ? 'slide-out' : 'slide-in'}`}
          role="dialog" aria-label="Cookie consent">

          <div className="cookie-banner-icon">
            <FiShield />
          </div>

          <div className="cookie-banner-body">
            <p className="cookie-banner-title">Your privacy matters</p>
            <p className="cookie-banner-text">
              We use essential cookies for authentication and cart functionality.
              Accepting also lets us cache images on your device for a faster
              experience — especially on slower connections.{' '}
              <Link to="/legal/privacy" className="cookie-banner-link">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="cookie-banner-actions">
            <button className="cookie-btn-accept" onClick={handleAccept}>
              <FiCheck /> Accept & Speed Up
            </button>
            <button className="cookie-btn-decline" onClick={handleDecline}>
              Essential Only
            </button>
          </div>

          <button className="cookie-banner-close" onClick={handleDecline}
            aria-label="Close">
            <FiX />
          </button>
        </div>
      )}

      {/* ---- Prefetch toast ---- */}
      {prefetching && (
        <div className="cookie-prefetch-toast">
          <div className="cookie-prefetch-spinner" />
          Caching images for faster browsing...
        </div>
      )}

      {prefetchDone && (
        <div className="cookie-prefetch-toast done">
          <FiCheck /> Images cached — enjoy lightning-fast browsing!
        </div>
      )}
    </>
  );
}