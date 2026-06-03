import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser, FiMapPin, FiCreditCard, FiCheck,
  FiChevronRight, FiLock, FiTruck, FiShield
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/CheckoutPage.css';

const STEPS = ['Delivery', 'Payment', 'Review'];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara'
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });

  const [payment, setPayment] = useState('stripe');
  const [cardDetails, setCardDetails] = useState({
    number: '', expiry: '', cvv: '', holder: ''
  });
  const [notes, setNotes] = useState('');

  /* ---- Derived totals ---- */
  const shipping   = cartTotal >= 50000 ? 0 : 2000;
  const tax        = cartTotal * 0.075;
  const total      = cartTotal + shipping + tax;

  /* ---- Field helpers ---- */
  const setAddr = (k, v) => setAddress(a => ({ ...a, [k]: v }));
  const setCard = (k, v) => setCardDetails(c => ({ ...c, [k]: v }));

  const formatCard  = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  /* ---- Validation ---- */
  const validateStep0 = () => {
    const { name, phone, street, city, state } = address;
    if (!name || !phone || !street || !city || !state) {
      toast.error('Please fill in all required fields'); return false;
    }
    if (phone.replace(/\D/g,'').length < 10) {
      toast.error('Enter a valid phone number'); return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (payment === 'stripe') {
      const num = cardDetails.number.replace(/\s/g,'');
      if (num.length < 16) { toast.error('Enter a valid card number'); return false; }
      if (!cardDetails.expiry.includes('/')) { toast.error('Enter a valid expiry date'); return false; }
      if (cardDetails.cvv.length < 3) { toast.error('Enter a valid CVV'); return false; }
      if (!cardDetails.holder) { toast.error('Enter cardholder name'); return false; }
    }
    return true;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  /* ---- Place order ---- */
  const placeOrder = async () => {
    setPlacing(true);
    try {
      const items = cart.map(i => ({ product: i._id, quantity: i.quantity }));
      const { data } = await axios.post('/api/orders', {
        items,
        shippingAddress: address,
        billingAddress: address,
        paymentMethod: payment,
        notes,
      });

      // For card payment — create Stripe intent
      if (payment === 'stripe') {
        await axios.post('/api/payment/create-intent', { orderId: data.order._id });
        // In production: load Stripe.js and confirm payment here
        // For now simulate success
        await axios.put(`/api/orders/${data.order._id}/status`, {
          status: 'confirmed',
          message: 'Payment confirmed'
        });
      }

      clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate(`/orders/${data.order._id}?success=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setPlacing(false);
  };

  /* ---- Redirect if cart empty ---- */
  if (cart.length === 0) return (
    <div className="co-empty">
      <span>🛒</span>
      <h2>Your cart is empty</h2>
      <Link to="/catalog" className="co-empty-btn">Shop Now</Link>
    </div>
  );

  return (
    <div className="co-page">

      {/* Header */}
      <div className="co-header">
        <div className="co-header-inner">
          <Link to="/cart" className="co-header-back">← Back to Cart</Link>
          <div className="co-header-logo">
            <span className="co-logo-main">FABULOUS</span>
            <span className="co-logo-sub">& MORE</span>
          </div>
          <div className="co-header-secure">
            <FiLock /> Secure Checkout
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="co-steps-bar">
        <div className="co-steps-inner">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`co-step ${i < step ? 'done' : i === step ? 'active' : 'upcoming'}`}>
                <div className="co-step-circle">
                  {i < step ? <FiCheck /> : i + 1}
                </div>
                <span className="co-step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`co-step-line ${i < step ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="co-layout">

        {/* ============ LEFT — Step content ============ */}
        <div className="co-left">

          {/* ---- STEP 0: Delivery ---- */}
          {step === 0 && (
            <div className="co-section">
              <div className="co-section-title">
                <div className="co-section-icon"><FiMapPin /></div>
                <h2>Delivery Information</h2>
              </div>

              <div className="co-form-grid">
                <div className="co-field">
                  <label className="co-label">Full Name *</label>
                  <input className="co-input" value={address.name}
                    onChange={e => setAddr('name', e.target.value)}
                    placeholder="e.g. Amara Johnson" />
                </div>
                <div className="co-field">
                  <label className="co-label">Phone Number *</label>
                  <input className="co-input" value={address.phone}
                    onChange={e => setAddr('phone', e.target.value)}
                    placeholder="e.g. 08012345678" type="tel" />
                </div>
                <div className="co-field co-field-full">
                  <label className="co-label">Street Address *</label>
                  <input className="co-input" value={address.street}
                    onChange={e => setAddr('street', e.target.value)}
                    placeholder="House number, street name, area" />
                </div>
                <div className="co-field">
                  <label className="co-label">City *</label>
                  <input className="co-input" value={address.city}
                    onChange={e => setAddr('city', e.target.value)}
                    placeholder="e.g. Lagos" />
                </div>
                <div className="co-field">
                  <label className="co-label">State *</label>
                  <select className="co-input" value={address.state}
                    onChange={e => setAddr('state', e.target.value)}>
                    <option value="">Select state...</option>
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="co-field">
                  <label className="co-label">ZIP / Postal Code</label>
                  <input className="co-input" value={address.zipCode}
                    onChange={e => setAddr('zipCode', e.target.value)}
                    placeholder="e.g. 100001" />
                </div>
                <div className="co-field">
                  <label className="co-label">Country</label>
                  <input className="co-input" value={address.country} readOnly
                    style={{ background: '#f9f9f9', cursor: 'not-allowed' }} />
                </div>
              </div>

              {/* Delivery note */}
              <div className="co-field" style={{ marginTop: '16px' }}>
                <label className="co-label">Delivery Note (optional)</label>
                <textarea className="co-input co-textarea" value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..." />
              </div>

              {/* Delivery info cards */}
              <div className="co-delivery-cards">
                {[
                  { icon: '🚚', title: 'Standard Delivery', desc: '3–5 business days', price: cartTotal >= 50000 ? 'FREE' : '₦2,000' },
                  { icon: '⚡', title: 'Express Delivery', desc: '1–2 business days', price: '₦5,000' },
                ].map(d => (
                  <div key={d.title} className={`co-delivery-card ${d.price === (cartTotal >= 50000 ? 'FREE' : '₦2,000') ? 'selected' : ''}`}>
                    <span className="co-delivery-emoji">{d.icon}</span>
                    <div>
                      <div className="co-delivery-title">{d.title}</div>
                      <div className="co-delivery-desc">{d.desc}</div>
                    </div>
                    <span className={`co-delivery-price ${d.price === 'FREE' ? 'free' : ''}`}>
                      {d.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- STEP 1: Payment ---- */}
          {step === 1 && (
            <div className="co-section">
              <div className="co-section-title">
                <div className="co-section-icon"><FiCreditCard /></div>
                <h2>Payment Method</h2>
              </div>

              {/* Payment options */}
              <div className="co-payment-methods">
                {[
                  { id: 'stripe',      label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Verve' },
                  { id: 'bank_transfer', label: 'Bank Transfer',     icon: '🏦', desc: 'Pay directly to our account' },
                  { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { id: 'whatsapp_pay', label: 'WhatsApp Payment',   icon: '📱', desc: 'We\'ll send payment details via WhatsApp' },
                ].map(m => (
                  <label key={m.id} className={`co-payment-option ${payment === m.id ? 'selected' : ''}`}>
                    <input type="radio" name="payment" value={m.id}
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      className="co-payment-radio" />
                    <span className="co-payment-icon">{m.icon}</span>
                    <div className="co-payment-text">
                      <span className="co-payment-label">{m.label}</span>
                      <span className="co-payment-desc">{m.desc}</span>
                    </div>
                    {payment === m.id && <FiCheck className="co-payment-check" />}
                  </label>
                ))}
              </div>

              {/* Card details form */}
              {payment === 'stripe' && (
                <div className="co-card-form">
                  <div className="co-card-header">
                    <FiLock className="co-card-lock" />
                    <span>Your card details are encrypted and secure</span>
                  </div>
                  <div className="co-form-grid">
                    <div className="co-field co-field-full">
                      <label className="co-label">Card Number *</label>
                      <input className="co-input co-card-input"
                        value={cardDetails.number}
                        onChange={e => setCard('number', formatCard(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19} />
                    </div>
                    <div className="co-field">
                      <label className="co-label">Expiry Date *</label>
                      <input className="co-input"
                        value={cardDetails.expiry}
                        onChange={e => setCard('expiry', formatExpiry(e.target.value))}
                        placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div className="co-field">
                      <label className="co-label">CVV *</label>
                      <input className="co-input" type="password"
                        value={cardDetails.cvv}
                        onChange={e => setCard('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
                        placeholder="•••" maxLength={4} />
                    </div>
                    <div className="co-field co-field-full">
                      <label className="co-label">Cardholder Name *</label>
                      <input className="co-input"
                        value={cardDetails.holder}
                        onChange={e => setCard('holder', e.target.value)}
                        placeholder="Name as on card" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank transfer details */}
              {payment === 'bank_transfer' && (
                <div className="co-bank-details">
                  <h4>Bank Account Details</h4>
                  {[
                    ['Bank', 'First Bank of Nigeria'],
                    ['Account Name', 'Fabulous & More Ltd'],
                    ['Account Number', '1234567890'],
                    ['Reference', `ORDER-${user?.name?.split(' ')[0]?.toUpperCase()}-${Date.now().toString().slice(-6)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="co-bank-row">
                      <span className="co-bank-key">{k}</span>
                      <span className="co-bank-val">{v}</span>
                    </div>
                  ))}
                  <p className="co-bank-note">
                    ⚠️ Please use the reference above. Your order will be confirmed within 2 hours of payment.
                  </p>
                </div>
              )}

              {/* WhatsApp payment */}
              {payment === 'whatsapp_pay' && (
                <div className="co-whatsapp-pay">
                  <FaWhatsapp className="co-wp-icon" />
                  <div>
                    <h4>WhatsApp Payment</h4>
                    <p>After placing your order, we'll send payment instructions to your WhatsApp number. Fast, easy, and secure.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- STEP 2: Review ---- */}
          {step === 2 && (
            <div className="co-section">
              <div className="co-section-title">
                <div className="co-section-icon"><FiCheck /></div>
                <h2>Review Your Order</h2>
              </div>

              {/* Delivery summary */}
              <div className="co-review-block">
                <div className="co-review-block-header">
                  <span>📍 Delivery Address</span>
                  <button className="co-review-edit" onClick={() => setStep(0)}>Edit</button>
                </div>
                <div className="co-review-block-body">
                  <p><strong>{address.name}</strong></p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state}</p>
                  <p>{address.country}</p>
                  <p>📞 {address.phone}</p>
                </div>
              </div>

              {/* Payment summary */}
              <div className="co-review-block">
                <div className="co-review-block-header">
                  <span>💳 Payment Method</span>
                  <button className="co-review-edit" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="co-review-block-body">
                  <p>
                    {{
                      stripe: `💳 Card ending in ${cardDetails.number.replace(/\s/g,'').slice(-4) || '****'}`,
                      bank_transfer: '🏦 Bank Transfer',
                      cash_on_delivery: '💵 Cash on Delivery',
                      whatsapp_pay: '📱 WhatsApp Payment',
                    }[payment]}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="co-review-block">
                <div className="co-review-block-header">
                  <span>📦 Items ({cart.length})</span>
                </div>
                <div className="co-review-items">
                  {cart.map(item => (
                    <div key={item._id} className="co-review-item">
                      <img
                        src={item.images?.[0]?.url || 'https://via.placeholder.com/56x56?text=+'}
                        alt={item.name}
                        className="co-review-item-img"
                      />
                      <div className="co-review-item-info">
                        <span className="co-review-item-name">{item.name}</span>
                        <span className="co-review-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="co-review-item-price">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {notes && (
                <div className="co-review-block">
                  <div className="co-review-block-header"><span>📝 Delivery Note</span></div>
                  <div className="co-review-block-body"><p>{notes}</p></div>
                </div>
              )}

              {/* Terms */}
              <p className="co-terms">
                By placing this order you agree to our{' '}
                <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="co-nav-btns">
            {step > 0 && (
              <button className="co-btn-back" onClick={back}>← Back</button>
            )}
            {step < 2 ? (
              <button className="co-btn-next" onClick={next}>
                Continue <FiChevronRight />
              </button>
            ) : (
              <button
                className="co-btn-place"
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? 'Placing Order...' : `Place Order — ₦${Math.round(total).toLocaleString()}`}
              </button>
            )}
          </div>
        </div>

        {/* ============ RIGHT — Order summary ============ */}
        <div className="co-right">
          <div className="co-summary-card">
            <h3 className="co-summary-title">Order Summary</h3>

            {/* Items */}
            <div className="co-summary-items">
              {cart.map(item => (
                <div key={item._id} className="co-summary-item">
                  <div className="co-summary-item-img-wrap">
                    <img
                      src={item.images?.[0]?.url || 'https://via.placeholder.com/52x52?text=+'}
                      alt={item.name}
                      className="co-summary-item-img"
                    />
                    <span className="co-summary-item-qty">{item.quantity}</span>
                  </div>
                  <span className="co-summary-item-name">{item.name}</span>
                  <span className="co-summary-item-price">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="co-summary-totals">
              <div className="co-summary-line">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="co-summary-line">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'co-free' : ''}>
                  {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="co-summary-line">
                <span>VAT (7.5%)</span>
                <span>₦{Math.round(tax).toLocaleString()}</span>
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span className="co-summary-total-amount">
                  ₦{Math.round(total).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="co-guarantees">
              {[
                [FiLock,    'SSL Encrypted Payment'],
                [FiTruck,   'Fast & Reliable Delivery'],
                [FiShield,  '30-Day Return Policy'],
              ].map(([Icon, label]) => (
                <div key={label} className="co-guarantee">
                  <Icon className="co-guarantee-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}