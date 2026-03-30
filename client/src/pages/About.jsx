import { Container, Row, Col, Button } from "react-bootstrap";

export default function About() {
  return (
    <section className="about-page">
      <Container fluid="xl">
        {/* HERO / FOUNDER */}
        <div className="founder-hero">
          <Row className="g-4 align-items-center">
            <Col lg={5}>
              <div className="founder-photo">
                <img src="/founder.png" alt="Adel Ibrahim - Founder" />
              </div>
            </Col>

            <Col lg={7}>
              <div className="founder-card">
                <div className="founder-kicker">In Loving Memory</div>

                <h1 className="founder-title">Adel Ibrahim</h1>

                <div className="founder-sub">Founder of Adel’s Famous Halal Food</div>

                <p className="founder-desc mt-4">
                  Adel Ibrahim was the beloved founder and namesake of Adel’s Famous —
                  a legendary halal food destination in Midtown Manhattan, New York.
                  Through dedication, quality, and consistency, he built more than a food business —
                  he built a New York icon.
                </p>

                <p className="founder-desc">
                  His legacy continues through every meal served, every customer welcomed,
                  and every plate prepared fresh daily.
                </p>

                <div className="founder-divider" />

              </div>
            </Col>
          </Row>
        </div>

        {/* SECOND SECTION: Story + Values */}
        <div className="about-grid">
          <div className="about-block">
            <h2 className="about-h2">Our Story</h2>
            <p className="about-p">
              Adel’s Famous is known for fast, fresh, and authentic halal street food.
              We focus on quality ingredients, bold flavors, and a consistently great experience.
            </p>
            <p className="about-p">
              Whether you’re stopping by for pickup or ordering delivery, our goal is simple:
              serve food that tastes amazing — every single time.
            </p>
          </div>

          <div className="about-block">
            <h2 className="about-h2">What We Stand For</h2>

            <div className="values">
              <div className="value-card">
                <div className="icon">🔥</div>
                <div>
                  <div className="title">Fresh Daily</div>
                  <div className="desc">Prepared fresh with high-quality ingredients.</div>
                </div>
              </div>

              <div className="value-card">
                <div className="icon">🚚</div>
                <div>
                  <div className="title">Fast Service</div>
                  <div className="desc">Quick pickup + reliable delivery experience.</div>
                </div>
              </div>

              <div className="value-card">
                <div className="icon">⭐</div>
                <div>
                  <div className="title">Loved by Customers</div>
                  <div className="desc">A New York favorite with loyal customers.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta">
         
                <div className="about-info">
                  <div className="info-row">
                    <i className="bi bi-geo-alt-fill" />
                    <div>
                      <div className="label">Location</div>
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

                <div className="about-actions">
                  <Button className="btn-order" href="/menu">
                    Order Now
                  </Button>

                  <Button
                    variant="outline-dark"
                    href="https://www.instagram.com/adelsfamoushalalfood/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </Button>
                </div>
        </div>
      </Container>
    </section>
  );
}