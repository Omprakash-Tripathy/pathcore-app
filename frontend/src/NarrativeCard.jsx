import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NarrativeCard({ age, sex, result, caseId }) {
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("clinical");

  useEffect(() => {
    setNarrative(null);
    setError(null);
  }, [caseId, result]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setNarrative(null);
    try {
      const res = await fetch(`${API_URL}/api/narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          age: Number(age),
          sex,
          biomarker_findings: result.biomarker_findings,
          nlp_flags: result.nlp_flags,
          risk_score: result.risk_score,
          recommendation: result.recommendation,
          statistical_model: result.statistical_model,
        }),
      });
      const data = await res.json();
      if (!data.available) {
        setError(data.error || "AI narrative is not available right now.");
      } else {
        setNarrative(data);
      }
    } catch (err) {
      setError(err.message || "Could not reach the narrative service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-ai/30 bg-gradient-to-br from-ai-tint via-surface to-surface p-6 md:p-8 glow-ai">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-ai animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-ai">
              Powered by Claude
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-2">
            AI-generated clinical narrative
          </h2>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            Claude turns the findings below into a polished, pathologist-ready
            narrative and a plain-language patient summary — a communication
            layer only. The risk score and every finding come entirely from
            the deterministic rule engine and statistical model above, never
            from this text.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {!result && (
            <div className="text-center md:text-right">
              <button
                disabled
                className="w-full md:w-auto rounded-xl bg-surface-raised text-muted font-semibold px-8 py-4 text-base border border-line cursor-not-allowed"
              >
                Generate narrative
              </button>
              <p className="text-xs text-muted mt-2">
                Analyze a report first to unlock this
              </p>
            </div>
          )}

          {result && caseId && !narrative && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="hover-lift w-full md:w-auto rounded-xl bg-ai text-paper font-bold px-8 py-4 text-base hover:bg-ai-deep transition disabled:opacity-60 pulse-ai"
            >
              {loading ? "Generating…" : "Generate narrative →"}
            </button>
          )}

          {result && !caseId && (
            <div className="text-center md:text-right max-w-xs">
              <button
                disabled
                className="w-full md:w-auto rounded-xl bg-surface-raised text-muted font-semibold px-8 py-4 text-base border border-line cursor-not-allowed"
              >
                Generate narrative
              </button>
              <p className="text-xs text-muted mt-2">
                Preview available for the 3 sample cases only — custom values
                aren't covered
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-5 text-sm text-risk-high bg-risk-high-tint rounded-xl p-4">
          {error}
        </p>
      )}

      {narrative && (
        <div className="mt-6 pt-6 border-t border-ai/20">
          {narrative.preview && (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ai bg-ai-tint border border-ai/30 rounded-full px-3 py-1 mb-4">
              Illustrative preview — not a live API call
            </div>
          )}

          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setTab("clinical")}
              className={`hover-lift px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === "clinical"
                  ? "bg-ai text-paper"
                  : "text-muted bg-surface-raised"
              }`}
            >
              Clinical narrative
            </button>
            <button
              onClick={() => setTab("patient")}
              className={`hover-lift px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === "patient"
                  ? "bg-ai text-paper"
                  : "text-muted bg-surface-raised"
              }`}
            >
              Patient-friendly summary
            </button>
          </div>
          <p className="text-base text-ink leading-relaxed bg-surface-raised rounded-xl p-5">
            {tab === "clinical" ? narrative.clinical_narrative : narrative.patient_summary}
          </p>
          <p className="text-xs text-muted mt-3">
            {narrative.model}. {narrative.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}
