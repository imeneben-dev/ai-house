import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchFilterBar from "../components/Searchfilterbar";
import EventCard       from "../components/Eventcard";
import Footer          from "../components/Footer";
import { EVENTS, DEPARTMENTS } from "../data/mockData";
import "./Training.css";

const TYPES  = ["Workshop", "Seminar", "Competition"];
const TOPICS = [...new Set(EVENTS.map((e) => e.topic))];

export default function Training() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    type:       searchParams.get("type") || "",
    topic:      "",
    status:     "",
  });

  const onFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const results = useMemo(() => {
    return EVENTS.filter((e) => {
      const q = search.toLowerCase();
      if (q && !e.title.toLowerCase().includes(q) && !e.topic.toLowerCase().includes(q)) return false;
      if (filters.department && e.department !== filters.department) return false;
      if (filters.type       && e.type       !== filters.type)       return false;
      if (filters.topic      && e.topic      !== filters.topic)      return false;
      if (filters.status     && e.status     !== filters.status)     return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="page training-page">
      {/* Page header */}
      <div className="training-page__header">
        <div className="container">
          <span className="section-tag">Training Hub</span>
          <h1 className="training-page__title">All Events</h1>
          <p className="training-page__sub">
            Browse workshops, seminars, and competitions. Filter by department,
            type, or topic to find what suits you.
          </p>
        </div>
      </div>

      <div className="container training-page__body">
        {/* Search + filters */}
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          filters={filters}
          onFilter={onFilter}
          departments={DEPARTMENTS}
          types={TYPES}
          topics={TOPICS}
        />

        {/* Results count */}
        <div className="training-page__count">
          {results.length} event{results.length !== 1 ? "s" : ""} found
        </div>

        {/* Grid */}
        {results.length > 0 ? (
          <div className="training-page__grid">
            {results.map((e) => <EventCard key={e.id} {...e} />)}
          </div>
        ) : (
          <div className="training-page__empty">
            <span>🔍</span>
            <p>No events match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}