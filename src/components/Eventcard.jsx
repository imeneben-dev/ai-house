import { Link } from "react-router-dom";
import "./Eventcard.css";

const TYPE_COLORS = {
  Workshop:    { bg: "#e8f0fc", text: "#004299" },
  Seminar:     { bg: "#e8f5ee", text: "#0a6640" },
  Competition: { bg: "#fef3e2", text: "#8a4e00" },
};

export default function EventCard({ id, title, type, topic, department, status, date, time, location, mode }) {
  const colors  = TYPE_COLORS[type] || TYPE_COLORS.Workshop;
  const isPast  = status === "past";
  const dateObj = new Date(date);
  const formatted = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Link to={`/training/${id}`} className={"event-card" + (isPast ? " event-card--past" : "")}>
      {/* Top row */}
      <div className="event-card__top">
        <span className="event-card__type" style={{ background: colors.bg, color: colors.text }}>
          {type}
        </span>
        <span className={"event-card__status" + (isPast ? " event-card__status--past" : " event-card__status--upcoming")}>
          {isPast ? "Past" : "● Upcoming"}
        </span>
      </div>

      {/* Title */}
      <h3 className="event-card__title">{title}</h3>

      {/* Topic + dept */}
      <div className="event-card__tags">
        <span className="event-card__tag">{topic}</span>
        <span className="event-card__tag">{department}</span>
      </div>

      {/* Meta */}
      <div className="event-card__meta">
        <div className="event-card__meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          {formatted} · {time}
        </div>
        <div className="event-card__meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>
          {location}
        </div>
        <div className="event-card__meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M2 8h20" stroke="currentColor" strokeWidth="1.8"/></svg>
          {mode}
        </div>
      </div>

      <div className="event-card__cta">
        {isPast ? "View Resources →" : "View & Register →"}
      </div>
    </Link>
  );
}