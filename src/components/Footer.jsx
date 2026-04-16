import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Footer.css";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
                <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2.5" fill="#fff"/>
              </svg>
            </div>
            AI House · Blida 1
          </Link>
          <p className="footer__tagline">
            Spreading AI literacy across the University of Blida 1,
            one department at a time.
          </p>
        </div>

        {/* Links */}
        <div className="footer__col">
          {/* MAGIC FIX 2: Change the title depending on the role */}
          <h4>{user?.role === "admin" ? "Admin Panel" : "Navigate"}</h4>
          
          {/* MAGIC FIX 3: Draw a totally different list for Admins! */}
          {user?.role === "admin" ? (
            <ul>
              <li><Link to="/admin">Dashboard Overview</Link></li>
              <li><Link to="/settings">Security & Settings</Link></li>
            </ul>
          ) : (
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/training">Training</Link></li>
              <li><Link to="/representatives">Representatives</Link></li>
            </ul>
          )}
        </div>

        <div className="footer__col">
          <h4>Account</h4>
          <Link to="/signin">Sign In</Link>
          <Link to="/signup">Create Account</Link>
        </div>

        <div className="footer__col">
          <h4>Contact</h4>
          <span>📍 Blida, Algeria</span>
          <span>✉️ aihouse@univ-blida.dz</span>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} AI House · University of Blida 1</span>
          <span>Built with the MERN Stack</span>
        </div>
      </div>
    </footer>
  );
}