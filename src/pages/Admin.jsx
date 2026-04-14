import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { REPS, DEPARTMENTS } from "../data/mockData";
import "./Admin.css";

// ─────────────────────────────────────────────
// MOCK DEPARTMENT STATS
// ─────────────────────────────────────────────
const DEPT_STATS = [
  { name: "Computer Science", reps: 5, events: 12, participants: 345 },
  { name: "Biology",          reps: 3, events: 8,  participants: 150 },
  { name: "Mathematics",      reps: 2, events: 5,  participants: 80  },
  { name: "Physics",          reps: 4, events: 10, participants: 210 },
  { name: "Electronics",      reps: 2, events: 4,  participants: 95  },
  { name: "Chemistry",        reps: 1, events: 2,  participants: 40  },
  { name: "Management",       reps: 2, events: 3,  participants: 60  },
  { name: "Civil Engineering",reps: 1, events: 1,  participants: 30  },
];

const HEATMAP_MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function DashboardHome({ events }) {
  const totalReps   = REPS.length;
  const totalDepts  = DEPARTMENTS.length;
  const totalEvents = events.length;

  // stable heatmap – useMemo-like via useState
  const [heatmap] = useState(() =>
    DEPT_STATS.map(() =>
      Array.from({ length: 12 }, () => Math.random())
    )
  );

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="content-intro">
        <h1 className="content-title">Dashboard Overview</h1>
        <p className="content-subtitle">Analytics &amp; impact highlights for the current period.</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {[
          { label: "Total Activities",        value: totalEvents, icon: "📅" },
          { label: "Active Representatives",  value: totalReps,   icon: "👥" },
          { label: "Departments Engaged",     value: totalDepts,  icon: "🏛️" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon-wrapper">{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid-layout">
        {/* Heatmap */}
        <div className="heatmap-section-container glass-card">
          <div className="card-header">
            <h2 className="section-subtitle">Departmental Activity Heatmap</h2>
            <div className="heatmap-legend">
              <span className="legend-label">Less</span>
              <div className="legend-cells">
                {[0,1,2,3,4].map(l => <div key={l} className={`legend-cell level-${l}`} />)}
              </div>
              <span className="legend-label">More</span>
            </div>
          </div>
          <div className="heatmap-wrap">
            <div className="heatmap-dept-labels">
              {DEPT_STATS.map(d => <span key={d.name}>{d.name.split(" ")[0]}</span>)}
            </div>
            <div>
              <div className="heatmap-month-labels">
                {HEATMAP_MONTHS.map(m => <span key={m}>{m}</span>)}
              </div>
              <div className="heatmap-grid">
                {heatmap.map((row, ri) => (
                  <div key={ri} className="heatmap-row">
                    {row.map((v, ci) => {
                      const lvl = v > 0.8 ? 4 : v > 0.6 ? 3 : v > 0.4 ? 2 : v > 0.2 ? 1 : 0;
                      return <div key={ci} className={`heatmap-cell level-${lvl}`} title={`${DEPT_STATS[ri].name} – ${HEATMAP_MONTHS[ci]}`} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Impact table */}
        <div className="summary-table-container glass-card">
          <div className="card-header">
            <h2 className="section-subtitle">Impact by Department</h2>
          </div>
          <table className="modern-table">
            <thead>
              <tr><th>Department</th><th>Reps</th><th>Events</th><th>Participants</th></tr>
            </thead>
            <tbody>
              {DEPT_STATS.map(d => (
                <tr key={d.name}>
                  <td className="font-semibold">{d.name}</td>
                  <td>{d.reps}</td>
                  <td>{d.events}</td>
                  <td>{d.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MANAGE ACTIVITIES
// ─────────────────────────────────────────────
function ManageActivities({ events, setEvents, onAddEvent }) {
  const [search,       setSearch]       = useState("");
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSave = () => {
    setEvents(prev => prev.map(e => e.id === editTarget.id ? editTarget : e));
    setEditTarget(null);
  };

  return (
    <div className="activities-view animate-fade-in">
      <div className="content-header-row">
        <h1 className="content-title">Manage Activities</h1>
        <div className="header-actions">
          <div className="admin-search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search activities…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-header-accent" onClick={onAddEvent}>+ New Event</button>
        </div>
      </div>

      <div className="data-table-container glass-card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Representative</th><th>Title</th><th>Type</th>
              <th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(act => (
              <tr key={act.id}>
                <td className="rep-cell-rich">
                  <div className="tiny-avatar-initials">
                    {act.instructor ? act.instructor.split(" ").slice(0,2).map(w=>w[0]).join("") : "??"}
                  </div>
                  {act.instructor || "—"}
                </td>
                <td className="font-semibold">{act.title}</td>
                <td><span className={`type-tag type-${act.type?.toLowerCase()}`}>{act.type}</span></td>
                <td className="text-muted">
                  {new Date(act.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                </td>
                <td>
                  <span className={`status-pill status-${act.status}`}>
                    {act.status === "upcoming" ? "Upcoming" : "Completed"}
                  </span>
                </td>
                <td>
                  <div className="action-row">
                    <button className="btn-icon-action edit" title="Edit" onClick={() => setEditTarget({...act})}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    <button className="btn-icon-action delete" title="Delete" onClick={() => setDeleteTarget(act)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No activities found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h2>Edit Activity</h2></div>
            <div className="modern-form">
              <div className="form-group-admin">
                <label>Title</label>
                <input className="input-premium-admin" value={editTarget.title} onChange={e => setEditTarget(p=>({...p,title:e.target.value}))} />
              </div>
              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Type</label>
                  <select className="select-premium-admin" value={editTarget.type} onChange={e => setEditTarget(p=>({...p,type:e.target.value}))}>
                    {["Workshop","Seminar","Competition"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group-admin">
                  <label>Status</label>
                  <select className="select-premium-admin" value={editTarget.status} onChange={e => setEditTarget(p=>({...p,status:e.target.value}))}>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group-admin">
                <label>Date</label>
                <input type="date" className="input-premium-admin" value={editTarget.date} onChange={e => setEditTarget(p=>({...p,date:e.target.value}))} />
              </div>
              <div className="form-group-admin">
                <label>Description</label>
                <textarea className="textarea-premium-admin" rows={3} value={editTarget.desc} onChange={e => setEditTarget(p=>({...p,desc:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="glass-modal confirmation-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered">
              <h2>Delete Activity?</h2>
              <p className="content-subtitle">"{deleteTarget.title}" will be permanently removed.</p>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MANAGE DEPARTMENTS
// ─────────────────────────────────────────────
function ManageDepts({ events }) {
  return (
    <div className="departments-view animate-fade-in">
      <div className="content-header-row">
        <h1 className="content-title">Manage Departments</h1>
      </div>
      <div className="summary-table-container glass-card">
        <table className="modern-table">
          <thead>
            <tr><th>Department Name</th><th>Total Representatives</th><th>Total Events</th></tr>
          </thead>
          <tbody>
            {DEPT_STATS.map(d => {
              const deptEvents = events.filter(e => e.department === d.name).length;
              return (
                <tr key={d.name}>
                  <td className="font-semibold">{d.name}</td>
                  <td>{d.reps}</td>
                  <td>{deptEvents || d.events}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MANAGE REPRESENTATIVES
// ─────────────────────────────────────────────
function ManageReps() {
  const [reps,        setReps]        = useState(REPS);
  const [search,      setSearch]      = useState("");
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);

  const filtered = reps.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    setReps(prev => prev.map(r => r.id === editTarget.id ? editTarget : r));
    setEditTarget(null);
  };

  const handleDelete = () => {
    setReps(prev => prev.filter(r => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="representatives-view animate-fade-in">
      <div className="content-header-row">
        <h1 className="content-title">Manage Representatives</h1>
        <div className="admin-search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input placeholder="Search by name or department…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="data-table-container glass-card">
        <table className="modern-table">
          <thead>
            <tr><th>Name</th><th>Department</th><th>Validation Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(rep => (
              <tr key={rep.id}>
                <td>
                  <div className="rep-cell-rich">
                    <div className="tiny-avatar-initials">{rep.initials}</div>
                    <div>
                      <div className="font-semibold">{rep.fullName}</div>
                      <div className="text-muted" style={{fontSize:"0.75rem"}}>{rep.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{rep.department}</td>
                <td>
                  <span className={`status-pill ${rep.validated ? "status-upcoming" : "status-pending"}`}>
                    {rep.validated ? "✓ Validated" : "Pending"}
                  </span>
                </td>
                <td>
                  <div className="action-row">
                    <button className="btn-icon-action edit" title="Edit" onClick={() => setEditTarget({...rep})}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    <button className="btn-icon-action delete" title="Delete" onClick={() => setDeleteTarget(rep)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="empty-row">No representatives found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h2>Edit Representative</h2></div>
            <div className="modern-form">
              <div className="form-group-admin">
                <label>Full Name</label>
                <input className="input-premium-admin" value={editTarget.fullName} onChange={e => setEditTarget(p=>({...p,fullName:e.target.value}))} />
              </div>
              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Department</label>
                  <select className="select-premium-admin" value={editTarget.department} onChange={e => setEditTarget(p=>({...p,department:e.target.value}))}>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group-admin">
                  <label>Role</label>
                  <select className="select-premium-admin" value={editTarget.validated ? "validated" : "pending"} onChange={e => setEditTarget(p=>({...p,validated:e.target.value==="validated"}))}>
                    <option value="validated">Validated</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="glass-modal confirmation-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered">
              <h2>Remove Representative?</h2>
              <p className="content-subtitle"><strong>{deleteTarget.fullName}</strong> will be removed from the platform.</p>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient btn-danger" onClick={handleDelete}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CREATE ACTIVITY MODAL
// ─────────────────────────────────────────────
const TYPES    = ["Workshop", "Seminar", "Competition"];
const AUDIENCE = ["General Public", "Students", "Dept Reps"];
const TOPICS   = ["Python","Data Science","Machine Learning","Automation","AI Ethics","AI Challenge"];

function CreateActivityModal({ onClose, onPublish, adminName }) {
  const [form, setForm] = useState({
    title: "", type: "Workshop", topic: "Python",
    audience: "Students", department: DEPARTMENTS[0],
    date: "", time: "", mode: "Physical", seats: 30,
    location: "", desc: "", status: "upcoming",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.location || !form.desc) {
      setError("Please fill in all required fields."); return;
    }
    onPublish({ ...form, seats: Number(form.seats), instructor: adminName, resources: [] });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="activity-modal glass-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-centered"><h2>Create New Activity</h2></div>
        <form className="modern-form" onSubmit={handleSubmit}>
          {error && <div className="error-msg-admin">{error}</div>}

          <div className="form-group-admin">
            <label>Activity Title *</label>
            <input className="input-premium-admin" placeholder="e.g. Python for Engineers" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} />
          </div>

          <div className="form-pill-group">
            {TYPES.map(t => (
              <button key={t} type="button" className={`type-pill ${form.type===t?"active":""}`} onClick={() => setForm(p=>({...p,type:t}))}>
                {t}
              </button>
            ))}
          </div>

          <div className="form-group-admin">
            <label>Target Audience</label>
            <div className="form-checkbox-row">
              {AUDIENCE.map(a => (
                <label key={a} className="checkbox-modern">
                  <input type="radio" name="audience" checked={form.audience===a} onChange={() => setForm(p=>({...p,audience:a}))} />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row-admin">
            <div className="form-group-admin">
              <label>Date *</label>
              <input type="date" className="input-premium-admin" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(p=>({...p,date:e.target.value}))} />
            </div>
            <div className="form-group-admin">
              <label>Time *</label>
              <input type="time" className="input-premium-admin" value={form.time} onChange={e => setForm(p=>({...p,time:e.target.value}))} />
            </div>
          </div>

          <div className="form-row-admin">
            <div className="form-group-admin">
              <label>Department</label>
              <select className="select-premium-admin" value={form.department} onChange={e => setForm(p=>({...p,department:e.target.value}))}>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                <option value="All Departments">All Departments</option>
              </select>
            </div>
            <div className="form-group-admin">
              <label>Topic</label>
              <select className="select-premium-admin" value={form.topic} onChange={e => setForm(p=>({...p,topic:e.target.value}))}>
                {TOPICS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row-admin">
            <div className="form-group-admin">
              <label>Mode</label>
              <select className="select-premium-admin" value={form.mode} onChange={e => setForm(p=>({...p,mode:e.target.value}))}>
                <option value="Physical">Physical</option>
                <option value="Webinar">Webinar (Online)</option>
              </select>
            </div>
            <div className="form-group-admin">
              <label>Seats</label>
              <input type="number" className="input-premium-admin" min="1" max="500" value={form.seats} onChange={e => setForm(p=>({...p,seats:e.target.value}))} />
            </div>
          </div>

          <div className="form-group-admin">
            <label>Location / Link *</label>
            <input className="input-premium-admin" placeholder={form.mode==="Webinar"?"e.g. Online (Zoom)":"e.g. Room B204"} value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} />
          </div>

          <div className="form-group-admin">
            <label>Description *</label>
            <textarea className="textarea-premium-admin" rows={3} placeholder="Brief overview of this activity…" value={form.desc} onChange={e => setForm(p=>({...p,desc:e.target.value}))} />
          </div>

          <div className="form-toggle-row">
            <label className="switch-label">
              <span className="switch">
                <input type="checkbox" checked readOnly />
                <span className="slider round" />
              </span>
              Set to Upcoming
            </label>
          </div>

          <div className="modal-footer-clean">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-publish-gradient">Publish Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────
function NotificationsPanel({ notifications, onClose }) {
  return (
    <div className="notif-panel">
      <div className="notif-panel__header">
        <span>Notifications</span>
        <button onClick={onClose}>✕</button>
      </div>
      {notifications.length === 0 ? (
        <div className="notif-panel__empty">No new notifications.</div>
      ) : (
        <div className="notif-panel__list">
          {notifications.map((n, i) => (
            <div key={i} className="notif-panel__item">
              <div className="notif-panel__icon">{n.icon}</div>
              <div>
                <div className="notif-panel__msg">{n.msg}</div>
                <div className="notif-panel__time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN ADMIN COMPONENT
// ─────────────────────────────────────────────
export default function Admin() {
  const { user, signOut }    = useAuth();
  const { events, addEvent } = useEvents();
  const navigate             = useNavigate();

  const [localEvents,      setLocalEvents]      = useState(events);
  const [activeTab,        setActiveTab]         = useState("dashboard");
  const [showUserDropdown, setShowUserDropdown]  = useState(false);
  const [isModalOpen,      setIsModalOpen]       = useState(false);
  const [showNotif,        setShowNotif]         = useState(false);
  const dropdownRef = useRef(null);

  const [notifications] = useState([
    { icon: "📅", msg: "New workshop registered: Python for Biologists",     time: "2 min ago" },
    { icon: "👤", msg: "Dr. Sonia Hamdane submitted validation request",      time: "1 hr ago"  },
    { icon: "🏆", msg: "National AI Hackathon 2026 now has 48 registrations", time: "3 hr ago"  },
  ]);

  // keep local events in sync when context changes
  useEffect(() => { setLocalEvents(events); }, [events]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // redirect non-admins
  if (!user || user.role !== "admin") {
    navigate("/"); return null;
  }

  const handlePublish = (newEvent) => {
    const created = { ...newEvent, id: Date.now(), resources: [] };
    setLocalEvents(prev => [created, ...prev]);
    addEvent(newEvent); // also pushes to public Training Hub
  };

  const initials = user.fullName.split(" ").slice(0,2).map(w=>w[0].toUpperCase()).join("");

  const NAV_ITEMS = [
    { id: "dashboard",       label: "Overview",        icon: "📊", group: "General"    },
    { id: "activities",      label: "Activities",      icon: "📅", group: "General",  badge: localEvents.length },
    { id: "departments",     label: "Departments",     icon: "🏛️", group: "Management" },
    { id: "representatives", label: "Representatives", icon: "👥", group: "Management" },
  ];

  return (
    <div className="admin-page-root modern-admin">

      {/* ── HEADER ── */}
      <header className="admin-header premium-header">
        <div className="header-left">
          <div className="admin-logo-official">
            <div className="navbar__logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
                <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2.5" fill="#fff"/>
              </svg>
            </div>
            <span className="navbar__logo-text">
              AI House <span className="navbar__logo-sub">· Admin</span>
            </span>
          </div>
        </div>

        <div className="header-right">
          {/* Notification bell */}
          <div className="notification-bell-wrap" style={{ position:"relative" }}>
            <button className="notification-bell" onClick={() => { setShowNotif(v=>!v); setShowUserDropdown(false); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications.length > 0 && <span className="bell-dot" />}
            </button>
            {showNotif && (
              <NotificationsPanel notifications={notifications} onClose={() => setShowNotif(false)} />
            )}
          </div>

          {/* New Event */}
          <button className="btn-header-accent" onClick={() => setIsModalOpen(true)}>
            <span>+</span> New Event
          </button>

          {/* User dropdown */}
          <div className="user-profile-premium" ref={dropdownRef} onClick={() => setShowUserDropdown(v=>!v)}>
            <div className="user-avatar-premium">{initials}</div>
            <div className="user-info-text">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">Super Admin</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showUserDropdown ? "rotate(180deg)" : "none", transition:"0.2s" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>

            {showUserDropdown && (
              <div className="dropdown-premium" onClick={e => e.stopPropagation()}>
                <div className="dropdown-item" onClick={() => { navigate("/settings"); setShowUserDropdown(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </div>
                <div className="dropdown-sep" />
                <div className="dropdown-item logout-btn" onClick={() => { signOut(); navigate("/"); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="admin-main-wrapper">

        {/* Sidebar */}
        <aside className="admin-sidebar-premium">
          {["General","Management"].map(group => (
            <div key={group} className="nav-group">
              <span className="nav-label">{group}</span>
              {NAV_ITEMS.filter(n => n.group === group).map(item => (
                <div
                  key={item.id}
                  className={`nav-item-p ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="badge-count">{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="admin-content-premium">
          {activeTab === "dashboard"       && <DashboardHome events={localEvents} />}
          {activeTab === "activities"      && <ManageActivities events={localEvents} setEvents={setLocalEvents} onAddEvent={() => setIsModalOpen(true)} />}
          {activeTab === "departments"     && <ManageDepts events={localEvents} />}
          {activeTab === "representatives" && <ManageReps />}
        </main>
      </div>

      {/* Create event modal */}
      {isModalOpen && (
        <CreateActivityModal
          onClose={() => setIsModalOpen(false)}
          onPublish={handlePublish}
          adminName={user.fullName}
        />
      )}
    </div>
  );
}