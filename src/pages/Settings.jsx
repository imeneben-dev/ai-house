import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./Settings.css";

const TABS = ["Profile", "Personal Info", "Security", "Notifications"];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  if (!user) {
    navigate("/signin");
    return null;
  }

  return (
    <div className="page settings-page">
      <div className="settings-page__header">
        <div className="container">
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
              onClick={() => setActiveTab(tab)}
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
  const [preview, setPreview] = useState(null);
  const [saved,   setSaved]   = useState(false);
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

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Profile Picture</h2>
      <p className="settings-panel__sub">This is how others will recognise you on the platform.</p>

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
          {preview && (
            <button className="btn-outline" onClick={() => { setPreview(null); setSaved(false); }}>
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <p className="profile-avatar-hint">JPG, PNG or GIF · Max 2MB</p>
        </div>
      </div>

      {preview && !saved && (
        <button className="btn-primary settings-save-btn" onClick={() => setSaved(true)}>
          Save Changes
        </button>
      )}
      {saved && <div className="settings-success">✓ Profile picture updated successfully.</div>}
    </div>
  );
}

/* ── Personal Info Tab ───────────────────────────────────── */
function PersonalInfoTab({ user }) {
  const [form,  setForm]  = useState({ fullName: user.fullName, email: user.email });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setSaved(false); };

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Personal Information</h2>
      <p className="settings-panel__sub">Update your name and email address.</p>

      <div className="settings-form">
        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        {/* Read-only fields */}
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

        <button className="btn-primary settings-save-btn" onClick={() => setSaved(true)}>
          Save Changes
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

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setSaved(false); setError(""); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.current || !form.newPass || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.newPass !== form.confirm) { setError("New passwords do not match."); return; }
    if (form.newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSaved(true);
    setForm({ current: "", newPass: "", confirm: "" });
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Security & Password</h2>
      <p className="settings-panel__sub">Change your password to keep your account secure.</p>

      <form className="settings-form" onSubmit={handleSubmit}>
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
        <button type="submit" className="btn-primary settings-save-btn">Update Password</button>
        {saved && <div className="settings-success">✓ Password updated successfully.</div>}
      </form>
    </div>
  );
}

/* ── Notifications Tab ───────────────────────────────────── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEvent:      true,
    registration:  true,
    reminders:     true,
    newsletter:    false,
    repUpdates:    true,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => { setPrefs(p => ({ ...p, [key]: !p[key] })); setSaved(false); };

  const ITEMS = [
    { key: "newEvent",     label: "New Events",          desc: "Get notified when a new workshop, seminar, or competition is added." },
    { key: "registration", label: "Registration Confirmations", desc: "Receive a confirmation when you register for an event." },
    { key: "reminders",    label: "Event Reminders",     desc: "Reminders 24 hours before events you registered for." },
    { key: "repUpdates",   label: "Representative Updates", desc: "Updates from AI representatives in your department." },
    { key: "newsletter",   label: "Newsletter",          desc: "Monthly AI House newsletter with highlights and upcoming activities." },
  ];

  return (
    <div className="settings-panel">
      <h2 className="settings-panel__title">Notifications</h2>
      <p className="settings-panel__sub">Choose which notifications you want to receive.</p>

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

      <button className="btn-primary settings-save-btn" onClick={() => setSaved(true)}>
        Save Preferences
      </button>
      {saved && <div className="settings-success">✓ Notification preferences saved.</div>}
    </div>
  );
}