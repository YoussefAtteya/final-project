import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setErr("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Register failed.");
        return;
      }

      window.dispatchEvent(new Event("auth-changed"));


      nav("/login", { replace: true });
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page d-flex align-items-center">
      <Container fluid="xl">
        <Row className="justify-content-center">
          <Col xs={12} md={9} lg={6} xl={5}>
            <div className="auth-card">
              <div className="auth-head">
                <img className="auth-logo" src="/logo.jpg" alt="Adel's Famous" />
                <div>
                  <h1 className="auth-title">Create account</h1>
                  <p className="auth-sub">Join us and order faster.</p>
                </div>
              </div>

              {err && (
                <Alert variant="danger" className="mb-3">
                  {err}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your name"
                    className="auth-input"
                    autoComplete="name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="name@example.com"
                    className="auth-input"
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">Password</Form.Label>
                  <Form.Control
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    placeholder="Min 6 characters"
                    className="auth-input"
                    autoComplete="new-password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">Confirm Password</Form.Label>
                  <Form.Control
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Repeat your password"
                    className="auth-input"
                    autoComplete="new-password"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-order w-100 auth-btn"
                  disabled={
                    loading ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.password ||
                    !form.confirmPassword
                  }
                >
                  {loading ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <Spinner size="sm" />
                      Creating...
                    </span>
                  ) : (
                    "Register"
                  )}
                </Button>

                <div className="auth-foot">
                  <span className="text-muted">Already have an account?</span>{" "}
                  <Link className="auth-link" to="/login">
                    Login
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}