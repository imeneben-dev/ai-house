import { Link } from "react-router-dom";
import "./Offercard.css";

/**
 * OfferCard props:
 *  icon     – emoji or SVG string
 *  type     – "Workshop" | "Seminar" | "Competition"
 *  title    – string
 *  desc     – string
 *  linkTo   – path string
 */
export default function OfferCard({ icon, type, title, desc, linkTo }) {
  return (
    <div className="offer-card">
      <div className="offer-card__icon">{icon}</div>
      <span className="offer-card__type">{type}</span>
      <h3 className="offer-card__title">{title}</h3>
      <p className="offer-card__desc">{desc}</p>
      <Link to={linkTo} className="offer-card__link">
        Explore more
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}