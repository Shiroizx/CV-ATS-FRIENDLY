import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Database,
  Loader2,
  RefreshCw,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { computeAhp } from "../lib/spk/ahp";
import { computeTopsis } from "../lib/spk/topsis";
import { computeSaw } from "../lib/spk/saw";
import { ensureMatrixSize, enforceAhpReciprocal, normalizeWeights } from "../lib/spk/validation";
import type { SpkWeightMode } from "../types/spk";

import SpkBarChart from "../components/spk/SpkBarChart";
import SpkRadarChart from "../components/spk/SpkRadarChart";
import SpkPieChart from "../components/spk/SpkPieChart";
import SpkRankingTable from "../components/spk/SpkRankingTable";
import MermaidBlock from "../components/spk/MermaidBlock";

/* ─────────────────────── TYPES ─────────────────────── */

interface UserAnalytics {
  user_id: string;
  email: string;
  full_name: string;
  download_count: number;
  resume_count: number;
  profile_completeness: number;
  days_since_last_activity: number;
  template_variety: number;
}

const CRITERIA = [
  { name: "Download", type: "benefit" as const, key: "download_count" },
  { name: "Jumlah Resume", type: "benefit" as const, key: "resume_count" },
  { name: "Kelengkapan Profil", type: "benefit" as const, key: "profile_completeness" },
  { name: "Aktivitas (hari)", type: "cost" as const, key: "days_since_last_activity" },
  { name: "Variasi Template", type: "benefit" as const, key: "template_variety" },
];

const CRITERIA_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e"];

const DEFAULT_PAIRWISE: number[][] = [
  [1, 2, 3, 5, 2],
  [1 / 2, 1, 2, 4, 1],
  [1 / 3, 1 / 2, 1, 3, 1 / 2],
  [1 / 5, 1 / 4, 1 / 3, 1, 1 / 3],
  [1 / 2, 1, 2, 3, 1],
];

const SAATY_SCALE = [
  { value: 1 / 9, label: "1/9" },
  { value: 1 / 7, label: "1/7" },
  { value: 1 / 5, label: "1/5" },
  { value: 1 / 3, label: "1/3" },
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
  { value: 7, label: "7" },
  { value: 9, label: "9" },
];

function closestSaatyIndex(v: number): number {
  let best = 0;
  let bestDist = Infinity;
  SAATY_SCALE.forEach((s, i) => {
    const d = Math.abs(Math.log(s.value) - Math.log(v));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

/* ─────────────────────── PROCESS DIAGRAM ─────────────────────── */

const processDiagram = `flowchart TD
  A["📥 Fetch Data User\\ndari Database"] --> B["📊 Buat Decision Matrix\\n(m user × 5 kriteria)"]
  B --> C{"Mode Bobot?"}
  C -->|"AHP"| D["Hitung Bobot AHP\\n(Pairwise + CR Check)"]
  C -->|"Manual"| E["Input Bobot Manual\\n(Slider)"]
  D --> F["Normalisasi &\\nWeighted Matrix"]
  E --> F
  F --> G{"Metode Ranking?"}
  G -->|"TOPSIS"| H["Hitung D+, D−\\n→ Closeness Coefficient"]
  G -->|"SAW"| I["Normalisasi Min-Max\\n→ Skor Preferensi"]
  H --> J["📈 Visualisasi:\\nBar, Radar, Pie,\\nTabel Ranking"]
  I --> J

  style J fill:#dbeafe,stroke:#3b82f6,color:#1e40af
`;

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export default function SpkDssPage() {
  // Data
  const [rawData, setRawData] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Config
  const [weightMode, setWeightMode] = useState<SpkWeightMode>("ahp");
  const [method, setMethod] = useState<"topsis" | "saw">("topsis");
  const [pairwise, setPairwise] = useState<number[][]>(DEFAULT_PAIRWISE);
  const [manualWeights, setManualWeights] = useState<number[]>([5, 4, 3, 2, 3]);
  const [configOpen, setConfigOpen] = useState(true);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number>(0);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.rpc("get_spk_user_analytics");
      if (err) throw err;
      setRawData(data || []);
    } catch (e: any) {
      console.error("SPK fetch error:", e);
      setError(e.message || "Gagal mengambil data. Pastikan SQL function sudah dijalankan di Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SPK Analytics Dashboard - FreeBuild CV";
    fetchData();
  }, []);

  // AHP weights
  const ahpResult = useMemo(() => {
    const n = CRITERIA.length;
    const sized = ensureMatrixSize(pairwise, n, 1);
    const valid = enforceAhpReciprocal(sized);
    return computeAhp(valid, n);
  }, [pairwise]);

  // Final weights
  const weights = useMemo(() => {
    if (weightMode === "ahp") return ahpResult.weights;
    return normalizeWeights(manualWeights);
  }, [weightMode, ahpResult, manualWeights]);

  // Build decision matrix
  const decisionMatrix = useMemo(
    () =>
      rawData.map((u) =>
        CRITERIA.map((c) => {
          const val = (u as any)[c.key] as number;
          return Number.isFinite(val) ? val : 0;
        })
      ),
    [rawData]
  );

  // Compute ranking
  const rankingResult = useMemo(() => {
    if (rawData.length === 0) return null;

    const types = CRITERIA.map((c) => c.type);

    if (method === "topsis") {
      const out = computeTopsis({ matrix: decisionMatrix, weights, types });
      const ranking = out.scores
        .map((score, i) => ({
          idx: i,
          score,
          user: rawData[i],
        }))
        .sort((a, b) => b.score - a.score)
        .map((r, rank) => ({ ...r, rank: rank + 1 }));
      return { ranking, details: out.details };
    }

    const out = computeSaw({ matrix: decisionMatrix, weights, types });
    const ranking = out.scores
      .map((score, i) => ({
        idx: i,
        score,
        user: rawData[i],
      }))
      .sort((a, b) => b.score - a.score)
      .map((r, rank) => ({ ...r, rank: rank + 1 }));
    return { ranking, details: null };
  }, [rawData, decisionMatrix, weights, method]);

  // Bar chart data
  const barData = useMemo(
    () =>
      rankingResult?.ranking.map((r) => ({
        label: r.user.full_name || r.user.email.split("@")[0],
        value: r.score,
        rank: r.rank,
      })) ?? [],
    [rankingResult]
  );

  // Radar chart data for selected user
  const radarData = useMemo(() => {
    if (!rankingResult || rankingResult.ranking.length === 0) return [];
    const idx = selectedUser;
    const entry = rankingResult.ranking[idx];
    if (!entry) return [];

    // Normalize each criteria 0-1 for radar
    const maxVals = CRITERIA.map((_, ci) =>
      Math.max(...decisionMatrix.map((row) => row[ci] ?? 0), 0.001)
    );
    const minVals = CRITERIA.map((_, ci) =>
      Math.min(...decisionMatrix.map((row) => row[ci] ?? 0))
    );

    return CRITERIA.map((c, ci) => {
      const raw = decisionMatrix[entry.idx]?.[ci] ?? 0;
      const range = maxVals[ci] - minVals[ci];
      let normalized = range > 0 ? (raw - minVals[ci]) / range : 0;
      if (c.type === "cost") normalized = 1 - normalized;
      return {
        label: c.name,
        value: Math.max(0, Math.min(1, normalized)),
      };
    });
  }, [rankingResult, selectedUser, decisionMatrix]);

  // Pie chart data
  const pieData = useMemo(
    () =>
      CRITERIA.map((c, i) => ({
        label: c.name,
        value: weights[i] ?? 0,
        color: CRITERIA_COLORS[i],
      })),
    [weights]
  );

  // Ranking table data
  const tableRows = useMemo(
    () =>
      rankingResult?.ranking.map((r) => ({
        rank: r.rank,
        name: r.user.full_name || "",
        email: r.user.email,
        scores: CRITERIA.map((c) => {
          const val = (r.user as any)[c.key] as number;
          return Number.isFinite(val) ? val : 0;
        }),
        finalScore: r.score,
      })) ?? [],
    [rankingResult]
  );

  // Export CSV
  const handleExportCsv = () => {
    if (!tableRows.length) return;
    const header = ["Rank", "Nama", "Email", ...CRITERIA.map((c) => c.name), "Skor Akhir"];
    const csvRows = [
      header.join(","),
      ...tableRows.map((r) =>
        [
          r.rank,
          `"${r.name}"`,
          `"${r.email}"`,
          ...r.scores.map((s) => s.toFixed(2)),
          r.finalScore.toFixed(6),
        ].join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spk_ranking_${method}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update pairwise cell (upper triangle only, reciprocal enforced)
  const updatePairwise = (i: number, j: number, val: number) => {
    setPairwise((prev) => {
      const next = prev.map((row) => row.slice());
      next[i][j] = val;
      next[j][i] = 1 / val;
      return next;
    });
  };

  // Stats
  const avgScore = useMemo(() => {
    if (!rankingResult) return 0;
    const sum = rankingResult.ranking.reduce((a, r) => a + r.score, 0);
    return rankingResult.ranking.length > 0 ? sum / rankingResult.ranking.length : 0;
  }, [rankingResult]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #eef2ff 0%, #e8f0fe 30%, #f0fdf4 60%, #faf5ff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── HEADER ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Link
              to="/admin"
              className="p-2.5 hover:bg-white/70 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                Sistem Penunjang Keputusan
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-20 blur-3xl pointer-events-none"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)" }}
            />
            <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    SPK Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 max-w-2xl">
                    Analisis ranking pengguna menggunakan{" "}
                    <span className="font-semibold text-blue-700">AHP + TOPSIS/SAW</span> berdasarkan data real
                    dari database.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh Data
                </button>
              </div>

              {/* Stats cards */}
              {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Total User</span>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-900">{rawData.length}</div>
                  </div>
                  <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">Avg. Skor</span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-900">{avgScore.toFixed(4)}</div>
                  </div>
                  <div className="bg-violet-50/80 rounded-xl p-3 border border-violet-100">
                    <div className="flex items-center gap-2 text-violet-600 mb-1">
                      <Database className="w-4 h-4" />
                      <span className="text-xs font-semibold">Kriteria</span>
                    </div>
                    <div className="text-2xl font-extrabold text-violet-900">{CRITERIA.length}</div>
                  </div>
                  <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                      <Settings2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">Metode</span>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-900">{method.toUpperCase()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ERROR STATE ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-sm text-red-800">
            <div className="font-bold mb-1">⚠️ Gagal Mengambil Data</div>
            <div>{error}</div>
            <div className="mt-3 text-xs text-red-600">
              Pastikan kamu sudah menjalankan{" "}
              <code className="bg-red-100 px-1.5 py-0.5 rounded text-red-900 font-mono">sql_spk_analytics.sql</code>{" "}
              di Supabase SQL Editor.
            </div>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <div className="text-sm text-gray-500 font-medium">Mengambil data dari database...</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── CONFIGURATION PANEL ── */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm mb-6 overflow-hidden">
              <button
                onClick={() => setConfigOpen(!configOpen)}
                className="w-full flex items-center justify-between p-5 text-left"
                id="config-toggle"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Konfigurasi SPK</div>
                    <div className="text-xs text-gray-500">
                      Mode: {weightMode === "ahp" ? "AHP (Pairwise)" : "Manual"} • Metode:{" "}
                      {method.toUpperCase()} • CR: {ahpResult.cr.toFixed(4)}
                    </div>
                  </div>
                </div>
                {configOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {configOpen && (
                <div className="px-5 pb-5 space-y-5">
                  {/* Method selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weight mode */}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Mode Bobot</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWeightMode("ahp")}
                          className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                            weightMode === "ahp"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          AHP (Pairwise)
                        </button>
                        <button
                          onClick={() => setWeightMode("manual")}
                          className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                            weightMode === "manual"
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          Manual Slider
                        </button>
                      </div>
                    </div>

                    {/* Ranking method */}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Metode Ranking</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMethod("topsis")}
                          className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                            method === "topsis"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          TOPSIS
                        </button>
                        <button
                          onClick={() => setMethod("saw")}
                          className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                            method === "saw"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          SAW
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AHP Pairwise Matrix */}
                  {weightMode === "ahp" && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Pairwise Comparison Matrix</div>
                      <div className="overflow-x-auto">
                        <table className="text-xs border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 bg-gray-50 border border-gray-200 font-semibold text-gray-600"></th>
                              {CRITERIA.map((c, i) => (
                                <th
                                  key={i}
                                  className="p-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 whitespace-nowrap"
                                >
                                  {c.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {CRITERIA.map((ci, i) => (
                              <tr key={i}>
                                <td className="p-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 whitespace-nowrap">
                                  {ci.name}
                                </td>
                                {CRITERIA.map((_, j) => {
                                  const val = pairwise[i]?.[j] ?? 1;
                                  if (i === j) {
                                    return (
                                      <td key={j} className="p-2 border border-gray-200 bg-gray-100 text-center text-gray-400">
                                        1
                                      </td>
                                    );
                                  }
                                  if (j < i) {
                                    // Lower triangle — show reciprocal, read-only
                                    return (
                                      <td key={j} className="p-2 border border-gray-200 bg-gray-50 text-center text-gray-500 font-mono">
                                        {val < 1 ? `1/${Math.round(1 / val)}` : val.toFixed(0)}
                                      </td>
                                    );
                                  }
                                  // Upper triangle — editable
                                  return (
                                    <td key={j} className="p-1 border border-gray-200">
                                      <select
                                        value={closestSaatyIndex(val)}
                                        onChange={(e) => {
                                          const sVal = SAATY_SCALE[parseInt(e.target.value)].value;
                                          updatePairwise(i, j, sVal);
                                        }}
                                        className="w-full px-1.5 py-1 rounded border border-gray-200 bg-white text-center text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                                      >
                                        {SAATY_SCALE.map((s, si) => (
                                          <option key={si} value={si}>
                                            {s.label}
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

                      {/* CR info */}
                      <div
                        className={`mt-3 rounded-xl p-3 text-sm ${
                          ahpResult.cr <= 0.1
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-amber-50 border border-amber-200 text-amber-800"
                        }`}
                      >
                        <span className="font-semibold">Consistency Ratio (CR): {ahpResult.cr.toFixed(4)}</span>
                        {" — "}
                        {ahpResult.cr <= 0.1
                          ? "✅ Konsisten (CR ≤ 0.10)"
                          : "⚠️ Kurang konsisten (CR > 0.10), pertimbangkan revisi pairwise."}
                      </div>
                    </div>
                  )}

                  {/* Manual weight sliders */}
                  {weightMode === "manual" && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-3">Bobot Manual (relatif)</div>
                      <div className="space-y-3">
                        {CRITERIA.map((c, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-gray-700 font-medium truncate">{c.name}</div>
                            <input
                              type="range"
                              min="1"
                              max="9"
                              value={manualWeights[i]}
                              onChange={(e) => {
                                const next = [...manualWeights];
                                next[i] = parseInt(e.target.value);
                                setManualWeights(next);
                              }}
                              className="flex-1 accent-blue-600"
                            />
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {manualWeights[i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Normalized weights display */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Bobot Ternormalisasi</div>
                    <div className="flex flex-wrap gap-2">
                      {CRITERIA.map((c, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CRITERIA_COLORS[i] }}
                          />
                          <span className="font-medium text-gray-700">{c.name}:</span>
                          <span className="font-bold text-gray-900">{(weights[i] ?? 0).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── VISUALIZATIONS ── */}
            {rawData.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-12 text-center">
                <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-600 font-medium">Belum ada data user di database.</div>
                <div className="text-sm text-gray-400 mt-1">
                  Pastikan ada user yang terdaftar dengan resume dan riwayat download.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Bar Chart (2 cols) */}
                  <div className="lg:col-span-2">
                    <SpkBarChart data={barData} title="📊 Ranking Pengguna" />
                  </div>

                  {/* Pie Chart */}
                  <div>
                    <SpkPieChart data={pieData} title="🥧 Distribusi Bobot Kriteria" />
                  </div>
                </div>

                {/* Radar Chart + User selector */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                      <div className="text-base font-bold text-gray-900 mb-3">🕸️ Profil Kriteria User</div>
                      <div className="text-xs text-gray-500 mb-3">
                        Pilih user dari ranking untuk melihat profil multi-kriteria:
                      </div>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      >
                        {rankingResult?.ranking.map((r, i) => (
                          <option key={r.user.user_id} value={i}>
                            #{r.rank} — {r.user.full_name || r.user.email.split("@")[0]} (
                            {r.score.toFixed(4)})
                          </option>
                        ))}
                      </select>

                      {rankingResult && rankingResult.ranking[selectedUser] && (
                        <div className="mt-4 space-y-2 text-xs text-gray-600">
                          {CRITERIA.map((c, ci) => {
                            const val = (rankingResult.ranking[selectedUser].user as any)[c.key];
                            return (
                              <div key={ci} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: CRITERIA_COLORS[ci] }}
                                  />
                                  {c.name}
                                </div>
                                <span className="font-bold text-gray-900">
                                  {c.key === "days_since_last_activity"
                                    ? val >= 9999
                                      ? "Belum pernah"
                                      : `${val} hari`
                                    : val}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <SpkRadarChart
                      data={radarData}
                      title={`🕸️ Radar — ${
                        rankingResult?.ranking[selectedUser]?.user.full_name ||
                        rankingResult?.ranking[selectedUser]?.user.email.split("@")[0] ||
                        "User"
                      }`}
                      color={CRITERIA_COLORS[selectedUser % CRITERIA_COLORS.length]}
                      size={320}
                    />
                  </div>
                </div>

                {/* Ranking Table */}
                <SpkRankingTable
                  rows={tableRows}
                  criteriaNames={CRITERIA.map((c) => c.name)}
                  method={method}
                  onExportCsv={handleExportCsv}
                />

                {/* TOPSIS Details */}
                {method === "topsis" && rankingResult?.details && (
                  <details className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <summary className="cursor-pointer font-bold text-gray-900 text-sm">
                      📐 Detail TOPSIS (Ideal Best, Ideal Worst, D+, D−)
                    </summary>
                    <div className="mt-4 text-sm text-gray-700 space-y-2 font-mono">
                      <div>
                        <span className="font-semibold text-emerald-700">Ideal Best:</span>{" "}
                        {rankingResult.details.idealBest.map((v) => v.toFixed(6)).join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold text-rose-700">Ideal Worst:</span>{" "}
                        {rankingResult.details.idealWorst.map((v) => v.toFixed(6)).join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold">D+ (jarak ke ideal terbaik):</span>{" "}
                        {rankingResult.details.distanceBest.map((v) => v.toFixed(6)).join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold">D− (jarak ke ideal terburuk):</span>{" "}
                        {rankingResult.details.distanceWorst.map((v) => v.toFixed(6)).join(", ")}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* ── PROCESS DIAGRAM ── */}
            <div className="mt-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm overflow-hidden">
              <button
                onClick={() => setDiagramOpen(!diagramOpen)}
                className="w-full flex items-center justify-between p-5 text-left"
                id="diagram-toggle"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Diagram Proses SPK</div>
                    <div className="text-xs text-gray-500">Flowchart alur analisis Decision Support System</div>
                  </div>
                </div>
                {diagramOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {diagramOpen && (
                <div className="px-5 pb-5">
                  <MermaidBlock diagram={processDiagram} />
                </div>
              )}
            </div>

            {/* ── FOOTER NOTE ── */}
            <div className="mt-6 text-center text-xs text-gray-500">
              SPK Analytics Dashboard • Metode AHP + TOPSIS/SAW •{" "}
              <span className="font-semibold">Matkul Sistem Penunjang Keputusan</span> • FreeBuild CV
            </div>
          </>
        )}
      </div>
    </div>
  );
}
