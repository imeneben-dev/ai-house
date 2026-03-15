import Hero          from "../components/Hero";
import StatsBar      from "../components/StatsBar";
import OfferSection  from "../components/Offersection";
import Partners      from "../components/Partners";
import Footer        from "../components/Footer";
import "./Home.css";

export default function Home() {
  return (
    <main className="home">
      <Hero />
      <StatsBar />
      <OfferSection />
      <Partners />
      <Footer />
    </main>
  );
}