import { useEffect, useState } from "react";

export default function CartToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t;

    const onAdded = () => {
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 1800);
    };

    window.addEventListener("cart-added", onAdded);
    return () => {
      window.removeEventListener("cart-added", onAdded);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className={"cart-toast" + (show ? " show" : "")}>
      ✅ Added to cart
    </div>
  );
}