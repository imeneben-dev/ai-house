import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "./UserMenu";
import logo from "../assets/images/ai_house_logo.svg";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home",          path: "/" },
  { label: "Training Hub",  path: "/training" },
  { label: "Representatives", path: "/representatives" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar__logo">
        <img src={logo} alt="AI House Logo" className="navbar__logo-img" />
        <span className="navbar__logo-text">
          AI House <span className="navbar__logo-sub">· Blida 1</span>
        </span>
      </Link>

      {/* Desktop links */}
      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={
                "navbar__link" +
                (location.pathname === link.path ? " navbar__link--active" : "")
              }
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="navbar__right">
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="navbar__admin-link">Admin Panel</Link>
            )}
            <UserMenu />
          </>
        ) : (
          <Link to="/signin" className="navbar__signin">Sign In</Link>
        )}

        {/* Hamburger */}
        <button
          className={"navbar__hamburger" + (menuOpen ? " open" : "")}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={"navbar__drawer" + (menuOpen ? " navbar__drawer--open" : "")}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={
              "navbar__drawer-link" +
              (location.pathname === link.path ? " active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {!user && (
          <Link to="/signin" className="btn-primary navbar__drawer-cta" onClick={() => setMenuOpen(false)}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}