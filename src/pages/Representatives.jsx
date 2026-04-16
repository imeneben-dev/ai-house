import { useState, useMemo, useEffect } from "react";
import SearchFilterBar from "../components/Searchfilterbar";
import RepCard         from "../components/Repcard";
import Footer          from "../components/Footer";
import { DEPARTMENTS } from "../data/mockData"; 
import "./Representatives.css";

export default function Representatives() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ department: "" });

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const [resReps, resAdmins] = await Promise.all([
          fetch("http://localhost:5000/api/representatives"),
          fetch("http://localhost:5000/api/admins") // Fetch the admins!
        ]);
        
        if (resReps.ok) setReps(await resReps.json());
        if (resAdmins.ok) setAdmins(await resAdmins.json());
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load network:", error);
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  const onFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const results = useMemo(() => {
    return reps.filter((r) => {
      const q = search.toLowerCase();
      if (q && !r.fullName.toLowerCase().includes(q) && !(r.focus || "").toLowerCase().includes(q)) return false;
      if (filters.department && r.department !== filters.department) return false;
      return true;
    });
  }, [search, filters, reps]);

  return (
    <div className="page reps-page">
      {/* Banner */}
      <div className="reps-page__header">
        <div className="container">
          <span className="section-tag">Human Network</span>
          <h1 className="reps-page__title">AI Representatives</h1>
          <p className="reps-page__sub">
            Faculty members leading the AI transition in their departments —
            trained, certified, and ready to mentor peers.
          </p>
        </div>
      </div>

      <div className="container reps-page__body">
        {/* Search */}
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          filters={filters}
          onFilter={onFilter}
          showType={false}
          departments={DEPARTMENTS}
        />

        {/* Count */}
        <div className="reps-page__count">
          {loading ? "Loading..." : `${results.length} representative${results.length !== 1 ? "s" : ""} found`}
        </div>

        {/* Grid & Empty States */}
        {loading ? (
           <div className="reps-page__empty">
             <p>Loading AI Representatives...</p>
           </div>
        ) : results.length > 0 ? (
          <div className="reps-page__grid">
            {/* 5. Map over the real results to draw the cards! */}
            {results.map((r) => <RepCard key={r.id} {...r} />)}
          </div>
        ) : (
          <div className="reps-page__empty">
            <span>🔍</span>
            <p>No representatives match your search.</p>
          </div>
        )}
        {!loading && admins.length > 0 && (
          <div style={{ marginTop: "5rem", paddingTop: "3rem", paddingBottom: "5rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span className="section-tag" style={{ color: "var(--blue)", background: "rgba(0,102,255,0.1)" }}>Support</span>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginTop: "0.5rem" }}>Platform Administrators</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "500px", margin: "0.5rem auto 0" }}>
                Having technical issues or need validation assistance? Contact a system administrator directly.
              </p>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
              {admins.map(admin => (
                <div key={admin._id || admin.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", width: "100%", maxWidth: "350px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                  {admin.profilePicture ? (
                    <img src={admin.profilePicture} alt={admin.fullName} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }} />
                  ) : (
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "800", flexShrink: 0 }}>
                      {admin.fullName.split(" ").map(n=>n[0]).join("")}
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{admin.fullName}</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0.5rem 0" }}>System Administrator</p>
                    <a href={`mailto:${admin.email}`} style={{ fontSize: "0.85rem", color: "var(--blue)", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      ✉️ {admin.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}