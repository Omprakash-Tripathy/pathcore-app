import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const TIER_COLORS = {
  Approve: "#34d399",
  Review: "#fbbf24",
  Escalate: "#f87171",
};

function DonutTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <span className="font-semibold text-ink">{d.name}</span>: {d.value}
    </div>
  );
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="text-muted">#{d.seq}</div>
      <div className="font-mono text-ink">score {d.risk_score}/10</div>
    </div>
  );
}

export default function AuditCharts({ summary, entries }) {
  if (!summary || summary.total === 0) return null;

  const pieData = [
    { name: "Approve", value: summary.approve_count },
    { name: "Review", value: summary.review_count },
    { name: "Escalate", value: summary.escalate_count },
  ].filter((d) => d.value > 0);

  const trendData = [...entries]
    .slice()
    .reverse()
    .map((e, i) => ({ seq: i + 1, risk_score: e.risk_score }));

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-8">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
          Tier distribution
        </div>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {pieData.map((d) => (
                  <Cell key={d.name} fill={TIER_COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-1">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TIER_COLORS[d.name] }}
              />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
          Risk score trend
        </div>
        <p className="text-xs text-muted mb-2">
          Oldest to most recent, in the order each analysis was run.
        </p>
        <div style={{ width: "100%", height: 190 }}>
          <ResponsiveContainer>
            <LineChart data={trendData} margin={{ left: -20, right: 10, top: 5 }}>
              <CartesianGrid stroke="#263242" vertical={false} />
              <XAxis
                dataKey="seq"
                tick={{ fill: "#8593a3", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "#8593a3", fontSize: 10, fontFamily: "IBM Plex Mono" }}
              />
              <Tooltip content={<TrendTooltip />} />
              <Line
                type="monotone"
                dataKey="risk_score"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2dd4bf" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
