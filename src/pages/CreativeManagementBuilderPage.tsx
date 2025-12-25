import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, X } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import type { CreativeManagementData } from "../types/creativeManagement";
import { initialCreativeManagementData } from "../types/creativeManagement";
import CreativeManagementForm from "../components/creative-management/CreativeManagementForm";
import CreativeManagementPreview from "../components/creative-management/CreativeManagementPreview";
import { CreativeManagementPDF } from "../components/creative-management/CreativeManagementPDF";

export default function CreativeManagementBuilderPage() {
  const [cvData, setCvData] = useState<CreativeManagementData>(initialCreativeManagementData);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
    const isiOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

    // Show SweetAlert2 instead of custom splash
    const htmlContent = isiOS && isSafari
      ? `
        <p class="text-gray-700 mb-3">Gunakan tombol <strong>Download PDF</strong> di atas untuk menyimpan CV kamu dalam bentuk PDF.</p>
        <p class="text-sm text-gray-600 mb-3">Untuk hasil terbaik, pastikan semua data sudah terisi dengan lengkap sebelum download.</p>
        <div class="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
          📱 <strong>Pengguna iPhone/iPad:</strong> Jika ingin menyimpan CV sebagai PDF dengan hasil yang lebih maksimal, disarankan menggunakan aplikasi <strong>Chrome</strong> di iOS, atau simpan/print dari laptop/PC.
        </div>
      `
      : `
        <p class="text-gray-700 mb-2">Gunakan tombol <strong>Download PDF</strong> di atas untuk menyimpan CV kamu dalam bentuk PDF.</p>
        <p class="text-sm text-gray-600">Untuk hasil terbaik, pastikan semua data sudah terisi dengan lengkap sebelum download.</p>
      `;

    Swal.fire({
      icon: 'info',
      title: 'Cara Menyimpan CV',
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

  const handleFormChange = (newData: CreativeManagementData) => {
    setCvData(newData);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<CreativeManagementPDF data={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cvData.fullName || "CV"}_Creative_Management.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CM</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Creative Management CV</span>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Membuat PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] print:hidden">
        {/* Form Section - Left Side */}
        <div className="w-full lg:w-1/2 overflow-y-auto bg-white border-r border-gray-200">
          <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 pb-24 lg:pb-8">
            <CreativeManagementForm data={cvData} onChange={handleFormChange} />
          </div>
        </div>

        {/* Preview Section - Right Side (Hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2 overflow-y-auto bg-gray-100 print:bg-white">
          <div className="sticky top-0 bg-gray-100 print:bg-white border-b border-gray-200 px-4 py-3 print:hidden">
            <h2 className="text-sm font-semibold text-gray-700">Preview CV</h2>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <CreativeManagementPreview data={cvData} />
          </div>
        </div>
      </div>

      {/* Floating Preview Button (Mobile Only) */}
      <button
        onClick={() => setShowPreviewModal(true)}
        className="lg:hidden fixed bottom-6 right-6 z-20 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Eye className="w-5 h-5" />
        <span className="font-medium">Preview CV</span>
      </button>

      {/* Preview Modal (Mobile Only) */}
      {
        showPreviewModal && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Preview CV</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Modal Content */}
            <div className="overflow-y-auto h-[calc(100vh-57px)] bg-gray-100 p-4">
              <CreativeManagementPreview data={cvData} />
            </div>
          </div>
        )
      }

      {/* Print View */}
      <div className="hidden print:block">
        <CreativeManagementPreview data={cvData} />
      </div>
    </div >
  );
}
