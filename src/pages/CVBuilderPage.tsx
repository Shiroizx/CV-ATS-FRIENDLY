import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import type { CVData } from "../types";
import { initialCVData } from "../types";
import CVForm from "../components/cv-form";
import CVPreview from "../components/cv-preview";
import { useAuth } from "../contexts/AuthContext";
import { checkAndRecordGuestDownload, checkAndRecordUserDownload } from "../lib/downloadCredit";
import { saveResume, getResumeById } from "../lib/resumeService";

export default function CVBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [resumeName, setResumeName] = useState("My Resume");

  // Fetch specific resume if ID is present
  useEffect(() => {
    if (id && user) {
      getResumeById(id).then(({ data, error }) => {
        if (data && data.template_type === 'ats_builder') {
          setCVData(data.cv_data);
          setResumeName(data.resume_name);
        } else if (error) {
          console.error("Error loading resume:", error);
          Swal.fire("Error", "Gagal memuat CV. Mungkin Anda tidak memiliki akses.", "error");
          navigate("/");
        }
      });
    }
  }, [id, user, navigate]);

  useEffect(() => {
    document.title = "CV ATS Builder - FreeBuild CV";
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

  const handlePrint = async () => {
    const isLoggedIn = !!user;

    if (isLoggedIn) {
      const result = await checkAndRecordUserDownload('ats_builder', resumeName || cvData.fullName || 'Untitled');
      if (!result.allowed) {
        Swal.fire({
          icon: 'error',
          title: 'Batas Download Tercapai',
          html: `Anda sudah menggunakan <strong>${result.count}/${result.max}</strong> kredit download. Batas maksimal telah tercapai.`,
          confirmButtonText: 'Mengerti',
          customClass: { popup: 'rounded-2xl', confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white' },
          buttonsStyling: false,
        });
        return;
      }
    } else {
      const result = await checkAndRecordGuestDownload();
      if (!result.allowed) {
        Swal.fire({
          icon: 'warning',
          title: 'Kredit Download Habis',
          html: `Anda sudah menggunakan <strong>${result.count}/${result.max}</strong> download gratis. <br/><br/>Login untuk mendapatkan <strong>3 kredit ekstra</strong>!`,
          confirmButtonText: 'Login Sekarang',
          showCancelButton: true,
          cancelButtonText: 'Nanti Saja',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
            cancelButton: 'px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-700',
          },
          buttonsStyling: false,
        }).then((res) => {
          if (res.isConfirmed) navigate('/login');
        });
        return;
      }
    }

    window.scrollTo(0, 0);
    window.print();
  };

  const handleSave = async () => {
    if (!user) return;

    let finalName = resumeName;
    if (!id) {
      const { value: name } = await Swal.fire({
        title: 'Simpan CV',
        input: 'text',
        inputLabel: 'Nama CV',
        inputValue: 'My Resume',
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (!value) return 'Nama CV tidak boleh kosong!';
        }
      });
      if (!name) return;
      finalName = name;
      setResumeName(name);
    }

    setIsSaving(true);
    const { data, error } = await saveResume('ats_builder', finalName, cvData, id);
    setIsSaving(false);

    if (error) {
      Swal.fire('Error', error.message || 'Gagal menyimpan CV', 'error');
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'CV berhasil disimpan ke riwayat Anda.',
        timer: 2000,
        showConfirmButton: false
      });
      if (!id && data) {
        navigate(`/cv-builder/${data.id}`, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white relative">
      {isPreviewMode ? (
        <CVPreview
          data={cvData}
          onBack={handleBackToForm}
          onPrint={handlePrint}
          onSave={handleSave}
          isSaving={isSaving}
          isLoggedIn={!!user}
        />
      ) : (
        <CVForm
          data={cvData}
          onChange={handleFormChange}
          onPreview={handlePreview}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}
