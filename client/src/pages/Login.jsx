import { useMemo, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const googleError = params.get("error");

  const redirectTo = useMemo(() => {
    return loc.state?.from || "/";
  }, [loc.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      nav(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <section className="auth-page page-pad">
      <Container fluid="xl">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={6} xl={5}>
            <div className="auth-card">
              <div className="auth-head">
                <img className="auth-logo" src="/logo.jpg" alt="Adel's Famous" />
                <div>
                  <h2 className="auth-title">Welcome back</h2>
                  <p className="auth-sub">
                    Login to order faster and view your account.
                  </p>
                </div>
              </div>

              {(googleError || error) && (
                <div className="auth-alert">
                  {googleError
                    ? "Google login failed. Please try again."
                    : error}
                </div>
              )}

              {!authLoading && user && (
                <div className="auth-alert success">
                  You are already logged in.
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <label className="auth-label">Email</label>
                <input
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <Button
                  type="submit"
                  className="btn-order w-100 auth-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <Spinner size="sm" /> Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <Button
                  type="button"
                  variant="outline-dark"
                  className="w-100 auth-google"
                  onClick={handleGoogle}
                  disabled={submitting}
                >
                  <i className="bi bi-google me-2" />
                  Continue with Google
                </Button>

                <div className="auth-foot">
                  <span className="text-muted">Don&apos;t have an account?</span>
                  <Link to="/register" className="auth-link">
                    Create one
                  </Link>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}