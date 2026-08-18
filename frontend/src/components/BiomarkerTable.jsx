export default function BiomarkerTable({ findings }) {
  if (!findings || findings.length === 0) return null;

  return (
    <div className="rounded-xl border border-ink/10 overflow-hidden">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="bg-paper-dim text-left text-ink-soft font-sans text-xs uppercase tracking-wide">
            <th className="p-3 font-medium">Parameter</th>
            <th className="p-3 font-medium">Value</th>
            <th className="p-3 font-medium hidden sm:table-cell">
              Reference
            </th>
            <th className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.06]">
          {findings.map((f) => (
            <tr
              key={f.parameter}
              className={f.status !== "normal" ? "bg-eosin-light/40" : ""}
            >
              <td className="p-3 font-sans text-ink">{f.label}</td>
              <td className="p-3 font-tabular text-ink">
                {f.value} <span className="text-ink-faint">{f.unit}</span>
              </td>
              <td className="p-3 text-ink-faint hidden sm:table-cell">
                {f.reference_low}&ndash;{f.reference_high} {f.unit}
              </td>
              <td className="p-3 font-sans font-medium capitalize">
                <span
                  className={
                    f.status !== "normal" ? "text-eosin-dark" : "text-success"
                  }
                >
                  {f.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
