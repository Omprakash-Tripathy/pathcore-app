import { useState, useEffect } from "react";
import RiskBadge from "../components/RiskBadge";
import BiomarkerTable from "../components/BiomarkerTable";
import RuleTrace from "../components/RuleTrace";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BIOMARKER_FIELDS = [
  { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL" },
  { key: "wbc", label: "WBC Count", unit: "×10³/µL" },
  { key: "platelets", label: "Platelet Count", unit: "×10³/µL" },
  { key: "glucose", label: "Fasting Glucose", unit: "mg/dL" },
  { key: "creatinine", label: "Creatinine", unit: "mg/dL" },
  { key: "alt", label: "ALT / SGPT", unit: "U/L" },
];

const EMPTY_BIOMARKERS = Object.fromEntries(
  BIOMARKER_FIELDS.map((f) => [f.key, ""])
);

export default function AnalyzerPage() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("F");
  const [biomarkers, setBiomarkers] = useState(EMPTY_BIOMARKERS);
  const [impressionText, setImpressionText] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleCases, setSampleCases] = useState([]);
  const [activeSample, setActiveSample] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/sample-cases`)
      .then((res) => res.json())
      .then((data) => setSampleCases(data.cases || []))
      .catch(() => setError("Could not reach the backend API. Is it running?"));
  }, []);

  function loadSample(sampleCase) {
    setAge(String(sampleCase.input.age));
    setSex(sampleCase.input.sex);
    setBiomarkers({ ...EMPTY_BIOMARKERS, ...sampleCase.input.biomarkers });
    setImpressionText(sampleCase.input.impression_text);
    setResult(null);
    setError(null);
    setActiveSample(sampleCase.id);
  }

  function handleBiomarkerChange(key, value) {
    setBiomarkers((prev) => ({ ...prev, [key]: value }));
    setActiveSample(null);
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(age),
          sex,
          biomarkers,
          impression_text: impressionText,
        }),
      });
      if (!res.ok) throw new Error("Backend returned an error.");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong calling the API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-ink tracking-tight">
          Analyze a report
        </h1>
        <p className="text-ink-soft mt-2 leading-relaxed">
          Load a sample case, or enter synthetic values yourself, then
          run the analysis to see the risk score, findings, and full
          rule trace.
        </p>
      </header>

      {sampleCases.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2.5">
          {sampleCases.map((c) => (
            <button
              key={c.id}
              onClick={() => loadSample(c)}
              title={c.description}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                activeSample === c.id
                  ? "bg-ink text-paper border-ink"
                  : "bg-panel border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input form */}
        <form
          onSubmit={handleAnalyze}
          className="bg-panel rounded-2xl border border-ink/10 p-6 space-y-5 h-fit"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
                Age
              </label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setActiveSample(null);
                }}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 font-mono bg-paper focus:bg-panel transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => {
                  setSex(e.target.value);
                  setActiveSample(null);
                }}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 bg-paper focus:bg-panel transition-colors"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BIOMARKER_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
                  {f.label}
                  <span className="normal-case font-normal text-ink-faint/70">
                    {" "}
                    &middot; {f.unit}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={biomarkers[f.key]}
                  onChange={(e) =>
                    handleBiomarkerChange(f.key, e.target.value)
                  }
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 font-mono bg-paper focus:bg-panel transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint mb-1.5">
              Lab impression (free text)
            </label>
            <textarea
              rows={4}
              value={impressionText}
              onChange={(e) => {
                setImpressionText(e.target.value);
                setActiveSample(null);
              }}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 bg-paper focus:bg-panel transition-colors"
              placeholder="e.g. No evidence of malignancy. All parameters within normal limits."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-semibold py-3 rounded-lg hover:bg-hema-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing\u2026" : "Analyze report"}
          </button>

          {error && (
            <p className="text-eosin-dark text-sm font-medium">{error}</p>
          )}
        </form>

        {/* Results panel */}
        <div className="bg-panel rounded-2xl border border-ink/10 p-6">
          {!result && !loading && (
            <div className="h-full flex items-center justify-center text-center py-16">
              <p className="text-ink-faint text-sm max-w-xs">
                Load a sample case above, or fill in the form, then run
                the analysis to see results here.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center py-16">
              <p className="text-ink-soft text-sm">Running analysis&hellip;</p>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              <RiskBadge
                score={result.risk_score}
                recommendation={result.recommendation}
              />
              <p className="text-sm text-ink-soft leading-relaxed">
                {result.recommendation_detail}
              </p>

              <BiomarkerTable findings={result.biomarker_findings} />

              <div>
                <h3 className="font-semibold text-ink text-sm mb-1.5">
                  System-generated draft report
                </h3>
                <p className="text-sm text-ink-soft bg-paper-dim rounded-lg p-4 leading-relaxed">
                  {result.draft_report}
                </p>
              </div>

              <RuleTrace
                findings={result.biomarker_findings}
                nlpFlags={result.nlp_flags}
              />

              <p className="text-xs text-ink-faint border-t border-ink/10 pt-4 leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
