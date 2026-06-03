import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiStar,
  FiShoppingCart,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "../styles/CatalogPage.css";

const CATEGORIES = [
  "Kitchen Utensils",
  "Cookware",
  "Bakeware",
  "Storage Solutions",
  "Cleaning Tools",
  "Small Appliances",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PRICE_RANGES = [
  { label: "Under ₦5,000", min: "", max: "5000" },
  { label: "₦5,000 – ₦15,000", min: "5000", max: "15000" },
  { label: "₦15,000 – ₦50,000", min: "15000", max: "50000" },
  { label: "Above ₦50,000", min: "50000", max: "" },
];


const API_URL = import.meta.env.VITE_API_URL;


export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false); // mobile filter drawer

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);

    axios
      .get(`${API_URL}/api/products?${params}`)
      .then((r) => {
        setProducts(r.data.products || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [category, search, sort, minPrice, maxPrice, page]);

  const set = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const clearAll = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = category || minPrice || maxPrice;
  const totalPages = Math.ceil(total / 12);

  /* ---- Sidebar ---- */
  const Sidebar = () => (
    <aside className={`cat-sidebar ${filterOpen ? "open" : ""}`}>
      <div className="cat-sidebar-header">
        <h3>Filters</h3>
        {hasFilters && (
          <button className="cat-clear-btn" onClick={clearAll}>
            Clear all
          </button>
        )}
        <button
          className="cat-sidebar-close"
          onClick={() => setFilterOpen(false)}
        >
          <FiX />
        </button>
      </div>

      {/* Category */}
      <div className="cat-filter-group">
        <div className="cat-filter-label">Category</div>
        <div className="cat-filter-options">
          <button
            className={`cat-filter-opt ${!category ? "active" : ""}`}
            onClick={() => set("category", "")}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-filter-opt ${category === cat ? "active" : ""}`}
              onClick={() => set("category", cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price ranges */}
      <div className="cat-filter-group">
        <div className="cat-filter-label">Price Range</div>
        <div className="cat-filter-options">
          <button
            className={`cat-filter-opt ${!minPrice && !maxPrice ? "active" : ""}`}
            onClick={() => {
              set("minPrice", "");
              set("maxPrice", "");
            }}
          >
            Any Price
          </button>
          {PRICE_RANGES.map((r) => (
            <button
              key={r.label}
              className={`cat-filter-opt ${minPrice === r.min && maxPrice === r.max ? "active" : ""}`}
              onClick={() => {
                set("minPrice", r.min);
                set("maxPrice", r.max);
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom price */}
      <div className="cat-filter-group">
        <div className="cat-filter-label">Custom Price (₦)</div>
        <div className="cat-price-row">
          <input
            className="cat-price-input"
            placeholder="Min"
            type="number"
            value={minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
          />
          <span className="cat-price-sep">–</span>
          <input
            className="cat-price-input"
            placeholder="Max"
            type="number"
            value={maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
          />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="cat-page">
      {/* ---- Page header ---- */}
      <div className="cat-header">
        <div className="cat-header-inner">
          <h1 className="cat-header-title">
            {category || (search ? `"${search}"` : "Our Collection")}
          </h1>
          <p className="cat-header-sub">
            {loading
              ? "Loading..."
              : `${total} product${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className="cat-body">
        {/* Mobile filter overlay */}
        {filterOpen && (
          <div
            className="cat-sidebar-overlay"
            onClick={() => setFilterOpen(false)}
          />
        )}

        <Sidebar />

        {/* ---- Main content ---- */}
        <div className="cat-main">
          {/* Toolbar */}
          <div className="cat-toolbar">
            <div className="cat-toolbar-left">
              {/* Mobile filter toggle */}
              <button
                className="cat-filter-toggle"
                onClick={() => setFilterOpen(true)}
              >
                <FiFilter /> Filters
                {hasFilters && <span className="cat-filter-badge" />}
              </button>
              <span className="cat-result-count">
                {total} product{total !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="cat-toolbar-right">
              {/* Sort */}
              <select
                className="cat-sort-select"
                value={sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              {/* View mode toggle */}
              <div className="cat-view-toggle">
                {[
                  ["grid", FiGrid],
                  ["list", FiList],
                ].map(([mode, Icon]) => (
                  <button
                    key={mode}
                    className={`cat-view-btn ${viewMode === mode ? "active" : ""}`}
                    onClick={() => setViewMode(mode)}
                    aria-label={`${mode} view`}
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          {hasFilters && (
            <div className="cat-active-filters">
              {category && (
                <span className="cat-chip">
                  {category}
                  <button onClick={() => set("category", "")}>
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="cat-chip">
                  ₦{minPrice || "0"} – {maxPrice ? `₦${maxPrice}` : "∞"}
                  <button
                    onClick={() => {
                      set("minPrice", "");
                      set("maxPrice", "");
                    }}
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              <button className="cat-chip-clear" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="cat-loading">
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="cat-empty">
              <div className="cat-empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="cat-empty-btn" onClick={clearAll}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid" ? "cat-products-grid" : "cat-products-list"
              }
            >
              {products.map((p) =>
                viewMode === "grid" ? (
                  <GridCard
                    key={p._id}
                    p={p}
                    addToCart={addToCart}
                    navigate={navigate}
                  />
                ) : (
                  <ListCard
                    key={p._id}
                    p={p}
                    addToCart={addToCart}
                    navigate={navigate}
                  />
                ),
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="cat-pagination">
              <button
                className="cat-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    className={`cat-page-btn ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                className="cat-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Grid card ---- */
function GridCard({ p, addToCart, navigate }) {
  const discount = p.comparePrice
    ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
    : 0;

  return (
    <div
      className="cat-grid-card"
      onClick={() => navigate(`/product/${p._id}`)}
    >
      <div className="cat-grid-img-wrap">
        <img src={p.images?.[0]?.url || "/placeholder.svg"} alt={p.name} />
        {discount > 0 && <span className="cat-grid-badge">-{discount}%</span>}
        <button
          className="cat-grid-cart-btn"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(p);
          }}
          aria-label="Add to cart"
        >
          <FiShoppingCart />
        </button>
      </div>
      <div className="cat-grid-body">
        <div className="cat-grid-category">{p.category}</div>
        <div className="cat-grid-name">{p.name}</div>
        <div className="cat-grid-stars">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className="cat-star"
              style={{
                fill:
                  i < Math.round(p.ratings?.average || 0) ? "#D4AF37" : "none",
              }}
            />
          ))}
          <span className="cat-star-count">({p.ratings?.count || 0})</span>
        </div>
        <div className="cat-grid-prices">
          <span className="cat-grid-price">₦{p.price?.toLocaleString()}</span>
          {p.comparePrice && (
            <span className="cat-grid-compare">
              ₦{p.comparePrice?.toLocaleString()}
            </span>
          )}
        </div>
        {p.stock > 0 && p.stock <= (p.lowStockThreshold || 10) && (
          <div className="cat-grid-low-stock">Only {p.stock} left</div>
        )}
      </div>
    </div>
  );
}

/* ---- List card ---- */
function ListCard({ p, addToCart, navigate }) {
  const discount = p.comparePrice
    ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
    : 0;

  return (
    <div
      className="cat-list-card"
      onClick={() => navigate(`/product/${p._id}`)}
    >
      <div className="cat-list-img-wrap">
        <img src={p.images?.[0]?.url || "/placeholder.svg"} alt={p.name} />
        {discount > 0 && <span className="cat-list-badge">-{discount}%</span>}
      </div>
      <div className="cat-list-body">
        <div className="cat-list-category">{p.category}</div>
        <h3 className="cat-list-name">{p.name}</h3>
        <p className="cat-list-desc">
          {p.shortDescription || p.description?.slice(0, 120)}
          {p.shortDescription?.length > 120 || p.description?.length > 120
            ? "..."
            : ""}
        </p>
        <div className="cat-list-stars">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className="cat-star"
              style={{
                fill:
                  i < Math.round(p.ratings?.average || 0) ? "#D4AF37" : "none",
              }}
            />
          ))}
          <span className="cat-star-count">({p.ratings?.count || 0})</span>
        </div>
        <div className="cat-list-footer">
          <div className="cat-list-prices">
            <span className="cat-list-price">₦{p.price?.toLocaleString()}</span>
            {p.comparePrice && (
              <span className="cat-list-compare">
                ₦{p.comparePrice?.toLocaleString()}
              </span>
            )}
          </div>
          <button
            className="cat-list-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(p);
            }}
          >
            <FiShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
