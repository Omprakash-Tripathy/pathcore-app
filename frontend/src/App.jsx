import { useState, useEffect } from "react";

// In local development this reads from .env (VITE_API_URL=http://localhost:5000).
// After deployment, this is set to the live Render backend URL as an
// environment variable in Vercel — see Part 9 of the build guide.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BIOMARKER_FIELDS = [
  { key: "hemoglobin", label: "Hemoglobin (g/dL)" },
  { key: "wbc", label: "WBC Count (x10^3/uL)" },
  { key: "platelets", label: "Platelet Count (x10^3/uL)" },
  { key: "glucose", label: "Fasting Glucose (mg/dL)" },
  { key: "creatinine", label: "Creatinine (mg/dL)" },
  { key: "alt", label: "ALT / SGPT (U/L)" },
];

const EMPTY_BIOMARKERS = Object.fromEntries(
  BIOMARKER_FIELDS.map((f) => [f.key, ""])
);

function RiskBadge({ score, recommendation }) {
  const tier =
    score <= 3 ? "low" : score <= 7 ? "mid" : "high";

  const styles = {
    low: "bg-green-100 text-green-800 border-green-300",
    mid: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${styles[tier]}`}>
      <div className="text-sm font-medium uppercase tracking-wide opacity-70">
        Risk Score
      </div>
      <div className="text-5xl font-bold my-2">{score} / 10</div>
      <div className="text-lg font-semibold">{recommendation}</div>
    </div>
  );
}

function BiomarkerTable({ findings }) {
  if (!findings || findings.length === 0) return null;
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-100 text-left">
          <th className="p-2 border border-slate-200">Parameter</th>
          <th className="p-2 border border-slate-200">Value</th>
          <th className="p-2 border border-slate-200">Reference Range</th>
          <th className="p-2 border border-slate-200">Status</th>
        </tr>
      </thead>
      <tbody>
        {findings.map((f) => (
          <tr
            key={f.parameter}
            className={f.status !== "normal" ? "bg-red-50" : ""}
          >
            <td className="p-2 border border-slate-200">{f.label}</td>
            <td className="p-2 border border-slate-200">
              {f.value} {f.unit}
            </td>
            <td className="p-2 border border-slate-200">
              {f.reference_low}-{f.reference_high} {f.unit}
            </td>
            <td className="p-2 border border-slate-200 capitalize font-medium">
              {f.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RuleTrace({ findings, nlpFlags }) {
  const traces = [
    ...findings.map((f) => f.rule_trace),
    ...nlpFlags.map((f) => f.rule_trace),
  ];
  if (traces.length === 0) return null;

  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-medium text-slate-700">
        Show rule trace (why this score) — {traces.length} rule
        {traces.length !== 1 ? "s" : ""} evaluated
      </summary>
      <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
        {traces.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </details>
  );
}

export default function App() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("F");
  const [biomarkers, setBiomarkers] = useState(EMPTY_BIOMARKERS);
  const [impressionText, setImpressionText] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleCases, setSampleCases] = useState([]);

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
  }

  function handleBiomarkerChange(key, value) {
    setBiomarkers((prev) => ({ ...prev, [key]: value }));
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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            PathCore — Report Accuracy &amp; Physiological Deviation Flagging
          </h1>
          <p className="text-slate-500 mt-1">
            Prototype clinical decision-support tool · Synthetic data only ·
            Advisory only — every report still requires pathologist sign-off.
          </p>
        </header>

        {/* Sample case buttons */}
        {sampleCases.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {sampleCases.map((c) => (
              <button
                key={c.id}
                onClick={() => loadSample(c)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                title={c.description}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input form */}
          <form
            onSubmit={handleAnalyze}
            className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sex
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {BIOMARKER_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {f.label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={biomarkers[f.key]}
                    onChange={(e) =>
                      handleBiomarkerChange(f.key, e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lab Impression (free text)
              </label>
              <textarea
                rows={4}
                value={impressionText}
                onChange={(e) => setImpressionText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="e.g. No evidence of malignancy. All parameters within normal limits."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Report"}
            </button>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}
          </form>

          {/* Results panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {!result && !loading && (
              <p className="text-slate-400 text-sm">
                Load a sample case above, or fill in the form, then click
                "Analyze Report" to see the risk score and draft report.
              </p>
            )}

            {loading && <p className="text-slate-500">Running analysis...</p>}

            {result && (
              <div className="space-y-4">
                <RiskBadge
                  score={result.risk_score}
                  recommendation={result.recommendation}
                />
                <p className="text-sm text-slate-600">
                  {result.recommendation_detail}
                </p>

                <BiomarkerTable findings={result.biomarker_findings} />

                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">
                    System-Generated Draft Report
                  </h3>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    {result.draft_report}
                  </p>
                </div>

                <RuleTrace
                  findings={result.biomarker_findings}
                  nlpFlags={result.nlp_flags}
                />

                <p className="text-xs text-slate-400 border-t pt-3">
                  {result.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
