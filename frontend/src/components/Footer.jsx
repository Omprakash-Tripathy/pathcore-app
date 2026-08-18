export default function Footer() {
  return (
    <footer className="border-t border-ink/[0.08] bg-ink text-paper/70">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-display font-semibold text-paper text-base mb-2">
            PathCore
          </div>
          <p className="leading-relaxed max-w-xs">
            An explainable clinical decision-support prototype for
            pathology report verification. Group 9, IIM Lucknow &mdash;
            PGP Digital Transformation &amp; AI Capstone, August 2026.
          </p>
        </div>

        <div>
          <div className="text-paper font-medium mb-2">Links</div>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://github.com/Omprakash-Tripathy/pathcore-app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper transition-colors"
              >
                GitHub repository
              </a>
            </li>
            <li>
              <a
                href="https://pathcore-app.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper transition-colors"
              >
                Live demo
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-paper font-medium mb-2">Read before you demo it</div>
          <p className="leading-relaxed">
            Synthetic data only. Advisory-only output &mdash; every
            report still requires pathologist sign-off. Reference ranges
            are illustrative, not clinically validated.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 border-t border-paper/10 text-xs text-paper/50">
        Built with the help of Claude (Anthropic), per the capstone&rsquo;s
        vibe-coding guidelines. All rule logic and NLP lexicon reviewed
        and validated by the team.
      </div>
    </footer>
  );
}
