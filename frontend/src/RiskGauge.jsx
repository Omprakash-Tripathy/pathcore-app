const TIER_STYLES = {
  low: {
    text: "text-risk-low",
    tint: "bg-risk-low-tint",
    label: "APPROVE",
  },
  mid: {
    text: "text-risk-mid",
    tint: "bg-risk-mid-tint",
    label: "REVIEW",
  },
  high: {
    text: "text-risk-high",
    tint: "bg-risk-high-tint",
    label: "ESCALATE",
  },
};

function tierFor(score) {
  if (score <= 3) return "low";
  if (score <= 7) return "mid";
  return "high";
}

export default function RiskGauge({ score, recommendation, caption }) {
  const tier = tierFor(score);
  const styles = TIER_STYLES[tier];
  // Center the marker within the score's own slot on a 1-10 track.
  const markerPosition = ((score - 0.5) / 10) * 100;

  return (
    <div>
      {caption && (
        <div className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          {caption}
        </div>
      )}

      <div className="flex items-end justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-5xl font-medium ${styles.text}`}>
            {score}
          </span>
          <span className="font-mono text-lg text-muted">/ 10</span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${styles.tint} ${styles.text}`}
        >
          {recommendation || styles.label}
        </span>
      </div>

      <div className="relative pt-5">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full flex">
          <div className="h-full bg-risk-low" style={{ width: "30%" }} />
          <div className="h-full bg-risk-mid" style={{ width: "40%" }} />
          <div className="h-full bg-risk-high" style={{ width: "30%" }} />
        </div>
        <div
          className="absolute top-0"
          style={{ left: `${markerPosition}%`, transform: "translateX(-50%)" }}
        >
          <div
            className={`h-4 w-4 rounded-full bg-surface border-2 ${
              tier === "low"
                ? "border-risk-low"
                : tier === "mid"
                ? "border-risk-mid"
                : "border-risk-high"
            } shadow-sm`}
          />
        </div>
        <div className="flex justify-between mt-2 font-mono text-[11px] text-muted">
          <span>1 · approve</span>
          <span>4 · review</span>
          <span>8 · escalate</span>
        </div>
      </div>
    </div>
  );
}
