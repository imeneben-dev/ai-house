import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const [form,  setForm]  = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!form.email || !form.password) { 
      setError("Please fill in all fields."); 
      return; 
    }
    
    setLoading(true);
    
    try {
      // 1. Ask the real database if the user exists
      const response = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        // 2. Database said yes! Put the user in the backpack.
        signIn(data.user, data.token);
        
        // 3. MAGIC ROUTING: Send Admins to the dashboard, and everyone else Home!
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        // Database said no (wrong password, etc.)
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
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

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo hint */}
        <div className="auth-demo">
          <strong>Demo credentials:</strong><br />
          Rep1: abdou.test@univ-blida.dz<br />
          Rep2: abde.test@univ-blida.dz<br />
          Participant: abdellah.test@univ-blida.dz<br />
          Admin: admin@univ-blida.dz<br />
          Password : SecurePassword123!
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}