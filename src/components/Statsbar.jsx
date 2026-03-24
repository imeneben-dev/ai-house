import { useEffect, useRef, useState } from "react";
import "./StatsBar.css";



function StatCell({ num, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false; 

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {

        if (num === 0) return; 

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

const [dynamicStats, setDynamicStats] = useState([
    { num: 0, suffix: "+", label: "Events Held" },
    { num: 0, suffix: "",  label: "Departments Reached" },
    { num: 0, suffix: "+", label: "AI Representatives" },
    { num: 0, suffix: "+", label: "Participants Trained" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/stats");
        const data = await response.json();

        setDynamicStats([
          { num: data.events || 0,          suffix: "+", label: "Events Held" },
          { num: data.departments || 0,     suffix: "",  label: "Departments Reached" },
          { num: data.representatives || 0, suffix: "+", label: "AI Representatives" },
          { num: data.participants || 0,    suffix: "+", label: "Participants Trained" },
        ]);
      } catch (error) {
        console.error("Failed to load stats from database:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="stats">
      {dynamicStats.map((s) => <StatCell key={s.label} {...s} />)}
    </section>
  );
}