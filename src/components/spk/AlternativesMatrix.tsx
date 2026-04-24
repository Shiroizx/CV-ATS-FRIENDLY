import { Plus, Trash2 } from "lucide-react";
import type { SpkAlternative, SpkCriterion, SpkScores } from "../../types/spk";
import { parseNumber } from "../../lib/spk/validation";

interface AlternativesMatrixProps {
  alternatives: SpkAlternative[];
  criteria: SpkCriterion[];
  scores: SpkScores;
  onAlternativesChange: (next: SpkAlternative[]) => void;
  onScoresChange: (next: SpkScores) => void;
}

function newAlternative(): SpkAlternative {
  return { id: crypto.randomUUID(), name: "" };
}

export default function AlternativesMatrix({
  alternatives,
  criteria,
  scores,
  onAlternativesChange,
  onScoresChange,
}: AlternativesMatrixProps) {
  const addAlt = () => onAlternativesChange([...alternatives, newAlternative()]);
  const removeAlt = (id: string) => {
    const nextAlt = alternatives.filter((a) => a.id !== id);
    const nextScores: SpkScores = { ...scores };
    delete nextScores[id];
    onAlternativesChange(nextAlt);
    onScoresChange(nextScores);
  };
  const updateAlt = (id: string, name: string) =>
    onAlternativesChange(alternatives.map((a) => (a.id === id ? { ...a, name } : a)));

  const setScore = (altId: string, critId: string, input: string) => {
    const parsed = parseNumber(input);
    const next: SpkScores = { ...scores };
    const row = { ...(next[altId] ?? {}) };
    row[critId] = parsed ?? 0;
    next[altId] = row;
    onScoresChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-bold text-gray-900">Alternatif & Nilai</div>
          <div className="text-sm text-gray-600">
            Isi alternatif (opsi yang akan diranking) dan nilai tiap kriteria.
          </div>
        </div>
        <button
          onClick={addAlt}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {criteria.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Tambahkan kriteria dulu.
        </div>
      ) : alternatives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Belum ada alternatif. Klik <span className="font-semibold">Tambah</span> untuk mulai.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-[840px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Alternatif</th>
                {criteria.map((c) => (
                  <th key={c.id} className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">
                    {c.name || "(tanpa nama)"}{" "}
                    <span className="text-[10px] font-bold uppercase text-gray-400">{c.type}</span>
                  </th>
                ))}
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {alternatives.map((a, rowIdx) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">
                    <div className="text-xs font-semibold text-gray-500 mb-1">Alternatif {rowIdx + 1}</div>
                    <input
                      value={a.name}
                      onChange={(e) => updateAlt(a.id, e.target.value)}
                      placeholder="Contoh: A1, Kandidat 1, Laptop X, ..."
                      className="w-64 max-w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </td>
                  {criteria.map((c) => (
                    <td key={c.id} className="p-3">
                      <input
                        value={String(scores[a.id]?.[c.id] ?? "")}
                        onChange={(e) => setScore(a.id, c.id, e.target.value)}
                        placeholder="0"
                        inputMode="decimal"
                        className="w-36 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      />
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <button
                      onClick={() => removeAlt(a.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      aria-label="Hapus alternatif"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

