import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CVData } from "../types";
import { initialCVData } from "../types";
import CVForm from "../components/cv-form";
import CVPreview from "../components/cv-preview";

export default function CVBuilderPage() {
  const navigate = useNavigate();
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  useEffect(() => {
    // Selalu mulai dari posisi paling atas saat halaman builder dibuka
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
    const isiOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

    setIsIOSSafari(isiOS && isSafari);
    setShowSplash(true);
  }, []);

  const handleFormChange = (data: CVData) => {
    setCVData(data);
  };

  const handlePreview = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsPreviewMode(true);
  };

  const handleBackToForm = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsPreviewMode(false);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handlePrint = () => {
    window.scrollTo(0, 0);
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white relative">
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button type="button" onClick={() => setShowSplash(false)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Tutup pemberitahuan">
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-xl">ℹ️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Selamat datang di CV ATS Builder (BETA)</h2>
                <p className="text-sm text-gray-700 mb-2">Aplikasi ini masih dalam tahap pengembangan. Tampilan dan fitur bisa berubah sewaktu-waktu, tapi kamu sudah bisa mulai membuat CV sekarang.</p>
                {isIOSSafari && (
                  <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-900">
                    <strong>Catatan untuk pengguna iPhone/iPad (Safari):</strong> Saat menyimpan CV ke PDF, Safari mungkin tetap menampilkan header dan footer bawaan browser. Untuk hasil terbaik, kamu bisa mencoba menggunakan aplikasi{" "}
                    <strong>Chrome</strong> di iOS atau melakukan print dari laptop/PC.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSplash(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewMode ? <CVPreview data={cvData} onBack={handleBackToForm} onPrint={handlePrint} /> : <CVForm data={cvData} onChange={handleFormChange} onPreview={handlePreview} onBackToHome={handleBackToHome} />}
    </div>
  );
}
