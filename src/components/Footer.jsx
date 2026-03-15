import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
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
          <h4>Navigate</h4>
          <Link to="/">Home</Link>
          <Link to="/training">Training Hub</Link>
          <Link to="/representatives">Representatives</Link>
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