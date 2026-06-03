import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiSave, FiPhone, FiMail, FiMapPin, FiGlobe,
  FiInstagram, FiFacebook, FiTwitter, FiYoutube,
  FiTruck, FiTag, FiPlus, FiTrash2,
  FiToggleLeft, FiToggleRight, FiX, FiBell, FiSettings
} from 'react-icons/fi';
import '../../styles/SettingsPage.css';

const TABS = [
  { id: 'business',     label: 'Business Info',  icon: FiGlobe     },
  { id: 'social',       label: 'Social Media',   icon: FiInstagram  },
  { id: 'shipping',     label: 'Delivery',        icon: FiTruck     },
  { id: 'announcement', label: 'Announcement',    icon: FiBell      },
  { id: 'coupons',      label: 'Coupons',         icon: FiTag       },
  { id: 'seo',          label: 'SEO',             icon: FiSettings  },
];

const API_URL = process.env.REACT_APP_API_URL;

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab]           = useState('business');
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(r => setSettings(r.data.settings))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  /* Update a nested field */
  const set = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${API_URL}/api/settings`, settings);
      setSettings(data.settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  if (!settings) return null;

  return (
    <div className="settings-page">

      {/* Top bar */}
      <div className="settings-topbar">
        <div>
          <h1 className="settings-title">Site Settings</h1>
          <p className="settings-sub">Manage business info, contact details and social media</p>
        </div>
        <button className="settings-save-btn" onClick={save} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="settings-layout">

        {/* Sidebar tabs */}
        <nav className="settings-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {/* Content area */}
        <div className="settings-content">

          {/* ---- BUSINESS INFO ---- */}
          {tab === 'business' && (
            <div className="settings-card">
              <h2 className="settings-section-title">Business Information</h2>
              <div className="settings-grid">
                {[
                  { key: 'name',         label: 'Business Name',    placeholder: 'Fabulous & More'         },
                  { key: 'tagline',      label: 'Tagline',          placeholder: 'Premium Kitchen Utensils' },
                  { key: 'email',        label: 'Main Email',       placeholder: 'hello@example.com',        icon: FiMail  },
                  { key: 'supportEmail', label: 'Support Email',    placeholder: 'support@example.com',      icon: FiMail  },
                  { key: 'phone',        label: 'Phone Number',     placeholder: '+234 800 000 0000',        icon: FiPhone },
                  { key: 'whatsapp',     label: 'WhatsApp Number',  placeholder: '+2348000000000',           icon: FiPhone },
                ].map(({ key, label, placeholder, icon: Icon }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label">
                      {Icon && <Icon size={13} />} {label}
                    </label>
                    <input
                      className="settings-input"
                      value={settings.business[key] || ''}
                      onChange={e => set('business', key, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Default WhatsApp Message</label>
                  <input className="settings-input"
                    value={settings.business.whatsappText || ''}
                    onChange={e => set('business', 'whatsappText', e.target.value)}
                    placeholder="Hi! I need help with my order." />
                </div>
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Business Description</label>
                  <textarea className="settings-input settings-textarea"
                    value={settings.business.description || ''}
                    onChange={e => set('business', 'description', e.target.value)}
                    placeholder="Short description shown in footer..." rows={3} />
                </div>
              </div>

              <h2 className="settings-section-title" style={{ marginTop: '28px' }}>Address</h2>
              <div className="settings-grid">
                {[
                  { key: 'street',  label: 'Street Address', placeholder: '123 Market Street' },
                  { key: 'city',    label: 'City',           placeholder: 'Lagos'              },
                  { key: 'state',   label: 'State',          placeholder: 'Lagos State'        },
                  { key: 'country', label: 'Country',        placeholder: 'Nigeria'            },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label"><FiMapPin size={13} /> {label}</label>
                    <input className="settings-input"
                      value={settings.address?.[key] || ''}
                      onChange={e => setSettings(p => ({ ...p, address: { ...p.address, [key]: e.target.value } }))}
                      placeholder={placeholder} />
                  </div>
                ))}
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Google Maps Link</label>
                  <input className="settings-input"
                    value={settings.address?.mapLink || ''}
                    onChange={e => setSettings(p => ({ ...p, address: { ...p.address, mapLink: e.target.value } }))}
                    placeholder="https://maps.google.com/..." />
                </div>
              </div>

              <h2 className="settings-section-title" style={{ marginTop: '28px' }}>Business Hours</h2>
              <div className="settings-grid">
                {[
                  { key: 'weekdays', label: 'Weekday Hours', placeholder: 'Monday – Saturday: 8am – 6pm WAT' },
                  { key: 'weekends', label: 'Weekend Hours', placeholder: 'Sunday: Closed'                   },
                  { key: 'timezone', label: 'Timezone',      placeholder: 'WAT (UTC+1)'                      },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label">{label}</label>
                    <input className="settings-input"
                      value={settings.hours?.[key] || ''}
                      onChange={e => setSettings(p => ({ ...p, hours: { ...p.hours, [key]: e.target.value } }))}
                      placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- SOCIAL MEDIA ---- */}
          {tab === 'social' && (
            <div className="settings-card">
              <h2 className="settings-section-title">Social Media Links</h2>
              <p className="settings-hint">Enter full URLs — e.g. https://instagram.com/yourbrand. Only filled links show in the footer.</p>
              <div className="settings-grid">
                {[
                  { key: 'facebook',  label: 'Facebook',    icon: FiFacebook,  placeholder: 'https://facebook.com/yourpage'   },
                  { key: 'instagram', label: 'Instagram',   icon: FiInstagram, placeholder: 'https://instagram.com/yourpage'  },
                  { key: 'twitter',   label: 'X (Twitter)', icon: FiTwitter,   placeholder: 'https://x.com/yourhandle'        },
                  { key: 'youtube',   label: 'YouTube',     icon: FiYoutube,   placeholder: 'https://youtube.com/@yourchannel'},
                  { key: 'tiktok',    label: 'TikTok',      icon: FiGlobe,     placeholder: 'https://tiktok.com/@yourhandle'  },
                  { key: 'linkedin',  label: 'LinkedIn',    icon: FiGlobe,     placeholder: 'https://linkedin.com/company/...' },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className="settings-field">
                    <label className="settings-label"><Icon size={13} /> {label}</label>
                    <input className="settings-input"
                      value={settings.social?.[key] || ''}
                      onChange={e => set('social', key, e.target.value)}
                      placeholder={placeholder} />
                    {settings.social?.[key] && (
                      <a href={settings.social[key]} target="_blank" rel="noreferrer"
                        className="settings-link-preview">Open link ↗</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- SHIPPING ---- */}
          {tab === 'shipping' && (
            <div className="settings-card">
              <h2 className="settings-section-title">Delivery & Shipping</h2>
              <div className="settings-grid">
                <div className="settings-field">
                  <label className="settings-label">Free Shipping Threshold (₦)</label>
                  <input className="settings-input" type="number" min="0"
                    value={settings.shipping?.freeShippingThreshold || ''}
                    onChange={e => set('shipping', 'freeShippingThreshold', Number(e.target.value))}
                    placeholder="50000" />
                  <span className="settings-hint">Orders above this get free delivery</span>
                </div>
                <div className="settings-field">
                  <label className="settings-label">Standard Delivery Cost (₦)</label>
                  <input className="settings-input" type="number" min="0"
                    value={settings.shipping?.standardCost || ''}
                    onChange={e => set('shipping', 'standardCost', Number(e.target.value))}
                    placeholder="2000" />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Estimated Delivery Time</label>
                  <input className="settings-input"
                    value={settings.shipping?.estimatedDays || ''}
                    onChange={e => set('shipping', 'estimatedDays', e.target.value)}
                    placeholder="3–5 business days" />
                </div>
                <div className="settings-field">
                  <label className="settings-label settings-toggle-label">
                    Express Delivery Available
                    <button type="button"
                      className={`settings-toggle ${settings.shipping?.expressAvailable ? 'on' : ''}`}
                      onClick={() => set('shipping', 'expressAvailable', !settings.shipping?.expressAvailable)}>
                      {settings.shipping?.expressAvailable ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </label>
                </div>
                {settings.shipping?.expressAvailable && (
                  <>
                    <div className="settings-field">
                      <label className="settings-label">Express Cost (₦)</label>
                      <input className="settings-input" type="number" min="0"
                        value={settings.shipping?.expressCost || ''}
                        onChange={e => set('shipping', 'expressCost', Number(e.target.value))}
                        placeholder="5000" />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">Express Estimated Time</label>
                      <input className="settings-input"
                        value={settings.shipping?.expressEstimatedDays || ''}
                        onChange={e => set('shipping', 'expressEstimatedDays', e.target.value)}
                        placeholder="1–2 business days" />
                    </div>
                  </>
                )}
              </div>

              {/* Live preview */}
              <div className="settings-shipping-preview">
                <h3>Preview — Cart Shipping Info</h3>
                <div className="settings-preview-box">
                  <div className="settings-preview-row">
                    <FiTruck size={15} />
                    <span>Free delivery on orders over ₦{(settings.shipping?.freeShippingThreshold || 50000).toLocaleString()}</span>
                  </div>
                  <div className="settings-preview-row">
                    <span>Standard: ₦{(settings.shipping?.standardCost || 2000).toLocaleString()} · {settings.shipping?.estimatedDays}</span>
                  </div>
                  {settings.shipping?.expressAvailable && (
                    <div className="settings-preview-row">
                      <span>Express: ₦{(settings.shipping?.expressCost || 5000).toLocaleString()} · {settings.shipping?.expressEstimatedDays}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ---- ANNOUNCEMENT ---- */}
          {tab === 'announcement' && (
            <div className="settings-card">
              <h2 className="settings-section-title">Announcement Bar</h2>
              <p className="settings-hint">Shown at the top of every page in the navbar</p>
              <div className="settings-grid">
                <div className="settings-field">
                  <label className="settings-label settings-toggle-label">
                    Show Announcement Bar
                    <button type="button"
                      className={`settings-toggle ${settings.announcement?.enabled ? 'on' : ''}`}
                      onClick={() => set('announcement', 'enabled', !settings.announcement?.enabled)}>
                      {settings.announcement?.enabled ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </label>
                </div>
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Announcement Text</label>
                  <input className="settings-input"
                    value={settings.announcement?.text || ''}
                    onChange={e => set('announcement', 'text', e.target.value)}
                    placeholder="Free delivery on orders over ₦50,000 · WhatsApp: +234 800 000 0000" />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Link (optional)</label>
                  <input className="settings-input"
                    value={settings.announcement?.link || ''}
                    onChange={e => set('announcement', 'link', e.target.value)}
                    placeholder="/catalog or https://..." />
                </div>
                <div className="settings-field">
                  <label className="settings-label">Background Colour</label>
                  <div className="settings-color-row">
                    <input type="color" className="settings-color-picker"
                      value={settings.announcement?.bgColor || '#D4AF37'}
                      onChange={e => set('announcement', 'bgColor', e.target.value)} />
                    <input className="settings-input"
                      value={settings.announcement?.bgColor || '#D4AF37'}
                      onChange={e => set('announcement', 'bgColor', e.target.value)}
                      placeholder="#D4AF37" />
                  </div>
                </div>
                <div className="settings-field">
                  <label className="settings-label">Text Colour</label>
                  <div className="settings-color-row">
                    <input type="color" className="settings-color-picker"
                      value={settings.announcement?.textColor || '#1A1A1A'}
                      onChange={e => set('announcement', 'textColor', e.target.value)} />
                    <input className="settings-input"
                      value={settings.announcement?.textColor || '#1A1A1A'}
                      onChange={e => set('announcement', 'textColor', e.target.value)}
                      placeholder="#1A1A1A" />
                  </div>
                </div>
              </div>

              {/* Live preview */}
              {settings.announcement?.enabled && (
                <div className="settings-ann-preview"
                  style={{ background: settings.announcement.bgColor, color: settings.announcement.textColor }}>
                  {settings.announcement.text || 'Your announcement text will appear here'}
                </div>
              )}
            </div>
          )}

          {/* ---- COUPONS ---- */}
          {tab === 'coupons' && (
            <CouponsTab settings={settings} setSettings={setSettings} />
          )}

          {/* ---- SEO ---- */}
          {tab === 'seo' && (
            <div className="settings-card">
              <h2 className="settings-section-title">SEO & Meta Tags</h2>
              <div className="settings-grid">
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Meta Title</label>
                  <input className="settings-input"
                    value={settings.seo?.metaTitle || ''}
                    onChange={e => set('seo', 'metaTitle', e.target.value)}
                    placeholder="Fabulous & More — Premium Kitchen Utensils Nigeria" />
                  <span className="settings-hint">{(settings.seo?.metaTitle || '').length}/60 characters — recommended max 60</span>
                </div>
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Meta Description</label>
                  <textarea className="settings-input settings-textarea"
                    value={settings.seo?.metaDescription || ''}
                    onChange={e => set('seo', 'metaDescription', e.target.value)}
                    placeholder="Shop premium kitchen utensils..." rows={3} />
                  <span className="settings-hint">{(settings.seo?.metaDescription || '').length}/160 characters — recommended max 160</span>
                </div>
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Keywords (comma separated)</label>
                  <input className="settings-input"
                    value={settings.seo?.keywords || ''}
                    onChange={e => set('seo', 'keywords', e.target.value)}
                    placeholder="kitchen utensils nigeria, cookware, bakeware" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   COUPONS TAB
   ================================================================ */
function CouponsTab({ settings, setSettings }) {
  const [form, setForm]     = useState({ code: '', discount: '', expiresAt: '', maxUses: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post('/api/settings/coupons', form);
      setSettings(data.settings);
      setForm({ code: '', discount: '', expiresAt: '', maxUses: '', description: '' });
      setAdding(false);
      toast.success('Coupon added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add coupon');
    }
    setSaving(false);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const { data } = await axios.delete(`/api/settings/coupons/${couponId}`);
      setSettings(data.settings);
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (coupon) => {
    try {
      const { data } = await axios.put(`/api/settings/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setSettings(data.settings);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="settings-card">
      <div className="settings-coupons-header">
        <h2 className="settings-section-title">Discount Coupons</h2>
        <button className="settings-add-coupon-btn" onClick={() => setAdding(a => !a)}>
          {adding ? <><FiX /> Cancel</> : <><FiPlus /> Add Coupon</>}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form className="settings-coupon-form" onSubmit={handleAdd}>
          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label">Coupon Code *</label>
              <input className="settings-input" style={{ textTransform: 'uppercase' }}
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20" required />
            </div>
            <div className="settings-field">
              <label className="settings-label">Discount % *</label>
              <input className="settings-input" type="number" min="1" max="100"
                value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                placeholder="20" required />
            </div>
            <div className="settings-field">
              <label className="settings-label">Expires On</label>
              <input className="settings-input" type="date"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div className="settings-field">
              <label className="settings-label">Max Uses (0 = unlimited)</label>
              <input className="settings-input" type="number" min="0"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="0" />
            </div>
            <div className="settings-field settings-field-full">
              <label className="settings-label">Description</label>
              <input className="settings-input"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Welcome discount for new customers" />
            </div>
          </div>
          <div className="settings-coupon-form-footer">
            <button type="submit" className="settings-save-btn" disabled={saving}>
              <FiSave /> {saving ? 'Adding...' : 'Add Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupon list */}
      {!settings.coupons?.length ? (
        <div className="settings-no-coupons">
          <FiTag size={36} />
          <p>No coupons yet — add one above</p>
        </div>
      ) : (
        <div className="settings-coupon-list">
          {settings.coupons.map(coupon => (
            <div key={coupon._id} className={`settings-coupon-item ${coupon.isActive ? 'active' : 'inactive'}`}>
              <div className="settings-coupon-left">
                <div className="settings-coupon-code">{coupon.code}</div>
                <div className="settings-coupon-details">
                  <span className="settings-coupon-pct">{coupon.discount}% off</span>
                  {coupon.expiresAt && (
                    <span className={`settings-coupon-expiry ${new Date() > new Date(coupon.expiresAt) ? 'expired' : ''}`}>
                      Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-NG')}
                    </span>
                  )}
                  <span className="settings-coupon-uses">
                    Used: {coupon.usedCount}{coupon.maxUses > 0 ? `/${coupon.maxUses}` : ''}
                  </span>
                  {coupon.description && (
                    <span className="settings-coupon-desc">{coupon.description}</span>
                  )}
                </div>
              </div>
              <div className="settings-coupon-actions">
                <button className={`settings-toggle ${coupon.isActive ? 'on' : ''}`}
                  onClick={() => handleToggle(coupon)}
                  title={coupon.isActive ? 'Disable' : 'Enable'}>
                  {coupon.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
                <button className="settings-coupon-delete" onClick={() => handleDelete(coupon._id)}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}