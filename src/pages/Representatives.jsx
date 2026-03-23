import { useState, useMemo, useEffect } from "react";
import SearchFilterBar from "../components/Searchfilterbar";
import RepCard         from "../components/Repcard";
import Footer          from "../components/Footer";
// 1. We removed REPS from the mockData import because we are getting real data now!
import { DEPARTMENTS } from "../data/mockData"; 
import "./Representatives.css";

export default function Representatives() {
  // 2. We create states to hold the real data and a loading spinner
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ department: "" });

  // 3. Fetch the real representatives exactly ONCE when the page opens
  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/representatives");
        const data = await response.json();
        
        // Save the real people to our state!
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

  // 4. Update the search math to filter our real 'reps' array instead of the fake mock array!
  const results = useMemo(() => {
    return reps.filter((r) => {
      const q = search.toLowerCase();
      // Added safety check (r.focus || "") in case focus is accidentally missing
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