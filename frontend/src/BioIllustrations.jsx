export function BigRBC({ className = "", size = 380 }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 400 400"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rbcGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#2dd4bf" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#rbcGlow)" />
      <circle cx="200" cy="200" r="150" stroke="#2dd4bf" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="200" cy="200" rx="60" ry="38" stroke="#2dd4bf" strokeWidth="1.5" fill="none" opacity="0.45" />
      <ellipse cx="200" cy="200" rx="34" ry="20" stroke="#2dd4bf" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

export function BigPathogen({ className = "", size = 340 }) {
  const spikes = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const r1 = 80, r2 = 108;
    return {
      x1: 170 + r1 * Math.cos(angle),
      y1: 170 + r1 * Math.sin(angle),
      x2: 170 + r2 * Math.cos(angle),
      y2: 170 + r2 * Math.sin(angle),
    };
  });
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 340 340"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pathogenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0a93e" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#f0a93e" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#f0a93e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="170" cy="170" r="160" fill="url(#pathogenGlow)" />
      <circle cx="170" cy="170" r="80" stroke="#f0a93e" strokeWidth="1.5" fill="none" opacity="0.4" />
      {spikes.map((s, i) => (
        <g key={i}>
          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#f0a93e" strokeWidth="1.5" opacity="0.4" />
          <circle cx={s.x2} cy={s.y2} r="4" fill="#f0a93e" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

export function RxSymbol({ className = "", size = 220 }) {
  return (
    <div
      className={`pointer-events-none select-none font-display ${className}`}
      style={{ fontSize: size, lineHeight: 1, fontWeight: 500 }}
      aria-hidden="true"
    >
      ℞
    </div>
  );
}

export function Microscope({ className = "", size = 260 }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke="#2dd4bf"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* base */}
      <path d="M50 168h70" opacity="0.55" />
      <path d="M85 168v-16" opacity="0.55" />
      {/* stand + arm */}
      <path d="M85 152c0-38 8-70 32-92" opacity="0.55" />
      <path d="M117 60c8-8 20-8 27 0" opacity="0.55" />
      {/* eyepiece */}
      <path d="M144 60l18-18" opacity="0.55" />
      <path d="M156 36l14 14" opacity="0.55" />
      {/* nosepiece + lens */}
      <circle cx="120" cy="86" r="7" opacity="0.55" />
      <path d="M113 93l-14 34" opacity="0.55" />
      {/* stage */}
      <path d="M75 118h48" opacity="0.55" />
      <path d="M70 132h58" opacity="0.55" />
      {/* slide */}
      <rect x="82" y="122" width="30" height="6" opacity="0.4" />
    </svg>
  );
}
