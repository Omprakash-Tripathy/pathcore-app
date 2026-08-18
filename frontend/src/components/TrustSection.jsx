const POINTS = [
  {
    title: "Advisory only, always",
    body: "PathCore never auto-approves a report. Every output requires mandatory pathologist sign-off, matching NMC requirements \u2014 the system routes attention, it doesn\u2019t make the call.",
  },
  {
    title: "Synthetic data only",
    body: "No real patient data is used at any point in this demo. Reference ranges are simplified, illustrative values for the prototype, not sourced from Tietz or a validated internal range.",
  },
  {
    title: "A lexicon, not a language model",
    body: "The NLP layer is a curated critical-phrase lexicon with negation handling \u2014 chosen deliberately over an opaque model so every flag stays traceable.",
  },
  {
    title: "Demo hosting, not production",
    body: "Current hosting on Vercel + Railway is public demo-only. Production would require migration to on-premise or private cloud infrastructure within India before any real patient data is processed, per the DPDP Act 2023 positioning in the strategy deck.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-xl mb-10">
        <span className="text-xs font-semibold tracking-wide uppercase text-hema">
          Trust &amp; limits
        </span>
        <h2 className="font-display font-semibold text-3xl text-ink mt-2">
          What this prototype is &mdash; and isn&rsquo;t
        </h2>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Being upfront about limitations is part of the audit trail,
          not a footnote to it.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-ink/10 bg-panel p-6"
          >
            <h3 className="font-semibold text-ink text-[15px] mb-1.5">
              {p.title}
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
