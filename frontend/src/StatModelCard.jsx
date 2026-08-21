export default function StatModelCard({ model }) {
  if (!model) return null;
  const pct = Math.round(model.probability * 100);

  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          Statistical cross-check
        </div>
        <span className="font-mono text-sm text-ink">{pct}%</span>
      </div>
      <p className="text-xs text-muted mb-3">
        Independent logistic regression estimate of elevated risk — can
        catch multivariate patterns the per-parameter rule engine misses.
      </p>

      <div className="h-2 w-full rounded-full bg-line overflow-hidden mb-3">
        <div
          className="h-full bg-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-1">
        {model.top_contributors.map((c) => (
          <li
            key={c.feature}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted">{c.feature}</span>
            <span
              className={`font-mono ${
                c.contribution >= 0 ? "text-risk-high" : "text-risk-low"
              }`}
            >
              {c.contribution >= 0 ? "+" : ""}
              {c.contribution.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
