const FEATURES = [
  {
    title: "1–10 risk score",
    description:
      "A single number built from every biomarker deviation and flagged phrase, so severity is comparable across cases at a glance.",
  },
  {
    title: "Routing recommendation",
    description:
      "APPROVE, REVIEW, or ESCALATE \u2014 a clear next action, never a final decision.",
  },
  {
    title: "Per-biomarker findings",
    description:
      "Reference ranges and deviation percentage for all six biomarkers, with abnormal rows visually distinct.",
  },
  {
    title: "Flagged impression phrases",
    description:
      "Every critical phrase the NLP layer caught, shown with its negation status so false positives are obvious.",
  },
  {
    title: "Auto-generated draft report",
    description:
      "A starting point for the pathologist to review and edit, not a report that goes out untouched.",
  },
  {
    title: "Expandable rule trace",
    description:
      "Every rule or phrase that contributed to the score, in plain language \u2014 the proof that nothing here is a black box.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="bg-panel border-y border-ink/[0.08]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-xl mb-10">
          <span className="text-xs font-semibold tracking-wide uppercase text-hema">
            What you get
          </span>
          <h2 className="font-display font-semibold text-3xl text-ink mt-2">
            Every analysis, six things back
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="flex gap-4">
              <span className="font-mono text-xs text-ink-faint pt-1 shrink-0 w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold text-ink text-[15px]">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed mt-1">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
