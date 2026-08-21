import { useState } from "react";
import Nav from "./Nav";
import Landing from "./Landing";
import ToolApp from "./ToolApp";
import BatchUpload from "./BatchUpload";
import AuditTrail from "./AuditTrail";

export default function App() {
  const [view, setView] = useState("landing");

  function handleNavigate(next) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className="min-h-screen bg-paper">
      <Nav view={view} onNavigate={handleNavigate} />
      {view === "landing" && <Landing onLaunch={() => handleNavigate("app")} />}
      {view === "app" && <ToolApp />}
      {view === "batch" && <BatchUpload />}
      {view === "audit" && <AuditTrail />}
    </div>
  );
}
