import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiShoppingCart, FiHeart, FiStar, FiShare2,
  FiTruck, FiShield, FiRefreshCw, FiCheck,
  FiMinus, FiPlus, FiChevronLeft, FiChevronRight,
  FiZoomIn, FiPackage
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import useWishlist from '../hooks/useWishlist';
import LazyImage from '../components/LazyImage';
import toast from 'react-hot-toast';
import '../styles/ProductPage.css';

const API_URL = process.env.REACT_APP_API_URL;


export default function ProductPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct]           = useState(null);
  const [related, setRelated]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeImg, setActiveImg]       = useState(0);
  const [zoomOpen, setZoomOpen]         = useState(false);
  const [qty, setQty]                   = useState(1);
  const [activeTab, setActiveTab]       = useState('description');
  const [review, setReview]             = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmitting] = useState(false);
  const [addedToCart, setAddedToCart]   = useState(false);
  const stickyRef                       = useRef(null);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    setAddedToCart(false);

    axios.get(`${API_URL}/api/products/${id}`)
      .then(r => {
        setProduct(r.data.product);
        const browsed = JSON.parse(localStorage.getItem('fab_browsed') || '[]');
        const updated = [r.data.product.name, ...browsed.filter(b => b !== r.data.product.name)].slice(0, 10);
        localStorage.setItem('fab_browsed', JSON.stringify(updated));
        return axios.get(`${API_URL}/api/products?category=${encodeURIComponent(r.data.product.category)}&limit=5`);
      })
      .then(r => setRelated(r.data.products?.filter(p => p._id !== id).slice(0, 4) || []))
      .catch(() => toast.error('Could not load product'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => { addToCart(product, qty); navigate('/checkout'); };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      const r = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(r.data.product);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const images    = product?.images?.length > 0 ? product.images : [{ url: '/placeholder.svg' }];
  const discount  = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const stockStatus = !product ? null
    : product.stock === 0     ? { label: 'Out of Stock',        cls: 'out'  }
    : product.stock <= (product.lowStockThreshold || 10)
                              ? { label: `Only ${product.stock} left!`, cls: 'low' }
                              : { label: 'In Stock',             cls: 'ok'   };

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-skeleton">
        <div className="pp-skeleton-img" />
        <div className="pp-skeleton-body">
          <div className="pp-skeleton-line tall" />
          <div className="pp-skeleton-line" />
          <div className="pp-skeleton-line short" />
          <div className="pp-skeleton-line" />
          <div className="pp-skeleton-price" />
          <div className="pp-skeleton-btn" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="pp-not-found">
      <FiPackage size={64} color="#d4af37" />
      <h2>Product Not Found</h2>
      <p>This product may have been removed or is no longer available.</p>
      <Link to="/catalog" className="pp-back-link">← Browse Catalog</Link>
    </div>
  );

  return (
    <div className="pp-page">

      {/* Breadcrumb */}
      <div className="pp-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/catalog">Catalog</Link>
          <span>/</span>
          <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div className="container">
        <div className="pp-main">

          {/* ---- IMAGE GALLERY ---- */}
          <div className="pp-gallery">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pp-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt={`${product.name} ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="pp-main-img-wrap">
              {discount > 0 && (
                <span className="pp-badge-discount">-{discount}%</span>
              )}
              {product.isFeatured && (
                <span className="pp-badge-featured">Featured</span>
              )}

              <LazyImage
                src={images[activeImg]?.url}
                alt={product.name}
                className="pp-main-img"
              />

              {/* Zoom button */}
              <button className="pp-zoom-btn" onClick={() => setZoomOpen(true)}>
                <FiZoomIn />
              </button>

              {/* Arrow navigation */}
              {images.length > 1 && (
                <>
                  <button className="pp-img-arrow left"
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>
                    <FiChevronLeft />
                  </button>
                  <button className="pp-img-arrow right"
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}>
                    <FiChevronRight />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="pp-img-dots">
                  {images.map((_, i) => (
                    <button key={i}
                      className={`pp-img-dot ${activeImg === i ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---- PRODUCT INFO ---- */}
          <div className="pp-info" ref={stickyRef}>

            {/* Category + Brand */}
            <div className="pp-meta-row">
              <span className="pp-category">{product.category}</span>
              {product.brand && <span className="pp-brand">{product.brand}</span>}
            </div>

            <h1 className="pp-name">{product.name}</h1>

            {/* Rating summary */}
            <div className="pp-rating-row">
              <div className="pp-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="pp-star"
                    style={{ fill: i < Math.round(product.ratings?.average || 0) ? '#D4AF37' : 'none' }} />
                ))}
              </div>
              <span className="pp-rating-avg">{(product.ratings?.average || 0).toFixed(1)}</span>
              <button className="pp-rating-count" onClick={() => setActiveTab('reviews')}>
                {product.ratings?.count || 0} reviews
              </button>
            </div>

            {/* Price */}
            <div className="pp-price-block">
              <span className="pp-price">₦{product.price?.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="pp-compare">₦{product.comparePrice?.toLocaleString()}</span>
                  <span className="pp-save-badge">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="pp-short-desc">{product.shortDescription}</p>
            )}

            {/* Stock status */}
            <div className={`pp-stock pp-stock-${stockStatus?.cls}`}>
              {stockStatus?.cls === 'ok' && <FiCheck size={14} />}
              {stockStatus?.label}
            </div>

            {/* Quantity + Add to cart */}
            <div className="pp-purchase-block">
              <div className="pp-qty-wrap">
                <button className="pp-qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}>
                  <FiMinus />
                </button>
                <span className="pp-qty">{qty}</span>
                <button className="pp-qty-btn"
                  onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  disabled={qty >= (product.stock || 99) || product.stock === 0}>
                  <FiPlus />
                </button>
              </div>

              <button
                className={`pp-add-to-cart ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {addedToCart ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
              </button>

              <button className="pp-wishlist-btn"
                onClick={() => toggle(product)}
                aria-label="Add to wishlist">
                <FiHeart
                  style={{ fill: isWishlisted(product._id) ? '#ef4444' : 'none',
                           color: isWishlisted(product._id) ? '#ef4444' : 'currentColor' }} />
              </button>
            </div>

            <button className="pp-buy-now" onClick={handleBuyNow}
              disabled={product.stock === 0}>
              Buy Now
            </button>

            {/* WhatsApp order */}
            <a
              href={`https://wa.me/2348000000000?text=Hi! I'd like to order: ${encodeURIComponent(product.name)} (₦${product.price?.toLocaleString()})`}
              target="_blank" rel="noreferrer"
              className="pp-whatsapp-btn"
            >
              <FaWhatsapp /> Order via WhatsApp
            </a>

            {/* Trust badges */}
            <div className="pp-trust-badges">
              {[
                [FiTruck,    'Free delivery over ₦50,000'],
                [FiShield,   '100% genuine product'],
                [FiRefreshCw,'30-day returns'],
              ].map(([Icon, text]) => (
                <div key={text} className="pp-trust-badge">
                  <Icon className="pp-trust-icon" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Share + SKU */}
            <div className="pp-meta-footer">
              <span className="pp-sku">SKU: {product.sku}</span>
              <button className="pp-share-btn" onClick={handleShare}>
                <FiShare2 size={14} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ---- TABS ---- */}
        <div className="pp-tabs-section">
          <div className="pp-tabs">
            {[
              { id: 'description', label: 'Description'                        },
              { id: 'features',    label: 'Features'                           },
              { id: 'reviews',     label: `Reviews (${product.ratings?.count || 0})` },
            ].map(({ id, label }) => (
              <button key={id}
                className={`pp-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>

          <div className="pp-tab-content">
            {activeTab === 'description' && (
              <div className="pp-description">
                <p>{product.description || product.shortDescription || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="pp-features">
                {product.features?.length > 0 ? (
                  <ul className="pp-features-list">
                    {product.features.map((f, i) => (
                      <li key={i} className="pp-feature-item">
                        <FiCheck className="pp-feature-check" />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pp-no-content">No features listed for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pp-reviews">
                {/* Review summary */}
                {product.ratings?.count > 0 && (
                  <div className="pp-review-summary">
                    <div className="pp-review-avg">
                      <span className="pp-review-avg-num">
                        {(product.ratings?.average || 0).toFixed(1)}
                      </span>
                      <div className="pp-review-avg-stars">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className="pp-star"
                            style={{ fill: i < Math.round(product.ratings?.average || 0) ? '#D4AF37' : 'none' }} />
                        ))}
                      </div>
                      <span className="pp-review-avg-label">
                        Based on {product.ratings?.count} review{product.ratings?.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Review list */}
                {product.reviews?.length > 0 ? (
                  <div className="pp-review-list">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="pp-review-item">
                        <div className="pp-review-header">
                          <div className="pp-reviewer-avatar">
                            {r.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="pp-reviewer-name">{r.user?.name || 'Customer'}</div>
                            <div className="pp-review-stars">
                              {[...Array(5)].map((_, j) => (
                                <FiStar key={j} size={12} className="pp-star"
                                  style={{ fill: j < r.rating ? '#D4AF37' : 'none' }} />
                              ))}
                            </div>
                          </div>
                          <span className="pp-review-date">
                            {new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="pp-review-comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pp-no-reviews">
                    <FiStar size={36} color="#d4af37" />
                    <p>No reviews yet — be the first!</p>
                  </div>
                )}

                {/* Write review */}
                {user ? (
                  <form className="pp-review-form" onSubmit={handleReview}>
                    <h3>Leave a Review</h3>
                    <div className="pp-star-picker">
                      {[5, 4, 3, 2, 1].map(r => (
                        <button key={r} type="button"
                          className={`pp-star-pick ${review.rating >= r ? 'active' : ''}`}
                          onClick={() => setReview(rv => ({ ...rv, rating: r }))}>
                          <FiStar style={{ fill: review.rating >= r ? '#D4AF37' : 'none' }} />
                        </button>
                      ))}
                      <span className="pp-star-label">
                        {['','Poor','Fair','Good','Very Good','Excellent'][review.rating]}
                      </span>
                    </div>
                    <textarea
                      className="pp-review-textarea"
                      value={review.comment}
                      onChange={e => setReview(rv => ({ ...rv, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      required
                    />
                    <button type="submit" className="pp-review-submit" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="pp-review-login">
                    <Link to="/login">Sign in</Link> to leave a review
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- RELATED PRODUCTS ---- */}
        {related.length > 0 && (
          <div className="pp-related">
            <div className="pp-related-header">
              <h2>You May Also Like</h2>
              <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}
                className="pp-related-all">
                View all {product.category} →
              </Link>
            </div>
            <div className="pp-related-grid">
              {related.map(p => (
                <div key={p._id} className="pp-related-card"
                  onClick={() => navigate(`/product/${p._id}`)}>
                  <div className="pp-related-img">
                    <LazyImage src={p.images?.[0]?.url || '/placeholder.svg'} alt={p.name} />
                  </div>
                  <div className="pp-related-body">
                    <div className="pp-related-cat">{p.category}</div>
                    <div className="pp-related-name">{p.name}</div>
                    <div className="pp-related-price">₦{p.price?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- ZOOM MODAL ---- */}
      {zoomOpen && (
        <div className="pp-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <div className="pp-zoom-modal" onClick={e => e.stopPropagation()}>
            <button className="pp-zoom-close" onClick={() => setZoomOpen(false)}>
              ×
            </button>
            <img src={images[activeImg]?.url} alt={product.name} className="pp-zoom-img" />
            {images.length > 1 && (
              <div className="pp-zoom-nav">
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>
                  <FiChevronLeft />
                </button>
                <span>{activeImg + 1} / {images.length}</span>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)}>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}