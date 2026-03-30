import { useEffect, useState } from "react";
import { Alert, Badge, Spinner, Table } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getStatusVariant(status) {
  switch (status) {
    case "paid":
      return "success";
    case "preparing":
      return "warning";
    case "out_for_delivery":
      return "info";
    case "completed":
      return "primary";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

function formatStatus(status) {
  switch (status) {
    case "out_for_delivery":
      return "Out for delivery";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "-";
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

function shortDayLabel(day) {
  if (!day) return "";
  const date = new Date(day);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    revenue: 0,
    revenue_today: 0,
    restaurant_status: "Closed",
    top_selling_dish: null,
    live_orders: [],
    latest_orders: [],
    daily_orders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load dashboard.");
      }

      setStats({
        total_orders: Number(data.total_orders || 0),
        pending_orders: Number(data.pending_orders || 0),
        revenue: Number(data.revenue || 0),
        revenue_today: Number(data.revenue_today || 0),
        restaurant_status: data.restaurant_status || "Closed",
        top_selling_dish: data.top_selling_dish || null,
        live_orders: Array.isArray(data.live_orders) ? data.live_orders : [],
        latest_orders: Array.isArray(data.latest_orders) ? data.latest_orders : [],
        daily_orders: Array.isArray(data.daily_orders) ? data.daily_orders : [],
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  loadDashboard();

  const interval = setInterval(() => {
    loadDashboard();
  }, 20000); 

  return () => clearInterval(interval);
}, []);

  const chartData = stats.daily_orders.map((row) => ({
    ...row,
    label: shortDayLabel(row.day),
  }));

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p>Overview of restaurant activity.</p>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4">
          {error}
        </Alert>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Total Orders</span>
          <strong>{loading ? "..." : stats.total_orders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Pending Orders</span>
          <strong>{loading ? "..." : stats.pending_orders}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Revenue</span>
          <strong>{loading ? "..." : `$${stats.revenue.toFixed(2)}`}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Restaurant Status</span>
          <strong>{loading ? "..." : stats.restaurant_status}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Revenue Today</span>
          <strong>{loading ? "..." : `$${stats.revenue_today.toFixed(2)}`}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Top Selling Dish</span>
          <strong>
            {loading
              ? "..."
              : stats.top_selling_dish
              ? stats.top_selling_dish.name
              : "No data"}
          </strong>
          {!loading && stats.top_selling_dish && (
            <small className="text-muted">
              Sold: {stats.top_selling_dish.total_qty}
            </small>
          )}
        </div>
      </div>

      <div className="admin-card mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">Orders Per Day</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders_count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-card mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">Live Orders</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div className="table-responsive">
          <Table hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {!loading && stats.live_orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No live orders found.
                  </td>
                </tr>
              )}

              {stats.live_orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="fw-bold">#{order.order_id}</td>
                  <td>{order.user_name || "Guest"}</td>
                  <td className="text-capitalize">{order.order_type || "-"}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                  <td>
                    <Badge bg={getStatusVariant(order.status)} pill>
                      {formatStatus(order.status)}
                    </Badge>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="admin-card mt-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">Latest Orders</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div className="table-responsive">
          <Table hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {!loading && stats.latest_orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No recent orders found.
                  </td>
                </tr>
              )}

              {stats.latest_orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="fw-bold">#{order.order_id}</td>
                  <td>{order.user_name || "Guest"}</td>
                  <td className="text-capitalize">{order.order_type || "-"}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                  <td>
                    <Badge bg={getStatusVariant(order.status)} pill>
                      {formatStatus(order.status)}
                    </Badge>
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

