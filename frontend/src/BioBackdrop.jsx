export default function BioBackdrop({ className = "", fixed = false }) {
  return (
    <svg
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 h-full w-full ${className}`}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="bioPattern"
          patternUnits="userSpaceOnUse"
          width="240"
          height="240"
        >
          {/* Biconcave red blood cell discs */}
          <g stroke="#2dd4bf" strokeWidth="1" fill="none" opacity="0.55">
            <circle cx="30" cy="40" r="22" />
            <ellipse cx="30" cy="40" rx="9" ry="6" />
          </g>
          <g stroke="#2dd4bf" strokeWidth="1" fill="none" opacity="0.4">
            <circle cx="170" cy="90" r="16" />
            <ellipse cx="170" cy="90" rx="6.5" ry="4.5" />
          </g>
          <g stroke="#2dd4bf" strokeWidth="1" fill="none" opacity="0.35">
            <circle cx="90" cy="190" r="19" />
            <ellipse cx="90" cy="190" rx="7.5" ry="5" />
          </g>

          {/* Pathogen-like motifs -- small nucleus with radial spikes */}
          <g stroke="#f0a93e" strokeWidth="1" fill="none" opacity="0.3">
            <circle cx="205" cy="205" r="10" />
            <line x1="205" y1="195" x2="205" y2="188" />
            <line x1="205" y1="215" x2="205" y2="222" />
            <line x1="195" y1="205" x2="188" y2="205" />
            <line x1="215" y1="205" x2="222" y2="205" />
            <line x1="198" y1="198" x2="192" y2="192" />
            <line x1="212" y1="198" x2="218" y2="192" />
            <line x1="198" y1="212" x2="192" y2="218" />
            <line x1="212" y1="212" x2="218" y2="218" />
          </g>
          <g stroke="#f0a93e" strokeWidth="0.8" fill="none" opacity="0.22">
            <circle cx="130" cy="30" r="7" />
            <line x1="130" y1="23" x2="130" y2="18" />
            <line x1="130" y1="37" x2="130" y2="42" />
            <line x1="123" y1="30" x2="118" y2="30" />
            <line x1="137" y1="30" x2="142" y2="30" />
          </g>

          {/* Faint hexagonal lattice node, evokes a microscope grid */}
          <g stroke="#8593a3" strokeWidth="0.6" fill="none" opacity="0.18">
            <circle cx="60" cy="130" r="2" />
            <circle cx="200" cy="150" r="2" />
            <circle cx="10" cy="200" r="2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bioPattern)" />
    </svg>
  );
}
