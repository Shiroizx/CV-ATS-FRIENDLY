import { useMemo } from "react";
import type { SpkCriterion } from "../../types/spk";
import { computeAhp } from "../../lib/spk/ahp";
import { ensureMatrixSize, enforceAhpReciprocal } from "../../lib/spk/validation";

interface WeightsAHPProps {
  criteria: SpkCriterion[];
  pairwise: number[][];
  onChange: (next: number[][]) => void;
}

const SCALE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "1 (Sama penting)", value: 1 },
  { label: "2", value: 2 },
  { label: "3 (Sedikit lebih penting)", value: 3 },
  { label: "4", value: 4 },
  { label: "5 (Lebih penting)", value: 5 },
  { label: "6", value: 6 },
  { label: "7 (Sangat lebih penting)", value: 7 },
  { label: "8", value: 8 },
  { label: "9 (Mutlak lebih penting)", value: 9 },
  { label: "1/2", value: 1 / 2 },
  { label: "1/3", value: 1 / 3 },
  { label: "1/4", value: 1 / 4 },
  { label: "1/5", value: 1 / 5 },
  { label: "1/6", value: 1 / 6 },
  { label: "1/7", value: 1 / 7 },
  { label: "1/8", value: 1 / 8 },
  { label: "1/9", value: 1 / 9 },
];

function closestOptionValue(v: number): number {
  let best = SCALE_OPTIONS[0]?.value ?? 1;
  let bestDiff = Math.abs(v - best);
  for (const opt of SCALE_OPTIONS) {
    const diff = Math.abs(v - opt.value);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = opt.value;
    }
  }
  return best;
}

export default function WeightsAHP({ criteria, pairwise, onChange }: WeightsAHPProps) {
  const n = criteria.length;
  const matrix = useMemo(() => enforceAhpReciprocal(ensureMatrixSize(pairwise, n, 1)), [pairwise, n]);
  const ahp = useMemo(() => (n >= 2 ? computeAhp(matrix, n) : null), [matrix, n]);

  const setPair = (i: number, j: number, v: number) => {
    const sized = ensureMatrixSize(pairwise, n, 1);
    sized[i][j] = v;
    const next = enforceAhpReciprocal(sized);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="text-lg font-bold text-gray-900 mb-1">Bobot (AHP)</div>
      <div className="text-sm text-gray-600 mb-4">
        Isi perbandingan berpasangan antar kriteria (skala Saaty). Sistem akan menghitung bobot dan cek konsistensi (CR).
      </div>

      {criteria.length < 2 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Tambahkan minimal 2 kriteria untuk AHP.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">Pairwise</th>
                  {criteria.map((c) => (
                    <th key={c.id} className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">
                      {c.name || "(tanpa nama)"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((rowC, i) => (
                  <tr key={rowC.id} className="border-t">
                    <td className="p-3 font-semibold text-gray-800 whitespace-nowrap">{rowC.name || "(tanpa nama)"}</td>
                    {criteria.map((colC, j) => {
                      if (i === j) {
                        return (
                          <td key={colC.id} className="p-3 text-gray-500">
                            1
                          </td>
                        );
                      }
                      if (i > j) {
                        return (
                          <td key={colC.id} className="p-3 text-gray-500">
                            {(matrix[i]?.[j] ?? 1).toFixed(4)}
                          </td>
                        );
                      }
                      const current = closestOptionValue(matrix[i]?.[j] ?? 1);
                      return (
                        <td key={colC.id} className="p-3">
                          <select
                            value={String(current)}
                            onChange={(e) => setPair(i, j, Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                          >
                            {SCALE_OPTIONS.map((opt) => (
                              <option key={opt.label} value={String(opt.value)}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ahp && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="font-semibold text-gray-900 mb-2">Bobot (hasil AHP)</div>
                <div className="space-y-2">
                  {criteria.map((c, idx) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="truncate text-gray-700">{c.name || "(tanpa nama)"}</div>
                      <div className="font-bold text-gray-900">{ahp.weights[idx]?.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="font-semibold text-gray-900 mb-2">Konsistensi</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">λmax</div>
                    <div className="font-bold text-gray-900">{ahp.lambdaMax.toFixed(4)}</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">CI</div>
                    <div className="font-bold text-gray-900">{ahp.ci.toFixed(4)}</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">RI</div>
                    <div className="font-bold text-gray-900">{ahp.ri.toFixed(2)}</div>
                  </div>
                  <div className="rounded-lg p-3 border border-amber-200 bg-amber-50">
                    <div className="text-xs text-amber-700">CR</div>
                    <div className="font-extrabold text-amber-900">{ahp.cr.toFixed(4)}</div>
                    <div className="mt-1 text-[11px] text-amber-800/80">
                      {ahp.cr <= 0.1 ? "Konsisten (CR ≤ 0.10)" : "Kurang konsisten (CR > 0.10), perbaiki pairwise."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

