import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavbarMain from "./components/NavbarMain";
import FooterMain from "./components/FooterMain";
import CartToast from "./components/CartToast";

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminDishes from "./pages/Admin/AdminDishes";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminAddons from "./pages/Admin/AdminAddons";

import Register from "./pages/Register";
import Checkout from "./pages/Checkout";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Account from "./pages/Account";

import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <div className="page">
        <CartToast />

        {/* NAVBAR */}
        <NavbarMain />

        <main className="page-content">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />

            {/* Admin pages */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="dishes" element={<AdminDishes />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="addons" element={<AdminAddons />} />
            </Route>
          </Routes>
        </main>

        {/* FOOTER */}
        <FooterMain />
      </div>
    </BrowserRouter>
  );
}