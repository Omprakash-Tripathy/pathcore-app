const APP_TABS = [
  { key: "app", label: "Analyze" },
  { key: "batch", label: "Batch upload" },
  { key: "audit", label: "Audit trail" },
];

export default function Nav({ view, onNavigate }) {
  const inApp = view !== "landing";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2 group shrink-0"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-teal group-hover:bg-teal-deep transition" />
          <span className="font-display text-xl font-medium text-ink">
            PathCore
          </span>
        </button>

        {!inApp && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#how-it-works" className="hover:text-ink transition">
              How it works
            </a>
            <a href="#about" className="hover:text-ink transition">
              About
            </a>
          </nav>
        )}

        {inApp && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {APP_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => onNavigate(t.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  view === t.key
                    ? "bg-teal text-paper"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}

        <button
          onClick={() => onNavigate(inApp ? "landing" : "app")}
          className="rounded-lg bg-teal text-paper text-sm font-medium px-4 py-2 hover:bg-teal-deep transition shrink-0"
        >
          {inApp ? "Back to overview" : "Open the tool"}
        </button>
      </div>

      {inApp && (
        <div className="md:hidden flex gap-2 px-4 pb-3 overflow-x-auto">
          {APP_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                view === t.key
                  ? "bg-teal text-paper"
                  : "bg-surface border border-line text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
