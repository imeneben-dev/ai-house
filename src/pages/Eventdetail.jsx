import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth }   from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import Footer from "../components/Footer";
import "./EventDetail.css";

export default function EventDetail() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const { events, updateEvent } = useEvents();
  const navigate    = useNavigate();
  const event       = events.find((e) => String(e.id) === String(id));

  const [form,    setForm]    = useState({ name: user?.fullName || "", email: user?.email || "", department: user?.department || "" });
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const seatsLeft = event?.seats - (event?.attendees ? event.attendees.length : 0);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/signin");
      return;
    }

    if (!form.name || !form.email || !form.department) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/events/${event.id}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSuccess(true); 
        updateEvent(data.event); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server. Please try again.");
    }
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
      <div className="event-detail__body">
        <div className="container event-detail__body-inner">

        {/* Left: info */}
        <div className="event-detail__info">
          <div className="event-detail__info-card">

          {/* Meta grid */}
          <div className="event-detail__meta-grid">
            {[
              { icon: "📅", label: "Date", value: formatted },
              { icon: "🕐", label: "Time", value: event.time },
              { icon: event.mode === "Webinar" ? "💻" : "📍", label: "Location", value: event.location },
              { icon: "👥", label: "Seats Left", value: seatsLeft > 0 ? `${seatsLeft} available` : "Sold Out!" },
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

                  <button type="submit" className="btn-primary event-detail__submit" disabled={loading}>
                    {loading ? "Registering..." : "Confirm Registration"}
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
      </div>

      <Footer />
    </div>
  );
}