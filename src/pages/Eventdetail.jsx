import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EVENTS } from "../data/mockData";
import Footer from "../components/Footer";
import "./Eventdetail.css";

export default function EventDetail() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const event     = EVENTS.find((e) => e.id === Number(id));

  const [form,    setForm]    = useState({ name: user?.fullName || "", email: user?.email || "", department: user?.department || "", note: "" });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  if (!event) return (
    <div className="page event-detail__not-found">
      <h2>Event not found.</h2>
      <Link to="/training" className="btn-primary">Back to Training Hub</Link>
    </div>
  );

  const isPast   = event.status === "past";
  const dateObj  = new Date(event.date);
  const formatted = dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department) {
      setError("Please fill in all required fields.");
      return;
    }
    // Real app: POST /api/registrations
    setSuccess(true);
    setError("");
  };

  return (
    <div className="page event-detail">

      {/* ── Hero banner ── */}
      <div className="event-detail__banner">
        <div className="container">
          <Link to="/training" className="event-detail__back">← Back to Training Hub</Link>
          <div className="event-detail__badges">
            <span className="event-detail__type-badge">{event.type}</span>
            <span className={"event-detail__status-badge" + (isPast ? " past" : " upcoming")}>
              {isPast ? "Past" : "● Upcoming"}
            </span>
          </div>
          <h1 className="event-detail__title">{event.title}</h1>
          <p className="event-detail__instructor">Delivered by {event.instructor}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container event-detail__body">

        {/* Left: info */}
        <div className="event-detail__info">

          {/* Meta grid */}
          <div className="event-detail__meta-grid">
            {[
              { icon: "📅", label: "Date", value: formatted },
              { icon: "🕐", label: "Time", value: event.time },
              { icon: event.mode === "Webinar" ? "💻" : "📍", label: "Location", value: event.location },
              { icon: "👥", label: "Seats", value: `${event.seats} participants` },
              { icon: "🏛️", label: "Department", value: event.department },
              { icon: "🏷️", label: "Topic", value: event.topic },
            ].map(({ icon, label, value }) => (
              <div className="event-detail__meta-item" key={label}>
                <span className="event-detail__meta-icon">{icon}</span>
                <div>
                  <div className="event-detail__meta-label">{label}</div>
                  <div className="event-detail__meta-value">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="event-detail__section">
            <h2 className="event-detail__section-title">About This Event</h2>
            <p className="event-detail__desc">{event.desc}</p>
          </div>

          {/* Resources — only for past events */}
          {isPast && (
            <div className="event-detail__section">
              <h2 className="event-detail__section-title">Resources</h2>
              {event.resources.length > 0 ? (
                <div className="event-detail__resources">
                  {event.resources.map((r) => (
                    <a key={r.name} href={r.url} className="event-detail__resource-item" download>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {r.name}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="event-detail__no-resources">No resources uploaded yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: registration form (upcoming only) */}
        {!isPast && (
          <div className="event-detail__register">
            <div className="event-detail__register-card">
              <h2 className="event-detail__register-title">Reserve Your Spot</h2>
              <p className="event-detail__register-sub">
                Fill in the form below to register for this event.
              </p>

              {success ? (
                <div className="event-detail__success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f5ee"/>
                    <path d="M7 13l3 3 7-7" stroke="#0a6640" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>You're registered! We'll send a confirmation to <strong>{form.email}</strong>.</p>
                </div>
              ) : (
                <form className="event-detail__form" onSubmit={handleSubmit}>
                  {error && <div className="event-detail__error">{error}</div>}

                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Note <span className="form-optional">(optional)</span></label>
                    <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Any questions or accessibility needs?" />
                  </div>

                  <button type="submit" className="btn-primary event-detail__submit">
                    Confirm Registration
                  </button>

                  {!user && (
                    <p className="event-detail__signin-note">
                      Already have an account?{" "}
                      <Link to="/signin">Sign in</Link> to pre-fill your info.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}