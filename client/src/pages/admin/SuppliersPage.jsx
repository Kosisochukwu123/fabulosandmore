import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiX, FiEdit2,
  FiTrash2, FiPhone, FiMail, FiMapPin, FiStar,
  FiPackage, FiDollarSign, FiTruck, FiUser
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../../styles/AdminSuppliers.css';

const EMPTY_FORM = {
  name: '', email: '', phone: '', whatsapp: '',
  contactPerson: '', address: { street: '', city: '', state: '', country: 'Nigeria' },
  leadTimeDays: 7, minimumOrderValue: 0, paymentTerms: '', rating: 5, notes: ''
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);

  const fetchSuppliers = () => {
    setLoading(true);
    axios.get('/api/suppliers')
      .then(r => setSuppliers(r.data.suppliers || []))
      .catch(() => toast.error('Failed to load suppliers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const filtered = suppliers.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew   = () => { setEditSupplier(null); setShowForm(true); };
  const openEdit  = (s) => { setEditSupplier(s);  setShowForm(true); };
  const openView  = (s) => setViewSupplier(s);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this supplier?')) return;
    try {
      await axios.delete(`/api/suppliers/${id}`);
      toast.success('Supplier deactivated');
      fetchSuppliers();
    } catch { toast.error('Failed'); }
  };

  /* ---- Summary stats ---- */
  const stats = [
    { label: 'Total Suppliers', value: suppliers.length,                                              icon: FiUser      },
    { label: 'Avg Lead Time',   value: suppliers.length ? `${Math.round(suppliers.reduce((a,s)=>a+(s.leadTimeDays||0),0)/suppliers.length)}d` : '—', icon: FiTruck },
    { label: 'Top Rated',       value: suppliers.filter(s => s.rating >= 4).length,                   icon: FiStar      },
    { label: 'Total Products',  value: suppliers.reduce((a,s) => a + (s.products?.length || 0), 0),   icon: FiPackage   },
  ];

  return (
    <div className="sup-page">

      {/* Top bar */}
      <div className="sup-topbar">
        <div className="sup-topbar-left">
          <div>
            <h1 className="sup-title">Suppliers</h1>
            <p className="sup-sub">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
        <button className="sup-add-btn" onClick={openNew}>
          <FiPlus /> Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="sup-stats">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="sup-stat-card">
            <div className="sup-stat-icon-wrap"><Icon className="sup-stat-icon" /></div>
            <div className="sup-stat-val">{value}</div>
            <div className="sup-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="sup-search-wrap">
        <div className="sup-search">
          <FiSearch className="sup-search-icon" />
          <input
            className="sup-search-input"
            placeholder="Search by name, email or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sup-search-clear" onClick={() => setSearch('')}><FiX /></button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="sup-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="sup-empty">
          <FiTruck className="sup-empty-icon" />
          <p>{search ? 'No suppliers match your search' : 'No suppliers yet'}</p>
          {!search && (
            <button className="sup-add-btn" onClick={openNew}>
              <FiPlus /> Add First Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="sup-grid">
          {filtered.map(s => (
            <SupplierCard
              key={s._id}
              supplier={s}
              onView={() => openView(s)}
              onEdit={() => openEdit(s)}
              onDelete={() => handleDelete(s._id)}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <SupplierFormModal
          supplier={editSupplier}
          onClose={() => { setShowForm(false); setEditSupplier(null); }}
          onSaved={() => { setShowForm(false); setEditSupplier(null); fetchSuppliers(); }}
        />
      )}

      {/* View modal */}
      {viewSupplier && (
        <SupplierViewModal
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
          onEdit={() => { setViewSupplier(null); openEdit(viewSupplier); }}
        />
      )}
    </div>
  );
}

/* ================================================================
   SUPPLIER CARD
   ================================================================ */
function SupplierCard({ supplier: s, onView, onEdit, onDelete }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < s.rating);

  return (
    <div className="sup-card">
      {/* Header */}
      <div className="sup-card-head">
        <div className="sup-card-avatar">
          {s.name?.[0]?.toUpperCase()}
        </div>
        <div className="sup-card-info">
          <div className="sup-card-name">{s.name}</div>
          {s.contactPerson && (
            <div className="sup-card-contact">Contact: {s.contactPerson}</div>
          )}
        </div>
        <div className="sup-card-rating">
          {stars.map((filled, i) => (
            <FiStar
              key={i}
              className="sup-star"
              style={{ fill: filled ? '#d4af37' : 'none', color: '#d4af37' }}
            />
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="sup-card-details">
        {s.email && (
          <div className="sup-card-detail">
            <FiMail className="sup-detail-icon" />
            <span>{s.email}</span>
          </div>
        )}
        {s.phone && (
          <div className="sup-card-detail">
            <FiPhone className="sup-detail-icon" />
            <span>{s.phone}</span>
          </div>
        )}
        {(s.address?.city || s.address?.state) && (
          <div className="sup-card-detail">
            <FiMapPin className="sup-detail-icon" />
            <span>{[s.address.city, s.address.state].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="sup-card-metrics">
        <div className="sup-metric">
          <span className="sup-metric-val">{s.leadTimeDays || '—'}d</span>
          <span className="sup-metric-label">Lead Time</span>
        </div>
        <div className="sup-metric">
          <span className="sup-metric-val">
            {s.minimumOrderValue ? `₦${(s.minimumOrderValue/1000).toFixed(0)}K` : '—'}
          </span>
          <span className="sup-metric-label">Min Order</span>
        </div>
        <div className="sup-metric">
          <span className="sup-metric-val">{s.products?.length || 0}</span>
          <span className="sup-metric-label">Products</span>
        </div>
        <div className="sup-metric">
          <span className="sup-metric-val">{s.totalOrders || 0}</span>
          <span className="sup-metric-label">Orders</span>
        </div>
      </div>

      {/* Payment terms badge */}
      {s.paymentTerms && (
        <div className="sup-card-terms">{s.paymentTerms}</div>
      )}

      {/* Actions */}
      <div className="sup-card-actions">
        <button className="sup-action-btn view" onClick={onView}>View</button>
        {s.whatsapp && (
          <a
            href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`}
            target="_blank" rel="noreferrer"
            className="sup-action-btn wa"
          >
            <FaWhatsapp />
          </a>
        )}
        <button className="sup-action-btn edit" onClick={onEdit}>
          <FiEdit2 />
        </button>
        <button className="sup-action-btn delete" onClick={onDelete}>
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   SUPPLIER FORM MODAL
   ================================================================ */
function SupplierFormModal({ supplier, onClose, onSaved }) {
  const isEdit = !!supplier;
  const [form, setForm] = useState(isEdit ? {
    name:              supplier.name || '',
    email:             supplier.email || '',
    phone:             supplier.phone || '',
    whatsapp:          supplier.whatsapp || '',
    contactPerson:     supplier.contactPerson || '',
    address: {
      street:  supplier.address?.street || '',
      city:    supplier.address?.city || '',
      state:   supplier.address?.state || '',
      country: supplier.address?.country || 'Nigeria',
    },
    leadTimeDays:       supplier.leadTimeDays || 7,
    minimumOrderValue:  supplier.minimumOrderValue || 0,
    paymentTerms:       supplier.paymentTerms || '',
    rating:             supplier.rating || 5,
    notes:              supplier.notes || '',
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required'); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`/api/suppliers/${supplier._id}`, form);
        toast.success('Supplier updated!');
      } else {
        await axios.post('/api/suppliers', form);
        toast.success('Supplier added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="sup-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sup-modal">
        <div className="sup-modal-head">
          <h2>{isEdit ? `Edit: ${supplier.name}` : 'Add New Supplier'}</h2>
          <button className="sup-modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form className="sup-modal-form" onSubmit={save}>
          <div className="sup-modal-body">

            {/* Basic info */}
            <div className="sup-form-section">
              <h3 className="sup-form-section-title">Basic Information</h3>
              <div className="sup-form-grid">
                <div className="sup-field sup-field-full">
                  <label className="sup-label">Company Name *</label>
                  <input className="sup-input" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Lagos Kitchen Supplies Ltd" required />
                </div>
                <div className="sup-field">
                  <label className="sup-label">Contact Person</label>
                  <input className="sup-input" value={form.contactPerson}
                    onChange={e => set('contactPerson', e.target.value)}
                    placeholder="e.g. Mr. Emeka Obi" />
                </div>
                <div className="sup-field">
                  <label className="sup-label">Email Address *</label>
                  <input className="sup-input" type="email" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="supplier@example.com" required />
                </div>
                <div className="sup-field">
                  <label className="sup-label">Phone Number</label>
                  <input className="sup-input" type="tel" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="e.g. 08012345678" />
                </div>
                <div className="sup-field">
                  <label className="sup-label">WhatsApp Number</label>
                  <input className="sup-input" type="tel" value={form.whatsapp}
                    onChange={e => set('whatsapp', e.target.value)}
                    placeholder="e.g. +2348012345678" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="sup-form-section">
              <h3 className="sup-form-section-title">Address</h3>
              <div className="sup-form-grid">
                <div className="sup-field sup-field-full">
                  <label className="sup-label">Street Address</label>
                  <input className="sup-input" value={form.address.street}
                    onChange={e => setAddr('street', e.target.value)}
                    placeholder="e.g. 24 Industrial Road, Trade Zone" />
                </div>
                <div className="sup-field">
                  <label className="sup-label">City</label>
                  <input className="sup-input" value={form.address.city}
                    onChange={e => setAddr('city', e.target.value)}
                    placeholder="e.g. Apapa" />
                </div>
                <div className="sup-field">
                  <label className="sup-label">State</label>
                  <input className="sup-input" value={form.address.state}
                    onChange={e => setAddr('state', e.target.value)}
                    placeholder="e.g. Lagos" />
                </div>
              </div>
            </div>

            {/* Business terms */}
            <div className="sup-form-section">
              <h3 className="sup-form-section-title">Business Terms</h3>
              <div className="sup-form-grid">
                <div className="sup-field">
                  <label className="sup-label">Lead Time (days)</label>
                  <input className="sup-input" type="number" min="1" value={form.leadTimeDays}
                    onChange={e => set('leadTimeDays', Number(e.target.value))}
                    placeholder="e.g. 7" />
                  <span className="sup-field-note">How many days from order to delivery</span>
                </div>
                <div className="sup-field">
                  <label className="sup-label">Minimum Order Value (₦)</label>
                  <input className="sup-input" type="number" min="0" value={form.minimumOrderValue}
                    onChange={e => set('minimumOrderValue', Number(e.target.value))}
                    placeholder="e.g. 50000" />
                </div>
                <div className="sup-field">
                  <label className="sup-label">Payment Terms</label>
                  <select className="sup-input" value={form.paymentTerms}
                    onChange={e => set('paymentTerms', e.target.value)}>
                    <option value="">Select...</option>
                    {['Pay on delivery','50% deposit','30-day credit','60-day credit','Prepayment only','Net 7','Net 14','Net 30'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sup-field">
                  <label className="sup-label">Supplier Rating</label>
                  <div className="sup-rating-picker">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        className={`sup-rating-btn ${form.rating >= n ? 'active' : ''}`}
                        onClick={() => set('rating', n)}>
                        <FiStar style={{ fill: form.rating >= n ? '#d4af37' : 'none', color: '#d4af37' }} />
                      </button>
                    ))}
                    <span className="sup-rating-label">
                      {['','Poor','Fair','Good','Great','Excellent'][form.rating]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="sup-form-section">
              <h3 className="sup-form-section-title">Internal Notes</h3>
              <textarea className="sup-input sup-textarea" value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any internal notes about this supplier — quality, reliability, special terms..." />
            </div>
          </div>

          <div className="sup-modal-footer">
            <button type="button" className="adm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn-save" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================================================================
   SUPPLIER VIEW MODAL
   ================================================================ */
function SupplierViewModal({ supplier: s, onClose, onEdit }) {
  return (
    <div className="sup-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sup-modal sup-modal-view">
        <div className="sup-modal-head">
          <h2>{s.name}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="adm-btn-cancel" onClick={onEdit}>Edit</button>
            <button className="sup-modal-close" onClick={onClose}><FiX /></button>
          </div>
        </div>

        <div className="sup-view-body">

          {/* Header row */}
          <div className="sup-view-header">
            <div className="sup-view-avatar">{s.name?.[0]?.toUpperCase()}</div>
            <div>
              <h3>{s.name}</h3>
              {s.contactPerson && <p>Contact: {s.contactPerson}</p>}
              <div className="sup-view-stars">
                {Array.from({length:5},(_,i)=>(
                  <FiStar key={i} style={{fill:i<s.rating?'#d4af37':'none',color:'#d4af37',fontSize:18}} />
                ))}
                <span>{['','Poor','Fair','Good','Great','Excellent'][s.rating]}</span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="sup-view-grid">
            <div className="sup-view-section">
              <h4>Contact Information</h4>
              {[
                [FiMail,    s.email,   `mailto:${s.email}`],
                [FiPhone,   s.phone,   `tel:${s.phone}`],
                [FaWhatsapp,s.whatsapp,`https://wa.me/${s.whatsapp?.replace(/\D/g,'')}`],
              ].map(([Icon, val, href], i) => val ? (
                <a key={i} href={href} target="_blank" rel="noreferrer"
                  className="sup-view-contact-item">
                  <Icon size={14} /> {val}
                </a>
              ) : null)}
              {(s.address?.city || s.address?.state) && (
                <div className="sup-view-contact-item">
                  <FiMapPin size={14} />
                  {[s.address.street, s.address.city, s.address.state].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <div className="sup-view-section">
              <h4>Business Terms</h4>
              <div className="sup-view-terms">
                {[
                  ['Lead Time',   `${s.leadTimeDays || '—'} days`],
                  ['Min Order',   s.minimumOrderValue ? `₦${s.minimumOrderValue.toLocaleString()}` : '—'],
                  ['Payment',     s.paymentTerms || '—'],
                  ['Products',    `${s.products?.length || 0} linked`],
                  ['Total Orders',s.totalOrders || 0],
                  ['Total Spent', s.totalSpent ? `₦${s.totalSpent.toLocaleString()}` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="sup-view-term-row">
                    <span className="sup-view-term-key">{k}</span>
                    <span className="sup-view-term-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          {s.notes && (
            <div className="sup-view-notes">
              <h4>Internal Notes</h4>
              <p>{s.notes}</p>
            </div>
          )}

          {/* Products */}
          {s.products?.length > 0 && (
            <div className="sup-view-products">
              <h4>Linked Products ({s.products.length})</h4>
              <div className="sup-view-prod-list">
                {s.products.map((p, i) => (
                  <div key={i} className="sup-view-prod-chip">
                    <FiPackage size={12} /> {p.name || p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="sup-view-actions">
            {s.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer" className="sup-view-action-btn wa">
                <FaWhatsapp /> WhatsApp
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} className="sup-view-action-btn email">
                <FiMail /> Email
              </a>
            )}
            {s.phone && (
              <a href={`tel:${s.phone}`} className="sup-view-action-btn phone">
                <FiPhone /> Call
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}