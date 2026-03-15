import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Usermenu.css";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const handleSignOut = () => {
    signOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <div className="usermenu" ref={menuRef}>
      {/* Trigger */}
      <button className="usermenu__trigger" onClick={() => setOpen(!open)}>
        <div className="usermenu__avatar">{initials}</div>
        <span className="usermenu__name">{user.fullName.split(" ")[0]}</span>
        <svg className={"usermenu__caret" + (open ? " open" : "")} width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="usermenu__dropdown">
          {/* User info row */}
          <div className="usermenu__info">
            <div className="usermenu__avatar usermenu__avatar--lg">{initials}</div>
            <div>
              <div className="usermenu__fullname">{user.fullName}</div>
              <div className="usermenu__role">
                {user.role === "representative" ? "AI Representative" : "Participant"}
              </div>
            </div>
          </div>

          <div className="usermenu__divider" />

          {/* Add event — only for representatives */}
          {user.role === "representative" && (
            <Link to="/training/new" className="usermenu__item usermenu__item--accent" onClick={() => setOpen(false)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add New Event
            </Link>
          )}

          <Link to="/settings" className="usermenu__item" onClick={() => setOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Settings
          </Link>

          <button className="usermenu__item usermenu__item--danger" onClick={handleSignOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}