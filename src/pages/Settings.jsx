import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./Settings.css";


export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const TABS = user?.role === "admin" 
    ? ["Profile", "Personal Info", "Security"] 
    : ["Profile", "Personal Info", "Security", "Notifications"];
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeSettingsTab");
    return savedTab ? savedTab : "Profile";
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeSettingsTab", tab);
  };

  if (!user) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="page settings-page">
      <div className="settings-page__header">
        <div className="container">
          {user?.role === "admin" && (
            <Link to="/admin" style={{ color: "rgba(255,255,255,0.7)", display: "inline-block", marginBottom: "1rem", fontWeight: "600", textDecoration: "none" }}>
              ← Back to Admin Dashboard
            </Link>
          )}
          <span className="section-tag">Account</span>
          <h1 className="settings-page__title">Settings</h1>
        </div>
      </div>

      <div className="container settings-page__body">
        {/* Sidebar tabs */}
        <aside className="settings-page__sidebar">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={"settings-tab" + (activeTab === tab ? " settings-tab--active" : "")}
              onClick={() => handleTabChange(tab)}
            >
              <span className="settings-tab__icon">{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
          <button className="settings-tab settings-tab--danger" onClick={() => { signOut(); navigate("/"); }}>
            <span className="settings-tab__icon">🚪</span>
            Log Out
          </button>
        </aside>

        {/* Content panel */}
        <div className="settings-page__panel">
          {activeTab === "Profile"        && <ProfileTab user={user} />}
          {activeTab === "Personal Info"  && <PersonalInfoTab user={user} />}
          {activeTab === "Security"       && <SecurityTab />}
          {activeTab === "Notifications"  && <NotificationsTab />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

const TAB_ICONS = {
  "Profile":       "🖼️",
  "Personal Info": "👤",
  "Security":      "🔒",
  "Notifications": "🔔",
};

/* ── Profile Picture Tab ─────────────────────────────────── */
function ProfileTab({ user }) {
  const { signIn } = useAuth();
  const [preview, setPreview] = useState(user.profilePicture || null);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  const initials = user.fullName.split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profilePicture: preview || ""
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSaved(true);
        signIn(data.user, token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server.");
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          profilePicture: ""
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSaved(true);
        signIn(data.user, token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to remove picture.");
    }
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Profile Picture</h2>
      <p className="settings-panel__sub">This is how others will recognise you on the platform.</p>

      {error && <div className="settings-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="profile-avatar-wrap">
        <div className="profile-avatar">
          {preview
            ? <img src={preview} alt="Profile" className="profile-avatar__img" />
            : <span className="profile-avatar__initials">{initials}</span>
          }
        </div>
        <div className="profile-avatar-actions">
          <button className="btn-primary" onClick={() => fileRef.current.click()}>
            Upload Photo
          </button>
          
          {/* If they have a picture, show the Remove button */}
          {preview && (
            <button className="btn-outline" onClick={handleRemove} disabled={loading}>
              Remove
            </button>
          )}
          
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <p className="profile-avatar-hint">JPG, PNG or GIF · Max 2MB</p>
        </div>
      </div>

      {/* 3. The updated save button */}
      <button 
        className="btn-primary settings-save-btn" 
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
      
      {saved && <div className="settings-success">✓ Profile picture updated successfully.</div>}
    </div>
  );
}

/* ── Personal Info Tab ───────────────────────────────────── */
function PersonalInfoTab({ user }) {
  const { signIn } = useAuth();
  const [form, setForm] = useState({ fullName: user.fullName, email: user.email, title: user.title || "", focus: user.focus || "", bio: user.bio || "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { 
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); 
    setSaved(false); 
    setError("");
  };

  const handleCertUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/certificate`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ certificateUrl: ev.target.result })
        });
        const data = await res.json();
        if (res.ok) {
          signIn(data.user, token);
          setSaved(true);
        }
      } catch (err) {
        setError("Failed to upload certificate.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
  fullName: form.fullName,
  email: form.email,
  title: form.title,
  focus: form.focus,
  bio: form.bio
}),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSaved(true);
        signIn(data.user, token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server.");
    }
  };
 return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Personal Information</h2>
      <p className="settings-panel__sub">Update your name and email address.</p>

      <div className="settings-form">
        {error && <div className="settings-error">{error}</div>}
        
        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        {user.role === "representative" && (
  <>
    <div className="form-group">
      <label>Job Title</label>
      <input name="title" value={form.title} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>AI Focus Area</label>
      <input name="focus" value={form.focus} onChange={handleChange} />
    </div>
    <div className="form-group">
      <label>Biography</label>
      <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "inherit" }} />
    </div>
    
          <div className="form-group" style={{ background: "rgba(0,102,255,0.05)", padding: "15px", borderRadius: "8px", border: "1px dashed var(--blue)" }}>
            <label style={{ color: "var(--blue)" }}>Train the Trainer Certification</label>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
              Upload your official certificate (PDF/Image) to be verified by an Administrator.
            </p>
            
            {user.certificateUrl ? (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span className="settings-success" style={{ margin: 0 }}>✓ File Uploaded</span>
                <input type="file" id="cert-upload" accept=".pdf,image/*" style={{ display: "none" }} onChange={handleCertUpload} />
                <button type="button" className="btn-outline" onClick={() => document.getElementById("cert-upload").click()} disabled={loading}>
                  {loading ? "Uploading..." : "Update File"}
                </button>
              </div>
            ) : (
              <input type="file" accept=".pdf,image/*" onChange={handleCertUpload} disabled={loading} />
            )}
          </div>
  </>
)}

        {/* Read-only fields */}
        {user?.role !== "admin" && (
              <>
        <div className="form-group">
          <label>Department <span className="settings-readonly-tag">Read only</span></label>
          <input value={user.department} disabled className="settings-input--readonly" />
        </div>
        <div className="form-group">
          <label>Role <span className="settings-readonly-tag">Read only</span></label>
          <input
            value={user.role === "representative" ? "AI Representative" : "Participant"}
            disabled
            className="settings-input--readonly"
          />
        </div>
        </>
            )}

        <button 
          className="btn-primary settings-save-btn" 
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {saved && <div className="settings-success">✓ Personal information updated.</div>}
      </div>
    </div>
  );
}

/* ── Security Tab ────────────────────────────────────────── */
function SecurityTab() {
  const [form,  setForm]  = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => { 
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); 
    setSaved(false); 
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current || !form.newPass || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.newPass !== form.confirm) { setError("New passwords do not match."); return; }
    if (form.newPass.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: form.current,
          newPassword: form.newPass
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSaved(true);
        setForm({ current: "", newPass: "", confirm: "" });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Security & Password</h2>
      <p className="settings-panel__sub">Change your password to keep your account secure.</p>

      <form className="settings-form" onSubmit={handleSubmit}>
        {/* Shows real errors from the backend */}
        {error && <div className="settings-error">{error}</div>}
        
        <div className="form-group">
          <label>Current Password</label>
          <input name="current" type="password" value={form.current} onChange={handleChange} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input name="newPass" type="password" value={form.newPass} onChange={handleChange} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="••••••••" />
        </div>
        
        {/* The updated button that disables while loading */}
        <button type="submit" className="btn-primary settings-save-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
        
        {saved && <div className="settings-success">✓ Password updated successfully.</div>}
      </form>
    </div>
  );
}

/* ── Notifications Tab ───────────────────────────────────── */
function NotificationsTab() {
  const { user, signIn } = useAuth();

  const userNotifs = user.notifications || {};
  
  const [prefs, setPrefs] = useState({
    newEvent:     userNotifs.newEvent ?? true,
    registration: userNotifs.registration ?? true,
    reminders:    userNotifs.reminders ?? true,
    repUpdates:   userNotifs.repUpdates ?? true,
    newsletter:   userNotifs.newsletter ?? false,
  });
  
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (key) => { 
    setPrefs(p => ({ ...p, [key]: !p[key] })); 
    setSaved(false); 
    setError("");
  };

  const ITEMS = [
    { key: "newEvent",     label: "New Events",          desc: "Get notified when a new workshop, seminar, or competition is added." },
    { key: "registration", label: "Registration Confirmations", desc: "Receive a confirmation when you register for an event." },
    { key: "reminders",    label: "Event Reminders",     desc: "Reminders 24 hours before events you registered for." },
    { key: "repUpdates",   label: "Representative Updates", desc: "Updates from AI representatives in your department." },
    { key: "newsletter",   label: "Newsletter",          desc: "Monthly AI House newsletter with highlights and upcoming activities." },
  ];

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(prefs),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setSaved(true);
        signIn(data.user, token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Notifications</h2>
      <p className="settings-panel__sub">Choose which notifications you want to receive.</p>

      {error && <div className="settings-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="notif-list">
        {ITEMS.map(({ key, label, desc }) => (
          <div className="notif-item" key={key}>
            <div className="notif-item__text">
              <span className="notif-item__label">{label}</span>
              <span className="notif-item__desc">{desc}</span>
            </div>
            <button
              className={"notif-toggle" + (prefs[key] ? " notif-toggle--on" : "")}
              onClick={() => toggle(key)}
              aria-label={`Toggle ${label}`}
            >
              <span className="notif-toggle__thumb" />
            </button>
          </div>
        ))}
      </div>

      {/* 4. The updated save button */}
      <button 
        className="btn-primary settings-save-btn" 
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Preferences"}
      </button>
      
      {saved && <div className="settings-success">✓ Notification preferences saved.</div>}
    </div>
  );
}