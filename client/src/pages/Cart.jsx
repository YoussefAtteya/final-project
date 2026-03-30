import { Container, Row, Col, Button } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

export default function Cart() {
  const { items, total, inc, dec, removeItem, clear } = useCart();
  const nav = useNavigate();

  return (
    <section className="page-pad">
      <Container fluid="xl">
        <div className="cart-header">
          <h2>Your Cart</h2>
          {items.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={clear}>
              Clear
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            Cart is empty
          </div>
        ) : (
          <Row className="g-4">
            <Col lg={8}>
              {items.map((it) => (
                <div key={it.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={getImageUrl(it.image)} alt={it.name} />
                  </div>

                  <div className="cart-item-body">
                    <div className="cart-item-top">
                      <div>
                        <div className="cart-item-name">{it.name}</div>
                        <div className="cart-item-price">
                          ${Number(it.price).toFixed(2)}
                        </div>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(it.id)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="cart-qty">
                      <Button variant="outline-dark" onClick={() => dec(it.id)}>-</Button>
                      <span>{it.quantity}</span>
                      <Button variant="outline-dark" onClick={() => inc(it.id)}>+</Button>
                    </div>
                  </div>
                </div>
              ))}
            </Col>

            <Col lg={4}>
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <Button className="btn-order w-100 mt-3" onClick={() => nav("/checkout")}>
                  Proceed to Checkout
                </Button>

                <div className="summary-note">
                  Secure test payment via Stripe
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
}