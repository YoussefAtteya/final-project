import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table, Badge } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "preparing",
  "out_for_delivery",
  "completed",
  "cancelled",
];

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load orders.");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      setSavingId(orderId);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update order status.");
      }

      setSuccess(`Order #${orderId} updated successfully.`);

      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === orderId
            ? { ...order, status: nextStatus }
            : order
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1>Orders</h1>
        <p>Manage incoming and completed orders.</p>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="rounded-4">
          {success}
        </Alert>
      )}

      <div className="admin-card">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h3 className="mb-0">All Orders</h3>
          {loading && <Spinner size="sm" />}
        </div>

        <div className="table-responsive">
          <Table hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Type</th>
                <th>Total</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Update Status</th>
              </tr>
            </thead>

            <tbody>
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No orders found.
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td className="fw-bold">#{order.order_id}</td>
                  <td>{order.user_name || "Guest"}</td>
                  <td>{order.user_email || "-"}</td>
                  <td className="text-capitalize">{order.order_type || "-"}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                  <td>${Number(order.delivery_fee || 0).toFixed(2)}</td>

                  <td>
                    <Badge bg={getStatusVariant(order.status)} pill>
                      {formatStatus(order.status)}
                    </Badge>
                  </td>

                  <td>{formatDate(order.created_at)}</td>

                  <td style={{ minWidth: 220 }}>
                    <Form.Select
                      value={order.status}
                      disabled={savingId === order.order_id}
                      onChange={(e) =>
                        handleStatusChange(order.order_id, e.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mt-4 d-flex justify-content-end">
          <Button variant="outline-dark" onClick={loadOrders} disabled={loading}>
            Refresh Orders
          </Button>
        </div>
      </div>
    </div>
  );
}