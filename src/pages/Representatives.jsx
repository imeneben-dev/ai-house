import { useState, useMemo, useEffect } from "react";
import SearchFilterBar from "../components/Searchfilterbar";
import RepCard         from "../components/Repcard";
import Footer          from "../components/Footer";
import { DEPARTMENTS } from "../data/mockData"; 
import "./Representatives.css";

export default function Representatives() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ department: "" });

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/representatives");
        const data = await response.json();

        setReps(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load representatives:", error);
        setLoading(false);
      }
    };

    fetchRepresentatives();
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
      </div>

      <Footer />
    </div>
  );
}