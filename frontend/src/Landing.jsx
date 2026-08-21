import RiskGauge from "./RiskGauge";
import BioBackdrop from "./BioBackdrop";
import { BigRBC, BigPathogen, RxSymbol, Microscope } from "./BioIllustrations";

const STATS = [
  {
    value: "4–5 hrs",
    label: "lost per pathologist, per day, to manual first-pass verification",
  },
  {
    value: "2–3%",
    label: "inter-pathologist variance across otherwise similar reports",
  },
  {
    value: "500,000+",
    label: "complex tests run through this workflow across the network each year",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Enter the report",
    body: "Patient age and sex, six core biomarkers, and the pathologist's free-text lab impression — the same inputs already sitting in every report today.",
  },
  {
    n: "02",
    title: "Dual-engine analysis",
    body: "A demographically-stratified rule engine checks each biomarker against age/sex-adjusted ranges, while a local NLP layer scans the impression text for concerning phrases — correctly ignoring negated ones.",
  },
  {
    n: "03",
    title: "AI-generated narrative",
    body: "Claude turns the structured findings into a polished clinical report and a plain-language patient summary — communication only, never the decision-maker.",
    ai: true,
  },
  {
    n: "04",
    title: "An explainable score",
    body: "Everything combines into a single 1–10 risk score and a routing tier. Every point on that score traces back to a specific rule, phrase, or model weight.",
  },
];

export default function Landing({ onLaunch }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <BioBackdrop className="opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/80 to-paper" />
        <BigPathogen
          className="hidden lg:block absolute -top-16 -right-16 opacity-70"
          size={300}
        />
        <BigRBC
          className="hidden lg:block absolute -bottom-24 -left-20 opacity-70"
          size={340}
        />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal mb-4">
              Dr. Lal PathLabs · AI-powered clinical decision-support
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-ink mb-5">
              A second pair of eyes for every{" "}
              <span className="italic text-teal">pathology report.</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed mb-8 max-w-lg">
              PathCore checks every report's biomarkers and lab impression
              against physiological norms the moment it's drafted — flagging
              what deserves a closer look, cross-checking with a statistical
              model, and writing the narrative with Claude, before a
              pathologist ever signs off.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={onLaunch}
                className="hover-lift glow-teal rounded-lg bg-teal text-ink font-semibold px-6 py-3 hover:bg-teal-deep transition"
              >
                Launch the tool
              </button>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-ink hover:text-teal transition"
              >
                See how it works ↓
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Advisory only", "Synthetic data", "Explainable by design"].map(
                (t) => (
                  <span
                    key={t}
                    className="text-xs font-medium text-muted border border-line rounded-full px-3 py-1 bg-surface/60"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="relative">
            <div className="hover-lift rounded-2xl border border-line bg-surface p-6 glow-teal">
              <div className="text-xs font-medium uppercase tracking-wide text-muted mb-4">
                Example output · critical case
              </div>
              <RiskGauge score={8} recommendation="ESCALATE" />
              <div className="mt-5 pt-5 border-t border-line space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Hemoglobin</span>
                  <span className="font-mono text-risk-high">
                    7.9 g/dL — low
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Impression flag</span>
                  <span className="font-mono text-risk-high">
                    "suspicious for malignancy"
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-xl border border-ai/40 bg-ai-tint px-4 py-2 text-xs font-semibold text-ai glow-ai hidden sm:block">
              + AI narrative by Claude
            </div>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="border-y border-line bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
          <div className="grid sm:grid-cols-3 gap-8">
            {STATS.map((s) => (
              <div key={s.value} className="hover-lift rounded-xl p-4 -m-4">
                <div className="font-display text-4xl text-teal mb-2">
                  {s.value}
                </div>
                <p className="text-sm text-muted leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-8">
            Figures from the strategy analysis accompanying this prototype —
            illustrative of the pain point, not this deployment's live
            metrics.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative overflow-hidden max-w-6xl mx-auto px-4 md:px-6 py-20">
        <RxSymbol
          className="hidden xl:block absolute top-16 -right-28 opacity-[0.09] text-teal"
          size={240}
        />
        <h2 className="font-display text-3xl text-ink mb-3">How it works</h2>
        <p className="text-muted max-w-xl mb-12">
          Four steps, all of them visible to the pathologist — nothing
          happens off-screen.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`hover-lift rounded-2xl border p-5 ${
                s.ai
                  ? "border-ai/40 bg-ai-tint glow-ai"
                  : "border-line bg-surface/60"
              }`}
            >
              <div
                className={`font-mono text-sm mb-3 ${
                  s.ai ? "text-ai" : "text-teal"
                }`}
              >
                {s.n}
              </div>
              <h3 className="font-display text-xl text-ink mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative bg-surface/40 border-y border-line overflow-hidden">
        <BioBackdrop className="opacity-30" />
        <Microscope
          className="hidden lg:block absolute top-10 -right-8 opacity-60"
          size={220}
        />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl text-ink mb-4">
              About this prototype
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              PathCore was built as the working proof-of-concept for a
              Digital Transformation and Artificial Intelligence capstone at
              IIM Lucknow — the priority AI use case identified in an AI
              transformation strategy prepared for Dr. Lal PathLabs.
            </p>
            <p className="text-muted leading-relaxed">
              It's deliberately built as a rule engine plus a local NLP layer
              and statistical cross-check, rather than a single opaque
              model, so every flag it raises can be traced back to a
              specific reference range, phrase, or weight — the design
              choice a regulated, human-reviewed clinical workflow calls
              for. Claude only enters at the very end, to write up findings
              that are already fully decided.
            </p>
          </div>
          <div className="hover-lift rounded-2xl border border-line bg-paper p-6">
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Built for</dt>
                <dd className="text-ink font-medium text-right">
                  Dr. Lal PathLabs
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Team</dt>
                <dd className="text-ink font-medium text-right">
                  Group 9 · IIM Lucknow
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Status</dt>
                <dd className="text-ink font-medium text-right">
                  Prototype / live demo
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Data</dt>
                <dd className="text-ink font-medium text-right">
                  Fully synthetic
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden max-w-6xl mx-auto px-4 md:px-6 py-20 text-center">
        <BigRBC
          className="hidden lg:block absolute top-1/2 -left-16 -translate-y-1/2 opacity-50"
          size={280}
        />
        <BigPathogen
          className="hidden lg:block absolute top-1/2 -right-16 -translate-y-1/2 opacity-50"
          size={280}
        />
        <h2 className="font-display text-3xl text-ink mb-4">
          Ready to see it flag a report?
        </h2>
        <p className="text-muted max-w-md mx-auto mb-8">
          Load one of three sample cases and watch the score, the flags, and
          the AI narrative build in real time.
        </p>
        <button
          onClick={onLaunch}
          className="hover-lift glow-teal rounded-lg bg-teal text-ink font-semibold px-6 py-3 hover:bg-teal-deep transition"
        >
          Launch the tool
        </button>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 text-xs text-muted">
          PathCore is a student prototype using synthetic data only. It is
          advisory only — every report still requires pathologist sign-off.
        </div>
      </footer>
    </div>
  );
}
