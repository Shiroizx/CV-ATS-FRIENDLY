import { useMemo } from "react";

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface SpkPieChartProps {
  data: PieSlice[];
  title?: string;
  size?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#eab308",
  "#f43f5e",
];

export default function SpkPieChart({ data, title, size = 220 }: SpkPieChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const slices = useMemo(() => {
    let cumAngle = -Math.PI / 2;
    return data.map((d, i) => {
      const angle = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
      const startAngle = cumAngle;
      cumAngle += angle;
      const endAngle = cumAngle;
      return {
        ...d,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        startAngle,
        endAngle,
        pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0",
      };
    });
  }, [data, total]);

  const center = size / 2;
  const outerR = size / 2 - 10;
  const innerR = outerR * 0.55; // donut

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Belum ada data.
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
      <div className="flex flex-col items-center p-4 gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s, i) => {
            if (s.endAngle - s.startAngle < 0.01) return null;

            // Full donut slice
            const outerStart = {
              x: center + outerR * Math.cos(s.startAngle),
              y: center + outerR * Math.sin(s.startAngle),
            };
            const outerEnd = {
              x: center + outerR * Math.cos(s.endAngle),
              y: center + outerR * Math.sin(s.endAngle),
            };
            const innerEnd = {
              x: center + innerR * Math.cos(s.endAngle),
              y: center + innerR * Math.sin(s.endAngle),
            };
            const innerStart = {
              x: center + innerR * Math.cos(s.startAngle),
              y: center + innerR * Math.sin(s.startAngle),
            };
            const largeArc = s.endAngle - s.startAngle > Math.PI ? 1 : 0;

            const path = [
              `M ${outerStart.x} ${outerStart.y}`,
              `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
              `L ${innerEnd.x} ${innerEnd.y}`,
              `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
              `Z`,
            ].join(" ");

            return (
              <path
                key={i}
                d={path}
                fill={s.color}
                stroke="white"
                strokeWidth="2"
                className="transition-opacity hover:opacity-80"
              />
            );
          })}
          {/* Center text */}
          <text x={center} y={center - 6} textAnchor="middle" className="text-xs fill-gray-500 font-medium">
            Total
          </text>
          <text x={center} y={center + 12} textAnchor="middle" className="text-sm fill-gray-900 font-bold">
            {total.toFixed(2)}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="font-medium">{s.label}</span>
              <span className="text-gray-400">({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
