import "./Searchfilterbar.css";

/**
 * SearchFilterBar props:
 *   search       – string
 *   onSearch     – fn(value)
 *   filters      – { department, type, topic, status }
 *   onFilter     – fn(key, value)
 *   showType     – bool (hide on Reps page)
 *   departments  – string[]
 *   types        – string[]
 *   topics       – string[]
 */
export default function SearchFilterBar({
  search, onSearch,
  filters, onFilter,
  showType = true,
  departments = [],
  types = [],
  topics = [],
}) {
  return (
    <div className="sfbar">
      {/* Search */}
      <div className="sfbar__search-wrap">
        <svg className="sfbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          className="sfbar__search"
          type="text"
          placeholder="Search by title or keyword…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button className="sfbar__clear" onClick={() => onSearch("")}>✕</button>
        )}
      </div>

      {/* Filters */}
      <div className="sfbar__filters">
        <select
          className="sfbar__select"
          value={filters.department}
          onChange={(e) => onFilter("department", e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {showType && (
          <select
            className="sfbar__select"
            value={filters.type}
            onChange={(e) => onFilter("type", e.target.value)}
          >
            <option value="">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        {showType && (
          <select
            className="sfbar__select"
            value={filters.topic}
            onChange={(e) => onFilter("topic", e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        {showType && (
          <select
            className="sfbar__select"
            value={filters.status}
            onChange={(e) => onFilter("status", e.target.value)}
          >
            <option value="">Upcoming & Past</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        )}
      </div>
    </div>
  );
}