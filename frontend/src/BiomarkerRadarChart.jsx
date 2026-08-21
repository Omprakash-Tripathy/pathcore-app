import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

const SHORT_LABELS = {
  Hemoglobin: "Hgb",
  "WBC Count": "WBC",
  "Platelet Count": "Plt",
  "Fasting Glucose": "Glu",
  Creatinine: "Creat",
  "ALT (SGPT)": "ALT",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-ink">{d.fullLabel}</div>
      <div className="text-muted font-mono">
        {d.value} {d.unit} · z = {d.rawZ}
      </div>
    </div>
  );
}

export default function BiomarkerRadarChart({ findings }) {
  if (!findings || findings.length === 0) return null;

  const data = findings.map((f) => ({
    subject: SHORT_LABELS[f.label] || f.label,
    fullLabel: f.label,
    z: Math.min(Math.abs(f.z_score), 6),
    rawZ: f.z_score,
    value: f.value,
    unit: f.unit,
  }));

  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
        Deviation profile
      </div>
      <p className="text-xs text-muted mb-2">
        Each axis is |z-score| from the demographic mean — the further from
        center, the further from normal.
      </p>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="#263242" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#8593a3", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 6]}
              tick={{ fill: "#8593a3", fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              dataKey="z"
              stroke="#2dd4bf"
              fill="#2dd4bf"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
