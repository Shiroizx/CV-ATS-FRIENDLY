import { useMemo } from "react";

interface RadarDataPoint {
  label: string;
  value: number; // 0-1 normalized
}

interface SpkRadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  color?: string;
  size?: number;
}

export default function SpkRadarChart({
  data,
  title,
  color = "#3b82f6",
  size = 280,
}: SpkRadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const n = data.length;

  const angleStep = (2 * Math.PI) / n;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const points = useMemo(
    () =>
      data.map((d, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const r = d.value * radius;
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
          labelX: center + (radius + 20) * Math.cos(angle),
          labelY: center + (radius + 20) * Math.sin(angle),
          label: d.label,
          value: d.value,
        };
      }),
    [data, center, radius, angleStep, n]
  );

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  if (data.length < 3) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Minimal 3 kriteria untuk radar chart.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="px-5 pt-5 pb-0">
          <div className="text-base font-bold text-gray-900">{title}</div>
        </div>
      )}
      <div className="flex justify-center p-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={Array.from({ length: n }, (_, i) => {
                const angle = -Math.PI / 2 + i * angleStep;
                const r = level * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(" ")}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {data.map((_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill={`${color}22`}
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
          ))}

          {/* Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] fill-gray-600 font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
