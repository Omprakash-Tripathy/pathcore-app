const ROWS = [
  { label: "Hemoglobin", value: "7.9", unit: "g/dL", ref: "13.5–17.5", flagged: true },
  { label: "WBC Count", value: "18.4", unit: "×10³/µL", ref: "4.0–11.0", flagged: true },
  { label: "Platelets", value: "95", unit: "×10³/µL", ref: "150–450", flagged: true },
  { label: "Fasting Glucose", value: "112", unit: "mg/dL", ref: "70–125", flagged: false },
  { label: "Creatinine", value: "2.1", unit: "mg/dL", ref: "0.7–1.3", flagged: true },
];

const NOTES = [
  {
    row: 0,
    tag: "Rule H-04",
    text: "43% below age/sex-adjusted floor. Severity: critical.",
  },
  {
    row: 2,
    tag: "Rule H-11 + NLP-03",
    text: "\u201cBlast cells noted\u201d matched a critical-phrase; no negation detected.",
  },
];

export default function ReportVisual() {
  return (
    <div className="relative">
      <div className="grid md:grid-cols-[1fr_15rem] gap-4 md:gap-3">
        {/* Report card */}
        <div className="rounded-2xl border border-ink/10 bg-panel shadow-[0_1px_0_rgba(16,21,31,0.04)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-ink/[0.06] bg-paper-dim/60">
            <span className="text-xs font-medium tracking-wide uppercase text-ink-faint">
              Case 03 &middot; 61M
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-eosin-dark bg-eosin-light rounded-full px-2.5 py-1">
              Escalate
            </span>
          </div>
          <div className="divide-y divide-ink/[0.06] font-mono text-sm">
            {ROWS.map((r, i) => (
              <div
                key={r.label}
                className={`flex items-center justify-between px-5 py-2.5 ${
                  r.flagged ? "bg-eosin-light/50" : ""
                }`}
              >
                <span className="text-ink-soft font-sans">{r.label}</span>
                <span className="flex items-baseline gap-2 font-tabular">
                  <span
                    className={
                      r.flagged ? "text-eosin-dark font-semibold" : "text-ink"
                    }
                  >
                    {r.value}
                  </span>
                  <span className="text-ink-faint text-xs">{r.unit}</span>
                  <span className="text-ink-faint text-xs hidden sm:inline">
                    ref {r.ref}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-ink/[0.06] flex items-center justify-between">
            <span className="text-xs text-ink-faint">Risk score</span>
            <span className="font-display font-semibold text-2xl text-hema">
              9<span className="text-ink-faint text-base font-sans"> / 10</span>
            </span>
          </div>
        </div>

        {/* Margin notes — desktop only, hand-drawn-feel connectors */}
        <div className="hidden md:flex flex-col gap-3 pt-14">
          {NOTES.map((n) => (
            <div key={n.tag} className="relative pl-4">
              <span
                className="absolute left-0 top-1.5 h-px w-3 bg-hema-line"
                aria-hidden="true"
              />
              <div className="text-[11px] font-mono font-semibold text-hema tracking-wide">
                {n.tag}
              </div>
              <p className="text-xs text-ink-soft leading-snug mt-0.5">
                {n.text}
              </p>
            </div>
          ))}
          <div className="pl-4 mt-1">
            <p className="text-[11px] text-ink-faint leading-snug">
              Every flag traces to a named rule or phrase &mdash; nothing
              is a black box.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile notes, inline */}
      <div className="md:hidden mt-3 space-y-2">
        {NOTES.map((n) => (
          <div
            key={n.tag}
            className="text-xs bg-hema-light rounded-lg px-3 py-2 text-hema-dark"
          >
            <span className="font-mono font-semibold">{n.tag}</span> &mdash;{" "}
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
