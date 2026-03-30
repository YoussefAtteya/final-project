import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./index.css";
import "./styles/theme.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/menu.css";
import "./styles/cart.css";
import "./styles/footer.css";
import "./styles/about.css";
import "./styles/login.css";
import "./styles/admin.css";
import "./styles/account.css";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);