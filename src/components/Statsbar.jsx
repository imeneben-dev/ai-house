import { useEffect, useRef, useState } from "react";
import "./StatsBar.css";

const STATS = [
  { num: 24,  suffix: "+", label: "Events Held"           },
  { num: 8,   suffix: "",  label: "Departments Reached"   },
  { num: 35,  suffix: "+", label: "AI Representatives"    },
  { num: 400, suffix: "+", label: "Participants Trained"  },
];

function StatCell({ num, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1400, t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * num));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [num]);

  return (
    <div className="stats__cell" ref={ref}>
      <span className="stats__num">{count}{suffix}</span>
      <span className="stats__label">{label}</span>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="stats">
      {STATS.map((s) => <StatCell key={s.label} {...s} />)}
    </section>
  );
}