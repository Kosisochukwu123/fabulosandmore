import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowRight, FiStar, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/AIRecommendations.css';

export default function AIRecommendations({ currentProduct }) {
  const { user }                  = useAuth();
  const { addToCart }             = useCart();
  const navigate                  = useNavigate();
  const [data, setData]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeChip, setActiveChip] = useState(0);

const API_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const browsed = JSON.parse(localStorage.getItem('fab_browsed') || '[]');

    axios.post(`${API_URL}/api/ai/recommendations`, {
      browsedProducts: browsed,
      currentProduct: currentProduct?._id || null,
    })
      .then(r => {
        setData(r.data.data || {});
        const first = r.data.data?.recommendations?.[0];
        if (first?.searchTerm) {
          return axios.get(
            `${API_URL}/api/products?search=${encodeURIComponent(first.searchTerm)}&limit=4`
          );
        }
        return axios.get(`${API_URL}/api/products?featured=true&limit=4`);
      })
      .then(r => setProducts(r?.data?.products || []))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, currentProduct]);

  /* ---- Load products for a specific chip ---- */
  const loadChipProducts = async (rec, idx) => {
    setActiveChip(idx);
    try {
      const { data } = await axios.get(
        `${API_URL} /api/products?search=${encodeURIComponent(rec.searchTerm)}&limit=4`
      );
      setProducts(data.products || []);
    } catch {/* silent */}
  };

  /* ---- Don't render if not logged in ---- */
  if (!user) return (
    <section className="ai-rec-section">
      <div className="container">
        <div className="ai-rec-header">
          <div className="ai-rec-badge">
            <span className="ai-rec-badge-icon">✨</span>
            Personalised Picks
          </div>
          <h2 className="ai-rec-title">Get AI-Powered Recommendations</h2>
          <p className="ai-rec-message">
            Sign in to see products picked specifically for your cooking style and kitchen needs.
          </p>
        </div>
        <div className="ai-rec-login-prompt">
          <p>Create a free account to unlock personalised recommendations</p>
          <Link to="/register" className="ai-rec-login-btn">
            Create Free Account <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );

  /* ---- Loading skeleton ---- */
  if (loading) return (
    <section className="ai-rec-section">
      <div className="container">
        <div className="ai-rec-header">
          <div className="ai-rec-badge">
            <span className="ai-rec-badge-icon">✨</span>
            AI Picks for You
          </div>
          <h2 className="ai-rec-title">Finding your perfect products...</h2>
        </div>
        <div className="ai-rec-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="ai-rec-skeleton-card">
              <div className="ai-rec-skeleton-img" />
              <div className="ai-rec-skeleton-body">
                <div className="ai-rec-skeleton-line" />
                <div className="ai-rec-skeleton-line short" />
                <div className="ai-rec-skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  /* ---- No data ---- */
  if (!data) return null;

  return (
    <section className="ai-rec-section">
      <div className="container">

        {/* Header */}
        <div className="ai-rec-header">
          <div className="ai-rec-badge">
            <span className="ai-rec-badge-icon">✨</span>
            AI Picks for {user.name?.split(' ')[0]}
          </div>
          <h2 className="ai-rec-title">Recommended Just for You</h2>
          {data.personalMessage && (
            <p className="ai-rec-message">"{data.personalMessage}"</p>
          )}
        </div>

        {/* Category chips */}
        {data.recommendations?.length > 0 && (
          <div className="ai-rec-chips">
            {data.recommendations.map((rec, i) => (
              <button
                key={i}
                className={`ai-rec-chip ${activeChip === i ? 'active' : ''}`}
                onClick={() => loadChipProducts(rec, i)}
              >
                <span className="ai-rec-chip-label">{rec.category}</span>
                <span className="ai-rec-chip-reason">{rec.reason}</span>
                <FiArrowRight className="ai-rec-chip-arrow" />
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 && (
          <div className="products-grid">
            {products.map(p => (
              <div
                key={p._id}
                className="product-card"
                onClick={() => navigate(`/product/${p._id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="product-card-img-wrap">
                  <img
                    src={p.images?.[0]?.url || 'https://via.placeholder.com/300x220?text=No+Image'}
                    alt={p.name}
                  />
                  {/* Quick add button */}
                  <button
                    className="product-card-cart-btn"
                    onClick={e => { e.stopPropagation(); addToCart(p); }}
                    aria-label="Add to cart"
                  >
                    <FiShoppingCart />
                  </button>
                </div>
                <div className="card-body">
                  <div className="product-card-category">{p.category}</div>
                  <div className="card-title">{p.name}</div>
                  <div className="ai-rec-card-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className="ai-rec-star"
                        style={{
                          fill: i < Math.round(p.ratings?.average || 0)
                            ? '#d4af37' : 'none'
                        }}
                      />
                    ))}
                    <span className="ai-rec-star-count">
                      ({p.ratings?.count || 0})
                    </span>
                  </div>
                  <span className="card-price">₦{p.price?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="ai-rec-login-prompt">
            <p>Browse our catalog to get personalised picks</p>
            <Link to="/catalog" className="ai-rec-login-btn">
              Browse Catalog <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}