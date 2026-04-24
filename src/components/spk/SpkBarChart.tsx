import { useMemo } from "react";

interface BarItem {
  label: string;
  value: number;
  rank: number;
}

interface SpkBarChartProps {
  data: BarItem[];
  title?: string;
  maxItems?: number;
}

const COLORS = [
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
];

export default function SpkBarChart({ data, title, maxItems = 15 }: SpkBarChartProps) {
  const items = useMemo(() => data.slice(0, maxItems), [data, maxItems]);
  const maxValue = useMemo(() => Math.max(...items.map((d) => d.value), 0.001), [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Belum ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {title && (
        <div className="px-5 pt-5 pb-2">
          <div className="text-base font-bold text-gray-900">{title}</div>
        </div>
      )}
      <div className="px-5 pb-5 space-y-2.5">
        {items.map((item, idx) => {
          const pct = (item.value / maxValue) * 100;
          const color = COLORS[idx % COLORS.length];
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {item.rank}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 ml-2 flex-shrink-0">
                  {item.value.toFixed(4)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                    animationDelay: `${idx * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
