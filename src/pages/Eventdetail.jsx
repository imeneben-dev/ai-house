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

  const [uploadingFile, setUploadingFile] = useState(false);

  // ==========================================
  // MAGIC FIX 1: State for the Edit Modal
  // ==========================================
  const [isEditing, setIsEditing] = useState(false);
  const [editEventForm, setEditEventForm] = useState(event || {});

  // Function to save the edits
  const handleSaveEdit = async () => {
    try {
      // Send the updated data to your context/database
      await updateEvent(event.id, editEventForm);
      setIsEditing(false); // Close the modal
      alert("Event updated successfully!"); // Simple success message
    } catch (err) {
      console.error("Failed to update event", err);
      alert("Failed to update event.");
    }
  };

  const handleFileUpload = async (e, fileName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64String = ev.target.result;

      const updatedResources = event.resources.filter(r => r.name !== fileName);
      updatedResources.push({ name: fileName, url: base64String });

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}/resources`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ resources: updatedResources })
        });

        const data = await response.json();
        if (response.ok) updateEvent(data.event); 
      } catch (err) {
        console.error("Upload failed.");
      }
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}/register`, {
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
          <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: "0.5rem" }}>{event.title}</h1>
          
          {/* ========================================== */}
          {/* MAGIC FIX 3: Exclusive Edit Button for the Owner */}
          {/* ========================================== */}
          {user?.fullName === event.instructor && (
            <button 
              onClick={() => {
                setEditEventForm(event); // Load current data into the form
                setIsEditing(true);      // Open the modal
              }} 
              style={{ 
                marginTop: '1rem', padding: '8px 16px', background: 'rgba(255,255,255,0.15)', 
                color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', 
                cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Event Details
            </button>
          )}
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

              {/* --- INSTRUCTOR CONTROL PANEL (Hidden from normal users) --- */}
              {user?.fullName === event.instructor && (
                <div 
                  className="instructor-controls"
                  style={{ 
                    /* MAGIC FIX 2: This guarantees a huge space below the buttons, pushing the download links down! */
                    marginBottom: "2.5rem", 
                    padding: "1.2rem", 
                    background: "var(--blue-light)", 
                    borderRadius: "8px", 
                    border: "1.5px dashed var(--blue)" 
                  }}
                >
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--blue)", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 16v-9M12 7l-3 3M12 7l3 3M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Instructor Controls: Upload Files
                  </h4>
                  
                  {/* MAGIC FIX 1: 'display: flex' and 'gap' forces a perfect, unbreakable horizontal space between the buttons! */}
                  <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    
                    <label 
                      className="btn-primary" 
                      style={{ 
                        cursor: uploadingFile ? "not-allowed" : "pointer", 
                        opacity: uploadingFile ? 0.6 : 1, 
                        margin: 0
                      }}
                    >
                      Upload Presentation (PDF)
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => handleFileUpload(e, "Presentation Deck.pdf")} 
                        disabled={uploadingFile} 
                        style={{ display: "none" }} 
                      />
                    </label>
                    
                    <label 
                      className="btn-primary" 
                      style={{ 
                        cursor: uploadingFile ? "not-allowed" : "pointer", 
                        opacity: uploadingFile ? 0.6 : 1, 
                        margin: 0
                      }}
                    >
                      Upload Dataset (JSON)
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={(e) => handleFileUpload(e, "Training Dataset.json")} 
                        disabled={uploadingFile} 
                        style={{ display: "none" }} 
                      />
                    </label>

                  </div>

                  {uploadingFile && (
                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--blue)", marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      Uploading to database... please wait.
                    </div>
                  )}
                </div>
              )}
              {/* ----------------------------------------------------------- */}

              {/* Display the buttons ONLY if files exist. */}
              {event.resources && event.resources.length > 0 ? (
                <div className="event-detail__resources">
                  {event.resources.map((r) => (
                    <a key={r.name} href={r.url} className="event-detail__resource-item" download={r.name}>
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
        {!isPast && user?.fullName !== event.instructor && (
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

      {/* ========================================== */}
      {/* MAGIC FIX 4: The Edit Event Modal Window */}
      {/* ========================================== */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Edit Event</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Event Title</label>
                <input value={editEventForm.title || ""} onChange={e => setEditEventForm({...editEventForm, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Topic</label>
                <input value={editEventForm.topic || ""} onChange={e => setEditEventForm({...editEventForm, topic: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Date</label>
                  <input type="date" value={editEventForm.date || ""} onChange={e => setEditEventForm({...editEventForm, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Time</label>
                  <input type="time" value={editEventForm.time || ""} onChange={e => setEditEventForm({...editEventForm, time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '5px' }}>Location / Meet Link</label>
                <input value={editEventForm.location || ""} onChange={e => setEditEventForm({...editEventForm, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--light-gray)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Save Changes</button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}