function StepCard({ index, title, description, chips }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-panel p-6">
      <div className="font-mono text-xs text-hema mb-4">{index}</div>
      <h3 className="font-display font-semibold text-lg text-ink mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-soft leading-relaxed">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c}
            className="text-xs font-mono text-ink-soft bg-paper-dim rounded-md px-2 py-1"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold tracking-wide uppercase text-hema">
          How it works
        </span>
        <h2 className="font-display font-semibold text-3xl text-ink mt-2">
          Two explainable components, one auditable score
        </h2>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Both halves are deliberately rule-based rather than opaque
          models &mdash; the most auditable path through CDSCO&rsquo;s
          Class C SaMD review, and the reason every flag can be traced
          back to a specific line of logic.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <StepCard
          index="01 — Rule engine"
          title="Demographic biomarker scoring"
          description="Each of six biomarkers is classified normal, low, or high against age- and sex-adjusted reference ranges, with percentage deviation quantified for every value."
          chips={["Hemoglobin", "WBC", "Platelets", "Glucose", "Creatinine", "ALT / SGPT"]}
        />
        <StepCard
          index="02 — NLP classifier"
          title="Critical-phrase impression scan"
          description={`A curated lexicon scans free-text lab impressions for clinically concerning phrases, with negation detection so a phrase like \u201cno evidence of malignancy\u201d is correctly ignored.`}
          chips={["Curated lexicon", "Negation-aware", "On-premise deployable"]}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-hema-line bg-hema-light p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="font-display font-semibold text-hema text-sm shrink-0">
          Combined into
        </div>
        <p className="text-sm text-hema-dark leading-relaxed">
          A single 1&ndash;10 risk score and routing recommendation
          &mdash; APPROVE, REVIEW, or ESCALATE &mdash; alongside a
          per-biomarker findings table, flagged phrases, a draft report,
          and an expandable rule trace for every score.
        </p>
      </div>
    </section>
  );
}
