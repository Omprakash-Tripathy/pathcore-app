export default function AboutSection() {
  return (
    <section id="about" className="bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-[1fr_1.2fr] gap-10">
        <div>
          <span className="text-xs font-semibold tracking-wide uppercase text-paper/50">
            About this build
          </span>
          <h2 className="font-display font-semibold text-3xl mt-2">
            Group 9, IIM Lucknow
          </h2>
          <p className="text-paper/70 mt-3 leading-relaxed max-w-sm">
            Built for the PGP Digital Transformation &amp; Artificial
            Intelligence Capstone, August 2026, as a use case for Dr
            Lal PathLabs: reduce pathologist verification time and
            inter-pathologist variance without removing the pathologist
            from the loop.
          </p>
        </div>
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold text-paper/90 text-sm mb-1">
              The use case
            </h3>
            <p className="text-paper/60 text-sm leading-relaxed">
              Flag physiologically abnormal biomarker values and
              clinically concerning free-text impressions before human
              sign-off, so pathologists spend their limited hours on
              genuinely abnormal cases rather than re-verifying every
              report from scratch.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-paper/90 text-sm mb-1">
              AI-assisted development
            </h3>
            <p className="text-paper/60 text-sm leading-relaxed">
              This application&rsquo;s code (Flask backend, React
              frontend) was built with Claude (Anthropic) as a coding
              assistant, per the capstone&rsquo;s vibe-coding
              guidelines. All rule engine logic, the NLP lexicon, and
              business logic were reviewed and validated by the team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
