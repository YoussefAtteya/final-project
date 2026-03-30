import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const API_BASE = 'http://localhost:5000';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch('http://localhost:5000/api/settings')
      .then((res) => res.json())
      .then((data) => mounted && setSettings(data))
      .catch(console.error)
      .finally(() => mounted && setLoadingSettings(false));

    fetch('http://localhost:5000/api/dishes/featured')
      .then((res) => res.json())
      .then((data) => mounted && setFeatured(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => mounted && setLoadingFeatured(false));

    return () => {
      mounted = false;
    };
  }, []);

  const status = settings?.liveStatus;

  const hoursText = useMemo(() => {
    if (!settings?.opening_time || !settings?.closing_time) return 'Loading...';
    const open = String(settings.opening_time).slice(0, 5);
    const close = String(settings.closing_time).slice(0, 5);
    return `Open Daily • ${open} – ${close}`;
  }, [settings]);

  const badge = useMemo(() => {
    if (!status) return { cls: 'closed', text: 'Checking availability…' };
    if (status === 'Open Now') return { cls: 'open', text: 'Order Online Available' };
    if (status === 'On Holiday') return { cls: 'holiday', text: 'Temporarily Closed (Holiday)' };
    return { cls: 'closed', text: 'Order Online Unavailable (Closed)' };
  }, [status]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/logo.jpg';

    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE}${imagePath}`;
    }

    return `${API_BASE}/uploads/${imagePath}`;
  };

  return (
    <>
      <section className="home-hero">
        <Container fluid="xl">
          <div className={`hero-order-badge ${badge.cls}`}>
            <span className="badge-dot" />
            {badge.text}
          </div>

          <div className="hero-wrap">
            <Row className="g-0 align-items-stretch">
              <Col lg={7}>
                <div className="hero-inner">
                  <div className="hero-lockup">
                    <img className="hero-lockup-logo" src="/logo.jpg" alt="Adel's Famous" />
                    <h1 className="hero-title m-0">
                      Adel’s Famous <span>Halal Food</span>
                    </h1>
                  </div>

                  <p className="hero-sub">
                    Fast, fresh, and authentic halal food in the heart of New York.
                    Order online for pickup or delivery.
                  </p>

                  <div className="hero-actions">
                    <Button className="btn-order" href="/menu">
                      Order Now
                    </Button>
                    <Button variant="outline-dark" href="/menu">
                      View Menu
                    </Button>
                  </div>
                </div>
              </Col>

              <Col lg={5} className="p-4">
                <Row className="g-3">
                  <Col xs={6} sm={6}>
                    <div className="kpi">
                      <div className="label">Service</div>
                      <div className="value">Delivery</div>
                    </div>
                  </Col>

                  <Col xs={6} sm={6}>
                    <div className="kpi">
                      <div className="label">Service</div>
                      <div className="value">Pickup</div>
                    </div>
                  </Col>

                  <Col xs={12} sm={12}>
                    <div className="kpi">
                      <div className="label">Hours</div>
                      <div className="value">{hoursText}</div>

                      {!loadingSettings && settings && (
                        <div
                          className={`status-indicator ${
                            status === 'Open Now'
                              ? 'open'
                              : status === 'On Holiday'
                              ? 'holiday'
                              : 'closed'
                          }`}
                        >
                          <span className="dot" />
                          {status}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <section className="brand-strip">
        <Container fluid="xl">
          <div className="strip-grid">
            <div className="strip-card">
              <img src="/hero1.png" alt="Food 1" />
            </div>
            <div className="strip-card">
              <img src="/hero2.png" alt="Food 2" />
            </div>
            <div className="strip-card">
              <img src="/hero3.png" alt="Food 3" />
            </div>
          </div>
        </Container>
      </section>

      <section className="featured-section">
        <Container fluid="xl">
          <div className="section-head">
            <h2>Customer Favorites</h2>
            <p>Our most loved dishes — made fresh daily.</p>
          </div>

          <Row className="g-4 justify-content-center">
            {featured.map((item, index) => (
              <Col key={item.id} xs={12} sm={6} lg={4} xl={3}>
                <div className="featured-card">
                  <div className="featured-img">
                    {index === 0 && (
                      <div className="popular-badge">🔥 Popular</div>
                    )}

                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="featured-body">
                    <h5>{item.name}</h5>
                    <div className="featured-price">${Number(item.price).toFixed(2)}</div>

                    <Button className="btn-order w-100 mt-3" href="/menu">
                      Order Now
                    </Button>
                  </div>
                </div>
              </Col>
            ))}

            {!loadingFeatured && featured.length === 0 && (
              <Col xs={12}>
                <div className="empty-state">
                  No featured dishes yet. Mark some dishes as featured in admin.
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      <section className="reviews-section">
        <Container fluid="xl">
          <div className="section-head">
            <h2>What Customers Say</h2>
            <p>Real reviews from happy customers.</p>
          </div>

          <Row className="g-4 justify-content-center">
            <Col xs={12} md={4}>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  Best halal food in NYC. Super fresh and fast delivery!
                </p>
                <div className="review-author">— Michael R.</div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  The chicken over rice is insane. Highly recommended.
                </p>
                <div className="review-author">— Sarah L.</div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p>
                  Authentic taste and very clean place. Love it!
                </p>
                <div className="review-author">— David K.</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="why-section">
        <Container fluid="xl">
          <div className="section-head">
            <h2>Why Choose Us</h2>
            <p>More than just food — it’s an experience.</p>
          </div>

          <Row className="g-4">
            <Col xs={12} md={4}>
              <div className="why-card">
                <div className="why-icon">🔥</div>
                <h5>Freshly Prepared</h5>
                <p>Every meal is cooked fresh daily with high quality ingredients.</p>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="why-card">
                <div className="why-icon">🚚</div>
                <h5>Fast Delivery</h5>
                <p>Quick preparation and reliable delivery across New York.</p>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="why-card">
                <div className="why-icon">⭐</div>
                <h5>Top Rated</h5>
                <p>Loved by hundreds of customers with outstanding reviews.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="location-section">
        <Container fluid="xl">
          <Row className="g-4 align-items-stretch">
            <Col lg={6}>
              <div className="map-card">
                <iframe
                  title="Adel's Famous Location"
                  src="https://www.google.com/maps?q=Adel%27s%20Famous%20Halal%20Food%20New%20York&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Col>

            <Col lg={6}>
              <div className="location-card">
                <h3 className="mb-2">Visit Us</h3>
                <p className="text-muted mb-4">
                  Come enjoy authentic halal food in New York. Pickup or delivery available.
                </p>

                <div className="location-info">
                  <div className="info-row">
                    <i className="bi bi-geo-alt-fill" />
                    <div>
                      <div className="label">Address</div>
                      <div className="value">1221 6th Ave, New York, NY 10020, United States</div>
                    </div>
                  </div>

                  <div className="info-row">
                    <i className="bi bi-telephone-fill" />
                    <div>
                      <div className="label">Phone</div>
                      <div className="value">+1 (866) 492-3357</div>
                    </div>
                  </div>
                </div>

                <div className="location-actions">
                  <a
                    className="btn btn-order w-100"
                    href="https://maps.app.goo.gl/spWrtHSzLjgqdz1eA"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>

                  <a
                    className="btn btn-outline-dark w-100"
                    href="https://www.instagram.com/adelsfamoushalalfood/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Instagram
                  </a>
                </div>

                <div className="small text-muted mt-3">Tip: Use “Get Directions” for fastest route.</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="cta-section">
        <Container fluid="xl">
          <div className="cta-box">
            <h2>Ready to Taste the Difference?</h2>
            <p>Order now and enjoy authentic halal street food made fresh daily.</p>

            <div className="cta-actions">
              <Button className="btn-order btn-lg" href="/menu">
                Order Online Now
              </Button>

              <Button variant="outline-dark" className="btn-lg" href="/menu">
                Browse Full Menu
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <a href="/menu" className="floating-order">
        🛒 Order Now
      </a>
    </>
  );
}