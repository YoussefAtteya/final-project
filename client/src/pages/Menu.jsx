import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { getCategories, getDishes } from '../services/api';
import DishModal from '../components/DishModal';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:5000';

export default function Menu() {
  const [cats, setCats] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;

    Promise.all([getCategories(), getDishes()])
      .then(([c, d]) => {
        if (!mounted) return;
        setCats(c);
        setDishes(d);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!activeCat) return dishes;
    return dishes.filter((d) => String(d.category_id) === String(activeCat));
  }, [dishes, activeCat]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/logo.jpg';

    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE}${imagePath}`;
    }

    return `${API_BASE}/uploads/${imagePath}`;
  };

  return (
    <section className="page-pad">
      <Container fluid="xl">
        <div className="menu-head">
          <h2 className="mb-1">Menu</h2>
          <p className="text-muted mb-0">Burgers, pizza, drinks — always fresh.</p>
        </div>

        <div className="cat-tabs">
          <button
            className={'cat-tab' + (!activeCat ? ' active' : '')}
            onClick={() => setActiveCat(null)}
          >
            All
          </button>

          {cats.map((c) => (
            <button
              key={c.id}
              className={'cat-tab' + (String(activeCat) === String(c.id) ? ' active' : '')}
              onClick={() => setActiveCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-5 d-flex justify-content-center">
            <Spinner />
          </div>
        ) : (
          <Row className="g-3 g-md-4 mt-2">
            {filtered.map((d) => (
              <Col key={d.id} xs={12} sm={6} lg={4} xl={3}>
                <div className="dish-card">
                  <div className="dish-img">
                    {(d.is_featured || d.is_special) && (
                      <div className="dish-badges">
                        {Boolean(d.is_featured) && (
                          <span className="dish-badge featured">Featured</span>
                        )}
                        {Boolean(d.is_special) && (
                          <span className="dish-badge special">Special</span>
                        )}
                      </div>
                    )}

                    <img src={getImageUrl(d.image)} alt={d.name} />
                  </div>

                  <div className="dish-body">
                    <div className="dish-top">
                      <h6 className="dish-name">{d.name}</h6>
                      <div className="dish-price">${Number(d.price).toFixed(2)}</div>
                    </div>

                    <div className="dish-actions">
                      <div className="dish-btn-row">
                        <Button
                          variant="outline-dark"
                          onClick={() => setSelected(d)}
                          className="flex-fill"
                        >
                          View More
                        </Button>

                        <Button
                          className="btn-order flex-fill"
                          onClick={() => {
                            addItem(d, 1);
                            window.dispatchEvent(new Event('cart-added'));
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        <DishModal dish={selected} onClose={() => setSelected(null)} />
      </Container>
    </section>
  );
}