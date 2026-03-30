import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function Account() {
  const { user, loading: authLoading, refresh } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    refresh?.();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    let ignore = false;

    const loadOrders = async () => {
      try {
        setError("");
        setLoadingOrders(true);

        const res = await fetch(`${API_BASE}/api/orders/my`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load your orders.");
        }

        if (!ignore) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load your orders.");
        }
      } finally {
        if (!ignore) {
          setLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <section className="account-page page-pad">
        <Container fluid="xl" className="py-5 text-center">
          <Spinner />
        </Container>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="account-page page-pad">
        <Container fluid="xl" className="py-5">
          <Alert variant="warning" className="rounded-4">
            You need to login first to view your account.
          </Alert>
          <Link to="/login" className="btn btn-dark">
            Go to Login
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <section className="account-page page-pad">
      <Container fluid="xl" className="py-4 py-lg-5">
        <Row className="g-4">
          <Col lg={4}>
            <div className="account-card">
              <div className="account-head">
                <div className="account-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="account-title">My Account</h1>
                  <p className="account-sub">Your profile and recent orders.</p>
                </div>
              </div>

              <div className="account-info-list">
                <div className="account-info-item">
                  <span>Name</span>
                  <strong>{user?.name || "-"}</strong>
                </div>

                <div className="account-info-item">
                  <span>Email</span>
                  <strong>{user?.email || "-"}</strong>
                </div>

                <div className="account-info-item">
                  <span>Role</span>
                  <strong>{user?.role || "user"}</strong>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={8}>
            <div className="account-card">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h2 className="account-section-title mb-1">My Orders</h2>
                  <p className="text-muted mb-0">Track the status of your recent orders.</p>
                </div>

                <Button as={Link} to="/menu" className="btn-order">
                  Order Again
                </Button>
              </div>

              {loadingOrders && (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              )}

              {!loadingOrders && error && (
                <Alert variant="danger" className="rounded-4 mb-0">
                  {error}
                </Alert>
              )}

              {!loadingOrders && !error && orders.length === 0 && (
                <div className="account-empty">
                  <h3>No orders yet</h3>
                  <p className="text-muted mb-3">
                    You have not placed any orders yet.
                  </p>
                  <Button as={Link} to="/menu" className="btn-order">
                    Browse Menu
                  </Button>
                </div>
              )}

              {!loadingOrders && !error && orders.length > 0 && (
                <div className="account-orders-list">
                  {orders.map((order) => (
                    <div key={order.orderId} className="account-order-card">
                      <div className="account-order-top">
                        <div>
                          <div className="account-order-id">
                            Order #{order.orderId}
                          </div>
                          <div className="account-order-date">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>

                        <Badge bg={getStatusVariant(order.status)} pill>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>

                      <div className="account-order-meta">
                        <div>
                          <span>Type</span>
                          <strong>{order.orderType || "-"}</strong>
                        </div>

                        <div>
                          <span>Total</span>
                          <strong>${Number(order.total || 0).toFixed(2)}</strong>
                        </div>

                        <div>
                          <span>Delivery</span>
                          <strong>${Number(order.deliveryFee || 0).toFixed(2)}</strong>
                        </div>
                      </div>

                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <div className="account-order-items mt-3">
                          <h6 className="mb-3">Items</h6>
                          <div className="d-flex flex-column gap-2">
                            {order.items.map((item) => (
                              <div
                                key={item.itemId}
                                className="d-flex justify-content-between align-items-center account-order-item-row"
                              >
                                <span>
                                  Dish #{item.dishId} × {item.quantity}
                                </span>
                                <strong>${Number(item.price || 0).toFixed(2)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}