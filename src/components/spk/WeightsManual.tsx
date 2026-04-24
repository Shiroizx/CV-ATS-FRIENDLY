import type { SpkCriterion } from "../../types/spk";
import { normalizeWeights, parseNumber } from "../../lib/spk/validation";

interface WeightsManualProps {
  criteria: SpkCriterion[];
  manualWeights: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}

export default function WeightsManual({ criteria, manualWeights, onChange }: WeightsManualProps) {
  const weightsArr = criteria.map((c) => manualWeights[c.id] ?? 0);
  const normalized = normalizeWeights(weightsArr);

  const setWeight = (id: string, value: string) => {
    const parsed = parseNumber(value);
    onChange({ ...manualWeights, [id]: parsed ?? 0 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="text-lg font-bold text-gray-900 mb-1">Bobot (Manual)</div>
      <div className="text-sm text-gray-600 mb-4">
        Isi bobot bebas (mis. 1–5). Sistem akan otomatis menormalisasi menjadi total 1.
      </div>

      {criteria.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Tambahkan kriteria dulu.
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((c, idx) => (
            <div key={c.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-500">Kriteria {idx + 1}</div>
                  <div className="font-semibold text-gray-900 truncate">{c.name || "(tanpa nama)"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 text-right">
                    Normalisasi
                    <div className="font-bold text-gray-800">{normalized[idx]?.toFixed(4)}</div>
                  </div>
                  <input
                    value={String(manualWeights[c.id] ?? "")}
                    onChange={(e) => setWeight(c.id, e.target.value)}
                    placeholder="0"
                    inputMode="decimal"
                    className="w-28 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

