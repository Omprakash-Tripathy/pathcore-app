import { useState, useEffect } from "react";
import RiskGauge from "./RiskGauge";
import StatModelCard from "./StatModelCard";
import BiomarkerRadarChart from "./BiomarkerRadarChart";
import NarrativeCard from "./NarrativeCard";
import BioBackdrop from "./BioBackdrop";
import { Microscope } from "./BioIllustrations";

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

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5";

function BiomarkerTable({ findings }) {
  if (!findings || findings.length === 0) return null;
  return (
    <div className="rounded-xl border border-line overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-3 font-semibold">Parameter</th>
            <th className="p-3 font-semibold">Value</th>
            <th className="p-3 font-semibold">Reference range</th>
            <th className="p-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr
              key={f.parameter}
              className={i !== findings.length - 1 ? "border-b border-line" : ""}
            >
              <td className="p-3 text-ink font-medium">{f.label}</td>
              <td className="p-3 font-mono text-ink">
                {f.value} {f.unit}
              </td>
              <td className="p-3 font-mono text-muted">
                {f.reference_low}–{f.reference_high} {f.unit}
              </td>
              <td className="p-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    f.status === "normal"
                      ? "bg-risk-low-tint text-risk-low"
                      : "bg-risk-high-tint text-risk-high"
                  }`}
                >
                  {f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RuleTrace({ findings, nlpFlags, modelTrace, multiParamNote }) {
  const traces = [
    ...findings.map((f) => f.rule_trace),
    ...nlpFlags.map((f) => f.rule_trace),
    ...(multiParamNote ? [multiParamNote] : []),
    ...(modelTrace ? [modelTrace] : []),
  ];
  if (traces.length === 0) return null;

  return (
    <details className="rounded-xl border border-line bg-paper p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        Show rule trace (why this score) — {traces.length} rule
        {traces.length !== 1 ? "s" : ""} evaluated
      </summary>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {traces.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-teal font-mono text-xs mt-0.5">→</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function TierLegend() {
  const tiers = [
    {
      label: "APPROVE",
      dotClass: "bg-risk-low",
      range: "1–3",
      desc: "Pre-validated draft, routed for fast pathologist sign-off.",
    },
    {
      label: "REVIEW",
      dotClass: "bg-risk-mid",
      range: "4–7",
      desc: "Standard pathologist review required before dispatch.",
    },
    {
      label: "ESCALATE",
      dotClass: "bg-risk-high",
      range: "8–10",
      desc: "High-priority — routed to senior pathologist immediately.",
    },
  ];
  return (
    <div className="min-w-0 bg-surface rounded-2xl border border-line p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-4">
        Understanding the tiers
      </h3>
      <div className="space-y-4">
        {tiers.map((t) => (
          <div key={t.label} className="flex gap-3">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${t.dotClass}`}
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-ink">
                  {t.label}
                </span>
                <span className="font-mono text-xs text-muted">
                  {t.range}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolApp() {
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

  function handleAgeChange(value) {
    setAge(value);
    setActiveSample(null);
  }

  function handleSexChange(value) {
    setSex(value);
    setActiveSample(null);
  }

  function handleImpressionChange(value) {
    setImpressionText(value);
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
    <div className="relative">
      <BioBackdrop className="opacity-40" fixed />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
          PathCore / Analysis tool
        </div>
        <h1 className="font-display text-3xl text-ink mb-2">
          Report accuracy &amp; physiological deviation flagging
        </h1>
        <p className="text-muted mb-8 max-w-2xl">
          Synthetic data only · advisory only — every report still requires
          pathologist sign-off.
        </p>

        {sampleCases.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {sampleCases.map((c) => (
              <button
                key={c.id}
                onClick={() => loadSample(c)}
                title={c.description}
                className={`hover-lift px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  activeSample === c.id
                    ? "bg-teal text-paper border-teal"
                    : "bg-surface border-line text-ink hover:border-teal"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* AI is the headline feature -- full-width, prominent, above the fold */}
        <div className="mb-6">
          <NarrativeCard age={age} sex={sex} result={result} caseId={activeSample} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0 space-y-6">
            <form
              onSubmit={handleAnalyze}
              className="min-w-0 bg-surface rounded-2xl border border-line p-6 space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => handleSexChange(e.target.value)}
                    className={inputClass}
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {BIOMARKER_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={biomarkers[f.key]}
                      onChange={(e) => handleBiomarkerChange(f.key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Lab impression (free text)</label>
                <textarea
                  rows={4}
                  value={impressionText}
                  onChange={(e) => handleImpressionChange(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. No evidence of malignancy. All parameters within normal limits."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="hover-lift glow-teal w-full bg-teal text-paper font-semibold py-3 rounded-lg hover:bg-teal-deep transition disabled:opacity-50"
              >
                {loading ? "Analyzing…" : "Analyze report"}
              </button>

              {error && (
                <p className="text-risk-high text-sm font-medium">{error}</p>
              )}
            </form>

            <TierLegend />
          </div>

          <div className="relative min-w-0 bg-surface rounded-2xl border border-line p-6 overflow-hidden">
            {!result && !loading && (
              <>
                <Microscope
                  className="hidden md:block absolute bottom-4 right-4 opacity-40"
                  size={180}
                />
                <p className="relative text-muted text-sm max-w-xs">
                  Load a sample case above, or fill in the form, then click
                  "Analyze report" to see the risk score and draft report.
                </p>
              </>
            )}

            {loading && <p className="text-muted text-sm">Running analysis…</p>}

            {result && (
              <div className="space-y-5">
                <RiskGauge
                  score={result.risk_score}
                  recommendation={result.recommendation}
                />
                <p className="text-sm text-muted">
                  {result.recommendation_detail}
                </p>

                <StatModelCard model={result.statistical_model} />

                <BiomarkerRadarChart findings={result.biomarker_findings} />

                <BiomarkerTable findings={result.biomarker_findings} />

                <div>
                  <h3 className="font-semibold text-ink mb-2 text-sm">
                    System-generated draft report
                  </h3>
                  <p className="text-sm text-muted bg-paper rounded-xl p-4 leading-relaxed">
                    {result.draft_report}
                  </p>
                </div>

                <RuleTrace
                  findings={result.biomarker_findings}
                  nlpFlags={result.nlp_flags}
                  modelTrace={result.statistical_model?.model_trace}
                  multiParamNote={result.multi_parameter_note}
                />

                <p className="text-xs text-muted border-t border-line pt-4">
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
