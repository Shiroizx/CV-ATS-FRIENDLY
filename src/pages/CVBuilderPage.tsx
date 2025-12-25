import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import type { CVData } from "../types";
import { initialCVData } from "../types";
import CVForm from "../components/cv-form";
import CVPreview from "../components/cv-preview";

export default function CVBuilderPage() {
  const navigate = useNavigate();
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Selalu mulai dari posisi paling atas saat halaman builder dibuka
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
    const isiOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

    // Show SweetAlert2 instead of custom splash
    const htmlContent = isiOS && isSafari
      ? `
        <p class="text-gray-700 mb-3">Aplikasi ini masih dalam tahap pengembangan. Tampilan dan fitur bisa berubah sewaktu-waktu, tapi kamu sudah bisa mulai membuat CV sekarang.</p>
        <div class="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
          <strong>Catatan untuk pengguna iPhone/iPad (Safari):</strong> Saat menyimpan CV ke PDF, Safari mungkin tetap menampilkan header dan footer bawaan browser. Untuk hasil terbaik, kamu bisa mencoba menggunakan aplikasi <strong>Chrome</strong> di iOS atau melakukan print dari laptop/PC.
        </div>
      `
      : `
        <p class="text-gray-700">Aplikasi ini masih dalam tahap pengembangan. Tampilan dan fitur bisa berubah sewaktu-waktu, tapi kamu sudah bisa mulai membuat CV sekarang.</p>
      `;

    Swal.fire({
      icon: 'info',
      title: 'Selamat datang di CV ATS Builder (BETA)',
      html: htmlContent,
      confirmButtonText: 'Mengerti',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
        backdrop: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
        backdrop: 'animate__animated animate__fadeOut'
      },
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-2xl font-bold',
        htmlContainer: 'text-left',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white',
      },
      buttonsStyling: false,
    });
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
      {isPreviewMode ? <CVPreview data={cvData} onBack={handleBackToForm} onPrint={handlePrint} /> : <CVForm data={cvData} onChange={handleFormChange} onPreview={handlePreview} onBackToHome={handleBackToHome} />}
    </div>
  );
}
