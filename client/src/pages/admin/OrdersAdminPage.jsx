import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX, FiEye, FiEdit2,
  FiTruck, FiCheck, FiClock, FiPackage, FiRefreshCw,
  FiMapPin, FiPhone, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../../styles/AdminOrders.css';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: '#d97706', bg: '#fef3c7', icon: FiClock     },
  confirmed:        { label: 'Confirmed',         color: '#1d4ed8', bg: '#dbeafe', icon: FiCheck     },
  processing:       { label: 'Processing',        color: '#7c3aed', bg: '#ede9fe', icon: FiRefreshCw },
  packed:           { label: 'Packed',            color: '#0369a1', bg: '#e0f2fe', icon: FiPackage   },
  shipped:          { label: 'Shipped',           color: '#15803d', bg: '#f0fdf4', icon: FiTruck     },
  out_for_delivery: { label: 'Out for Delivery',  color: '#059669', bg: '#ecfdf5', icon: FiTruck     },
  delivered:        { label: 'Delivered',         color: '#16a34a', bg: '#dcfce7', icon: FiCheck     },
  cancelled:        { label: 'Cancelled',         color: '#dc2626', bg: '#fee2e2', icon: FiX         },
  refunded:         { label: 'Refunded',          color: '#6b7280', bg: '#f3f4f6', icon: FiRefreshCw },
};

const STATUS_FLOW = [
  'pending','confirmed','processing','packed','shipped','out_for_delivery','delivered'
];

const PAYMENT_STATUS = {
  pending:  { label: 'Pending',  color: '#d97706', bg: '#fef3c7' },
  paid:     { label: 'Paid',     color: '#16a34a', bg: '#dcfce7' },
  failed:   { label: 'Failed',   color: '#dc2626', bg: '#fee2e2' },
  refunded: { label: 'Refunded', color: '#6b7280', bg: '#f3f4f6' },
};

export default function OrdersAdminPage() {
  const [orders, setOrders]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const LIMIT = 20;

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (statusFilter) params.append('status', statusFilter);
    if (search)       params.append('search', search);
    axios.get(`/api/orders?${params}`)
      .then(r => { setOrders(r.data.orders || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);
  useEffect(() => {
    const t = setTimeout(fetchOrders, 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await axios.put(`/api/orders/${orderId}/status`, {
        status,
        message: `Order ${STATUS_CONFIG[status]?.label || status}`
      });
      toast.success(`Status updated to ${STATUS_CONFIG[status]?.label}`);
      fetchOrders();
      setExpanded(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setUpdating(null);
  };

  const pages = Math.ceil(total / LIMIT);

  const STATUS_TABS = ['', ...Object.keys(STATUS_CONFIG)];

  return (
    <div className="adm-ord-page">

      {/* Top bar */}
      <div className="adm-ord-topbar">
        <div className="adm-ord-topbar-left">
          <div>
            <h1 className="adm-ord-title">Orders</h1>
            <p className="adm-ord-sub">{total} total orders</p>
          </div>
        </div>
        <div className="adm-ord-topbar-stats">
          {['pending','processing','shipped'].map(s => {
            const cnt = orders.filter(o => o.status === s).length;
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="adm-ord-quick-stat"
                style={{ background: cfg.bg, color: cfg.color }}
                onClick={() => setStatusFilter(s)}>
                <span className="adm-ord-qs-count">{cnt}</span>
                <span className="adm-ord-qs-label">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status tabs */}
      <div className="adm-ord-status-tabs">
        {STATUS_TABS.map(s => (
          <button
            key={s || 'all'}
            className={`adm-ord-status-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s ? STATUS_CONFIG[s]?.label : 'All Orders'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="adm-ord-search-wrap">
        <div className="adm-ord-search">
          <FiSearch className="adm-ord-search-icon" />
          <input
            className="adm-ord-search-input"
            placeholder="Search by order number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button className="adm-ord-search-clear" onClick={() => setSearch('')}>
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="adm-ord-loading"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="adm-ord-empty">
          <FiPackage className="adm-ord-empty-icon" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="adm-ord-list">
          {orders.map(order => {
            const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const payCfg = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;
            const Icon   = cfg.icon;
            const isExp  = expanded === order._id;
            const curIdx = STATUS_FLOW.indexOf(order.status);

            return (
              <div key={order._id} className="adm-ord-card">

                {/* Card header */}
                <div
                  className="adm-ord-card-head"
                  onClick={() => setExpanded(isExp ? null : order._id)}
                >
                  {/* Left */}
                  <div className="adm-ord-card-left">
                    <div className="adm-ord-num">#{order.orderNumber}</div>
                    <div className="adm-ord-meta">
                      <span>{order.user?.name || 'Customer'}</span>
                      <span className="adm-ord-meta-sep">·</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}</span>
                      <span className="adm-ord-meta-sep">·</span>
                      <span>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="adm-ord-card-right">
                    <span className="adm-ord-status-badge"
                      style={{ color: cfg.color, background: cfg.bg }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    <span className="adm-ord-pay-badge"
                      style={{ color: payCfg.color, background: payCfg.bg }}>
                      {payCfg.label}
                    </span>
                    <span className="adm-ord-total">
                      ₦{order.total?.toLocaleString()}
                    </span>
                    <button className="adm-ord-toggle">
                      {isExp ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>

                {/* Item thumbnails */}
                <div className="adm-ord-thumbs-row">
                  {order.items?.slice(0, 5).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || 'https://via.placeholder.com/40x40?text=+'}
                      alt={item.name}
                      className="adm-ord-thumb"
                      title={item.name}
                    />
                  ))}
                  {order.items?.length > 5 && (
                    <div className="adm-ord-thumb-more">+{order.items.length - 5}</div>
                  )}
                  <div className="adm-ord-payment-method">
                    {{
                      stripe:            '💳 Card',
                      bank_transfer:     '🏦 Bank Transfer',
                      cash_on_delivery:  '💵 COD',
                      whatsapp_pay:      '📱 WhatsApp Pay',
                    }[order.paymentMethod] || order.paymentMethod}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExp && (
                  <div className="adm-ord-expanded">
                    <div className="adm-ord-expanded-grid">

                      {/* Left: Items + Totals */}
                      <div className="adm-ord-expanded-left">
                        <h4 className="adm-ord-expanded-title">Items Ordered</h4>
                        <div className="adm-ord-items">
                          {order.items?.map((item, i) => (
                            <div key={i} className="adm-ord-item">
                              <img
                                src={item.image || 'https://via.placeholder.com/48x48?text=+'}
                                alt={item.name}
                                className="adm-ord-item-img"
                              />
                              <div className="adm-ord-item-info">
                                <div className="adm-ord-item-name">{item.name}</div>
                                <div className="adm-ord-item-sku">SKU: {item.sku}</div>
                              </div>
                              <div className="adm-ord-item-right">
                                <div className="adm-ord-item-qty">×{item.quantity}</div>
                                <div className="adm-ord-item-sub">
                                  ₦{((item.price || 0) * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="adm-ord-totals">
                          {[
                            ['Subtotal',   `₦${order.subtotal?.toLocaleString()}`],
                            ['Shipping',   order.shippingCost === 0 ? 'FREE' : `₦${order.shippingCost?.toLocaleString()}`],
                            ['VAT',        `₦${Math.round(order.tax || 0).toLocaleString()}`],
                          ].map(([k, v]) => (
                            <div key={k} className="adm-ord-total-row">
                              <span>{k}</span><span>{v}</span>
                            </div>
                          ))}
                          <div className="adm-ord-total-row grand">
                            <span>Total</span>
                            <span>₦{order.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Customer + Status Update */}
                      <div className="adm-ord-expanded-right">

                        {/* Customer info */}
                        <div className="adm-ord-cust-card">
                          <h4 className="adm-ord-expanded-title">Customer</h4>
                          <div className="adm-ord-cust-name">{order.user?.name}</div>
                          <div className="adm-ord-cust-email">{order.user?.email}</div>
                          {order.user?.phone && (
                            <a href={`tel:${order.user.phone}`} className="adm-ord-cust-phone">
                              <FiPhone size={13} /> {order.user.phone}
                            </a>
                          )}
                          {order.user?.whatsappNumber && (
                            <a
                              href={`https://wa.me/${order.user.whatsappNumber.replace(/\D/g,'')}`}
                              target="_blank" rel="noreferrer"
                              className="adm-ord-wa-btn"
                            >
                              <FaWhatsapp /> WhatsApp Customer
                            </a>
                          )}
                        </div>

                        {/* Delivery address */}
                        <div className="adm-ord-addr-card">
                          <h4 className="adm-ord-expanded-title">
                            <FiMapPin size={13} /> Delivery Address
                          </h4>
                          <p>{order.shippingAddress?.name}</p>
                          <p>{order.shippingAddress?.street}</p>
                          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                          <p>{order.shippingAddress?.country}</p>
                          {order.shippingAddress?.phone && (
                            <p className="adm-ord-addr-phone">
                              <FiPhone size={12} /> {order.shippingAddress.phone}
                            </p>
                          )}
                        </div>

                        {/* Status update */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <div className="adm-ord-status-update">
                            <h4 className="adm-ord-expanded-title">Update Status</h4>

                            {/* Progress dots */}
                            <div className="adm-ord-progress">
                              {STATUS_FLOW.map((s, i) => {
                                const sCfg = STATUS_CONFIG[s];
                                const done   = i < curIdx;
                                const active = i === curIdx;
                                return (
                                  <React.Fragment key={s}>
                                    <div className={`adm-ord-prog-dot ${done ? 'done' : active ? 'active' : ''}`}
                                      title={sCfg.label}>
                                      {done ? <FiCheck size={10} /> : <sCfg.icon size={10} />}
                                    </div>
                                    {i < STATUS_FLOW.length - 1 && (
                                      <div className={`adm-ord-prog-line ${done ? 'done' : ''}`} />
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* Next status button */}
                            <div className="adm-ord-status-btns">
                              {curIdx < STATUS_FLOW.length - 1 && (
                                <button
                                  className="adm-ord-next-btn"
                                  onClick={() => updateStatus(order._id, STATUS_FLOW[curIdx + 1])}
                                  disabled={updating === order._id}
                                >
                                  {updating === order._id ? 'Updating...' : (
                                    <>Mark as {STATUS_CONFIG[STATUS_FLOW[curIdx + 1]]?.label} →</>
                                  )}
                                </button>
                              )}
                              {!['cancelled','delivered'].includes(order.status) && (
                                <button
                                  className="adm-ord-cancel-btn"
                                  onClick={() => updateStatus(order._id, 'cancelled')}
                                  disabled={updating === order._id}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>

                            {/* Custom status select */}
                            <div className="adm-ord-custom-status">
                              <label className="adm-ord-custom-label">Jump to status:</label>
                              <select
                                className="adm-ord-custom-select"
                                value={order.status}
                                onChange={e => updateStatus(order._id, e.target.value)}
                                disabled={updating === order._id}
                              >
                                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Order notes */}
                        {order.notes && (
                          <div className="adm-ord-notes">
                            <h4 className="adm-ord-expanded-title">Delivery Note</h4>
                            <p>{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    {order.deliveryTracking?.length > 0 && (
                      <div className="adm-ord-timeline">
                        <h4 className="adm-ord-expanded-title">Order Timeline</h4>
                        <div className="adm-ord-timeline-list">
                          {[...order.deliveryTracking].reverse().map((t, i) => (
                            <div key={i} className="adm-ord-timeline-item">
                              <div className={`adm-ord-timeline-dot ${i === 0 ? 'latest' : ''}`} />
                              <div className="adm-ord-timeline-body">
                                <span className="adm-ord-timeline-status">
                                  {t.status?.replace(/_/g, ' ')}
                                </span>
                                <span className="adm-ord-timeline-msg">{t.message}</span>
                                <span className="adm-ord-timeline-time">
                                  {new Date(t.timestamp).toLocaleString('en-NG', {
                                    day: 'numeric', month: 'short',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="adm-ord-pagination">
          <button className="adm-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Prev
          </button>
          {[...Array(Math.min(pages, 8))].map((_, i) => (
            <button key={i}
              className={`adm-page-btn ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button className="adm-page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}