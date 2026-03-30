import { NavLink, Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Tags,
  Settings,
  CirclePlus,
} from "lucide-react";
import "../../styles/admin.css";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/dishes", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/addons", label: "Addons", icon: CirclePlus },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];


export default function AdminLayout() {
  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-badge">AF</div>
          <div>
            <h2 className="admin-brand-title">Adel's Admin</h2>
            <p className="admin-brand-sub">Control Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <Container fluid className="admin-content-wrap">
          <Outlet />
        </Container>
      </main>

      <nav className="admin-mobile-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-mobile-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </section>
  );
}