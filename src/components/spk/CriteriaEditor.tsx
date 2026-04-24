import type { SpkCriterion } from "../../types/spk";
import { Plus, Trash2 } from "lucide-react";

interface CriteriaEditorProps {
  criteria: SpkCriterion[];
  onChange: (next: SpkCriterion[]) => void;
}

function newCriterion(): SpkCriterion {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "benefit",
  };
}

export default function CriteriaEditor({ criteria, onChange }: CriteriaEditorProps) {
  const add = () => onChange([...criteria, newCriterion()]);
  const remove = (id: string) => onChange(criteria.filter((c) => c.id !== id));
  const update = (id: string, patch: Partial<SpkCriterion>) =>
    onChange(criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-bold text-gray-900">Kriteria</div>
          <div className="text-sm text-gray-600">
            Tambahkan kriteria penilaian dan tentukan tipe <span className="font-medium">benefit</span> atau{" "}
            <span className="font-medium">cost</span>.
          </div>
        </div>
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {criteria.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Belum ada kriteria. Klik <span className="font-semibold">Tambah</span> untuk mulai.
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((c, idx) => (
            <div key={c.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Kriteria {idx + 1}</div>
                  <input
                    value={c.name}
                    onChange={(e) => update(c.id, { name: e.target.value })}
                    placeholder="Contoh: Harga, Kualitas, Jarak, Pengalaman, ..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
                <button
                  onClick={() => remove(c.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  aria-label="Hapus kriteria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="text-sm font-medium text-gray-700">Tipe</div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`type-${c.id}`}
                      checked={c.type === "benefit"}
                      onChange={() => update(c.id, { type: "benefit" })}
                    />
                    Benefit (semakin besar semakin baik)
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`type-${c.id}`}
                      checked={c.type === "cost"}
                      onChange={() => update(c.id, { type: "cost" })}
                    />
                    Cost (semakin kecil semakin baik)
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

