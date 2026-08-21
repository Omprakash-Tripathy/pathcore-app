import { useState } from "react";
import BatchBarChart from "./BatchBarChart";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TIER_TEXT = {
  APPROVE: "text-risk-low bg-risk-low-tint",
  REVIEW: "text-risk-mid bg-risk-mid-tint",
  ESCALATE: "text-risk-high bg-risk-high-tint",
};

function summarize(result) {
  const abnormal = result.biomarker_findings.filter((f) => f.status !== "normal");
  const activeNlp = result.nlp_flags.filter((f) => !f.negated);

  if (abnormal.length === 0 && activeNlp.length === 0) {
    return "All parameters within range.";
  }

  const parts = [];
  if (abnormal.length > 0) {
    const shown = abnormal.slice(0, 2).map((f) => `${f.label} ${f.status}`).join(", ");
    const extra = abnormal.length > 2 ? ` +${abnormal.length - 2} more` : "";
    parts.push(shown + extra);
  }
  if (activeNlp.length > 0) {
    parts.push(`flagged: ${activeNlp.map((f) => f.phrase).join(", ")}`);
  }
  return parts.join("; ");
}

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/batch-analyze`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Batch analysis failed.");
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong uploading the file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-deep">
        PathCore / Batch analysis
      </div>
      <h1 className="font-display text-3xl text-ink mb-2">
        Process a queue of reports at once
      </h1>
      <p className="text-muted mb-8 max-w-2xl">
        Upload a CSV of multiple patients and get back a worklist
        prioritized by risk score — the same pipeline as the single-report
        tool, run across an entire batch.
      </p>

      <form
        onSubmit={handleUpload}
        className="bg-surface rounded-2xl border border-line p-6 mb-8 flex flex-wrap items-center gap-4"
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-muted"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-ink text-white font-semibold px-5 py-2.5 text-sm hover:bg-teal-deep transition disabled:opacity-50"
        >
          {loading ? "Processing…" : "Upload and analyze"}
        </button>
        <a
          href={`${API_URL}/api/sample-batch.csv`}
          className="text-sm font-medium text-teal-deep hover:underline ml-auto"
        >
          Download a sample CSV
        </a>
      </form>

      {error && (
        <p className="text-risk-high text-sm font-medium mb-6">{error}</p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="text-xs text-muted mb-1">Total rows</div>
              <div className="font-display text-2xl text-ink">
                {data.summary.total}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-risk-low-tint p-4">
              <div className="text-xs text-risk-low mb-1">Approve</div>
              <div className="font-display text-2xl text-risk-low">
                {data.summary.approve_count}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-risk-mid-tint p-4">
              <div className="text-xs text-risk-mid mb-1">Review</div>
              <div className="font-display text-2xl text-risk-mid">
                {data.summary.review_count}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-risk-high-tint p-4">
              <div className="text-xs text-risk-high mb-1">Escalate</div>
              <div className="font-display text-2xl text-risk-high">
                {data.summary.escalate_count}
              </div>
            </div>
          </div>

          {data.row_errors?.length > 0 && (
            <p className="text-sm text-risk-high">
              {data.row_errors.length} row(s) could not be processed (check
              the CSV format).
            </p>
          )}

          <BatchBarChart results={data.results} />

          <div className="rounded-xl border border-line overflow-x-auto bg-surface">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Patient</th>
                  <th className="p-3 font-semibold">Risk score</th>
                  <th className="p-3 font-semibold">Tier</th>
                  <th className="p-3 font-semibold">Stat. model</th>
                  <th className="p-3 font-semibold">Draft summary</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r, i) => (
                  <tr
                    key={r.row}
                    className={
                      i !== data.results.length - 1
                        ? "border-b border-line align-top"
                        : "align-top"
                    }
                  >
                    <td className="p-3 font-mono text-muted">#{i + 1}</td>
                    <td className="p-3 text-ink">
                      {r.age} / {r.sex}
                    </td>
                    <td className="p-3 font-mono text-ink">
                      {r.risk_score}/10
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          TIER_TEXT[r.recommendation]
                        }`}
                      >
                        {r.recommendation}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-muted">
                      {Math.round(r.statistical_model.probability * 100)}%
                    </td>
                    <td className="p-3 text-muted max-w-xs">
                      {summarize(r)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
