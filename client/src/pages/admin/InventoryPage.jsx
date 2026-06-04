import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiX, FiAlertTriangle,
  FiPackage, FiTrendingDown, FiTrendingUp, FiBarChart2,
  FiRefreshCw, FiCamera, FiFilter, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/AdminInventory.css';

const ADJUSTMENT_TYPES = [
  { value: 'stock_in',    label: 'Stock In',          color: '#16a34a', desc: 'Received from supplier' },
  { value: 'stock_out',   label: 'Stock Out',          color: '#dc2626', desc: 'Manual removal'         },
  { value: 'adjustment',  label: 'Manual Adjustment',  color: '#d97706', desc: 'Set exact stock count'  },
  { value: 'return',      label: 'Customer Return',    color: '#1d4ed8', desc: 'Returned by customer'   },
  { value: 'damage',      label: 'Damage / Loss',      color: '#7c3aed', desc: 'Damaged or lost stock'  },
];

const API_URL = process.env.REACT_APP_API_URL;


const TYPE_BADGE = {
  stock_in:   { bg: '#dcfce7', color: '#16a34a' },
  stock_out:  { bg: '#fee2e2', color: '#dc2626' },
  adjustment: { bg: '#fef3c7', color: '#d97706' },
  return:     { bg: '#dbeafe', color: '#1d4ed8' },
  damage:     { bg: '#ede9fe', color: '#7c3aed' },
};

export default function InventoryPage() {
  const [tab, setTab]               = useState('dashboard');
  const [stats, setStats]           = useState({});
  const [logs, setLogs]             = useState([]);
  const [lowStock, setLowStock]     = useState([]);
  const [products, setProducts]     = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [logFilter, setLogFilter]   = useState('');
  const [logPage, setLogPage]       = useState(1);
  const [logTotal, setLogTotal]     = useState(0);
  const [barcodeVal, setBarcodeVal] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);
  const barcodeRef = useRef(null);
  const LOG_LIMIT = 20;

  /* ---- Load dashboard ---- */
  const loadDashboard = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_URL}/api/inventory/dashboard`),
      axios.get(`${API_URL}/api/products?limit=200`),
      axios.get(`${API_URL}/api/suppliers`),
    ]).then(([dashRes, prodRes, supRes]) => {
      setStats(dashRes.data.stats || {});
      setLogs(dashRes.data.recentLogs || []);
      setLowStock(dashRes.data.recentLogs
        ? [] // low stock comes from products
        : []);
      setProducts(prodRes.data.products || []);
      setSuppliers(supRes.data.suppliers || []);
    }).catch(() => toast.error('Failed to load inventory data'))
      .finally(() => setLoading(false));
  };

  /* ---- Load low stock separately ---- */
  const loadLowStock = () => {
    axios.get(`${API_URL}/api/products/low-stock`)
      .then(r => setLowStock(r.data.products || []))
      .catch(() => {});
  };

  /* ---- Load logs with filter ---- */
  const loadLogs = () => {
    setLogsLoading(true);
    const params = new URLSearchParams({ page: logPage, limit: LOG_LIMIT });
    if (logFilter) params.append('type', logFilter);
    axios.get(`${API_URL}/api/inventory?${params}`)
      .then(r => { setLogs(r.data.logs || []); setLogTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLogsLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    loadLowStock();
  }, []);

  useEffect(() => {
    if (tab === 'logs') loadLogs();
  }, [tab, logFilter, logPage]);

  /* ---- Barcode search ---- */
  const searchBarcode = async () => {
    if (!barcodeVal.trim()) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/inventory/barcode/${barcodeVal.trim()}`);
      setBarcodeResult(data.product);
      toast.success(`Found: ${data.product.name}`);
    } catch {
      setBarcodeResult(null);
      toast.error('Product not found for this barcode');
    }
  };

  /* ---- Dashboard stat cards ---- */
  const statCards = [
    { label: 'Total Products',     value: stats.totalProducts || 0,    icon: FiPackage,     color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Low Stock Items',    value: stats.lowStock || 0,          icon: FiAlertTriangle,color: '#d97706', bg: '#fef3c7' },
    { label: 'Out of Stock',       value: stats.outOfStock || 0,        icon: FiTrendingDown, color: '#dc2626', bg: '#fee2e2' },
    { label: 'Inventory Value',    value: stats.totalInventoryValue
      ? `₦${(stats.totalInventoryValue/1000000).toFixed(1)}M`
      : '—',                                                             icon: FiBarChart2,   color: '#d4af37', bg: '#fbf5e0' },
  ];

  const logPages = Math.ceil(logTotal / LOG_LIMIT);

  return (
    <div className="inv-page">

      {/* Top bar */}
      <div className="inv-topbar">
        <div className="inv-topbar-left">
          <div>
            <h1 className="inv-title">Inventory</h1>
            <p className="inv-sub">Track stock, adjust quantities, scan barcodes</p>
          </div>
        </div>
        <div className="inv-topbar-actions">
          <button className="inv-refresh-btn" onClick={() => { loadDashboard(); loadLowStock(); }}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="inv-adjust-btn" onClick={() => setShowAdjust(true)}>
            <FiPlus /> Stock Adjustment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inv-tabs">
        {[
          { id: 'dashboard', label: 'Dashboard'    },
          { id: 'lowstock',  label: `Low Stock (${lowStock.length})` },
          { id: 'barcode',   label: 'Barcode Scan' },
          { id: 'logs',      label: 'Activity Log' },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`inv-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================================================================
          TAB: DASHBOARD
          ================================================================ */}
      {tab === 'dashboard' && (
        <div className="inv-dashboard">
          {loading ? (
            <div className="inv-loading"><div className="spinner" /></div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="inv-stat-grid">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="inv-stat-card">
                    <div className="inv-stat-icon-wrap" style={{ background: bg }}>
                      <Icon style={{ color, fontSize: 22 }} />
                    </div>
                    <div className="inv-stat-val">{value}</div>
                    <div className="inv-stat-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="inv-recent-card">
                <div className="inv-recent-head">
                  <h3>Recent Inventory Activity</h3>
                  <button className="inv-see-all-btn" onClick={() => setTab('logs')}>
                    View All →
                  </button>
                </div>
                {logs.length === 0 ? (
                  <p className="inv-no-data">No recent activity</p>
                ) : (
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Stock Change</th>
                        <th>Reason</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 10).map(log => {
                        const tbadge = TYPE_BADGE[log.type] || TYPE_BADGE.adjustment;
                        return (
                          <tr key={log._id}>
                            <td>
                              <div className="inv-log-product">{log.product?.name || '—'}</div>
                              <div className="inv-log-sku">{log.product?.sku}</div>
                            </td>
                            <td>
                              <span className="inv-type-badge"
                                style={{ background: tbadge.bg, color: tbadge.color }}>
                                {log.type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="inv-log-qty">{log.quantity}</td>
                            <td className="inv-log-change">
                              {log.previousStock ?? '—'} → {log.newStock ?? '—'}
                            </td>
                            <td className="inv-log-reason">{log.reason || '—'}</td>
                            <td className="inv-log-date">
                              {new Date(log.createdAt).toLocaleDateString('en-NG', {
                                day: 'numeric', month: 'short'
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================================================================
          TAB: LOW STOCK
          ================================================================ */}
      {tab === 'lowstock' && (
        <div className="inv-lowstock">
          {lowStock.length === 0 ? (
            <div className="inv-empty-state">
              <span className="inv-empty-icon">✅</span>
              <h3>All products well stocked!</h3>
              <p>No items are below their low stock threshold.</p>
            </div>
          ) : (
            <>
              <div className="inv-lowstock-header">
                <p>{lowStock.length} product{lowStock.length !== 1 ? 's' : ''} need restocking</p>
                <button className="inv-adjust-btn" onClick={() => setShowAdjust(true)}>
                  <FiPlus /> Adjust Stock
                </button>
              </div>
              <div className="inv-lowstock-grid">
                {lowStock.map(p => (
                  <div key={p._id} className={`inv-lowstock-card ${p.stock === 0 ? 'out' : 'low'}`}>
                    <div className="inv-lowstock-card-head">
                      <img
                        src={p.images?.[0]?.url || 'https://via.placeholder.com/56x56?text=+'}
                        alt={p.name}
                        className="inv-lowstock-img"
                      />
                      <div className="inv-lowstock-info">
                        <div className="inv-lowstock-name">{p.name}</div>
                        <div className="inv-lowstock-sku">SKU: {p.sku}</div>
                        <div className="inv-lowstock-cat">{p.category}</div>
                      </div>
                      <div className={`inv-lowstock-count ${p.stock === 0 ? 'red' : 'amber'}`}>
                        {p.stock}
                        <span>units</span>
                      </div>
                    </div>
                    <div className="inv-lowstock-bar-wrap">
                      <div
                        className="inv-lowstock-bar"
                        style={{
                          width: `${Math.min((p.stock / (p.lowStockThreshold * 2)) * 100, 100)}%`,
                          background: p.stock === 0 ? '#ef4444' : '#f59e0b'
                        }}
                      />
                    </div>
                    <div className="inv-lowstock-footer">
                      <span>Threshold: {p.lowStockThreshold} units</span>
                      {p.supplier && (
                        <span className="inv-lowstock-supplier">
                          Supplier: {p.supplier.name}
                        </span>
                      )}
                      <button
                        className="inv-restock-btn"
                        onClick={() => { setShowAdjust(true); }}
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================================================================
          TAB: BARCODE
          ================================================================ */}
      {tab === 'barcode' && (
        <div className="inv-barcode-tab">
          <div className="inv-barcode-card">
            <div className="inv-barcode-header">
              <FiCamera className="inv-barcode-camera-icon" />
              <div>
                <h3>Barcode Scanner</h3>
                <p>Type or scan a product barcode to look up stock information instantly</p>
              </div>
            </div>

            <div className="inv-barcode-input-row">
              <input
                ref={barcodeRef}
                className="inv-barcode-input"
                value={barcodeVal}
                onChange={e => setBarcodeVal(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && searchBarcode()}
                placeholder="Scan barcode or type manually..."
                autoFocus
              />
              <button className="inv-barcode-search-btn" onClick={searchBarcode}>
                Search
              </button>
              <button className="inv-barcode-clear-btn" onClick={() => { setBarcodeVal(''); setBarcodeResult(null); barcodeRef.current?.focus(); }}>
                <FiX />
              </button>
            </div>

            <p className="inv-barcode-hint">
              💡 Press Enter or click Search. Connect a USB barcode scanner for faster lookup.
            </p>
          </div>

          {/* Barcode result */}
          {barcodeResult && (
            <div className="inv-barcode-result">
              <div className="inv-barcode-result-head">
                <img
                  src={barcodeResult.images?.[0]?.url || 'https://via.placeholder.com/80x80?text=+'}
                  alt={barcodeResult.name}
                  className="inv-barcode-result-img"
                />
                <div className="inv-barcode-result-info">
                  <div className="inv-barcode-result-name">{barcodeResult.name}</div>
                  <div className="inv-barcode-result-meta">SKU: {barcodeResult.sku}</div>
                  <div className="inv-barcode-result-meta">Category: {barcodeResult.category}</div>
                  <div className="inv-barcode-result-meta">Barcode: {barcodeResult.barcode}</div>
                </div>
              </div>

              <div className="inv-barcode-result-stats">
                <div className={`inv-barcode-stat ${
                  barcodeResult.stock === 0 ? 'out' :
                  barcodeResult.stock <= barcodeResult.lowStockThreshold ? 'low' : 'ok'
                }`}>
                  <div className="inv-barcode-stat-val">{barcodeResult.stock}</div>
                  <div className="inv-barcode-stat-label">Current Stock</div>
                </div>
                <div className="inv-barcode-stat neutral">
                  <div className="inv-barcode-stat-val">{barcodeResult.lowStockThreshold}</div>
                  <div className="inv-barcode-stat-label">Low Stock Alert</div>
                </div>
                <div className="inv-barcode-stat neutral">
                  <div className="inv-barcode-stat-val">₦{barcodeResult.price?.toLocaleString()}</div>
                  <div className="inv-barcode-stat-label">Sell Price</div>
                </div>
                <div className="inv-barcode-stat neutral">
                  <div className="inv-barcode-stat-val">{barcodeResult.warehouseLocation || '—'}</div>
                  <div className="inv-barcode-stat-label">Location</div>
                </div>
              </div>

              <button
                className="inv-adjust-btn"
                style={{ marginTop: '16px', width: '100%' }}
                onClick={() => setShowAdjust(true)}
              >
                <FiPlus /> Adjust Stock for This Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================================
          TAB: ACTIVITY LOG
          ================================================================ */}
      {tab === 'logs' && (
        <div className="inv-logs-tab">
          {/* Filter */}
          <div className="inv-logs-filter-row">
            <select
              className="inv-logs-filter"
              value={logFilter}
              onChange={e => { setLogFilter(e.target.value); setLogPage(1); }}
            >
              <option value="">All Types</option>
              {ADJUSTMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="inv-logs-count">{logTotal} records</span>
          </div>

          {logsLoading ? (
            <div className="inv-loading"><div className="spinner" /></div>
          ) : logs.length === 0 ? (
            <div className="inv-empty-state">
              <span className="inv-empty-icon">📋</span>
              <h3>No activity logs</h3>
              <p>Stock adjustments will appear here.</p>
            </div>
          ) : (
            <>
              <div className="inv-logs-table-wrap">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Stock</th>
                      <th>Reason</th>
                      <th>Location</th>
                      <th>By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const tbadge = TYPE_BADGE[log.type] || TYPE_BADGE.adjustment;
                      return (
                        <tr key={log._id}>
                          <td>
                            <div className="inv-log-product">{log.product?.name || '—'}</div>
                            <div className="inv-log-sku">{log.product?.sku}</div>
                          </td>
                          <td>
                            <span className="inv-type-badge"
                              style={{ background: tbadge.bg, color: tbadge.color }}>
                              {log.type?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span className={`inv-log-qty-badge ${
                              ['stock_in','return'].includes(log.type) ? 'positive' : 'negative'
                            }`}>
                              {['stock_in','return'].includes(log.type) ? '+' : '-'}{log.quantity}
                            </span>
                          </td>
                          <td className="inv-log-change">
                            {log.previousStock ?? '—'} → {log.newStock ?? '—'}
                          </td>
                          <td className="inv-log-reason">{log.reason || '—'}</td>
                          <td className="inv-log-location">{log.warehouseLocation || '—'}</td>
                          <td className="inv-log-by">{log.performedBy?.name || 'System'}</td>
                          <td className="inv-log-date">
                            {new Date(log.createdAt).toLocaleString('en-NG', {
                              day: 'numeric', month: 'short',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logPages > 1 && (
                <div className="inv-log-pagination">
                  <button className="adm-page-btn" disabled={logPage === 1}
                    onClick={() => setLogPage(p => p - 1)}>← Prev</button>
                  {[...Array(Math.min(logPages, 8))].map((_, i) => (
                    <button key={i}
                      className={`adm-page-btn ${logPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setLogPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                  <button className="adm-page-btn" disabled={logPage === logPages}
                    onClick={() => setLogPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjust && (
        <AdjustmentModal
          products={products}
          suppliers={suppliers}
          preselectedProduct={barcodeResult}
          onClose={() => setShowAdjust(false)}
          onSaved={() => {
            setShowAdjust(false);
            loadDashboard();
            loadLowStock();
            if (tab === 'logs') loadLogs();
            toast.success('Stock adjusted successfully!');
          }}
        />
      )}
    </div>
  );
}

/* ================================================================
   ADJUSTMENT MODAL
   ================================================================ */
function AdjustmentModal({ products, suppliers, preselectedProduct, onClose, onSaved }) {
  const [form, setForm] = useState({
    product:           preselectedProduct?._id || '',
    type:              'stock_in',
    quantity:          '',
    reason:            '',
    purchasePrice:     '',
    warehouseLocation: '',
    notes:             '',
    supplier:          '',
    batchNumber:       '',
  });
  const [saving, setSaving] = useState(false);
  const [selectedProd, setSelectedProd] = useState(preselectedProduct || null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleProductChange = (id) => {
    set('product', id);
    setSelectedProd(products.find(p => p._id === id) || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.quantity) {
      toast.error('Select a product and enter quantity'); return;
    }
    if (Number(form.quantity) <= 0) {
      toast.error('Quantity must be greater than 0'); return;
    }
    setSaving(true);
    try {
      await axios.post('/api/inventory/adjust', {
        ...form,
        quantity: Number(form.quantity),
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    }
    setSaving(false);
  };

  const typeConfig = ADJUSTMENT_TYPES.find(t => t.value === form.type);
  const newStock = selectedProd ? (() => {
    const qty = Number(form.quantity) || 0;
    const cur = selectedProd.stock || 0;
    if (form.type === 'adjustment') return qty;
    if (['stock_in','return'].includes(form.type)) return cur + qty;
    return Math.max(0, cur - qty);
  })() : null;

  return (
    <div className="adj-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adj-modal">
        <div className="adj-modal-head">
          <h2>Stock Adjustment</h2>
          <button className="sup-modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form className="adj-form" onSubmit={handleSubmit}>
          <div className="adj-body">

            {/* Product selector */}
            <div className="adj-field">
              <label className="adj-label">Product *</label>
              <select className="adj-input" value={form.product}
                onChange={e => handleProductChange(e.target.value)} required>
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} — Stock: {p.stock} (SKU: {p.sku})
                  </option>
                ))}
              </select>
            </div>

            {/* Current stock display */}
            {selectedProd && (
              <div className="adj-current-stock">
                <div className="adj-stock-item">
                  <span className="adj-stock-label">Current Stock</span>
                  <span className={`adj-stock-val ${
                    selectedProd.stock === 0 ? 'red' :
                    selectedProd.stock <= selectedProd.lowStockThreshold ? 'amber' : 'green'
                  }`}>{selectedProd.stock} units</span>
                </div>
                {newStock !== null && form.quantity && (
                  <div className="adj-stock-item">
                    <span className="adj-stock-label">After Adjustment</span>
                    <span className={`adj-stock-val ${
                      newStock === 0 ? 'red' :
                      newStock <= selectedProd.lowStockThreshold ? 'amber' : 'green'
                    }`}>{newStock} units</span>
                  </div>
                )}
              </div>
            )}

            {/* Adjustment type */}
            <div className="adj-field">
              <label className="adj-label">Adjustment Type *</label>
              <div className="adj-type-grid">
                {ADJUSTMENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`adj-type-btn ${form.type === t.value ? 'active' : ''}`}
                    style={form.type === t.value ? { borderColor: t.color, background: `${t.color}15` } : {}}
                    onClick={() => set('type', t.value)}
                  >
                    <span className="adj-type-label" style={form.type === t.value ? { color: t.color } : {}}>
                      {t.label}
                    </span>
                    <span className="adj-type-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="adj-form-row">
              <div className="adj-field">
                <label className="adj-label">
                  {form.type === 'adjustment' ? 'New Stock Count *' : 'Quantity *'}
                </label>
                <input className="adj-input" type="number" min="1" value={form.quantity}
                  onChange={e => set('quantity', e.target.value)} required
                  placeholder={form.type === 'adjustment' ? 'Set exact stock to...' : 'Enter quantity'} />
              </div>
              {form.type === 'stock_in' && (
                <div className="adj-field">
                  <label className="adj-label">Purchase Price (₦)</label>
                  <input className="adj-input" type="number" min="0" value={form.purchasePrice}
                    onChange={e => set('purchasePrice', e.target.value)}
                    placeholder="Cost per unit" />
                </div>
              )}
            </div>

            {/* Row 2 */}
            <div className="adj-form-row">
              <div className="adj-field">
                <label className="adj-label">Reason</label>
                <input className="adj-input" value={form.reason}
                  onChange={e => set('reason', e.target.value)}
                  placeholder="e.g. Monthly cycle count, Supplier delivery" />
              </div>
              <div className="adj-field">
                <label className="adj-label">Warehouse Location</label>
                <input className="adj-input" value={form.warehouseLocation}
                  onChange={e => set('warehouseLocation', e.target.value)}
                  placeholder="e.g. Rack A-12, Shelf 3" />
              </div>
            </div>

            {/* Supplier (stock_in only) */}
            {form.type === 'stock_in' && suppliers.length > 0 && (
              <div className="adj-form-row">
                <div className="adj-field">
                  <label className="adj-label">Supplier</label>
                  <select className="adj-input" value={form.supplier}
                    onChange={e => set('supplier', e.target.value)}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="adj-field">
                  <label className="adj-label">Batch Number</label>
                  <input className="adj-input" value={form.batchNumber}
                    onChange={e => set('batchNumber', e.target.value)}
                    placeholder="e.g. BATCH-2024-001" />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="adj-field">
              <label className="adj-label">Additional Notes</label>
              <textarea className="adj-input adj-textarea" value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any additional information about this adjustment..." />
            </div>

            {/* Preview */}
            {selectedProd && form.quantity && (
              <div className="adj-preview" style={{ borderColor: typeConfig?.color }}>
                <div className="adj-preview-icon" style={{ background: `${typeConfig?.color}20`, color: typeConfig?.color }}>
                  {['stock_in','return'].includes(form.type) ? <FiTrendingUp /> : <FiTrendingDown />}
                </div>
                <div>
                  <div className="adj-preview-title" style={{ color: typeConfig?.color }}>
                    {typeConfig?.label}
                  </div>
                  <div className="adj-preview-desc">
                    {selectedProd.name}: {selectedProd.stock} → <strong>{newStock}</strong> units
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="adj-footer">
            <button type="button" className="adm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}