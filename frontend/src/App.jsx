import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";

export default function App() {
  const [view, setView] = useState("landing");

  function navigate(next) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar view={view} onNavigate={navigate} />
      {view === "landing" ? (
        <LandingPage onLaunch={() => navigate("analyzer")} />
      ) : (
        <AnalyzerPage />
      )}
      <Footer />
    </div>
  );
}
