import OfferCard from "./Offercard";
import "./Offersection.css";

const OFFERS = [
  {
    icon: "🖥️",
    type: "Workshop",
    title: "Hands-On Training Sessions",
    desc: "Practical, instructor-led workshops covering Python, data science, automation, and more — designed for faculty and students.",
    linkTo: "/training?type=Workshop",
  },
  {
    icon: "🎓",
    type: "Seminar",
    title: "Expert Talks & Presentations",
    desc: "Knowledge-sharing seminars featuring AI experts, researchers, and industry guests from across Algeria and beyond.",
    linkTo: "/training?type=Seminar",
  },
  {
    icon: "🏆",
    type: "Competition",
    title: "AI Challenges & Hackathons",
    desc: "Team-based competitions where students tackle real-world AI problems, with prizes and recognition for top solutions.",
    linkTo: "/training?type=Competition",
  },
];

export default function OfferSection() {
  return (
    <section className="offer-section">
      <div className="container">
        <div className="offer-section__header">
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">Everything You Need to Learn AI</h2>
          <p className="section-sub">
            From beginner workshops to advanced competitions — the AI House
            covers the full spectrum of AI education for the University of Blida 1.
          </p>
        </div>
        <div className="offer-section__grid">
          {OFFERS.map((o) => <OfferCard key={o.type} {...o} />)}
        </div>
      </div>
    </section>
  );
}