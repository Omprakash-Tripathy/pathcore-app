export default function RuleTrace({ findings, nlpFlags }) {
  const traces = [
    ...findings.map((f) => f.rule_trace),
    ...nlpFlags.map((f) => f.rule_trace),
  ];
  if (traces.length === 0) return null;

  return (
    <details className="group rounded-xl border border-ink/10 bg-paper-dim/50 open:bg-panel">
      <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3 text-sm font-medium text-ink">
        <span>
          Show rule trace &mdash; {traces.length} rule
          {traces.length !== 1 ? "s" : ""} evaluated
        </span>
        <span className="text-ink-faint transition-transform group-open:rotate-180">
          &darr;
        </span>
      </summary>
      <ul className="px-4 pb-4 space-y-2">
        {traces.map((t, i) => (
          <li
            key={i}
            className="text-sm text-ink-soft font-mono leading-relaxed pl-3 border-l-2 border-hema-line"
          >
            {t}
          </li>
        ))}
      </ul>
    </details>
  );
}
