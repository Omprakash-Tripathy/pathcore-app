function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="10" fill="#10151F" />
        <circle cx="20" cy="24" r="12" fill="#4B2E83" />
        <circle cx="30" cy="24" r="12" fill="#BE2F63" opacity="0.85" />
      </svg>
      <span className="font-display font-semibold text-lg tracking-tight text-ink">
        PathCore
      </span>
    </div>
  );
}

export default function Navbar({ view, onNavigate }) {
  const isLanding = view === "landing";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-paper/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate("landing")}
          className="cursor-pointer"
          aria-label="PathCore home"
        >
          <Logo />
        </button>

        {isLanding ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-ink transition-colors">
              What you get
            </a>
            <a href="#trust" className="hover:text-ink transition-colors">
              Trust &amp; limits
            </a>
            <a href="#about" className="hover:text-ink transition-colors">
              About
            </a>
          </nav>
        ) : (
          <span className="hidden md:block text-sm font-medium text-ink-soft">
            Prototype workspace &middot; synthetic data only
          </span>
        )}

        <button
          onClick={() => onNavigate(isLanding ? "analyzer" : "landing")}
          className="rounded-full bg-ink text-paper text-sm font-semibold px-4 py-2 hover:bg-hema-dark transition-colors"
        >
          {isLanding ? "Launch the demo" : "Back to overview"}
        </button>
      </div>
    </header>
  );
}
