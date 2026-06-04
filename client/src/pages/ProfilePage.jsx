import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiPackage,
  FiHeart,
  FiStar,
  FiLogOut,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/ProfilePage.css";

const API_URL = process.env.REACT_APP_API_URL;

const TABS = [
  { id: "profile", label: "My Profile", icon: FiUser },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
  { id: "security", label: "Security", icon: FiLock },
  { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/orders/my-orders`)
      .then((r) => setOrders(r.data.orders || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  if (!user) return null;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: FiPackage },
    {
      label: "Total Spent",
      value: `₦${orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}`,
      icon: FiStar,
    },
    { label: "Loyalty Pts", value: user.loyaltyPoints || 0, icon: FiHeart },
  ];

  return (
    <div className="pro-page">
      {/* Header */}
      <div className="pro-header">
        <div className="pro-header-inner">
          <div className="pro-avatar-wrap">
            <div className="pro-avatar">{user.name?.[0]?.toUpperCase()}</div>
          </div>
          <div className="pro-header-info">
            <h1 className="pro-header-name">{user.name}</h1>
            <p className="pro-header-email">
              <FiMail size={13} /> {user.email}
            </p>
            <span className={`pro-role-badge ${user.role}`}>
              {user.role?.toUpperCase()}
            </span>
          </div>
          <div className="pro-header-actions">
            {user.role === "admin" && (
              <Link to="/admin" className="pro-admin-btn">
                Admin Panel →
              </Link>
            )}
            <button className="pro-logout-btn" onClick={logout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="pro-stats-bar">
        <div className="pro-stats-inner">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="pro-stat">
              <Icon className="pro-stat-icon" />
              <div className="pro-stat-val">{ordersLoading ? "—" : value}</div>
              <div className="pro-stat-label">{label}</div>
            </div>
          ))}
          <Link to="/orders" className="pro-stat pro-stat-link">
            <FiPackage className="pro-stat-icon" />
            <div className="pro-stat-val">View All</div>
            <div className="pro-stat-label">My Orders</div>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="pro-body">
        {/* Sidebar tabs */}
        <aside className="pro-sidebar">
          <nav className="pro-tabs">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`pro-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="pro-tab-icon" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <div className="pro-content">
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "addresses" && <AddressesTab user={user} />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "whatsapp" && <WhatsAppTab user={user} />}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PROFILE TAB
   ================================================================ */
function ProfileTab({ user }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    whatsappNumber: user.whatsappNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", form);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
    setSaving(false);
  };

  return (
    <div className="pro-tab-content">
      <div className="pro-section-header">
        <h2>Personal Information</h2>
        <p>Update your name, phone and contact details</p>
      </div>

      <form className="pro-form" onSubmit={save}>
        <div className="pro-form-grid">
          <div className="pro-field">
            <label className="pro-label">
              <FiUser size={14} /> Full Name
            </label>
            <input
              className="pro-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="pro-field">
            <label className="pro-label">
              <FiMail size={14} /> Email Address
            </label>
            <input
              className="pro-input pro-input-disabled"
              value={user.email}
              readOnly
              title="Email cannot be changed"
            />
            <span className="pro-input-note">Email cannot be changed</span>
          </div>

          <div className="pro-field">
            <label className="pro-label">
              <FiPhone size={14} /> Phone Number
            </label>
            <input
              className="pro-input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="e.g. 08012345678"
              type="tel"
            />
          </div>

          <div className="pro-field">
            <label className="pro-label">
              <FaWhatsapp size={14} /> WhatsApp Number
            </label>
            <input
              className="pro-input"
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              placeholder="e.g. +2348012345678"
              type="tel"
            />
            <span className="pro-input-note">Used for order notifications</span>
          </div>
        </div>

        {/* Account info cards */}
        <div className="pro-account-info">
          {[
            { label: "Account ID", value: user._id?.slice(-8).toUpperCase() },
            {
              label: "Member Since",
              value: new Date(user.createdAt).toLocaleDateString("en-NG", {
                month: "long",
                year: "numeric",
              }),
            },
            {
              label: "Account Type",
              value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1),
            },
            {
              label: "Status",
              value: user.isActive ? "Active" : "Inactive",
              green: user.isActive,
            },
          ].map(({ label, value, green }) => (
            <div key={label} className="pro-info-card">
              <span className="pro-info-label">{label}</span>
              <span className={`pro-info-val ${green ? "green" : ""}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <button type="submit" className="pro-save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

/* ================================================================
   ADDRESSES TAB
   ================================================================ */
function AddressesTab({ user }) {
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
    isDefault: false,
  });

  const NIGERIAN_STATES = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setForm({
      label: "Home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nigeria",
      isDefault: false,
    });
    setEditIndex(null);
    setShowForm(true);
  };

  const openEdit = (i) => {
    setForm({ ...addresses[i] });
    setEditIndex(i);
    setShowForm(true);
  };

  const remove = async (i) => {
    const updated = addresses.filter((_, idx) => idx !== i);
    setAddresses(updated);
    try {
      await axios.put("/api/auth/profile", { address: updated });
      toast.success("Address removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const setDefault = async (i) => {
    const updated = addresses.map((a, idx) => ({ ...a, isDefault: idx === i }));
    setAddresses(updated);
    try {
      await axios.put("/api/auth/profile", { address: updated });
      toast.success("Default address updated");
    } catch {
      toast.error("Failed");
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.state) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    let updated;
    if (editIndex !== null) {
      updated = addresses.map((a, i) => (i === editIndex ? form : a));
    } else {
      updated = [...addresses, form];
    }
    try {
      await axios.put("/api/auth/profile", { address: updated });
      setAddresses(updated);
      setShowForm(false);
      toast.success(editIndex !== null ? "Address updated!" : "Address added!");
    } catch {
      toast.error("Failed to save address");
    }
    setSaving(false);
  };

  return (
    <div className="pro-tab-content">
      <div className="pro-section-header">
        <div>
          <h2>Saved Addresses</h2>
          <p>Manage your delivery addresses</p>
        </div>
        <button className="pro-add-addr-btn" onClick={openNew}>
          <FiPlus /> Add Address
        </button>
      </div>

      {/* Address cards */}
      {addresses.length === 0 && !showForm && (
        <div className="pro-addr-empty">
          <span>📍</span>
          <p>No saved addresses yet</p>
          <button className="pro-add-addr-btn" onClick={openNew}>
            <FiPlus /> Add Your First Address
          </button>
        </div>
      )}

      <div className="pro-addr-grid">
        {addresses.map((addr, i) => (
          <div
            key={i}
            className={`pro-addr-card ${addr.isDefault ? "default" : ""}`}
          >
            {addr.isDefault && (
              <span className="pro-addr-default-badge">Default</span>
            )}
            <div className="pro-addr-label-row">
              <span className="pro-addr-label">{addr.label || "Address"}</span>
            </div>
            <div className="pro-addr-lines">
              <p>{addr.street}</p>
              <p>
                {addr.city}, {addr.state}
              </p>
              <p>
                {addr.zipCode && `${addr.zipCode}, `}
                {addr.country}
              </p>
            </div>
            <div className="pro-addr-actions">
              <button className="pro-addr-btn edit" onClick={() => openEdit(i)}>
                <FiEdit2 size={13} /> Edit
              </button>
              {!addr.isDefault && (
                <button
                  className="pro-addr-btn default-btn"
                  onClick={() => setDefault(i)}
                >
                  <FiCheck size={13} /> Set Default
                </button>
              )}
              <button className="pro-addr-btn delete" onClick={() => remove(i)}>
                <FiTrash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="pro-addr-form-wrap">
          <h3 className="pro-addr-form-title">
            {editIndex !== null ? "Edit Address" : "New Address"}
          </h3>
          <form className="pro-form" onSubmit={saveAddress}>
            <div className="pro-form-grid">
              <div className="pro-field">
                <label className="pro-label">Label</label>
                <select
                  className="pro-input"
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                >
                  {["Home", "Office", "Other"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pro-field">
                <label className="pro-label">Country</label>
                <input
                  className="pro-input pro-input-disabled"
                  value={form.country}
                  readOnly
                />
              </div>
              <div className="pro-field pro-field-full">
                <label className="pro-label">Street Address *</label>
                <input
                  className="pro-input"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                  placeholder="House number, street, area"
                  required
                />
              </div>
              <div className="pro-field">
                <label className="pro-label">City *</label>
                <input
                  className="pro-input"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="e.g. Lagos"
                  required
                />
              </div>
              <div className="pro-field">
                <label className="pro-label">State *</label>
                <select
                  className="pro-input"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  required
                >
                  <option value="">Select state...</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pro-field">
                <label className="pro-label">ZIP / Postal Code</label>
                <input
                  className="pro-input"
                  value={form.zipCode}
                  onChange={(e) => set("zipCode", e.target.value)}
                  placeholder="e.g. 100001"
                />
              </div>
            </div>

            <label className="pro-checkbox-row">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => set("isDefault", e.target.checked)}
              />
              <span>Set as default delivery address</span>
            </label>

            <div className="pro-addr-form-btns">
              <button
                type="button"
                className="pro-btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="pro-save-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editIndex !== null
                    ? "Update Address"
                    : "Add Address"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   SECURITY TAB
   ================================================================ */
function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleShow = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const save = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
    setSaving(false);
  };

  const strength = (pwd) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const pwdStrength = strength(form.newPassword);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwdStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][
    pwdStrength
  ];

  return (
    <div className="pro-tab-content">
      <div className="pro-section-header">
        <h2>Change Password</h2>
        <p>Keep your account secure with a strong password</p>
      </div>

      <form className="pro-form" onSubmit={save} style={{ maxWidth: "480px" }}>
        {[
          {
            key: "currentPassword",
            label: "Current Password",
            showKey: "current",
          },
          { key: "newPassword", label: "New Password", showKey: "new" },
          {
            key: "confirmPassword",
            label: "Confirm Password",
            showKey: "confirm",
          },
        ].map(({ key, label, showKey }) => (
          <div key={key} className="pro-field" style={{ marginBottom: "18px" }}>
            <label className="pro-label">{label}</label>
            <div className="pro-pwd-wrap">
              <input
                className="pro-input"
                type={show[showKey] ? "text" : "password"}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="pro-pwd-toggle"
                onClick={() => toggleShow(showKey)}
              >
                {show[showKey] ? "🙈" : "👁️"}
              </button>
            </div>
            {key === "newPassword" && form.newPassword && (
              <div className="pro-pwd-strength">
                <div className="pro-pwd-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="pro-pwd-segment"
                      style={{
                        background:
                          i <= pwdStrength ? strengthColor : "#e8e8e8",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    color: strengthColor,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>
        ))}

        <div className="pro-pwd-tips">
          <p className="pro-pwd-tips-title">Password tips:</p>
          {[
            "At least 8 characters",
            "Mix of uppercase & lowercase",
            "Include numbers",
            "Include special characters (!@#$)",
          ].map((tip) => (
            <div key={tip} className="pro-pwd-tip">
              <FiCheck size={12} className="pro-pwd-tip-icon" />
              {tip}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="pro-save-btn"
          disabled={saving}
          style={{ marginTop: "24px" }}
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

/* ================================================================
   WHATSAPP TAB
   ================================================================ */
function WhatsAppTab({ user }) {
  const [number, setNumber] = useState(user.whatsappNumber || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", { whatsappNumber: number });
      toast.success("WhatsApp number saved!");
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="pro-tab-content">
      <div className="pro-section-header">
        <h2>WhatsApp Notifications</h2>
        <p>Receive order updates directly on WhatsApp</p>
      </div>

      {/* Benefits */}
      <div className="pro-wa-benefits">
        {[
          {
            icon: "📦",
            title: "Order Confirmations",
            desc: "Instant confirmation when your order is placed",
          },
          {
            icon: "🚚",
            title: "Shipping Updates",
            desc: "Track your delivery in real time",
          },
          {
            icon: "✅",
            title: "Delivery Alerts",
            desc: "Know the moment your order arrives",
          },
          {
            icon: "🎁",
            title: "Exclusive Offers",
            desc: "Get deals and promotions first",
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="pro-wa-benefit">
            <span className="pro-wa-benefit-icon">{icon}</span>
            <div>
              <div className="pro-wa-benefit-title">{title}</div>
              <div className="pro-wa-benefit-desc">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <form className="pro-form" onSubmit={save} style={{ maxWidth: "420px" }}>
        <div className="pro-field">
          <label className="pro-label">
            <FaWhatsapp size={14} /> Your WhatsApp Number
          </label>
          <div className="pro-wa-input-wrap">
            <span className="pro-wa-prefix">🇳🇬 +234</span>
            <input
              className="pro-input pro-wa-input"
              value={number.replace("+234", "").replace(/^\+/, "")}
              onChange={(e) =>
                setNumber("+234" + e.target.value.replace(/\D/g, ""))
              }
              placeholder="8012345678"
              type="tel"
            />
          </div>
          <span className="pro-input-note">
            Enter number without country code
          </span>
        </div>

        <button
          type="submit"
          className="pro-save-btn"
          disabled={saving}
          style={{ marginTop: "20px" }}
        >
          {saving ? "Saving..." : "Save WhatsApp Number"}
        </button>
      </form>

      {user.whatsappNumber && (
        <div className="pro-wa-active">
          <FiCheck className="pro-wa-active-icon" />
          <div>
            <strong>WhatsApp notifications active</strong>
            <span>{user.whatsappNumber}</span>
          </div>
          <a
            href={`https://wa.me/${user.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="pro-wa-test-btn"
          >
            Test →
          </a>
        </div>
      )}
    </div>
  );
}
