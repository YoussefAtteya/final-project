import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Container fluid="xl">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="brand-row">
              <img className="footer-logo" src="/logo.jpg" alt="Adel's Famous" />
              <div>
                <div className="footer-title">Adel’s Famous Halal Food</div>
                <div className="footer-sub">Halal Street Food • New York</div>
              </div>
            </div>

            <p className="footer-text">
              Fresh, fast, and authentic halal food. Order online for pickup or delivery.
            </p>

            <div className="footer-badges">
              <span className="footer-chip chip-green">
                <span className="dot" /> Open Daily
              </span>
              <span className="footer-chip chip-orange">Pickup</span>
              <span className="footer-chip chip-orange">Delivery</span>
            </div>
          </div>

          {/* Links */}
          <div className="footer-col">
            <div className="footer-h">Explore</div>
            <a className="footer-link" href="/">Home</a>
            <a className="footer-link" href="/menu">Menu</a>
            <a className="footer-link" href="/about">About</a>
            <a className="footer-link" href="/cart">Cart</a>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <div className="footer-h">Contact</div>

            <div className="footer-item">
              <i className="bi bi-geo-alt-fill" />
              <span>1221 6th Ave, New York, NY 10020</span>
            </div>

            <div className="footer-item">
              <i className="bi bi-telephone-fill" />
              <span>+1 (866) 492-3357</span>
            </div>

            <div className="footer-actions">
              <a
                className="footer-btn btn-green"
                href="https://maps.app.goo.gl/spWrtHSzLjgqdz1eA"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-compass" /> Get Directions
              </a>

              <a
                className="footer-btn btn-outline"
                href="https://www.instagram.com/adelsfamoushalalfood/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-instagram" /> Instagram
              </a>
            </div>
          </div>

          {/* Hours */}
          {/* <div className="footer-col">
            <div className="footer-h">Hours</div>
            <div className="hours-box">
              <div className="hours-row">
                <span>Mon – Sun</span>
                <span className="hours-strong">10:00 – 23:00</span>
              </div>
              <div className="hours-note">
              </div>
            </div>
          </div> */}
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} Adel’s Famous. All rights reserved.
          </div>

          <div className="footer-social">
           

            {/* <a
              className="social-pill"
              href="https://maps.app.goo.gl/spWrtHSzLjgqdz1eA"
              target="_blank"
              rel="noreferrer"
              aria-label="Location"
            >
              <i className="bi bi-geo-alt" />
            </a> */}
          </div>
        </div>
      </Container>
    </footer>
  );
}