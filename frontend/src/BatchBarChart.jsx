import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const TIER_COLORS = {
  APPROVE: "#34d399",
  REVIEW: "#fbbf24",
  ESCALATE: "#f87171",
};

function BatchTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-ink">{d.label}</div>
      <div className="text-muted font-mono">
        score {d.risk_score}/10 · {d.recommendation}
      </div>
    </div>
  );
}

export default function BatchBarChart({ results }) {
  if (!results || results.length === 0) return null;

  const data = results.map((r) => ({
    label: `${r.age}/${r.sex} · row ${r.row}`,
    risk_score: r.risk_score,
    recommendation: r.recommendation,
  }));

  const height = Math.max(160, data.length * 34);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Worklist by risk score
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid stroke="#263242" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fill: "#8593a3", fontSize: 10, fontFamily: "IBM Plex Mono" }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fill: "#8593a3", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            />
            <Tooltip content={<BatchTooltip />} cursor={{ fill: "#1a2431" }} />
            <Bar dataKey="risk_score" radius={[0, 6, 6, 0]} barSize={16}>
              {data.map((d, i) => (
                <Cell key={i} fill={TIER_COLORS[d.recommendation]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
