import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/auth";

export function Shell() {
  const navigate = useNavigate();

  return (
    <>
      <header className="nav">
        <Link to="/" className="nav-brand">
          Idem<span>Gate</span>
        </Link>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
          Operations
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Configuration
        </NavLink>
        <NavLink to="/status" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Status
        </NavLink>
        <div className="nav-right">
          <span className="mono" style={{ color: "#888", fontSize: 12 }}>
            ops
          </span>
          <button
            type="button"
            className="btn"
            style={{ background: "#333", borderColor: "#444", color: "#ddd" }}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <div className="page">
        <Outlet />
      </div>
    </>
  );
}
