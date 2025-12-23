import type { CVData } from "../../types";
import { ArrowLeft, Printer } from "lucide-react";
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
  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
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
        <div className="max-w-4xl mx-auto px-4 py-2 bg-blue-50 border-t border-blue-200 text-sm text-blue-800">
          <p>
            💡 <strong>Tips:</strong> Klik <strong>"Print"</strong> lalu pilih <strong>"Save as PDF"</strong> untuk menyimpan CV Anda.
          </p>
          <p className="mt-1 text-xs">
            📱 <strong>iOS/iPhone:</strong> Gunakan browser <strong>Chrome</strong> untuk hasil terbaik, atau gunakan desktop untuk kontrol penuh.
          </p>
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
              <div className="cv-content text-sm text-black leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: data.summary }} />
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
