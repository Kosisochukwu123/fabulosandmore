import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiPackage,
  FiImage,
  FiStar,
  FiAlertTriangle,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import ImageUploader from "../../components/admin/ImageUploader";
import "../../styles/AdminProducts.css";

const CATEGORIES = [
  "Kitchen Utensils",
  "Cookware",
  "Bakeware",
  "Storage Solutions",
  "Cleaning Tools",
  "Small Appliances",
];

const EMPTY_FORM = {
  name: "",
  category: "",
  subcategory: "",
  brand: "",
  sku: "",
  barcode: "",
  price: "",
  comparePrice: "",
  costPrice: "",
  stock: "",
  lowStockThreshold: "10",
  warehouseLocation: "",
  description: "",
  shortDescription: "",
  weight: "",
  features: "",
  tags: "",
  isFeatured: false,
  isBulkAvailable: false,
  isActive: true,
};

const API_URL = process.env.REACT_APP_API_URL;

export default function ProductsAdminPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const LIMIT = 15;

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    axios
      .get(`${API_URL}/api/products?${params}`)
      .then((r) => {
        setProducts(r.data.products || []);
        setTotal(r.data.total || 0);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category]);
  useEffect(() => {
    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openNew = () => {
    setEditProduct(null);
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      toast.success("Product deactivated");
      fetchProducts();
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  };

  const handleToggleActive = async (p) => {
    try {
      await axios.put(`${API_URL}/api/products/${p._id}`, {
        isActive: !p.isActive,
      });
      toast.success(`Product ${p.isActive ? "hidden" : "activated"}`);
      fetchProducts();
    } catch {
      toast.error("Failed");
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="adm-prod-page">
      {/* Top bar */}
      <div className="adm-prod-topbar">
        <div className="adm-prod-topbar-left">
          <div>
            <h1 className="adm-prod-title">Products</h1>
            <p className="adm-prod-sub">{total} total products</p>
          </div>
        </div>
        <button className="adm-prod-add-btn" onClick={openNew}>
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="adm-prod-filters">
        <div className="adm-prod-search">
          <FiSearch className="adm-prod-search-icon" />
          <input
            className="adm-prod-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              className="adm-prod-search-clear"
              onClick={() => setSearch("")}
            >
              <FiX />
            </button>
          )}
        </div>
        <select
          className="adm-prod-cat-filter"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="adm-prod-table-wrap">
        {loading ? (
          <div className="adm-prod-loading">
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="adm-prod-empty">
            <FiPackage className="adm-prod-empty-icon" />
            <p>No products found</p>
            <button className="adm-prod-add-btn" onClick={openNew}>
              <FiPlus /> Add First Product
            </button>
          </div>
        ) : (
          <table className="adm-prod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className={!p.isActive ? "inactive-row" : ""}>
                  {/* Product */}
                  <td>
                    <div className="adm-prod-cell">
                      <img
                        src={p.images?.[0]?.url || "/placeholder.svg"}
                        alt={p.name}
                        className="adm-prod-thumb"
                      />
                      <div>
                        <div className="adm-prod-name">{p.name}</div>
                        <div className="adm-prod-sku">SKU: {p.sku}</div>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td>
                    <span className="adm-prod-cat-badge">{p.category}</span>
                  </td>
                  {/* Price */}
                  <td>
                    <div className="adm-prod-price">
                      ₦{p.price?.toLocaleString()}
                    </div>
                    {p.comparePrice && (
                      <div className="adm-prod-compare">
                        ₦{p.comparePrice?.toLocaleString()}
                      </div>
                    )}
                  </td>
                  {/* Stock */}
                  <td>
                    <div
                      className={`adm-prod-stock ${
                        p.stock === 0
                          ? "out"
                          : p.stock <= p.lowStockThreshold
                            ? "low"
                            : "ok"
                      }`}
                    >
                      {p.stock === 0 && <FiAlertTriangle size={12} />}
                      {p.stock} units
                    </div>
                  </td>
                  {/* Status */}
                  <td>
                    <button
                      className={`adm-prod-status-btn ${p.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleActive(p)}
                      title={p.isActive ? "Click to hide" : "Click to activate"}
                    >
                      {p.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      {p.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  {/* Sales */}
                  <td>
                    <div className="adm-prod-sales">
                      {p.totalSold || 0} sold
                    </div>
                    <div className="adm-prod-views">
                      {p.viewCount || 0} views
                    </div>
                  </td>
                  {/* Actions */}
                  <td>
                    <div className="adm-prod-actions">
                      <button
                        className="adm-prod-action-btn view"
                        onClick={() =>
                          window.open(`/product/${p._id}`, "_blank")
                        }
                        title="View live"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="adm-prod-action-btn edit"
                        onClick={() => openEdit(p)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="adm-prod-action-btn delete"
                        onClick={() => handleDelete(p._id)}
                        disabled={deleting === p._id}
                        title="Deactivate"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="adm-prod-pagination">
          <button
            className="adm-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              className={`adm-page-btn ${page === i + 1 ? "active" : ""}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="adm-page-btn"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          onClose={closeForm}
          onSaved={() => {
            closeForm();
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

/* ================================================================
   PRODUCT FORM MODAL
   ================================================================ */
function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(
    isEdit
      ? {
          ...EMPTY_FORM,
          name: product.name || "",
          category: product.category || "",
          subcategory: product.subcategory || "",
          brand: product.brand || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          price: product.price || "",
          comparePrice: product.comparePrice || "",
          costPrice: product.costPrice || "",
          stock: product.stock ?? "",
          lowStockThreshold: product.lowStockThreshold || 10,
          warehouseLocation: product.warehouseLocation || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          weight: product.weight || "",
          features: product.features?.join("\n") || "",
          tags: product.tags?.join(", ") || "",
          isFeatured: product.isFeatured || false,
          isBulkAvailable: product.isBulkAvailable || false,
          isActive: product.isActive !== false,
        }
      : EMPTY_FORM,
  );

  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("basic");
  const [imageFiles, setImageFiles] = useState([]); // files selected for new product
  const [imagePreviews, setImagePreviews] = useState([]); // preview URLs
  const imgInputRef = React.useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* Handle image file selection */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImagePreview = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const save = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.category ||
      !form.sku ||
      !form.price ||
      form.stock === ""
    ) {
      toast.error(
        "Fill all required fields: Name, Category, SKU, Price, Stock",
      );
      return;
    }

    setSaving(true);
    try {
      /* Always use FormData so multer on the server handles both
         JSON fields and optional image files in one request */
      const fd = new FormData();

      /* Append all text fields */
      const fields = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory || "",
        brand: form.brand || "",
        sku: form.sku,
        barcode: form.barcode || "",
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : "",
        costPrice: form.costPrice ? Number(form.costPrice) : "",
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        warehouseLocation: form.warehouseLocation || "",
        description: form.description || form.shortDescription || "",
        shortDescription: form.shortDescription || "",
        weight: form.weight ? Number(form.weight) : "",
        features: form.features || "",
        tags: form.tags || "",
        isFeatured: form.isFeatured ? "true" : "false",
        isBulkAvailable: form.isBulkAvailable ? "true" : "false",
        isActive: form.isActive ? "true" : "false",
      };

      Object.entries(fields).forEach(([k, v]) => {
        if (v !== "" && v !== undefined) fd.append(k, v);
      });

      /* Append image files */
      imageFiles.forEach((file) => fd.append("images", file));

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) {
        await axios.put(`${API_URL}/api/products/${product._id}`, fd, config);
        toast.success("Product updated!");
      } else {
        await axios.post(`${API_URL}/api/products`, fd, config);
        toast.success("Product created!");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
    setSaving(false);
  };

  const TABS = [
    { id: "basic", label: "Basic Info" },
    { id: "pricing", label: "Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "details", label: "Details" },
  ];

  return (
    <div
      className="adm-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="adm-modal">
        {/* Modal header */}
        <div className="adm-modal-head">
          <h2>{isEdit ? `Edit: ${product.name}` : "Add New Product"}</h2>
          <button className="adm-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className="adm-modal-tabs">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`adm-modal-tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="adm-modal-form" onSubmit={save}>
          <div className="adm-modal-body">
            {/* ---- BASIC ---- */}
            {tab === "basic" && (
              <div className="adm-form-grid">
                <div className="adm-field adm-field-full">
                  <label className="adm-label">Product Name *</label>
                  <input
                    className="adm-input"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Premium Non-Stick Frying Pan 28cm"
                    required
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Category *</label>
                  <select
                    className="adm-input"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-field">
                  <label className="adm-label">Subcategory</label>
                  <input
                    className="adm-input"
                    value={form.subcategory}
                    onChange={(e) => set("subcategory", e.target.value)}
                    placeholder="e.g. Frying Pans"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Brand</label>
                  <input
                    className="adm-input"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="e.g. Tefal"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">SKU *</label>
                  <input
                    className="adm-input"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. PAN-NST-28-BLK"
                    required
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Barcode</label>
                  <input
                    className="adm-input"
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="e.g. 6001234567890"
                  />
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label">Short Description</label>
                  <input
                    className="adm-input"
                    value={form.shortDescription}
                    onChange={(e) => set("shortDescription", e.target.value)}
                    placeholder="One-line summary shown on product cards"
                  />
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label">Full Description</label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Detailed product description..."
                  />
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label">Tags (comma separated)</label>
                  <input
                    className="adm-input"
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="e.g. non-stick, oven-safe, dishwasher-safe"
                  />
                </div>
              </div>
            )}

            {/* ---- PRICING ---- */}
            {tab === "pricing" && (
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label">Selling Price (₦) *</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="e.g. 15000"
                    required
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Compare-at Price (₦)</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    value={form.comparePrice}
                    onChange={(e) => set("comparePrice", e.target.value)}
                    placeholder="Original price (shown crossed out)"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Cost Price (₦)</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => set("costPrice", e.target.value)}
                    placeholder="Your purchase cost (not shown publicly)"
                  />
                </div>
                {form.price && form.costPrice && (
                  <div className="adm-field">
                    <label className="adm-label">Margin</label>
                    <div className="adm-margin-display">
                      <span className="adm-margin-pct">
                        {Math.round(
                          ((form.price - form.costPrice) / form.price) * 100,
                        )}
                        %
                      </span>
                      <span className="adm-margin-amt">
                        ₦{(form.price - form.costPrice).toLocaleString()}{" "}
                        profit/unit
                      </span>
                    </div>
                  </div>
                )}
                <div className="adm-field adm-field-full">
                  <label className="adm-label adm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isBulkAvailable}
                      onChange={(e) => set("isBulkAvailable", e.target.checked)}
                    />
                    Available for bulk / wholesale orders
                  </label>
                </div>
              </div>
            )}

            {/* ---- INVENTORY ---- */}
            {tab === "inventory" && (
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label className="adm-label">Current Stock *</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => set("stock", e.target.value)}
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Low Stock Alert Threshold</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => set("lowStockThreshold", e.target.value)}
                    placeholder="Default: 10"
                  />
                  <span className="adm-field-note">
                    Alert fires when stock falls to this level
                  </span>
                </div>
                <div className="adm-field">
                  <label className="adm-label">Warehouse Location</label>
                  <input
                    className="adm-input"
                    value={form.warehouseLocation}
                    onChange={(e) => set("warehouseLocation", e.target.value)}
                    placeholder="e.g. Rack B-14, Shelf 3"
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Weight (kg)</label>
                  <input
                    className="adm-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => set("weight", e.target.value)}
                    placeholder="e.g. 0.85"
                  />
                </div>
                {/* Stock health indicator */}
                {form.stock !== "" && (
                  <div className="adm-field adm-field-full">
                    <div
                      className={`adm-stock-health ${
                        Number(form.stock) === 0
                          ? "out"
                          : Number(form.stock) <= Number(form.lowStockThreshold)
                            ? "low"
                            : "ok"
                      }`}
                    >
                      {Number(form.stock) === 0
                        ? "❌ Out of stock — customers cannot purchase"
                        : Number(form.stock) <= Number(form.lowStockThreshold)
                          ? `⚠️ Low stock — only ${form.stock} units remaining`
                          : `✅ In stock — ${form.stock} units available`}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---- DETAILS ---- */}
            {tab === "details" && (
              <div className="adm-form-grid">
                <div className="adm-field adm-field-full">
                  <label className="adm-label">
                    Key Features (one per line)
                  </label>
                  <textarea
                    className="adm-input adm-textarea"
                    value={form.features}
                    onChange={(e) => set("features", e.target.value)}
                    placeholder={
                      "Non-stick ceramic coating\nDishwasher safe\nOven safe up to 200°C\nErgonomic handle"
                    }
                  />
                  <span className="adm-field-note">
                    Each line becomes a bullet point on the product page
                  </span>
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label adm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => set("isFeatured", e.target.checked)}
                    />
                    Feature on homepage (Featured Products section)
                  </label>
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label adm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                    />
                    Product is active and visible to customers
                  </label>
                </div>
                <div className="adm-field adm-field-full">
                  <label className="adm-label">Product Images</label>

                  {/* For existing products — use the full ImageUploader */}
                  {isEdit ? (
                    <ImageUploader
                      productId={product._id}
                      existingImages={product.images || []}
                      onUpdated={(imgs) => console.log("Images updated", imgs)}
                    />
                  ) : (
                    /* For new products — simple file picker, images upload with the form */
                    <div className="adm-new-image-picker">
                      <input
                        ref={imgInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImageSelect}
                      />

                      {/* Drop zone / pick button */}
                      <div
                        className="adm-image-drop-zone"
                        onClick={() => imgInputRef.current?.click()}
                      >
                        <FiImage className="adm-image-drop-icon" />
                        <span className="adm-image-drop-text">
                          <strong>Click to select images</strong> or drag & drop
                        </span>
                        <span className="adm-image-drop-sub">
                          JPG, PNG, WebP · max 5MB each
                        </span>
                      </div>

                      {/* Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="adm-image-preview-row">
                          {imagePreviews.map((src, i) => (
                            <div key={i} className="adm-image-preview-thumb">
                              <img src={src} alt={`preview ${i + 1}`} />
                              {i === 0 && (
                                <span className="adm-image-main-badge">
                                  Main
                                </span>
                              )}
                              <button
                                type="button"
                                className="adm-image-remove-btn"
                                onClick={() => removeImagePreview(i)}
                              >
                                <FiX size={10} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="adm-image-add-more"
                            onClick={() => imgInputRef.current?.click()}
                          >
                            + Add more
                          </button>
                        </div>
                      )}

                      <span className="adm-field-note">
                        Images will be uploaded together when you click "Create
                        Product"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="adm-modal-footer">
            <button type="button" className="adm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="adm-btn-save" disabled={saving}>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
