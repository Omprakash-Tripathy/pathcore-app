import { useState, useEffect } from "react";
import AuditCharts from "./AuditCharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TIER_TEXT = {
  APPROVE: "text-risk-low bg-risk-low-tint",
  REVIEW: "text-risk-mid bg-risk-mid-tint",
  ESCALATE: "text-risk-high bg-risk-high-tint",
};

const TIERS = ["ALL", "APPROVE", "REVIEW", "ESCALATE"];

function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AuditTrail() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tier, setTier] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const query = tier === "ALL" ? "" : `&tier=${tier}`;
    Promise.all([
      fetch(`${API_URL}/api/history?limit=50${query}`).then((r) => r.json()),
      fetch(`${API_URL}/api/history/summary`).then((r) => r.json()),
    ])
      .then(([historyData, summaryData]) => {
        setEntries(historyData.analyses || []);
        setSummary(summaryData);
      })
      .catch(() => setError("Could not reach the backend API. Is it running?"))
      .finally(() => setLoading(false));
  }, [tier]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-deep">
        PathCore / Audit trail
      </div>
      <h1 className="font-display text-3xl text-ink mb-2">
        A durable record of every analysis
      </h1>
      <p className="text-muted mb-8 max-w-2xl">
        Every report run through PathCore — single or batch — is saved with
        a timestamp, independent of any one browser session. This is what
        "auditable" means in practice.
      </p>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted mb-1">Total analyses</div>
            <div className="font-display text-2xl text-ink">
              {summary.total}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-risk-low-tint p-4">
            <div className="text-xs text-risk-low mb-1">Approve</div>
            <div className="font-display text-2xl text-risk-low">
              {summary.approve_count}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-risk-mid-tint p-4">
            <div className="text-xs text-risk-mid mb-1">Review</div>
            <div className="font-display text-2xl text-risk-mid">
              {summary.review_count}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-risk-high-tint p-4">
            <div className="text-xs text-risk-high mb-1">Escalate</div>
            <div className="font-display text-2xl text-risk-high">
              {summary.escalate_count}
            </div>
          </div>
        </div>
      )}

      <AuditCharts summary={summary} entries={entries} />

      <div className="flex gap-2 mb-4">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              tier === t
                ? "bg-ink text-white border-ink"
                : "bg-surface border-line text-muted hover:border-teal"
            }`}
          >
            {t === "ALL" ? "All" : t}
          </button>
        ))}
      </div>

      {error && <p className="text-risk-high text-sm font-medium">{error}</p>}
      {loading && <p className="text-muted text-sm">Loading…</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="text-muted text-sm">
          No analyses yet — run one from the tool or a batch upload, then
          come back here.
        </p>
      )}

      {!loading && entries.length > 0 && (
        <div className="rounded-xl border border-line overflow-x-auto bg-surface">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Source</th>
                <th className="p-3 font-semibold">Patient</th>
                <th className="p-3 font-semibold">Risk score</th>
                <th className="p-3 font-semibold">Tier</th>
                <th className="p-3 font-semibold">Stat. model</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e.id}
                  className={
                    i !== entries.length - 1 ? "border-b border-line" : ""
                  }
                >
                  <td className="p-3 font-mono text-xs text-muted">
                    {formatTimestamp(e.created_at)}
                  </td>
                  <td className="p-3 text-muted capitalize">{e.source}</td>
                  <td className="p-3 text-ink">
                    {e.age} / {e.sex}
                  </td>
                  <td className="p-3 font-mono text-ink">
                    {e.risk_score}/10
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        TIER_TEXT[e.recommendation]
                      }`}
                    >
                      {e.recommendation}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-muted">
                    {Math.round((e.ml_probability || 0) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
