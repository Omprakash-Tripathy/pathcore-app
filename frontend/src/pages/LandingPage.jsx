import Hero from "../components/Hero";
import StatBar from "../components/StatBar";
import HowItWorks from "../components/HowItWorks";
import FeatureGrid from "../components/FeatureGrid";
import TrustSection from "../components/TrustSection";
import AboutSection from "../components/AboutSection";
import CtaBand from "../components/CtaBand";

export default function LandingPage({ onLaunch }) {
  return (
    <main>
      <Hero onLaunch={onLaunch} />
      <StatBar />
      <HowItWorks />
      <FeatureGrid />
      <TrustSection />
      <AboutSection />
      <CtaBand onLaunch={onLaunch} />
    </main>
  );
}
