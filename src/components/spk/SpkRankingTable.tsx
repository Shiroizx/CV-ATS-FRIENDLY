import { Download } from "lucide-react";

interface RankingRow {
  rank: number;
  name: string;
  email: string;
  scores: number[];
  finalScore: number;
}

interface SpkRankingTableProps {
  rows: RankingRow[];
  criteriaNames: string[];
  method: string;
  onExportCsv?: () => void;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function SpkRankingTable({ rows, criteriaNames, method, onExportCsv }: SpkRankingTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Belum ada data user untuk dianalisis.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <div className="text-base font-bold text-gray-900">Tabel Ranking Detail</div>
          <div className="text-xs text-gray-500">
            Metode: <span className="font-semibold text-blue-600">{method.toUpperCase()}</span> • {rows.length} alternatif
          </div>
        </div>
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">Rank</th>
              <th className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">User</th>
              {criteriaNames.map((name, i) => (
                <th key={i} className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap">
                  {name}
                </th>
              ))}
              <th className="text-center p-3 font-semibold text-gray-700 whitespace-nowrap bg-blue-50">
                Skor Akhir
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.email} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="p-3 whitespace-nowrap">
                  <span className="font-extrabold text-gray-900 text-base">
                    {row.rank <= 3 ? MEDAL[row.rank - 1] : `#${row.rank}`}
                  </span>
                </td>
                <td className="p-3 min-w-[160px]">
                  <div className="font-semibold text-gray-900 truncate">{row.name || "Tanpa Nama"}</div>
                  <div className="text-xs text-gray-500 truncate">{row.email}</div>
                </td>
                {row.scores.map((score, i) => (
                  <td key={i} className="p-3 text-center text-gray-700 font-mono text-xs">
                    {score.toFixed(2)}
                  </td>
                ))}
                <td className="p-3 text-center bg-blue-50/50">
                  <span className="font-bold text-blue-700 text-sm">{row.finalScore.toFixed(4)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
