import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function StripePaymentForm({ clientSecret, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card input is not ready.");
      setProcessing(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setError(result.error.message || "Payment failed.");
      setProcessing(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      onPaid?.(result.paymentIntent);
      setProcessing(false);
      return;
    }

    setError("Payment did not succeed. Please try again.");
    setProcessing(false);
  };

  return (
    <div className="mt-4">
      <h3 className="mb-3">Payment</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          handlePay();
        }}
      >
        <div className="mb-3">
          <CardElement
            options={{
              hidePostalCode: true,
              style: { base: { fontSize: "16px" } },
            }}
          />
        </div>

        <Button type="submit" className="btn-order w-100" disabled={processing || !stripe}>
          {processing ? "Processing..." : "Pay Now"}
        </Button>
      </Form>
    </div>
  );
}

export default function Checkout() {
  const { items = [], clear } = useCart();
  const nav = useNavigate();

  const [error, setError] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [stripePublishableKey, setStripePublishableKey] = useState(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    let ignore = false;

    const loadCheckoutConfig = async () => {
      try {
        setLoadingConfig(true);

        const res = await fetch(`${API_BASE}/api/checkout/config`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load checkout config.");
        }

        if (!ignore) {
          setDeliveryFee(Number(data?.deliveryFee || 0));
          setStripePublishableKey(data?.stripePublishableKey || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load delivery fee.");
        }
      } finally {
        if (!ignore) {
          setLoadingConfig(false);
        }
      }
    };

    loadCheckoutConfig();

    return () => {
      ignore = true;
    };
  }, []);

  const hasItems = items.length > 0;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [items]);

  const total = subtotal + (hasItems ? deliveryFee : 0);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!hasItems) {
      setError("Your cart is empty.");
      return;
    }

    if (!form.fullName || !form.phone || !form.address || !form.city) {
      setError("Please complete all required fields.");
      return;
    }

    if (clientSecret) return; // already created PaymentIntent

    setCreatingOrder(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          order_type: "delivery",
          // Backend can be extended to persist customer details later.
          customer: form,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create order.");
      }

      setClientSecret(data?.clientSecret || null);
    } catch (err) {
      setError(err.message || "Failed to create order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const stripePromise = useMemo(() => {
    if (!stripePublishableKey) return null;
    return loadStripe(stripePublishableKey);
  }, [stripePublishableKey]);

  return (
    <section className="checkout-page py-5">
      <Container fluid="xl">
        <Row className="g-4">
          <Col lg={7}>
            <div className="checkout-card">
              <h1 className="checkout-title mb-4">Checkout</h1>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Your phone"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street address"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Optional notes"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="btn-order mt-4 px-4 py-2"
                  disabled={loadingConfig || creatingOrder || Boolean(clientSecret)}
                >
                  {loadingConfig
                    ? "Loading..."
                    : creatingOrder
                      ? "Creating Payment..."
                      : clientSecret
                        ? "Payment Created"
                        : "Place Order"}
                </Button>
              </Form>

              {clientSecret && (
                <>
                  {!stripePublishableKey && (
                    <Alert variant="warning" className="mt-4">
                      Stripe publishable key is not configured. Payment UI can't be loaded.
                    </Alert>
                  )}

                  {stripePromise && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        onPaid={() => {
                          clear();
                          nav("/account");
                        }}
                      />
                    </Elements>
                  )}
                </>
              )}
            </div>
          </Col>

          <Col lg={5}>
            <div className="checkout-card">
              <h3 className="mb-4">Order Summary</h3>

              {!hasItems ? (
                <p className="text-muted mb-0">Your cart is empty.</p>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between mb-3">
                      <div>
                        <div className="fw-bold">{item.name}</div>
                        <div className="text-muted small">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="fw-semibold">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <hr />
                </>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Delivery</span>
                <span>
                  {loadingConfig ? <Spinner size="sm" /> : `$${(hasItems ? deliveryFee : 0).toFixed(2)}`}
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>
                  {loadingConfig ? <Spinner size="sm" /> : `$${total.toFixed(2)}`}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}