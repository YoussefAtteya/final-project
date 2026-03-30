import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function NavbarMain() {
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  const { count } = useCart();
  const { user, loading: authLoading, logout } = useAuth();
  const nav = useNavigate();

  const [animateCart, setAnimateCart] = useState(false);
  const [glow, setGlow] = useState(false);

  const accountPath = user ? "/account" : "/login";

  useEffect(() => {
    const handleCartAnimation = () => {
      setAnimateCart(true);
      setTimeout(() => setAnimateCart(false), 400);
    };

    window.addEventListener("cart-added", handleCartAnimation);
    return () => window.removeEventListener("cart-added", handleCartAnimation);
  }, []);

  useEffect(() => {
    const handleGlow = () => {
      setGlow(true);
      setTimeout(() => setGlow(false), 500);
    };

    window.addEventListener("cart-added", handleGlow);
    return () => window.removeEventListener("cart-added", handleGlow);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!expanded) return;
      if (navRef.current && !navRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [expanded]);

  const closeMenu = () => setExpanded(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      nav("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar
        ref={navRef}
        expand="lg"
        className="navbar-pro fixed-top"
        expanded={expanded}
        onToggle={(next) => setExpanded(next)}
      >
        <Container style={{ maxWidth: 1350 }}>
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex align-items-center gap-2"
            onClick={closeMenu}
          >
            <img src="/logo.jpg" alt="Adel's Famous" className="brand-logo" />
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold">Adel&apos;s Famous</span>
              <small className="text-muted">Halal Food • New York</small>
            </div>

            <span className="badge brand-badge ms-2 d-none d-md-inline">
              Order Online
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" className="custom-toggler" />

          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
              <NavLink
                to="/"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={closeMenu}
              >
                Home
              </NavLink>

              <NavLink
                to="/menu"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={closeMenu}
              >
                Menu
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={closeMenu}
              >
                About
              </NavLink>

              {/* MOBILE ONLY LINKS INSIDE BURGER */}
              <div className="mobile-menu-only">
                <NavLink
                  to={accountPath}
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                  onClick={closeMenu}
                >
                  My Account
                </NavLink>

                {user?.role === "admin" && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                )}
              </div>

              <div className="d-flex align-items-center gap-2 ms-lg-2 icons-row">
                <a
                  className="icon-pill"
                  href="https://www.instagram.com/adelsfamoushalalfood/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  <i className="bi bi-instagram" />
                </a>

                <a
                  className="icon-pill"
                  href="https://maps.app.goo.gl/spWrtHSzLjgqdz1eA"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  <i className="bi bi-geo-alt" />
                </a>

                <NavLink
                  to="/cart"
                  className={`icon-pill position-relative ${glow ? "cart-glow" : ""} ${
                    animateCart ? "cart-animate" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <i className="bi bi-cart3" />
                  {count > 0 && <span className="cart-badge">{count}</span>}
                </NavLink>

                {/* DESKTOP ACCOUNT ICON */}
                <NavLink
                  to={accountPath}
                  className="icon-pill desktop-account-icon"
                  onClick={closeMenu}
                  title="My Account"
                >
                  <i className="bi bi-person" />
                </NavLink>
              </div>

              <Button
                as={Link}
                to="/menu"
                className="btn-order ms-lg-2"
                onClick={closeMenu}
              >
                Order Now
              </Button>

              {!authLoading && !user && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    "nav-link login-link desktop-login-link" + (isActive ? " active" : "")
                  }
                  onClick={closeMenu}
                >
                  Login
                </NavLink>
              )}

              {!authLoading && user && (
                <>
                  {user.role === "admin" && (
                    <Button
                      as={Link}
                      to="/admin"
                      variant="outline-dark"
                      className="ms-lg-1 desktop-admin-btn"
                      onClick={closeMenu}
                    >
                      Admin
                    </Button>
                  )}

                  <Button
                    variant="outline-dark"
                    className="ms-lg-1"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" end className="mobile-bottom-link">
          <i className="bi bi-house-door"></i>
          <span>Home</span>
        </NavLink>

        <NavLink to="/menu" className="mobile-bottom-link">
          <i className="bi bi-grid"></i>
          <span>Menu</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={`mobile-bottom-link ${glow ? "mobile-cart-glow" : ""}`}
        >
          <div className={`mobile-icon-wrap ${animateCart ? "cart-animate" : ""}`}>
            <i className="bi bi-cart3"></i>
            {count > 0 && <span className="cart-badge mobile-cart-badge">{count}</span>}
          </div>
          <span>Cart</span>
        </NavLink>

        {!authLoading && user ? (
          user.role === "admin" ? (
            <NavLink to="/admin" className="mobile-bottom-link">
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </NavLink>
          ) : (
            <NavLink to="/account" className="mobile-bottom-link">
              <i className="bi bi-person"></i>
              <span>My Account</span>
            </NavLink>
          )
        ) : (
          <NavLink to="/login" className="mobile-bottom-link">
            <i className="bi bi-person"></i>
            <span>My Account</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}