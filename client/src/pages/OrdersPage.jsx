import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiPackage, FiTruck, FiCheck, FiX, FiClock,
  FiChevronDown, FiChevronUp, FiMapPin, FiPhone,
  FiRefreshCw, FiShoppingBag
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../styles/OrdersPage.css';

const STATUS_CONFIG = {
  pending:           { label: 'Pending',           color: '#d97706', bg: '#fef3c7', icon: FiClock    },
  confirmed:         { label: 'Confirmed',          color: '#1d4ed8', bg: '#dbeafe', icon: FiCheck    },
  processing:        { label: 'Processing',         color: '#7c3aed', bg: '#ede9fe', icon: FiRefreshCw},
  packed:            { label: 'Packed',             color: '#0369a1', bg: '#e0f2fe', icon: FiPackage  },
  shipped:           { label: 'Shipped',            color: '#15803d', bg: '#f0fdf4', icon: FiTruck    },
  out_for_delivery:  { label: 'Out for Delivery',   color: '#059669', bg: '#ecfdf5', icon: FiTruck    },
  delivered:         { label: 'Delivered',          color: '#16a34a', bg: '#dcfce7', icon: FiCheck    },
  cancelled:         { label: 'Cancelled',          color: '#dc2626', bg: '#fee2e2', icon: FiX        },
  refunded:          { label: 'Refunded',           color: '#6b7280', bg: '#f3f4f6', icon: FiRefreshCw},
};

const TRACKING_STEPS = ['confirmed','processing','packed','shipped','out_for_delivery','delivered'];

const API_URL = process.env.REACT_APP_API_URL;

export default function OrdersPage() {
  const { id } = useParams();                       // single order view
  const [searchParams] = useSearchParams();
  const justOrdered = searchParams.get('success') === 'true';

  const [orders, setOrders]       = useState([]);
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    if (id) {
      // Single order detail
      axios.get(`${API_URL}/api/orders/${id}`)
        .then(r => setOrder(r.data.order))
        .catch(() => toast.error('Order not found'))
        .finally(() => setLoading(false));
    } else {
      // All orders
      axios.get(`${API_URL}/api/orders/my-orders`)
        .then(r => setOrders(r.data.orders || []))
        .catch(() => toast.error('Could not load orders'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  /* ---- Single order detail view ---- */
  if (id) return (
    <OrderDetail
      order={order}
      loading={loading}
      justOrdered={justOrdered}
    />
  );

  /* ---- All orders list ---- */
  const STATUS_FILTERS = [
    'all','pending','confirmed','processing','shipped','delivered','cancelled'
  ];

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="ord-page">

      {/* Header */}
      <div className="ord-header">
        <div className="ord-header-inner">
          <div>
            <h1 className="ord-header-title">My Orders</h1>
            <p className="ord-header-sub">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/catalog" className="ord-shop-btn">
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="ord-body">

        {/* Status filter tabs */}
        <div className="ord-filters">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`ord-filter-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All Orders' : STATUS_CONFIG[s]?.label || s}
              {s === 'all' && <span className="ord-filter-count">{orders.length}</span>}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="ord-loading">
            <div className="spinner" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="ord-empty">
            <span className="ord-empty-icon">📦</span>
            <h3>No orders found</h3>
            <p>{filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}</p>
            <Link to="/catalog" className="ord-empty-btn">Start Shopping</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && filtered.length > 0 && (
          <div className="ord-list">
            {filtered.map(o => (
              <OrderCard
                key={o._id}
                order={o}
                expanded={expanded === o._id}
                onToggle={() => setExpanded(expanded === o._id ? null : o._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   ORDER CARD — used in the list view
   ================================================================ */
function OrderCard({ order, expanded, onToggle }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="ord-card">

      {/* Card header */}
      <div className="ord-card-head" onClick={onToggle} role="button">
        <div className="ord-card-head-left">
          <div className="ord-card-num">
            <span className="ord-card-num-label">Order</span>
            <span className="ord-card-num-val">#{order.orderNumber}</span>
          </div>
          <div className="ord-card-date">
            {new Date(order.createdAt).toLocaleDateString('en-NG', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        </div>

        <div className="ord-card-head-right">
          <span
            className="ord-status-badge"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            <Icon size={12} />
            {cfg.label}
          </span>
          <span className="ord-card-total">
            ₦{order.total?.toLocaleString()}
          </span>
          <button className="ord-card-toggle" aria-label="Toggle details">
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      {/* Item thumbnails preview */}
      <div className="ord-card-previews">
        {order.items?.slice(0, 4).map((item, i) => (
          <img
            key={i}
            src={item.image || 'https://via.placeholder.com/56x56?text=+'}
            alt={item.name}
            className="ord-card-thumb"
          />
        ))}
        {order.items?.length > 4 && (
          <div className="ord-card-thumb-more">+{order.items.length - 4}</div>
        )}
        <span className="ord-card-items-count">
          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
        </span>

        <Link to={`/orders/${order._id}`} className="ord-view-btn" onClick={e => e.stopPropagation()}>
          View Details →
        </Link>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="ord-card-expanded">
          {/* Items list */}
          <div className="ord-expanded-items">
            {order.items?.map((item, i) => (
              <div key={i} className="ord-expanded-item">
                <img
                  src={item.image || 'https://via.placeholder.com/52x52?text=+'}
                  alt={item.name}
                  className="ord-expanded-img"
                />
                <div className="ord-expanded-info">
                  <span className="ord-expanded-name">{item.name}</span>
                  <span className="ord-expanded-sku">SKU: {item.sku}</span>
                </div>
                <div className="ord-expanded-meta">
                  <span className="ord-expanded-qty">x{item.quantity}</span>
                  <span className="ord-expanded-price">
                    ₦{((item.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="ord-expanded-totals">
            {[
              ['Subtotal',  `₦${order.subtotal?.toLocaleString()}`],
              ['Shipping',  order.shippingCost === 0 ? 'FREE' : `₦${order.shippingCost?.toLocaleString()}`],
              ['VAT',       `₦${Math.round(order.tax || 0).toLocaleString()}`],
            ].map(([k, v]) => (
              <div key={k} className="ord-expanded-total-row">
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div className="ord-expanded-total-row grand">
              <span>Total</span>
              <span>₦{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="ord-expanded-actions">
            <Link to={`/orders/${order._id}`} className="ord-action-btn primary">
              Track Order
            </Link>
            {['pending', 'confirmed'].includes(order.status) && (
              <a
                href={`https://wa.me/2348000000000?text=Hi, I'd like to cancel order %23${order.orderNumber}`}
                target="_blank" rel="noreferrer"
                className="ord-action-btn secondary"
              >
                <FaWhatsapp /> Cancel via WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   ORDER DETAIL — full tracking view
   ================================================================ */
function OrderDetail({ order, loading, justOrdered }) {
  if (loading) return (
    <div className="ord-loading" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!order) return (
    <div className="ord-empty" style={{ minHeight: '60vh' }}>
      <span className="ord-empty-icon">😕</span>
      <h3>Order not found</h3>
      <Link to="/orders" className="ord-empty-btn">Back to Orders</Link>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = TRACKING_STEPS.indexOf(order.status);

  return (
    <div className="ord-page">

      {/* Success banner */}
      {justOrdered && (
        <div className="ord-success-banner">
          <FiCheck className="ord-success-icon" />
          <div>
            <strong>Order placed successfully! 🎉</strong>
            <span>Thank you for shopping with Fabulous & More. We'll notify you via WhatsApp.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ord-header">
        <div className="ord-header-inner">
          <Link to="/orders" className="ord-back-link">← All Orders</Link>
          <div>
            <h1 className="ord-header-title">#{order.orderNumber}</h1>
            <p className="ord-header-sub">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <span
            className="ord-status-badge"
            style={{ color: cfg.color, background: cfg.bg, fontSize: '14px', padding: '8px 16px' }}
          >
            <cfg.icon size={14} /> {cfg.label}
          </span>
        </div>
      </div>

      <div className="ord-detail-body">

        {/* ---- Tracking progress ---- */}
        <div className="ord-track-card">
          <h3 className="ord-track-title">Delivery Progress</h3>

          {order.status === 'cancelled' ? (
            <div className="ord-track-cancelled">
              <FiX className="ord-track-cancelled-icon" />
              <span>This order has been cancelled</span>
            </div>
          ) : (
            <div className="ord-track-steps">
              {TRACKING_STEPS.map((s, i) => {
                const sCfg = STATUS_CONFIG[s];
                const SIcon = sCfg.icon;
                const done = currentStep > i;
                const active = currentStep === i;
                return (
                  <React.Fragment key={s}>
                    <div className={`ord-track-step ${done ? 'done' : active ? 'active' : ''}`}>
                      <div className="ord-track-step-circle">
                        {done ? <FiCheck size={14} /> : <SIcon size={14} />}
                      </div>
                      <span className="ord-track-step-label">{sCfg.label}</span>
                    </div>
                    {i < TRACKING_STEPS.length - 1 && (
                      <div className={`ord-track-line ${done ? 'done' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Estimated delivery */}
          {order.estimatedDelivery && order.status !== 'delivered' && (
            <div className="ord-track-eta">
              <FiTruck className="ord-track-eta-icon" />
              Estimated delivery:{' '}
              <strong>
                {new Date(order.estimatedDelivery).toLocaleDateString('en-NG', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </strong>
            </div>
          )}

          {order.status === 'delivered' && (
            <div className="ord-track-delivered">
              <FiCheck /> Delivered on{' '}
              {new Date(order.deliveredAt).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
          )}
        </div>

        <div className="ord-detail-grid">

          {/* ---- Left column ---- */}
          <div className="ord-detail-left">

            {/* Timeline */}
            <div className="ord-timeline-card">
              <h3 className="ord-section-title">Order Timeline</h3>
              <div className="ord-timeline">
                {[...(order.deliveryTracking || [])].reverse().map((t, i) => (
                  <div key={i} className="ord-timeline-item">
                    <div className={`ord-timeline-dot ${i === 0 ? 'latest' : ''}`} />
                    <div className="ord-timeline-content">
                      <div className="ord-timeline-status">
                        {t.status?.replace(/_/g, ' ')}
                      </div>
                      <div className="ord-timeline-msg">{t.message}</div>
                      {t.location && (
                        <div className="ord-timeline-loc">
                          <FiMapPin size={12} /> {t.location}
                        </div>
                      )}
                      <div className="ord-timeline-time">
                        {new Date(t.timestamp).toLocaleString('en-NG', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order items */}
            <div className="ord-items-card">
              <h3 className="ord-section-title">Items Ordered</h3>
              {order.items?.map((item, i) => (
                <div key={i} className="ord-detail-item">
                  <img
                    src={item.image || 'https://via.placeholder.com/70x70?text=+'}
                    alt={item.name}
                    className="ord-detail-item-img"
                  />
                  <div className="ord-detail-item-info">
                    <span className="ord-detail-item-name">{item.name}</span>
                    <span className="ord-detail-item-sku">SKU: {item.sku}</span>
                    <span className="ord-detail-item-unit">
                      ₦{item.price?.toLocaleString()} each
                    </span>
                  </div>
                  <div className="ord-detail-item-right">
                    <span className="ord-detail-item-qty">x{item.quantity}</span>
                    <span className="ord-detail-item-sub">
                      ₦{((item.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="ord-totals">
                {[
                  ['Subtotal',  `₦${order.subtotal?.toLocaleString()}`],
                  ['Shipping',  order.shippingCost === 0 ? 'FREE' : `₦${order.shippingCost?.toLocaleString()}`],
                  ['VAT (7.5%)', `₦${Math.round(order.tax || 0).toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} className="ord-total-row">
                    <span>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div className="ord-total-row grand">
                  <span>Total Paid</span>
                  <span>₦{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Right column ---- */}
          <div className="ord-detail-right">

            {/* Delivery address */}
            <div className="ord-info-card">
              <h3 className="ord-section-title">
                <FiMapPin className="ord-section-icon" /> Delivery Address
              </h3>
              <div className="ord-address">
                <p><strong>{order.shippingAddress?.name}</strong></p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.country}</p>
                <p className="ord-address-phone">
                  <FiPhone size={13} /> {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            {/* Payment info */}
            <div className="ord-info-card">
              <h3 className="ord-section-title">Payment Info</h3>
              <div className="ord-payment-info">
                <div className="ord-payment-row">
                  <span>Method</span>
                  <span>{{
                    stripe: '💳 Card',
                    bank_transfer: '🏦 Bank Transfer',
                    cash_on_delivery: '💵 Cash on Delivery',
                    whatsapp_pay: '📱 WhatsApp Pay',
                  }[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                <div className="ord-payment-row">
                  <span>Status</span>
                  <span className={`ord-pay-status ${order.paymentStatus}`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Need help */}
            <div className="ord-help-card">
              <h3 className="ord-section-title">Need Help?</h3>
              <p className="ord-help-text">
                Questions about your order? Chat with us on WhatsApp and we'll respond instantly.
              </p>
              <a
                href={`https://wa.me/2348000000000?text=Hi! I need help with order %23${order.orderNumber}`}
                target="_blank" rel="noreferrer"
                className="ord-whatsapp-help-btn"
              >
                <FaWhatsapp /> Chat on WhatsApp
              </a>
              {['pending', 'confirmed'].includes(order.status) && (
                <a
                  href={`https://wa.me/2348000000000?text=Hi, I'd like to cancel order %23${order.orderNumber}`}
                  target="_blank" rel="noreferrer"
                  className="ord-cancel-btn"
                >
                  Request Cancellation
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}