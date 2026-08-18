const STATS = [
  { value: "4\u20135 \u2192 2\u20132.5", unit: "hrs/day", label: "Pathologist verification time" },
  { value: "2\u20133 \u2192 <1", unit: "%", label: "Inter-pathologist variance" },
  { value: "~150 \u2192 ~200", unit: "slides/day", label: "Per-pathologist throughput" },
  { value: "7.2", unit: "months", label: "Projected payback period" },
];

export default function StatBar() {
  return (
    <section className="border-y border-ink/[0.08] bg-panel">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="font-mono font-tabular text-xl md:text-2xl font-semibold text-ink">
              {s.value}
              <span className="text-ink-faint text-sm font-sans ml-1">
                {s.unit}
              </span>
            </div>
            <div className="text-xs md:text-sm text-ink-soft mt-1 leading-snug">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
