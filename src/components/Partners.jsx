import "./Partners.css";

const PARTNERS = [
  { name: "University of Blida 1", abbr: "UB1" },
  { name: "Rectorate",             abbr: "RECT" },
  { name: "Ministry of Education", abbr: "MEN" },
  { name: "Algerian AI Society",   abbr: "AAIS" },
  { name: "Tech Industry Partner", abbr: "TIP" },
  { name: "Academic Network",      abbr: "AN" },
];

export default function Partners() {
  return (
    <section className="partners">
      <div className="container">
        <div className="partners__header">
          <span className="section-tag">Partnership Grid</span>
          <h2 className="section-title">Our Partners</h2>
          <p className="section-sub">
            Working with institutions, government bodies, and industry leaders to
            accelerate AI education across Algeria.
          </p>
        </div>
        <div className="partners__grid">
          {PARTNERS.map((p) => (
            <div className="partners__card" key={p.name}>
              <div className="partners__logo">{p.abbr}</div>
              <span className="partners__name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}