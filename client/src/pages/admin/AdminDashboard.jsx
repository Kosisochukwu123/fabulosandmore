import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiDollarSign,
  FiAlertTriangle,
  FiBox,
  FiTruck,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const GOLD = "#D4AF37";
const COLORS = [GOLD, "#1A1A1A", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444"];


const API_URL = process.env.REACT_APP_API_URL;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/analytics/dashboard`)
      .then((r) => setData(r.data.data || {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Monthly Revenue",
      value: `₦${(data?.thisMonthRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: GOLD,
      bg: "#FBF5E0",
      change: data?.revenueGrowth
        ? `${data.revenueGrowth > 0 ? "+" : ""}${data.revenueGrowth}%`
        : "All time",
      changeType: (data?.revenueGrowth || 0) >= 0 ? "up" : "down",
    },
    {
      label: "Monthly Orders",
      value: data?.thisMonthOrders || 0,
      icon: FiShoppingCart,
      color: "#3B82F6",
      bg: "#EFF6FF",
      change: "This month",
      changeType: "flat",
    },
    {
      label: "Total Customers",
      value: (data?.totalCustomers || 0).toLocaleString(),
      icon: FiUsers,
      color: "#22C55E",
      bg: "#F0FDF4",
      change: "All time",
      changeType: "flat",
    },
    {
      label: "Total Orders",
      value: (data?.totalOrders || 0).toLocaleString(),
      icon: FiPackage,
      color: "#F59E0B",
      bg: "#FEF3C7",
      change: "All time",
      changeType: "flat",
    },
  ];

  return (
    <div className="adm-content">
      <div className="adm-page-header">
        <h2 className="adm-page-title">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h2>
        <p className="adm-page-sub">
          Here's what's happening with your store today.
        </p>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "80px" }}
        >
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="adm-stat-grid">
            {stats.map(
              ({ label, value, icon: Icon, color, bg, change, changeType }) => (
                <div key={label} className="adm-stat-card">
                  <div
                    className="adm-stat-icon-wrap"
                    style={{ background: bg }}
                  >
                    <Icon className="adm-stat-icon" style={{ color }} />
                  </div>
                  <div className="adm-stat-value">{value}</div>
                  <div className="adm-stat-label">{label}</div>
                  {change && (
                    <div className={`adm-stat-change ${changeType}`}>
                      {change}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          {/* Charts */}
          <div className="adm-charts-row">
            <div className="adm-card">
              <div className="adm-card-header">
                <h3 className="adm-card-title">Revenue — Last 30 Days</h3>
                <Link to="/admin/orders" className="adm-card-link">
                  View Orders →
                </Link>
              </div>
              {data?.dailySales?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis
                      dataKey="_id"
                      tick={{ fontSize: 11, fill: "#aaa" }}
                      tickFormatter={(v) => v?.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#aaa" }}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v) => [
                        `₦${(v || 0).toLocaleString()}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e8e8e8",
                        fontSize: 13,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={GOLD}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: GOLD }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty-note">No sales data yet</div>
              )}
            </div>

            <div className="adm-card">
              <div className="adm-card-header">
                <h3 className="adm-card-title">Orders by Status</h3>
              </div>
              {data?.salesByStatus?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.salesByStatus}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      labelLine={false}
                    >
                      {data.salesByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e8e8e8",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="adm-empty-note">No order data yet</div>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="adm-bottom-row">
            <div className="adm-card">
              <div className="adm-card-header">
                <h3 className="adm-card-title">Top Products</h3>
                <Link to="/admin/products" className="adm-card-link">
                  Manage →
                </Link>
              </div>
              {data?.topProducts?.length > 0 ? (
                data.topProducts.map((p, i) => (
                  <div key={p._id} className="adm-product-row">
                    <div className="adm-product-row-left">
                      <span className="adm-product-rank">#{i + 1}</span>
                      <span className="adm-product-name">{p.name}</span>
                    </div>
                    <span className="adm-product-sold">
                      {p.totalSold || 0} sold
                    </span>
                  </div>
                ))
              ) : (
                <div className="adm-empty-note">No products sold yet</div>
              )}
            </div>
            <LowStockPanel />
          </div>
        </>
      )}
    </div>
  );
}

function LowStockPanel() {
  const [lowStock, setLowStock] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("/api/products/low-stock")
      .then((r) => setLowStock(r.data.products || []))
      .catch(() => {});
  }, []);
  return (
    <div className="adm-card">
      <div className="adm-card-header">
        <div className="adm-low-stock-header">
          <FiAlertTriangle className="adm-low-stock-icon" />
          <h3 className="adm-card-title" style={{ margin: 0 }}>
            Low Stock ({lowStock.length})
          </h3>
        </div>
        <button
          className="adm-card-link"
          onClick={() => navigate("/admin/inventory")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Manage →
        </button>
      </div>
      {lowStock.length === 0 ? (
        <p className="adm-empty-note">All products well-stocked! ✅</p>
      ) : (
        lowStock.slice(0, 6).map((p) => (
          <div key={p._id} className="adm-low-stock-item">
            <div>
              <div className="adm-low-stock-name">{p.name}</div>
              <div className="adm-low-stock-sku">SKU: {p.sku}</div>
            </div>
            <div className="adm-low-stock-count">
              <div
                className={`adm-low-stock-num ${p.stock === 0 ? "red" : "amber"}`}
              >
                {p.stock}
              </div>
              <div className="adm-low-stock-sub">in stock</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
