import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { DEPARTMENTS } from "../data/mockData";
import Footer from "../components/Footer";
import "./AddEvent.css";

const TYPES    = ["Workshop", "Seminar", "Competition"];
const TOPICS   = ["Python", "Data Science", "Machine Learning", "Automation", "AI Ethics", "AI in Research", "AI Challenge"];
const AUDIENCE = ["Students", "Representatives", "General Public"];

export default function AddEvent() {
  const { user }    = useAuth();
  if (user?.role === "representative" && !user.isCertified) {
    return (
      <div className="page container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <h2>Access Denied</h2>
        <p>Your account is currently Pending. Please upload your Train the Trainer certificate in your Settings and wait for Admin validation before hosting events.</p>
      </div>
    );
  }
  const { addEvent } = useEvents();
  const navigate    = useNavigate();

  const [form, setForm] = useState({
    title:      "",
    type:       "Workshop",
    topic:      "Python",
    audience:   "Students",
    department: user?.department || "", 
    date:       "",
    time:       "",
    location:   "",
    mode:       "Physical",
    seats:      30,
    desc:       "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "representative") {
    navigate("/");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.date || !form.time || !form.location || !form.desc) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const result = await addEvent({
      ...form,
      seats: Number(form.seats),
      instructor: user.fullName,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to create event. Please try again.");
    }
  };

  return (
    <div className="page add-event-page">
      {/* Banner */}
      <div className="add-event-page__header">
        <div className="container">
          <Link to="/training" className="add-event-page__back">← Back to Training Hub</Link>
          <span className="section-tag">Representative Portal</span>
          <h1 className="add-event-page__title">Create New Activity</h1>
          <p className="add-event-page__sub">
            Fill in the details below. The event will be set to Upcoming and appear in the Training Hub immediately.
          </p>
        </div>
      </div>

      <div className="container add-event-page__body">
        {success ? (
          <div className="add-event-success">
            <div className="add-event-success__icon">✓</div>
            <h2>Event Created Successfully!</h2>
            <p>Your event has been added to the Training Hub and is now visible to all users.</p>
            <div className="add-event-success__actions">
              <Link to="/training" className="btn-primary">View Training Hub</Link>
              <button className="btn-outline" onClick={() => { setSuccess(false); setForm({ title: "", type: "Workshop", topic: "Python", audience: "Students", department: user.department, date: "", time: "", location: "", mode: "Physical", seats: 30, desc: "" }); }}>
                Add Another Event
              </button>
            </div>
          </div>
        ) : (
          <form className="add-event-form" onSubmit={handleSubmit}>
            {error && <div className="add-event-error">{error}</div>}

            {/* Row 1 */}
            <div className="add-event-form__row add-event-form__row--full">
              <div className="form-group">
                <label>Event Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Introduction to Python for Engineers" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="add-event-form__row">
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Topic *</label>
                <select name="topic" value={form.topic} onChange={handleChange}>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="add-event-form__row">
              <div className="form-group">
                <label>Target Audience *</label>
                <select name="audience" value={form.audience} onChange={handleChange}>
                  {AUDIENCE.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select name="department" value={form.department} onChange={handleChange}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="All Departments">All Departments</option>
                </select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="add-event-form__row">
              <div className="form-group">
                <label>Date *</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input name="time" type="time" value={form.time} onChange={handleChange} />
              </div>
            </div>

            {/* Row 5 */}
            <div className="add-event-form__row">
              <div className="form-group">
                <label>Delivery Mode *</label>
                <select name="mode" value={form.mode} onChange={handleChange}>
                  <option value="Physical">Physical</option>
                  <option value="Webinar">Webinar (Online)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Seats *</label>
                <input name="seats" type="number" min="1" max="500" value={form.seats} onChange={handleChange} />
              </div>
            </div>

            {/* Row 6 */}
            <div className="add-event-form__row add-event-form__row--full">
              <div className="form-group">
                <label>Location / Link *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder={form.mode === "Webinar" ? "e.g. Online (Zoom) — zoom.us/j/..." : "e.g. Room B204 – Faculty of Sciences"} />
              </div>
            </div>

            {/* Row 7 */}
            <div className="add-event-form__row add-event-form__row--full">
              <div className="form-group">
                <label>Description *</label>
                <textarea name="desc" value={form.desc} onChange={handleChange} rows={4} placeholder="Describe what participants will learn, prerequisites, and what to bring..." />
              </div>
            </div>

            {/* Status notice */}
            <div className="add-event-status-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              This event will automatically be set to <strong>Upcoming</strong> and will appear in the Training Hub immediately after submission.
            </div>

            <div className="add-event-form__actions">
              <button type="submit" className="btn-primary add-event-submit" disabled={loading}>
                {loading ? "Publishing..." : "Publish Event"}
              </button>
              <Link to="/training" className="btn-outline">Cancel</Link>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}