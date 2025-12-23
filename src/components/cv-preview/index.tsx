import { useEffect, useState } from "react";
import type { CVData } from "../../types";
import { ArrowLeft, Printer } from "lucide-react";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import PreviewHeader from "./PreviewHeader";
import PreviewEducation from "./PreviewEducation";
import PreviewExperience from "./PreviewExperience";
import PreviewBootcamp from "./PreviewBootcamp";
import PreviewSkills from "./PreviewSkills";
import PreviewAwards from "./PreviewAwards";
import PreviewHobby from "./PreviewHobby";

interface CVPreviewProps {
  data: CVData;
  onBack: () => void;
  onPrint: () => void;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
};

export default function CVPreview({ data, onBack, onPrint }: CVPreviewProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  // Pastikan saat masuk ke halaman preview, posisi scroll di atas dan tampilkan splash sekali
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
    const isiOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

    setIsIOSSafari(isiOS && isSafari);
    setShowSplash(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white relative">
      {/* Splash alert khusus halaman preview */}
      {showSplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button type="button" onClick={() => setShowSplash(false)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" aria-label="Tutup pemberitahuan">
              ✕
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-xl">ℹ️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Cara Menyimpan CV</h2>
                <p className="text-sm text-gray-700 mb-2">
                  Gunakan tombol <strong>Print / Save as PDF</strong> di atas untuk menyimpan CV kamu dalam bentuk PDF.
                </p>
                <p className="text-xs text-gray-600 mb-2">Untuk hasil terbaik, pastikan ukuran kertas A4 dan orientasi Portrait saat menyimpan atau mencetak.</p>
                {isIOSSafari && (
                  <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-900">
                    📱 <strong>Pengguna iPhone/iPad:</strong> Jika ingin menyimpan CV sebagai PDF dengan hasil yang lebih maksimal, disarankan menggunakan aplikasi
                    <strong> Chrome</strong> di iOS, atau simpan/print dari laptop/PC.
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

      <nav className="print:hidden sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
          <button onClick={onBack} className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Form
          </button>
          <button onClick={onPrint} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
            <Printer className="w-5 h-5" />
            Print / Save as PDF
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none my-4 print:my-0">
        <article className="p-8 md:p-10 print:p-[0.75in] font-serif">
          <PreviewHeader
            profilePhoto={data.profilePhoto}
            fullName={data.fullName}
            phone={data.phone}
            email={data.email}
            linkedin={data.linkedin}
            showLinkedinUnderline={data.showLinkedinUnderline}
            portfolio={data.portfolio}
            showPortfolioUnderline={data.showPortfolioUnderline}
            address={data.address}
          />

          {data.summary && (
            <section className="mb-5">
              <div className="cv-content text-sm text-black leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
            </section>
          )}

          <PreviewEducation education={data.education} formatDate={formatDate} />
          <PreviewExperience experiences={data.experiences} formatDate={formatDate} />
          <PreviewBootcamp bootcamps={data.bootcamps} formatDate={formatDate} />
          <PreviewSkills skills={data.skills} />
          <PreviewAwards awards={data.awards} />
          <PreviewHobby hobbies={data.hobbies} />

          {!data.fullName && !data.summary && data.experiences.length === 0 && data.education.length === 0 && (
            <div className="text-center py-12 text-gray-500 print:hidden">
              <p className="text-lg">Belum ada data CV</p>
              <p className="text-sm mt-1">Kembali ke form untuk mengisi data CV Anda</p>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
