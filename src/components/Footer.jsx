import { Link } from "react-router-dom";
import logo from "../assets/images/ai_house_logo.svg";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img src={logo} alt="AI House Logo" style={{ height:"44px", width:"auto", objectFit:"contain" }} />
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