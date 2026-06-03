import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiArrowRight,
  FiTag,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/CartPage.css";

const SHIPPING_THRESHOLD = 50000;
const SHIPPING_COST = 2000;

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotal, cartCount } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingFree = cartTotal >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_COST;
  const tax = (cartTotal - discount) * 0.075;
  const total = cartTotal - discount + shipping + tax;
  const toFreeShip = SHIPPING_THRESHOLD - cartTotal;

  const handleCoupon = () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setTimeout(() => {
      const codes = { FABULOUS10: 0.1, WELCOME20: 0.2, SAVE15: 0.15 };
      const rate = codes[coupon.toUpperCase()];
      if (rate) {
        const amount = Math.round(cartTotal * rate);
        setDiscount(amount);
        setCouponApplied(coupon.toUpperCase());
        toast.success(`Coupon applied! ₦${amount.toLocaleString()} off`);
      } else {
        toast.error("Invalid coupon code");
      }
      setCouponLoading(false);
    }, 800);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied("");
    setCoupon("");
    toast.success("Coupon removed");
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  /* ---- Empty cart ---- */
  if (cart.length === 0)
    return (
      <div className="cart-empty-page">
        <div className="cart-empty-wrap">
          <span className="cart-empty-icon">🛒</span>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-sub">
            Looks like you haven't added anything yet.
          </p>
          <Link to="/catalog" className="cart-empty-btn">
            Start Shopping <FiArrowRight />
          </Link>
          <div className="cart-empty-links">
            <Link to="/">Home</Link>
            <span>·</span>
            <Link to="/catalog">All Products</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="cart-page">
      {/* Page header */}
      <div className="cart-page-header">
        <div className="cart-page-header-inner">
          <h1>Shopping Cart</h1>
          <span className="cart-page-count">
            {cartCount} item{cartCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="cart-layout">
        {/* ============ LEFT — Items ============ */}
        <div className="cart-items-col">
          {/* Free shipping progress */}
          {!shippingFree && (
            <div className="cart-shipping-progress">
              <div className="cart-shipping-progress-text">
                <FiTruck className="cart-shipping-icon" />
                <span>
                  Add <strong>₦{toFreeShip.toLocaleString()}</strong> more for
                  free delivery!
                </span>
              </div>
              <div className="cart-shipping-bar">
                <div
                  className="cart-shipping-fill"
                  style={{
                    width: `${Math.min((cartTotal / SHIPPING_THRESHOLD) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {shippingFree && (
            <div className="cart-shipping-progress cart-shipping-free">
              <FiTruck className="cart-shipping-icon" />
              <span>
                🎉 You've unlocked <strong>free delivery!</strong>
              </span>
            </div>
          )}

          {/* Items list */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                {/* Image */}
                <Link
                  to={`/product/${item._id}`}
                  className="cart-item-img-wrap"
                >
                  <img
                    src={item.images?.[0]?.url || "/placeholder.svg"}
                    alt={item.name}
                    className="cart-item-img"
                  />
                </Link>

                {/* Details */}
                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <span className="cart-item-category">
                        {item.category}
                      </span>
                      <Link
                        to={`/product/${item._id}`}
                        className="cart-item-name"
                      >
                        {item.name}
                      </Link>
                      {item.sku && (
                        <span className="cart-item-sku">SKU: {item.sku}</span>
                      )}
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => {
                        removeFromCart(item._id);
                        toast.success("Item removed");
                      }}
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    {/* Qty control */}
                    <div className="cart-qty">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item._id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <FiMinus />
                      </button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Unit price */}
                    <div className="cart-item-unit-price">
                      ₦{item.price?.toLocaleString()} each
                    </div>

                    {/* Subtotal */}
                    <div className="cart-item-subtotal">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  {/* Low stock warning */}
                  {item.stock <= 5 && (
                    <div className="cart-item-stock-warn">
                      ⚠️ Only {item.stock} left in stock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="cart-actions">
            <button
              className="cart-clear-btn"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
            >
              <FiTrash2 /> Clear Cart
            </button>
            <Link to="/catalog" className="cart-continue-btn">
              ← Continue Shopping
            </Link>
          </div>

          {/* WhatsApp order option */}
          <div className="cart-whatsapp-box">
            <FaWhatsapp className="cart-whatsapp-icon" />
            <div className="cart-whatsapp-text">
              <strong>Prefer to order on WhatsApp?</strong>
              <span>Chat with us and we'll process your order manually.</span>
            </div>
            <a
              href={`https://wa.me/2348000000000?text=Hello! I'd like to order:${cart.map((i) => `%0A- ${i.name} x${i.quantity}`).join("")}%0A%0ATotal: ₦${total.toLocaleString()}`}
              target="_blank"
              rel="noreferrer"
              className="cart-whatsapp-btn"
            >
              Chat Now
            </a>
          </div>
        </div>

        {/* ============ RIGHT — Summary ============ */}
        <div className="cart-summary-col">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>

            {/* Line items */}
            <div className="cart-summary-lines">
              <div className="cart-summary-line">
                <span>Subtotal ({cartCount} items)</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="cart-summary-line discount">
                  <span>Coupon ({couponApplied})</span>
                  <span>-₦{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="cart-summary-line">
                <span>Shipping</span>
                <span className={shippingFree ? "free-label" : ""}>
                  {shippingFree ? "FREE" : `₦${SHIPPING_COST.toLocaleString()}`}
                </span>
              </div>

              <div className="cart-summary-line">
                <span>VAT (7.5%)</span>
                <span>₦{Math.round(tax).toLocaleString()}</span>
              </div>
            </div>

            {/* Total */}
            <div className="cart-summary-total">
              <span>Total</span>
              <span className="cart-total-amount">
                ₦{Math.round(total).toLocaleString()}
              </span>
            </div>

            {/* Coupon input */}
            <div className="cart-coupon">
              <p className="cart-coupon-label">
                <FiTag /> Have a coupon?
              </p>
              {couponApplied ? (
                <div className="cart-coupon-applied">
                  <span>
                    ✓ <strong>{couponApplied}</strong> applied
                  </span>
                  <button onClick={removeCoupon} className="cart-coupon-remove">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="cart-coupon-row">
                  <input
                    className="cart-coupon-input"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCoupon()}
                    placeholder="Enter code..."
                  />
                  <button
                    className="cart-coupon-btn"
                    onClick={handleCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              <p className="cart-coupon-hint">
                Try: FABULOUS10, WELCOME20, SAVE15
              </p>
            </div>

            {/* Checkout button */}
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <FiArrowRight />
            </button>

            {!user && (
              <p className="cart-login-note">
                <Link to="/login">Login</Link> or{" "}
                <Link to="/register">Register</Link> to checkout
              </p>
            )}

            {/* Trust badges */}
            <div className="cart-trust">
              {[
                [FiShield, "Secure Checkout"],
                [FiTruck, "Fast Delivery"],
                [FiRefreshCw, "30-Day Returns"],
              ].map(([Icon, label]) => (
                <div key={label} className="cart-trust-item">
                  <Icon className="cart-trust-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Payment icons */}
            <div className="cart-payment-icons">
              <span className="cart-payment-label">We accept:</span>
              <div className="cart-payment-badges">
                {["💳 Card", "🏦 Bank", "📱 WhatsApp Pay"].map((p) => (
                  <span key={p} className="cart-payment-badge">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
