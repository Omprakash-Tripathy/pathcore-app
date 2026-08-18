const TIERS = {
  low: {
    label: "APPROVE",
    text: "text-success",
    bg: "bg-success-light",
    ring: "ring-success/20",
  },
  mid: {
    label: "REVIEW",
    text: "text-warn",
    bg: "bg-warn-light",
    ring: "ring-warn/20",
  },
  high: {
    label: "ESCALATE",
    text: "text-eosin-dark",
    bg: "bg-eosin-light",
    ring: "ring-eosin/20",
  },
};

export default function RiskBadge({ score, recommendation }) {
  const tierKey = score <= 3 ? "low" : score <= 7 ? "mid" : "high";
  const tier = TIERS[tierKey];

  return (
    <div className={`rounded-2xl ring-1 ${tier.ring} ${tier.bg} p-6`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Risk score
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-wide ${tier.text} bg-panel rounded-full px-2.5 py-1`}
        >
          {recommendation || tier.label}
        </span>
      </div>
      <div className={`font-display font-tabular font-semibold text-5xl mt-2 ${tier.text}`}>
        {score}
        <span className="text-ink-faint text-xl font-sans"> / 10</span>
      </div>
    </div>
  );
}
