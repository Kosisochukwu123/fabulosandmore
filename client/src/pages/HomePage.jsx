import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowRight, FiStar, FiShoppingCart,
  FiTruck, FiShield, FiRefreshCw, FiPhone,
  FiX, FiChevronLeft, FiChevronRight, FiZap
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import {
  GiKnifeFork, GiCookingPot, GiCupcake,
  GiWashingMachine, GiOpenChest
} from 'react-icons/gi';
import { MdOutlineBlender } from 'react-icons/md';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import AIRecommendations from '../components/ai/AIRecommendations';

const HERO_SLIDES = [
  {
    image: '/images/hero-kitchen.jpg',
    tag: '✦ New Collection 2025',
    title: 'The Art of\nCooking Begins\nHere',
    sub: 'Premium kitchen utensils and cookware crafted for the modern Nigerian home. Quality you can see, feel, and trust.',
    cta: 'Shop Cookware',
    ctaLink: '/catalog?category=Cookware',
    position: 'left',
  },
  {
    image: '/images/hero-teapots.jpg',
    tag: '✦ Handcrafted Collection',
    title: 'Timeless Pieces\nfor Your\nKitchen',
    sub: 'Discover our curated selection of premium teaware, ceramics and artisan kitchen accessories.',
    cta: 'Shop Now',
    ctaLink: '/catalog',
    position: 'left',
  },
  {
    image: '/images/hero-tea.jpg',
    tag: '✦ Premium Quality',
    title: 'Every Cup\nTells a\nStory',
    sub: 'From morning tea to evening cooking — equip your kitchen with tools that last a lifetime.',
    cta: 'Explore All',
    ctaLink: '/catalog',
    position: 'center',
  },
];

const CATEGORIES = [
  { name: 'Kitchen Utensils', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', count: '200+ items', Icon: GiKnifeFork  },
  { name: 'Cookware',         image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', count: '150+ items', Icon: GiCookingPot  },
  { name: 'Bakeware',         image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', count: '100+ items', Icon: GiCupcake     },
  { name: 'Storage Solutions',image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', count: '80+ items',  Icon: GiOpenChest   },
  { name: 'Cleaning Tools',   image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', count: '60+ items',  Icon: GiWashingMachine },
  { name: 'Small Appliances', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80', count: '40+ items',  Icon: MdOutlineBlender },
];

const FEATURES = [
  { icon: FiTruck,     title: 'Free Delivery',   desc: 'On orders above ₦50,000' },
  { icon: FiShield,    title: 'Genuine Products', desc: '100% authentic quality'  },
  { icon: FiRefreshCw, title: 'Easy Returns',     desc: '30-day return policy'    },
  { icon: FiPhone,     title: '24/7 Support',     desc: 'Via WhatsApp & phone'    },
];

const API_URL = process.env.REACT_APP_API_URL || '';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topProducts, setTopProducts]           = useState([]);
  const [apiError, setApiError]                 = useState(false);
  const [slide, setSlide]                       = useState(0);
  const [sliding, setSliding]                   = useState(false);
  const { addToCart }                           = useCart();
  const { settings }                            = useSettings();
  const navigate                                = useNavigate();
  const slideTimer                              = useRef(null);

  /* Build WhatsApp link from settings */
  const waNumber  = (settings?.business?.whatsapp || '').replace(/[^0-9]/g, '');
  const waText    = settings?.business?.whatsappText || 'Hi! I need help.';
  const waLink    = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : '#';
  const waBulk    = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent('I want a bulk order quote')}` : '#';
  const phone     = settings?.business?.phone || '';

  useEffect(() => {
    axios.get(`${API_URL}/api/products?featured=true&limit=6`)
      .then(r => setFeaturedProducts(r.data.products || []))
      .catch(() => setApiError(true));
    axios.get(`${API_URL}/api/products?sort=popular&limit=8`)
      .then(r => setTopProducts(r.data.products || []))
      .catch(() => {});
  }, []);

  const startTimer = () => {
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % HERO_SLIDES.length);
        setSliding(false);
      }, 220);
    }, 5500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(slideTimer.current);
  }, []);

  const goTo = (idx) => {
    setSliding(true);
    setTimeout(() => { setSlide(idx); setSliding(false); }, 220);
    startTimer();
  };

  const current = HERO_SLIDES[slide];

  return (
    <div className="home-page">

      {apiError && (
        <div className="home-error-bar">
          ⚠️ Could not connect to database. Make sure MongoDB is running and <code>.env</code> has the correct <code>MONGO_URI</code>.
        </div>
      )}

      {/* ---- HERO ---- */}
      <section className="hero">
        <div className={`hero-bg ${sliding ? 'fade-out' : 'fade-in'}`}
          style={{ backgroundImage: `url(${current.image})` }} />
        <div className="hero-overlay" />

        <div className={`hero-content ${current.position === 'center' ? 'center' : ''} ${sliding ? 'content-fade-out' : 'content-fade-in'}`}>
          <div className="hero-tag">{current.tag}</div>
          <h1 className="hero-title">
            {current.title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-sub">{current.sub}</p>
          <div className="hero-btns">
            <Link to={current.ctaLink} className="hero-btn-primary">
              {current.cta} <FiArrowRight />
            </Link>
            <a href={waLink} target="_blank" rel="noreferrer" className="hero-btn-wa">
              <FaWhatsapp /> WhatsApp Us
            </a>
          </div>
          <div className="hero-stats">
            {[['5,000+','Products'], ['10K+','Customers'], ['99%','Satisfaction']].map(([v, l]) => (
              <div key={l} className="hero-stat">
                <span className="hero-stat-val">{v}</span>
                <span className="hero-stat-label">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="hero-arrow left"
          onClick={() => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
          <FiChevronLeft />
        </button>
        <button className="hero-arrow right"
          onClick={() => goTo((slide + 1) % HERO_SLIDES.length)}>
          <FiChevronRight />
        </button>

        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="hero-scroll-cue">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ---- FEATURES BAR ---- */}
      <section className="features-bar">
        <div className="features-bar-inner">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="features-bar-item">
              <Icon className="features-bar-icon" />
              <div>
                <div className="features-bar-title">{title}</div>
                <div className="features-bar-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- MARQUEE ---- */}
      <div className="marquee-band">
        <div className="marquee-track">
          {[...Array(3)].map((_, ri) => (
            <span key={ri} className="marquee-inner">
              {['Free Delivery on ₦50K+','100% Genuine Products','30-Day Returns','WhatsApp Support 24/7','Premium Quality','Bulk Orders Welcome'].map((t, i) => (
                <React.Fragment key={i}>
                  <span>{t}</span>
                  <span className="marquee-dot">✦</span>
                </React.Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---- CATEGORIES ---- */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header center">
            <span className="home-section-tag">Browse</span>
            <h2>Shop by Category</h2>
            <div className="home-accent" />
            <p>Find exactly what you need from our curated collection</p>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map(({ name, image, count, Icon }) => (
              <Link key={name} to={`/catalog?category=${encodeURIComponent(name)}`} className="cat-card">
                <div className="cat-card-img-wrap">
                  <img src={image} alt={name} className="cat-card-img" />
                  <div className="cat-card-img-overlay" />
                  <div className="cat-card-icon-wrap">
                    <Icon className="cat-card-icon" />
                  </div>
                </div>
                <div className="cat-card-body">
                  <div className="cat-card-name">{name}</div>
                  <div className="cat-card-footer">
                    <span className="cat-card-count">{count}</span>
                    <FiArrowRight className="cat-card-arrow" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- EDITORIAL ---- */}
      <section className="editorial">
        <div className="editorial-grid">
          <div className="editorial-large" style={{ backgroundImage: 'url(/images/hero-kitchen.jpg)' }}>
            <div className="editorial-overlay" />
            <div className="editorial-text">
              <span className="editorial-tag">Premium Cookware</span>
              <h3>Equip Your Kitchen Like a Chef</h3>
              <Link to="/catalog?category=Cookware" className="editorial-link">
                Shop Cookware <FiArrowRight />
              </Link>
            </div>
          </div>
          <div className="editorial-small-col">
            <div className="editorial-small" style={{ backgroundImage: 'url(/images/hero-teapots.jpg)' }}>
              <div className="editorial-overlay" />
              <div className="editorial-text">
                <span className="editorial-tag">Teaware</span>
                <h3>Artisan Collections</h3>
                <Link to="/catalog" className="editorial-link">Explore <FiArrowRight /></Link>
              </div>
            </div>
            <div className="editorial-small" style={{ backgroundImage: 'url(/images/hero-tea.jpg)' }}>
              <div className="editorial-overlay" />
              <div className="editorial-text">
                <span className="editorial-tag">New Arrivals</span>
                <h3>Fresh In This Week</h3>
                <Link to="/catalog" className="editorial-link">Shop Now <FiArrowRight /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURED PRODUCTS ---- */}
      {featuredProducts.length > 0 && (
        <section className="home-section home-section-pale">
          <div className="container">
            <div className="home-section-header">
              <div>
                <span className="home-section-tag">Handpicked</span>
                <h2>Featured Products</h2>
                <div className="home-accent" />
              </div>
              <Link to="/catalog?featured=true" className="home-view-all">View All <FiArrowRight /></Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map(p => (
                <ProductCard key={p._id} product={p} addToCart={addToCart} navigate={navigate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- TRUST BAND ---- */}
      <section className="trust-band">
        <div className="container">
          <div className="trust-band-inner">
            <div className="trust-band-text">
              <h2>"The best kitchen store in Nigeria. Fast delivery, genuine products, and amazing customer service!"</h2>
              <div className="trust-band-author">
                <div className="trust-band-avatar">A</div>
                <div>
                  <div className="trust-band-name">Amara O.</div>
                  <div className="trust-band-stars">★★★★★</div>
                </div>
              </div>
            </div>
            <div className="trust-band-stats">
              {[
                ['10,000+','Happy Customers'],
                ['99%','Satisfaction Rate'],
                ['₦0','Delivery on ₦50K+'],
                ['30 days','Return Policy'],
              ].map(([v, l]) => (
                <div key={l} className="trust-stat">
                  <div className="trust-stat-val">{v}</div>
                  <div className="trust-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- TOP PICKS ---- */}
      {topProducts.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="home-section-header center">
              <span className="home-section-tag">Best Sellers</span>
              <h2>Top Picks</h2>
              <div className="home-accent" />
              <p>Our best-selling products loved by thousands of customers</p>
            </div>
            <div className="products-grid">
              {topProducts.slice(0, 8).map(p => (
                <ProductCard key={p._id} product={p} addToCart={addToCart} navigate={navigate} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/catalog" className="home-shop-all-btn">
                Shop All Products <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---- EMPTY STATE ---- */}
      {!apiError && featuredProducts.length === 0 && topProducts.length === 0 && (
        <section className="home-section">
          <div className="container home-empty">
            <GiCookingPot className="home-empty-icon-svg" />
            <h3>No products yet</h3>
            <p>Run <code>npm run seed</code> or add products via the admin panel to see them here.</p>
            <Link to="/admin" className="home-shop-all-btn">Go to Admin Panel</Link>
          </div>
        </section>
      )}

      <AIRecommendations />

      {/* ---- BULK CTA ---- */}
      <section className="bulk-cta">
        <div className="bulk-cta-img" style={{ backgroundImage: 'url(/images/hero-kitchen.jpg)' }} />
        <div className="bulk-cta-overlay" />
        <div className="bulk-cta-content">
          <span className="home-section-tag">For Businesses</span>
          <h2>Bulk Orders Welcome</h2>
          <div className="home-accent" />
          <p>Special pricing for restaurants, hotels, schools and businesses across Nigeria.</p>
          <div className="bulk-cta-btns">
            <Link to="/bulk-orders" className="hero-btn-primary">
              Get a Custom Quote <FiArrowRight />
            </Link>
            <a href={waBulk} target="_blank" rel="noreferrer" className="hero-btn-wa">
              <FaWhatsapp /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <AIChatButton waNumber={phone} />
    </div>
  );
}

/* ================================================================
   PRODUCT CARD
   ================================================================ */
function ProductCard({ product, addToCart, navigate }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="product-card"
      onClick={() => navigate(`/product/${product._id}`)}
      role="button" tabIndex={0}>
      <div className="product-card-img-wrap">
        <img
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
        {discount > 0 && <span className="product-card-badge">-{discount}%</span>}
        <button className="product-card-cart-btn"
          onClick={e => { e.stopPropagation(); addToCart(product); }}
          aria-label="Add to cart">
          <FiShoppingCart />
        </button>
      </div>
      <div className="card-body">
        <div className="product-card-category">{product.category}</div>
        <div className="card-title">{product.name}</div>
        <div className="product-card-stars">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} className="product-star"
              style={{ fill: i < Math.round(product.ratings?.average || 0) ? '#D4AF37' : 'none' }} />
          ))}
          <span className="product-star-count">({product.ratings?.count || 0})</span>
        </div>
        <div className="product-card-prices">
          <span className="card-price">₦{product.price?.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="card-compare">₦{product.comparePrice?.toLocaleString()}</span>
          )}
        </div>
        {product.stock > 0 && product.stock <= product.lowStockThreshold && (
          <div className="product-card-low-stock">Only {product.stock} left in stock</div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   AI CHAT BUTTON — uses phone from settings for fallback message
   ================================================================ */
function AIChatButton({ waNumber }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Fabulous & More AI assistant. Ask me about products, pricing, delivery or anything kitchen-related!" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef           = useRef(null);

  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/ai/chat`, {
        message: userMsg,
        history: messages.map(m => ({ role: m.role, content: m.text }))
      });
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      const fallback = waNumber
        ? `Sorry, having trouble right now. Call or WhatsApp us on ${waNumber}!`
        : "Sorry, having trouble right now. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', text: fallback }]);
    }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <div className="chat-header-title">AI Assistant</div>
              <div className="chat-header-sub">Fabulous &amp; More · Online</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}><FiX /></button>
          </div>
          <div className="chat-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="chat-bubble assistant chat-typing">
                <span /><span /><span />
              </div>
            )}
          </div>
          <form className="chat-form" onSubmit={sendMessage}>
            <input className="chat-input" value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about products, delivery..."
              disabled={loading} />
            <button type="submit" className="chat-send" disabled={loading || !input.trim()}>
              <FiArrowRight />
            </button>
          </form>
        </div>
      )}
      <button className={`chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)} aria-label="Open AI chat">
        {open ? <FiX /> : <FiZap />}
      </button>
    </>
  );
}
