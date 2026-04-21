import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEPARTMENTS } from "../data/mockData";
import aiHouseLogo from "../assets/ai_house_logo.svg";
import "./Auth.css";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
  fullName: "", email: "", department: "", password: "", role: "participant",
  title: "", focus: "", bio: ""
});
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.department || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          department: form.department,
          password: form.password,
          role: form.role,
          title: form.title,
          focus: form.focus,
          bio: form.bio
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.alertText + " " + data.fix);
      }

    } catch (err) {
      setError("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <img src={aiHouseLogo} alt="AI House Logo" className="auth-logo__img" 
          
          style={{ height: "68px", width: "auto", objectFit: "contain", display: "block" }}/>
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

          {form.role === "representative" ? (
            <>
              <div className="form-group">
                <label>Job Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Associate Professor" />
              </div>
              <div className="form-group">
                <label>AI Focus Area</label>
                <input name="focus" value={form.focus} onChange={handleChange} placeholder="e.g. Machine Learning" />
              </div>
              <div className="form-group form-group--full">
                <label>Short Bio</label>
                <textarea 
                  name="bio" 
                  value={form.bio} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder="Tell us about your background..." 
                  style={{ padding: "10px", borderRadius: "8px", border: "1.5px solid var(--border)", fontFamily: "inherit" }}
                />
              </div>
            </>
          ) : (
            <div className="form-group" />
          )}

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