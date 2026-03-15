import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEPARTMENTS } from "../data/mockData";
import "./Auth.css";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const [form,  setForm]  = useState({
    fullName: "", email: "", department: "", password: "", confirmPassword: "", role: "participant",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.department || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    signUp(form);
    navigate("/");
  };

  return (
    <div className="page auth-page">
      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
              <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="2.5" fill="#fff"/>
            </svg>
          </div>
          AI House · Blida 1
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join the AI House community at the University of Blida 1.</p>

        {/* Role selector */}
        <div className="auth-roles">
          {["participant", "representative"].map((role) => (
            <label
              key={role}
              className={"auth-role" + (form.role === role ? " auth-role--active" : "")}
            >
              <input
                type="radio"
                name="role"
                value={role}
                checked={form.role === role}
                onChange={handleChange}
                style={{ display: "none" }}
              />
              <span className="auth-role__icon">{role === "participant" ? "🎓" : "🤝"}</span>
              <span className="auth-role__label">
                {role === "participant" ? "Participant" : "AI Representative"}
              </span>
              <span className="auth-role__desc">
                {role === "participant"
                  ? "I want to attend workshops and events"
                  : "I'm a faculty member leading AI in my department"}
              </span>
            </label>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Dr. Amira Benali" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Department *</label>
            <select name="department" value={form.department} onChange={handleChange}>
              <option value="">Select your department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" />
          <div className="form-group">
            <label>Password *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
          </div>
          <div className="form-group form-group--full">
            <button type="submit" className="btn-primary auth-submit">
              Create Account
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}