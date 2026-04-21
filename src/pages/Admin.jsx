import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { DEPARTMENTS } from "../data/mockData";
import aiHouseLogo from "../assets/ai_house_logo.svg";
import "./Admin.css";

// ─────────────────────────────────────────────
// MOCK DEPARTMENT STATS
// ─────────────────────────────────────────────

const HEATMAP_MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function DashboardHome({ data }) {
  // If data hasn't arrived from the database yet, show a clean loading state
  if (!data) return <div className="dashboard-view animate-fade-in"><p>Loading analytics...</p></div>;

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="content-intro">
        <h1 className="content-title">Dashboard Overview</h1>
        <p className="content-subtitle">Analytics &amp; impact highlights for the current period.</p>
      </div>

      {/* Real Stat cards */}
      <div className="stats-grid">
        {[
          { label: "Total Activities",        value: data.totalEvents, icon: "📅" },
          { label: "Active Representatives",  value: data.totalReps,   icon: "👥" },
          { label: "Departments Engaged",     value: data.totalDepts,  icon: "🏛️" },
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
        {/* Real Heatmap */}
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
              {data.deptStats.map(d => <span key={d.name}>{d.name.split(" ")[0]}</span>)}
            </div>
            <div>
              <div className="heatmap-month-labels">
                {HEATMAP_MONTHS.map(m => <span key={m}>{m}</span>)}
              </div>
              <div className="heatmap-grid">
                {data.heatmap.map((row, ri) => (
                  <div key={ri} className="heatmap-row">
                    {row.map((v, ci) => {
                      // Determine color level based on real database activity
                      const lvl = v > 0.8 ? 4 : v > 0.6 ? 3 : v > 0.4 ? 2 : v > 0.1 ? 1 : 0;
                      return (
                        <div key={ci} className={`heatmap-cell level-${lvl}`}>
                          <div className="heat-tooltip">
                            <span className="heat-tooltip__title">{data.deptStats[ri].name}</span>
                            <span className="heat-tooltip__desc">{HEATMAP_MONTHS[ci]} Activity</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real Impact table */}
        <div className="summary-table-container glass-card">
          <div className="card-header">
            <h2 className="section-subtitle">Impact by Department</h2>
          </div>
          <table className="modern-table">
            <thead>
              <tr><th>Department</th><th>Reps</th><th>Events</th><th>Participants</th></tr>
            </thead>
            <tbody>
              {data.deptStats.map(d => (
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
function ManageActivities({ events, setEvents, onAddEvent, setSuccessMsg }) {
  const [search,       setSearch]       = useState("");
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [repsList, setRepsList] = useState([]);

  useEffect(() => {
    const fetchRepsForPictures = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRepsList(data);
        }
      } catch (err) {
        console.error("Failed to fetch reps for pictures");
      }
    };
    fetchRepsForPictures();
  }, []);

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const repId = deleteTarget._id || deleteTarget.id;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives/${repId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
        setAdminsList(prev => prev.filter(a => (a._id || a.id) !== repId)); 

        setDeleteTarget(null);

        setSuccessMsg("Account permanently deleted & blacklisted!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete account", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const repId = editTarget._id || editTarget.id;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives/${repId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editTarget)
      });
      
      if (res.ok) {
        const updatedRep = await res.json();
        
        if (updatedRep.role === "participant") {
          setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
          setParticipants(prev => [...prev, updatedRep]);
        } else if (updatedRep.role === "admin") {
          setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
          setAdminsList(prev => [...prev, updatedRep]); 
        } else {
          setReps(prev => prev.map(r => (r._id || r.id) === repId ? updatedRep : r));
        }

        setEditTarget(null);

        setSuccessMsg("Representative updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update representative", error);
    }
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
            {filtered.map(act => {
              // MAGIC FIX 3: Look through our dictionary to find the matching Representative by name!
              const repMatch = repsList.find(r => r.fullName === act.instructor);

              return (
                <tr key={act._id || act.id}>
                  <td className="rep-cell-rich">
                    {repMatch?.profilePicture ? (
                      <img 
                        src={repMatch.profilePicture} 
                        alt={act.instructor} 
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
                      />
                    ) : (
                      <div className="tiny-avatar-initials">
                        {act.instructor ? act.instructor.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("") : "??"}
                      </div>
                    )}
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
              );
            })}
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
                {/* Ensure date strings display properly inside input type="date" */}
                <input type="date" className="input-premium-admin" value={editTarget.date.split("T")[0]} onChange={e => setEditTarget(p=>({...p,date:e.target.value}))} />
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
function ManageDepts({ deptStats }) {
  // Wait for the backend data to arrive
  if (!deptStats) return <div className="animate-fade-in"><p>Loading department data...</p></div>;

  // Calculate the maximum participants so we can draw relative visual progress bars!
  const maxParticipants = Math.max(...deptStats.map(d => d.participants), 1);

  return (
    <div className="departments-view animate-fade-in">
      <div className="content-header-row">
        <div>
          <h1 className="content-title">Department Analytics</h1>
          <p className="content-subtitle" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "5px" }}>
            Track engagement, event hosting, and representative activity across all university faculties.
          </p>
        </div>
      </div>

      <div className="data-table-container glass-card" style={{ marginTop: "1.5rem" }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Active Reps</th>
              <th>Activities Held</th>
              <th>Participants Trained</th>
              <th>Engagement Level</th>
            </tr>
          </thead>
          <tbody>
            {deptStats.map(d => {
              // Calculate percentage for the visual bar
              const percent = Math.round((d.participants / maxParticipants) * 100) || 0;
              
              return (
                <tr key={d.name}>
                  <td className="font-semibold" style={{ fontSize: "1rem" }}>{d.name}</td>
                  <td>
                    <span className="status-pill status-upcoming" style={{ background: "rgba(0, 102, 255, 0.1)", color: "var(--blue)" }}>
                      {d.reps} Reps
                    </span>
                  </td>
                  <td><strong>{d.events}</strong> Events</td>
                  <td className="font-semibold">{d.participants}</td>
                  <td style={{ width: "200px" }}>
                    {/* Dynamic Progress Bar */}
                    <div style={{ background: "var(--border)", height: "8px", borderRadius: "4px", overflow: "hidden", width: "100%" }}>
                      <div style={{ 
                        background: "var(--blue)", 
                        height: "100%", 
                        width: `${percent}%`, 
                        transition: "width 1s ease-in-out",
                        borderRadius: "4px"
                      }}></div>
                    </div>
                  </td>
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
function ManageReps({ user, setSuccessMsg }) {
  const isSuperAdmin = user?.email === "admin@univ-blida.dz";
  const [reps,        setReps]        = useState([]);
  const [participants, setParticipants] = useState([]);
  const [adminsList, setAdminsList] = useState([]); 
  const [demoteTarget, setDemoteTarget] = useState(null);
  const [search,      setSearch]      = useState("");
  const [editTarget,  setEditTarget]  = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [deletePartTarget, setDeletePartTarget] = useState(null);
  const [editPartTarget, setEditPartTarget] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch Reps
        const resReps = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives`, { headers: { "Authorization": `Bearer ${token}` } });
        if (resReps.ok) setReps(await resReps.json());

        // Fetch Participants
        const resParts = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/participants`, { headers: { "Authorization": `Bearer ${token}` } });
        if (resParts.ok) setParticipants(await resParts.json());

        const resAdmins = await fetch(`${import.meta.env.VITE_API_URL}/api/admins`);
      if (resAdmins.ok) {
        const adminData = await resAdmins.json();
        setAdminsList(adminData.filter(a => a.email !== "admin@univ-blida.dz"));
      }

      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    fetchUsers();
  }, []);

  const filtered = reps.filter(r =>
    r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.department?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredParts = participants.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const repId = editTarget._id || editTarget.id;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives/${repId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editTarget)
      });
      
      if (res.ok) {
        const updatedRep = await res.json();

        if (updatedRep.role === "participant") {
          setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
          setParticipants(prev => [...prev, updatedRep]);
        } else if (updatedRep.role === "admin") {
          setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
          setAdminsList(prev => [...prev, updatedRep]); 
        } else {
          setReps(prev => prev.map(r => (r._id || r.id) === repId ? updatedRep : r));
        }
      }
    } catch (error) {
      console.error("Failed to update representative", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const repId = deleteTarget._id || deleteTarget.id;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives/${repId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
      setReps(prev => prev.filter(r => (r._id || r.id) !== repId));
      setAdminsList(prev => prev.filter(a => (a._id || a.id) !== repId)); 
      setDeleteTarget(null);
      }
    } catch (error) {
      console.error("Failed to delete representative", error);
    }
  };

  const handleDeleteParticipant = async () => {
    try {
      const token = localStorage.getItem("token");
      const partId = deletePartTarget._id || deletePartTarget.id;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/participants/${partId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        setParticipants(prev => prev.filter(p => (p._id || p.id) !== partId));
        setDeletePartTarget(null);
        setSuccessMsg("Participant removed successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to delete participant", error);
    }
  };

  const handleDemoteAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminId = demoteTarget._id || demoteTarget.id;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/representatives/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...demoteTarget, role: "representative" }) 
      });

      if (res.ok) {
        const demotedUser = await res.json();
        setAdminsList(prev => prev.filter(a => (a._id || a.id) !== adminId));
        setReps(prev => [...prev, demotedUser]);

        setDemoteTarget(null);
        setSuccessMsg("Admin rights revoked successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to demote admin", error);
    }
  };

  const handleSaveParticipant = async () => {
    try {
      const token = localStorage.getItem("token");
      const partId = editPartTarget._id || editPartTarget.id;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/participants/${partId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editPartTarget)
      });
      
      if (res.ok) {
        const updatedPart = await res.json();
        
        if (updatedPart.role === "representative") {
          setParticipants(prev => prev.filter(p => (p._id || p.id) !== partId));
          setReps(prev => [...prev, updatedPart]);
        } else {
          setParticipants(prev => prev.map(p => (p._id || p.id) === partId ? updatedPart : p));
        }
        
        setEditPartTarget(null);
        setSuccessMsg("Participant updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update participant", error);
    }
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
            <tr><th>Name</th><th>Department</th><th>Certificate</th><th>Validation Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(rep => (
              <tr key={rep._id || rep.id}>
                <td>
                  <div className="rep-cell-rich">
                    {rep.profilePicture ? (
                    <img 
                      src={rep.profilePicture} 
                      alt={rep.fullName} 
                      style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} 
                    />
                  ) : (
                    <div className="tiny-avatar-initials">
                      {rep.fullName ? rep.fullName.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("") : "??"}
                    </div>
                  )}
                    <div>
                      <div className="font-semibold">{rep.fullName}</div>
                      <div className="text-muted" style={{fontSize:"0.75rem"}}>{rep.email}</div>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{rep.department}</td>
                
             <td>
               {rep.certificateUrl ? (
                 <a href={rep.certificateUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: "0.75rem", padding: "4px 8px", textDecoration: "none" }}>
                   View File
                 </a>
               ) : (
                 <span className="text-muted" style={{ fontSize: "0.75rem", fontStyle: "italic" }}>Not uploaded yet</span>
               )}
             </td>
                <td>
                  {/* Using 'isCertified' to perfectly match your backend Schema! */}
                  <span className={`status-pill ${rep.isCertified ? "status-upcoming" : "status-pending"}`}>
                    {rep.isCertified ? "✓ Validated" : "Pending"}
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


      <div className="content-header-row" style={{ marginTop: "3rem" }}>
        <h2 className="content-title" style={{ fontSize: "1.2rem" }}>Manage Participants</h2>
      </div>
      <div className="data-table-container glass-card">
        <table className="modern-table">
          <thead>
            <tr><th>Name</th><th>Department</th><th>Email</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredParts.map(part => (
              <tr key={part._id || part.id}>
                <td>
                  <div className="rep-cell-rich">
                    {part.profilePicture ? (
                      <img src={part.profilePicture} alt={part.fullName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div className="tiny-avatar-initials">{part.fullName ? part.fullName.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("") : "??"}</div>
                    )}
                    <div className="font-semibold">{part.fullName}</div>
                  </div>
                </td>
                <td className="text-muted">{part.department}</td>
                <td className="text-muted">{part.email}</td>
                <td>
                  <div className="action-row">
                    <button className="btn-icon-action edit" title="Edit" onClick={() => setEditPartTarget({...part})}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                    <button className="btn-icon-action delete" title="Delete" onClick={() => setDeletePartTarget(part)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredParts.length === 0 && <tr><td colSpan={4} className="empty-row">No participants found.</td></tr>}
          </tbody>
        </table>
      </div> 

      {/* ========================================== */}
      {/* 2. SUPER ADMIN LAYER */}
      {/* ========================================== */}
      {isSuperAdmin && (
        <>
          <div className="content-header-row" style={{ marginTop: "3rem" }}>
            <h2 className="content-title" style={{ fontSize: "1.2rem" }}>Manage Platform Admins</h2>
          </div>
          <div className="data-table-container glass-card">
            <table className="modern-table">
              <thead>
                <tr><th>Name</th><th>Department</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {adminsList.map(adm => (
                  <tr key={adm._id || adm.id}>
                    <td>
                      <div className="rep-cell-rich">
                        {adm.profilePicture ? (
                          <img src={adm.profilePicture} alt={adm.fullName} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div className="tiny-avatar-initials">{adm.fullName ? adm.fullName.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()).join("") : "??"}</div>
                        )}
                        <div className="font-semibold">{adm.fullName}</div>
                      </div>
                    </td>
                    <td className="text-muted">{adm.department}</td>
                    <td className="text-muted">{adm.email}</td>
                    <td>
                      <div className="action-row">
                        <button className="btn-icon-action edit" title="Revoke Admin Rights" onClick={() => setDemoteTarget(adm)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l6 6M3 10l6-6"/></svg>
                        </button>
                        <button className="btn-icon-action delete" title="Delete Account" onClick={() => setDeleteTarget(adm)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminsList.length === 0 && <tr><td colSpan={4} className="empty-row">No additional admins found.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Demotion Confirmation Modal */}
          {demoteTarget && (
            <div className="modal-overlay" onClick={() => setDemoteTarget(null)}>
              <div className="glass-modal confirmation-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header-centered">
                  <h2>Revoke Admin Rights?</h2>
                  <p className="content-subtitle"><strong>{demoteTarget.fullName}</strong> will be demoted back to a Representative and lose dashboard access.</p>
                </div>
                <div className="modal-footer-clean">
                  <button className="btn-cancel" onClick={() => setDemoteTarget(null)}>Cancel</button>
                  <button className="btn-publish-gradient" onClick={handleDemoteAdmin}>Yes, Revoke</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h2>Edit Representative</h2></div>
            <div className="modern-form">
              
              <div className="form-group-admin">
                <label>Full Name</label>
                <input className="input-premium-admin" value={editTarget.fullName || ""} onChange={e => setEditTarget(p=>({...p,fullName:e.target.value}))} />
              </div>
              
              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Department</label>
                  <select className="select-premium-admin" value={editTarget.department || ""} onChange={e => setEditTarget(p=>({...p,department:e.target.value}))}>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Account Role</label>
                  <select className="select-premium-admin" value={editTarget.role || "representative"} onChange={e => setEditTarget(p=>({...p,role:e.target.value}))}>
                    <option value="participant">Participant</option>
                    <option value="representative">Representative</option>
                    {isSuperAdmin && <option value="admin">Platform Admin</option>}
                  </select>
                </div>
              </div>

              <div className="form-group-admin">
                <label>Validation Status</label>
                <select className="select-premium-admin" value={editTarget.isCertified ? "validated" : "pending"} onChange={e => setEditTarget(p=>({...p,isCertified:e.target.value==="validated"}))}>
                  <option value="validated">Validated</option>
                  <option value="pending">Pending</option>
                </select>
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
      {/* ========================================== */}
      {/* ALL ACTION MODALS */}
      {/* ========================================== */}

      {/* 1. Delete Participant Modal */}
      {deletePartTarget && (
        <div className="modal-overlay" onClick={() => setDeletePartTarget(null)}>
          <div className="glass-modal confirmation-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered">
              <h2>Remove Participant?</h2>
              <p className="content-subtitle"><strong>{deletePartTarget.fullName}</strong> will be permanently erased from the database.</p>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setDeletePartTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient btn-danger" onClick={handleDeleteParticipant}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Participant Modal */}
      {editPartTarget && (
        <div className="modal-overlay" onClick={() => setEditPartTarget(null)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered"><h2>Edit Participant</h2></div>
            <div className="modern-form">
              <div className="form-group-admin">
                <label>Full Name</label>
                <input className="input-premium-admin" value={editPartTarget.fullName || ""} onChange={e => setEditPartTarget(p=>({...p,fullName:e.target.value}))} />
              </div>
              <div className="form-row-admin">
                <div className="form-group-admin">
                  <label>Department</label>
                  <select className="select-premium-admin" value={editPartTarget.department || ""} onChange={e => setEditPartTarget(p=>({...p,department:e.target.value}))}>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group-admin">
                  <label>Account Role</label>
                  <select className="select-premium-admin" value={editPartTarget.role || "participant"} onChange={e => setEditPartTarget(p=>({...p,role:e.target.value}))}>
                    <option value="participant">Participant</option>
                    <option value="representative">Representative</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer-clean">
              <button className="btn-cancel" onClick={() => setEditPartTarget(null)}>Cancel</button>
              <button className="btn-publish-gradient" onClick={handleSaveParticipant}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Representative/Admin Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="glass-modal confirmation-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-centered">
              <h2>Delete Account?</h2>
              <p className="content-subtitle"><strong>{deleteTarget.fullName}</strong> will be permanently erased from the database.</p>
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

  const [dashboardData, setDashboardData] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  
  // MAGIC FIX 1: Make notifications dynamic state
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch Dashboard Analytics
        const dashRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (dashRes.ok) setDashboardData(await dashRes.json());

        // MAGIC FIX 2: Fetch the Real 24-Hour Notifications!
        const notifRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/notifications`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (notifRes.ok) setNotifications(await notifRes.json());

      } catch (error) {
        console.error("Failed to load admin data", error);
      }
    };

    if (user?.role === "admin") {
      fetchAdminData();
    }
  }, [user, localEvents]);

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

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const handlePublish = async (newEvent) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...newEvent, resources: [] })
      });

      if (res.ok) {
        const createdEvent = await res.json();

        setLocalEvents(prev => [createdEvent, ...prev]);

        if (addEvent) addEvent(createdEvent); 

        setSuccessMsg("New activity published successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (error) {
      console.error("Failed to publish event", error);
    }
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
            <img 
                src={aiHouseLogo} 
                alt="AI House Logo" 
                style={{ height: "48px", width: "auto", objectFit: "contain", display: "block" }} 
              />            
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
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.fullName} 
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }} 
              />
            ) : (
              <div className="user-avatar-premium">{initials}</div>
            )}
            <div className="user-info-text">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">
                {user.email === "admin@univ-blida.dz" ? "Super Admin" : "Admin"}
              </span>
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

        {activeTab === "dashboard"       && <DashboardHome data={dashboardData} />}

        {/* Pass setSuccessMsg to the tabs! */}
        {activeTab === "activities"      && <ManageActivities events={localEvents} setEvents={setLocalEvents} onAddEvent={() => setIsModalOpen(true)} setSuccessMsg={setSuccessMsg} />}
        {activeTab === "departments"     && <ManageDepts deptStats={dashboardData?.deptStats} />}
        {activeTab === "representatives" && <ManageReps user={user} setSuccessMsg={setSuccessMsg} />}
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

      {/* Create event modal */}
      {isModalOpen && (
        <CreateActivityModal
          onClose={() => setIsModalOpen(false)}
          onPublish={handlePublish}
          adminName={user?.fullName || "Admin"}
        />
      )}

      {successMsg && (
        <div className="toast-notification-premium">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {successMsg}
        </div>
      )}

    </div>
  );
}