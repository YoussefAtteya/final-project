import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);

const STORAGE_KEY = 'adels_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (dish, qty = 1) => {
    const id = dish.id;
    const price = Number(dish.price);

    setItems(prev => {
      const found = prev.find(x => x.id === id);
      if (found) {
        return prev.map(x =>
          x.id === id ? { ...x, quantity: x.quantity + qty } : x
        );
      }
      return [
        ...prev,
        {
          id,
          name: dish.name,
          price,
          image: dish.image,
          quantity: qty
        }
      ];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const setQty = (id, qty) => {
    const q = Number(qty);
    if (Number.isNaN(q) || q <= 0) return;
    setItems(prev => prev.map(x => (x.id === id ? { ...x, quantity: q } : x)));
  };

  const inc = (id) => {
    setItems(prev => prev.map(x => (x.id === id ? { ...x, quantity: x.quantity + 1 } : x)));
  };

  const dec = (id) => {
    setItems(prev =>
      prev
        .map(x => (x.id === id ? { ...x, quantity: x.quantity - 1 } : x))
        .filter(x => x.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(() => {
    return items.reduce((sum, x) => sum + (Number(x.price) * x.quantity), 0);
  }, [items]);

  const count = useMemo(() => {
    return items.reduce((sum, x) => sum + x.quantity, 0);
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    setQty,
    inc,
    dec,
    clear,
    total,
    count
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}