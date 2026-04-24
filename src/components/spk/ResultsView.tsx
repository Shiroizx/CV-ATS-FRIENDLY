import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type {
  SpkAlternative,
  SpkComputeOutput,
  SpkCriterion,
  SpkScores,
  SpkWeightMode,
} from "../../types/spk";
import { computeAhp } from "../../lib/spk/ahp";
import { computeSaw } from "../../lib/spk/saw";
import { computeTopsis } from "../../lib/spk/topsis";
import { ensureMatrixSize, enforceAhpReciprocal, normalizeWeights } from "../../lib/spk/validation";

function buildDecisionMatrix(alternatives: SpkAlternative[], criteria: SpkCriterion[], scores: SpkScores): number[][] {
  return alternatives.map((a) => criteria.map((c) => scores[a.id]?.[c.id] ?? 0));
}

function exportRankingCsv(out: SpkComputeOutput) {
  const rows = [
    ["rank", "alternative", "score"],
    ...out.ranking.map((r) => [String(r.rank), r.alternativeName, String(r.score)]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell.replaceAll('"', '""');
          return `"${s}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spk_ranking_${out.method}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function compute(
  method: "topsis" | "saw",
  criteria: SpkCriterion[],
  alternatives: SpkAlternative[],
  scores: SpkScores,
  weightMode: SpkWeightMode,
  manualWeights: Record<string, number>,
  pairwise: number[][]
): SpkComputeOutput | null {
  if (criteria.length === 0 || alternatives.length === 0) return null;

  const types = criteria.map((c) => c.type);
  const matrix = buildDecisionMatrix(alternatives, criteria, scores);

  let weights: number[] = [];
  if (weightMode === "manual") {
    weights = normalizeWeights(criteria.map((c) => manualWeights[c.id] ?? 0));
  } else {
    const n = criteria.length;
    const ahp = computeAhp(enforceAhpReciprocal(ensureMatrixSize(pairwise, n, 1)), n);
    weights = ahp.weights;
  }

  if (method === "saw") {
    const saw = computeSaw({ matrix, weights, types });
    const ranking = saw.scores
      .map((score, i) => ({
        alternativeId: alternatives[i]!.id,
        alternativeName: alternatives[i]!.name || `A${i + 1}`,
        score,
      }))
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));

    return { method: "saw", ranking, weights };
  }

  const topsis = computeTopsis({ matrix, weights, types });
  const ranking = topsis.scores
    .map((score, i) => ({
      alternativeId: alternatives[i]!.id,
      alternativeName: alternatives[i]!.name || `A${i + 1}`,
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  return { method: "topsis", ranking, weights, details: topsis.details };
}

interface ResultsViewProps {
  criteria: SpkCriterion[];
  alternatives: SpkAlternative[];
  scores: SpkScores;
  weightMode: SpkWeightMode;
  manualWeights: Record<string, number>;
  pairwise: number[][];
}

export default function ResultsView(props: ResultsViewProps) {
  const [method, setMethod] = useState<"topsis" | "saw">("topsis");

  const out = useMemo(
    () =>
      compute(
        method,
        props.criteria,
        props.alternatives,
        props.scores,
        props.weightMode,
        props.manualWeights,
        props.pairwise
      ),
    [method, props]
  );

  const ahpInfo = useMemo(() => {
    if (props.weightMode !== "ahp" || props.criteria.length < 2) return null;
    const n = props.criteria.length;
    return computeAhp(enforceAhpReciprocal(ensureMatrixSize(props.pairwise, n, 1)), n);
  }, [props.weightMode, props.criteria.length, props.pairwise]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-bold text-gray-900">Hasil</div>
          <div className="text-sm text-gray-600">Hitung skor dan ranking alternatif.</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as "topsis" | "saw")}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
          >
            <option value="topsis">TOPSIS</option>
            <option value="saw">SAW (pembanding)</option>
          </select>
          <button
            onClick={() => out && exportRankingCsv(out)}
            disabled={!out}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {props.criteria.length === 0 || props.alternatives.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Isi <span className="font-semibold">Kriteria</span> dan <span className="font-semibold">Alternatif</span> dulu.
        </div>
      ) : !out ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-600">
          Data belum lengkap untuk dihitung.
        </div>
      ) : (
        <div className="space-y-4">
          {ahpInfo && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-semibold text-amber-900">AHP Consistency Ratio (CR): {ahpInfo.cr.toFixed(4)}</div>
              <div className="text-sm text-amber-900/80">
                {ahpInfo.cr <= 0.1 ? "Konsisten (CR ≤ 0.10)." : "Kurang konsisten (CR > 0.10), pertimbangkan revisi pairwise."}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800">Ranking</div>
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full text-sm">
                <thead className="bg-white">
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Rank</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Alternatif</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {out.ranking.map((r) => (
                    <tr key={r.alternativeId} className="border-b last:border-b-0">
                      <td className="p-3 font-extrabold text-gray-900">{r.rank}</td>
                      <td className="p-3 font-semibold text-gray-900">{r.alternativeName}</td>
                      <td className="p-3 text-gray-700">{r.score.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="font-semibold text-gray-900 mb-2">Bobot yang dipakai</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {props.criteria.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="truncate text-gray-700">{c.name || "(tanpa nama)"}</div>
                  <div className="font-bold text-gray-900">{out.weights[idx]?.toFixed(4)}</div>
                </div>
              ))}
            </div>
          </div>

          {out.method === "topsis" && out.details && (
            <details className="rounded-xl border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">Detail TOPSIS (lihat)</summary>
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <div>
                  <span className="font-semibold">Ideal Best</span>:{" "}
                  {out.details.idealBest.map((v) => v.toFixed(6)).join(", ")}
                </div>
                <div>
                  <span className="font-semibold">Ideal Worst</span>:{" "}
                  {out.details.idealWorst.map((v) => v.toFixed(6)).join(", ")}
                </div>
                <div>
                  <span className="font-semibold">D+</span>: {out.details.distanceBest.map((v) => v.toFixed(6)).join(", ")}
                </div>
                <div>
                  <span className="font-semibold">D-</span>: {out.details.distanceWorst.map((v) => v.toFixed(6)).join(", ")}
                </div>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

