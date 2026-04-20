import "./Partners.css";

const PARTNERS = [
  { name: "University of Blida 1", logo: new URL("../assets/images/saad_dahleb_uni_partner.svg", import.meta.url).href },
  { name: "Google",                logo: new URL("../assets/images/google_partner.svg",      import.meta.url).href },
  { name: "NVIDIA",                logo: new URL("../assets/images/nvidia_partner.svg",      import.meta.url).href },
  { name: "Ooredoo",               logo: new URL("../assets/images/Ooredoo.svg",     import.meta.url).href },
  { name: "Algeria Venture",       logo: new URL("../assets/images/algeria_venture.svg", import.meta.url).href },
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
              <div className="partners__logo-wrap">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="partners__logo-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="partners__logo-fallback" style={{ display: "none" }}>
                  {p.name.charAt(0)}
                </div>
              </div>
              <span className="partners__name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}