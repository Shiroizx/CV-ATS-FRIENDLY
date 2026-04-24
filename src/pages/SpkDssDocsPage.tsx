import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import MermaidBlock from "../components/spk/MermaidBlock";

const useCase = `flowchart LR
actorUser["User"]
actorAdmin["Admin"]
spkSystem["SPK_DSS_Module"]

actorUser -->|"Input_kriteria_alternatif"| spkSystem
actorUser -->|"Pilih_metode_bobot"| spkSystem
actorUser -->|"Proses_ranking"| spkSystem
actorUser -->|"Lihat_hasil"| spkSystem
actorUser -->|"Export_CSV"| spkSystem

actorAdmin -->|"Semua_aksi_user"| spkSystem
`;

const activity = `flowchart TD
startNode([Start]) --> inputCriteria[Input_kriteria_(benefit/cost)]
inputCriteria --> weightMode{Pilih_bobot}
weightMode -->|AHP| pairwise[Isi_pairwise_matrix]
pairwise --> calcAHP[Hitung_bobot_AHP_&_CR]
weightMode -->|Manual| manual[Isi_bobot_manual]
manual --> normalizeW[Normalisasi_bobot]
calcAHP --> inputAlt[Input_alternatif_&_nilai]
normalizeW --> inputAlt
inputAlt --> validate[Validasi_data]
validate --> computeRank[Hitung_ranking_(TOPSIS/SAW)]
computeRank --> showResult[Tampilkan_hasil_&_detail]
showResult --> export[Export_CSV_(opsional)]
export --> endNode([End])
`;

const sequence = `sequenceDiagram
participant User
participant UI
participant Engine as SPK_Engine
participant Store as LocalStorage

User->>UI: Isi_kriteria,_bobot,_alternatif,_nilai
UI->>Store: Simpan_state_otomatis
User->>UI: Klik_Hitung
UI->>Engine: compute(AHP/Manual_weights,_TOPSIS/SAW)
Engine-->>UI: ranking_+_detail_perhitungan
UI-->>User: Tampilkan_hasil
User->>UI: Export_CSV
UI-->>User: File_CSV_terunduh
`;

const dfd0 = `flowchart LR
User["User"] -->|"Data_kriteria,_alternatif,_nilai"| System["SPK_DSS_System"]
System -->|"Hasil_ranking_&_report"| User
System -->|"Simpan_state"| Store["LocalStorage"]
Store -->|"Load_state"| System
`;

const erd = `erDiagram
CRITERION {
  string id
  string name
  string type
}
ALTERNATIVE {
  string id
  string name
}
SCORE {
  string alternativeId
  string criterionId
  float value
}
RUN {
  string id
  string weightMode
  string method
  datetime createdAt
}

CRITERION ||--o{ SCORE : has
ALTERNATIVE ||--o{ SCORE : has
RUN ||--o{ SCORE : uses
`;

export default function SpkDssDocsPage() {
  useEffect(() => {
    document.title = "SPK / DSS Docs - FreeBuild CV";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/spk" className="p-2 hover:bg-white/70 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">Diagram & Dokumentasi DSS</div>
            <div className="text-sm text-gray-600">
              Diagram siap pakai untuk laporan matakuliah Sistem Penunjang Keputusan.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-lg font-bold text-gray-900">Ringkasan DSS</div>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  Modul ini adalah <span className="font-semibold">Decision Support System (DSS)</span> untuk membantu
                  pengambilan keputusan multi-kriteria (MCDM) dengan menghasilkan <span className="font-semibold">ranking</span>{" "}
                  alternatif.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-semibold">AHP</span> dipakai untuk menghitung bobot kriteria dari pairwise
                    comparison dan mengecek konsistensi (CR).
                  </li>
                  <li>
                    <span className="font-semibold">TOPSIS</span> menghitung kedekatan alternatif terhadap solusi ideal
                    terbaik/terburuk.
                  </li>
                  <li>
                    <span className="font-semibold">SAW</span> disediakan sebagai metode pembanding sederhana.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-xl font-extrabold text-gray-900">Use Case Diagram</div>
              <MermaidBlock diagram={useCase} />
            </section>

            <section className="space-y-3">
              <div className="text-xl font-extrabold text-gray-900">Activity Diagram</div>
              <MermaidBlock diagram={activity} />
            </section>

            <section className="space-y-3">
              <div className="text-xl font-extrabold text-gray-900">Sequence Diagram</div>
              <MermaidBlock diagram={sequence} />
            </section>

            <section className="space-y-3">
              <div className="text-xl font-extrabold text-gray-900">Context / DFD Level 0</div>
              <MermaidBlock diagram={dfd0} />
            </section>

            <section className="space-y-3">
              <div className="text-xl font-extrabold text-gray-900">ERD (Konseptual)</div>
              <MermaidBlock diagram={erd} />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="font-bold text-gray-900 mb-2">Catatan untuk Laporan</div>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <span className="font-semibold">Konsistensi AHP</span>: biasanya dianggap baik jika CR ≤ 0.10.
                </div>
                <div>
                  <span className="font-semibold">Benefit/Cost</span>: Benefit makin besar makin baik; Cost makin kecil makin baik.
                </div>
                <div>
                  <span className="font-semibold">Data</span>: modul ini menyimpan state di localStorage (bukan database).
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="font-bold text-gray-900 mb-2">Cara Pakai</div>
              <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                <li>Isi kriteria (benefit/cost).</li>
                <li>Pilih bobot (AHP atau manual).</li>
                <li>Isi alternatif dan nilai.</li>
                <li>Lihat hasil dan export CSV.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

