import ReportVisual from "./ReportVisual";

export default function Hero({ onLaunch }) {
  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-12 md:gap-10 items-center">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-hema bg-hema-light rounded-full px-3 py-1.5 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-hema" />
          Dr Lal PathLabs &middot; DTAI Capstone Prototype
        </div>
        <h1 className="font-display font-semibold text-4xl md:text-[2.75rem] leading-[1.08] tracking-tight text-ink">
          Every abnormal report,
          <br />
          flagged before sign-off.
          <br />
          <span className="text-hema">Never a black box.</span>
        </h1>
        <p className="mt-5 text-ink-soft text-base md:text-lg leading-relaxed max-w-md">
          PathCore reads biomarkers and free-text impressions the way a
          second pair of eyes would &mdash; scoring risk from 1&ndash;10
          and showing exactly which rule or phrase drove that score, so
          pathologists spend their hours on cases that actually need
          them.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onLaunch}
            className="rounded-full bg-ink text-paper font-semibold text-sm px-6 py-3 hover:bg-hema-dark transition-colors"
          >
            Launch the demo
          </button>
          <a
            href="https://github.com/Omprakash-Tripathy/pathcore-app"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-1.5"
          >
            View source on GitHub
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      <ReportVisual />
    </section>
  );
}
