export default function CtaBand({ onLaunch }) {
  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-20">
      <div className="rounded-3xl bg-hema text-paper px-6 md:px-12 py-12 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-display font-semibold text-2xl md:text-3xl">
            See the rule trace for yourself
          </h2>
          <p className="text-paper/75 mt-2 max-w-md leading-relaxed">
            Load one of three sample cases, or enter your own synthetic
            values, and watch the score build up flag by flag.
          </p>
        </div>
        <button
          onClick={onLaunch}
          className="shrink-0 rounded-full bg-paper text-hema-dark font-semibold text-sm px-6 py-3 hover:bg-eosin-light transition-colors"
        >
          Launch the demo
        </button>
      </div>
    </section>
  );
}
