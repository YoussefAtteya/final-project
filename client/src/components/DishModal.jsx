import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { getImageUrl } from "../utils/imageUrl";

export default function DishModal({ dish, onClose }) {
  useEffect(() => {
    if (!dish) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [dish, onClose]);

  if (!dish) return null;

  return (
    <div className="glass-backdrop" onClick={onClose}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
        <div className="glass-img">
          <img src={getImageUrl(dish.image)} alt={dish.name} />
        </div>

        <div className="glass-body">
          <div className="glass-head">
            <h4 className="mb-1">{dish.name}</h4>
            <div className="price">${Number(dish.price).toFixed(2)}</div>
          </div>

          <p className="text-muted mb-3">
            {dish.description || 'Freshly made with premium halal ingredients.'}
          </p>

          <div className="glass-actions">
            <Button className="btn-order w-100">Add to Cart</Button>
            <Button variant="outline-dark" className="w-100">Order Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}