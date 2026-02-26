import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Eye, Wand2, Save, Loader2 } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import type { PortfolioData } from "../types/portfolio";
import { initialPortfolioData } from "../types/portfolio";
import { dummyPortfolioData } from "../lib/dummyData";
import PortfolioForm from "../components/portfolio/PortfolioForm";
import PortfolioPreview from "../components/portfolio/PortfolioPreview";
import { useAuth } from "../contexts/AuthContext";
import { checkAndRecordGuestDownload, checkAndRecordUserDownload, getRemainingDownloads } from "../lib/downloadCredit";
import { savePortfolioResume, getPortfolioResumeById } from "../lib/resumeService";

// A4 at 96 dpi
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export default function PortfolioBuilderPage() {
    const [portfolioData, setPortfolioData] =
        useState<PortfolioData>(initialPortfolioData);
    const [isDownloading, setIsDownloading] = useState(false);
    const [, setRemainingCredits] = useState<number | null>(null);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [resumeName, setResumeName] = useState("My Portfolio");

    // Refs for PDF capture
    const hiddenPreviewRef = useRef<HTMLDivElement>(null);  // outer A4 clip box
    const hiddenContentRef = useRef<HTMLDivElement>(null);  // inner content (gets scaled)

    // Load resume from DB if ID is present
    useEffect(() => {
        if (id && user) {
            getPortfolioResumeById(id).then(({ data, error }) => {
                if (data && data.portfolio_data) {
                    setPortfolioData(data.portfolio_data);
                    setResumeName(data.resume_name);
                } else if (error) {
                    console.error("Error loading portfolio:", error);
                    Swal.fire("Error", "Gagal memuat Portfolio. Mungkin Anda tidak memiliki akses.", "error");
                    navigate("/");
                }
            });
        }
    }, [id, user, navigate]);

    useEffect(() => {
        document.title = "Portfolio Builder - FreeBuild CV";
        window.scrollTo({ top: 0, behavior: "smooth" });

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        if (isIOS) {
            Swal.fire({
                icon: "warning",
                text: "untuk pengguna iphone disarankan menggunakan chrome agar bisa download pdf nya",
                timer: 5000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                customClass: {
                    popup: "rounded-2xl shadow-2xl",
                },
            });
        } else {
            Swal.fire({
                icon: "info",
                title: "Portfolio Builder",
                html: `
            <p class="text-gray-700 mb-2">Buat portofolio profesional untuk menampilkan proyek-proyek terbaikmu.</p>
            <p class="text-sm text-gray-600">Isi form di sebelah kiri, lihat preview di sebelah kanan, lalu download sebagai PDF.</p>
          `,
                confirmButtonText: "Mulai Buat Portfolio",
                showClass: { popup: "animate__animated animate__fadeInDown animate__faster", backdrop: "animate__animated animate__fadeIn" },
                hideClass: { popup: "animate__animated animate__fadeOutUp animate__faster", backdrop: "animate__animated animate__fadeOut" },
                customClass: {
                    popup: "rounded-2xl shadow-2xl",
                    title: "text-2xl font-bold",
                    htmlContainer: "text-left",
                    confirmButton: "px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-teal-600 hover:bg-teal-700 text-white",
                },
                buttonsStyling: false,
            });
        }
    }, []);

    useEffect(() => {
        getRemainingDownloads(!!user).then(info => setRemainingCredits(info.remaining));
    }, [user]);



    const handleFormChange = (newData: PortfolioData) => setPortfolioData(newData);

    const handleFillDummy = () => {
        setPortfolioData(dummyPortfolioData);
    };

    const handleDownloadPDF = async () => {
        // Download credit check
        const isLoggedIn = !!user;
        if (isLoggedIn) {
            const result = await checkAndRecordUserDownload('portfolio', resumeName || portfolioData.fullName || 'Untitled');
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
            setRemainingCredits(result.max - result.count);
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
            setRemainingCredits(result.max - result.count);
        }

        const captureBox = hiddenPreviewRef.current;
        const contentEl = hiddenContentRef.current;
        if (!captureBox || !contentEl) return;

        setIsDownloading(true);
        try {
            // 1. Reset everything
            contentEl.style.transform = "none";
            captureBox.style.height = "auto";
            captureBox.style.overflow = "visible";

            const targetRatio = A4_HEIGHT_PX / A4_WIDTH_PX; // ~1.4143

            // 2. Binary search for optimal width where height/width <= A4 ratio
            let minW = A4_WIDTH_PX;
            let maxW = 3000;
            let bestW = A4_WIDTH_PX;

            for (let i = 0; i < 10; i++) {
                const midW = (minW + maxW) / 2;
                contentEl.style.width = `${midW}px`;
                captureBox.style.width = `${midW}px`;
                // Read scrollHeight to force synchronous layout
                const h = contentEl.scrollHeight;

                if (h / midW > targetRatio) {
                    // Text is too un-wrapped, making it taller than A4 ratio -> go wider
                    minW = midW;
                } else {
                    // It fits within A4 ratio, look for a tighter (smaller) width
                    bestW = midW;
                    maxW = midW;
                }
            }

            // 3. Apply the optimal width
            contentEl.style.width = `${bestW}px`;
            captureBox.style.width = `${bestW}px`;

            // KEY FIX for missing footer: 
            // Force the container's physical height to exactly match A4 proportions.
            // This ensures flex-1 pushes the footer all the way to the bottom!
            const captureHeight = Math.ceil(bestW * targetRatio);
            contentEl.style.minHeight = `${captureHeight}px`;

            await new Promise((r) => setTimeout(r, 50));

            // 4. Scale down the entire perfectly-proportioned container to fit A4 exactly
            const finalScale = A4_WIDTH_PX / bestW;
            contentEl.style.transform = `scale(${finalScale})`;
            contentEl.style.transformOrigin = "top left";

            // Wait for browser transform
            await new Promise((r) => setTimeout(r, 100));

            // 5. Capture the exactly A4-sized visual viewport
            const canvas = await html2canvas(captureBox, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#ffffff",
                logging: false,
                width: A4_WIDTH_PX,
                height: A4_HEIGHT_PX,
                windowWidth: A4_WIDTH_PX,
            });

            // 6. Reset everything
            contentEl.style.transform = "none";
            contentEl.style.width = `${A4_WIDTH_PX}px`;
            contentEl.style.minHeight = "auto";
            captureBox.style.width = `${A4_WIDTH_PX}px`;
            captureBox.style.height = `${A4_HEIGHT_PX}px`;
            captureBox.style.overflow = "hidden";

            // 5. The captured canvas is exactly A4 proportions → fill the PDF page
            const pdfDoc = new jsPDF("portrait", "mm", "a4");
            const pdfW = pdfDoc.internal.pageSize.getWidth();
            const pdfH = pdfDoc.internal.pageSize.getHeight();
            const imgData = canvas.toDataURL("image/png", 1.0);

            pdfDoc.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
            pdfDoc.save(`${portfolioData.fullName || "Portfolio"}_Portfolio.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "Gagal membuat PDF. Silakan coba lagi.",
                confirmButtonText: "OK",
                customClass: { confirmButton: "px-6 py-3 rounded-xl font-semibold bg-red-600 text-white" },
                buttonsStyling: false,
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        let finalName = resumeName;
        if (!id) {
            const { value: name } = await Swal.fire({
                title: 'Simpan Portfolio',
                input: 'text',
                inputLabel: 'Nama Portfolio',
                inputValue: 'My Portfolio',
                showCancelButton: true,
                confirmButtonText: 'Simpan',
                cancelButtonText: 'Batal',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-teal-600 text-white',
                    cancelButton: 'px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-700',
                },
                buttonsStyling: false,
                inputValidator: (value) => {
                    if (!value) return 'Nama Portfolio tidak boleh kosong!';
                }
            });
            if (!name) return;
            finalName = name;
            setResumeName(name);
        }

        setIsSaving(true);
        const { data, error } = await savePortfolioResume(finalName, portfolioData, id);
        setIsSaving(false);

        if (error) {
            Swal.fire('Error', error.message || 'Gagal menyimpan Portfolio', 'error');
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Portfolio berhasil disimpan ke riwayat Anda.',
                timer: 2000,
                showConfirmButton: false
            });
            if (!id && data) {
                navigate(`/builder/portfolio/${data.id}`, { replace: true });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">P</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">Portfolio Builder</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {user?.user_metadata?.is_admin && (
                                <button
                                    onClick={handleFillDummy}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-all font-medium text-sm"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Isi Data Dummy
                                </button>
                            )}
                            {user && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? "Menyimpan..." : "Simpan"}
                                </button>
                            )}
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                {isDownloading ? "Membuat PDF..." : "Download PDF"}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Split Screen */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
                {/* Form */}
                <div className="w-full lg:w-1/2 overflow-y-auto bg-white border-r border-gray-200">
                    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 pb-24 lg:pb-8">
                        <PortfolioForm data={portfolioData} onChange={handleFormChange} />
                    </div>
                </div>
                {/* Screen Preview */}
                <div className="hidden lg:block lg:w-1/2 overflow-y-auto bg-gray-100">
                    <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3">
                        <h2 className="text-sm font-semibold text-gray-700">Preview Portfolio</h2>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <PortfolioPreview data={portfolioData} />
                    </div>
                </div>
            </div>

            {/* Mobile floating preview */}
            <button
                onClick={() => {
                    sessionStorage.setItem("portfolioPreviewData", JSON.stringify(portfolioData));
                    navigate("/builder/portfolio/preview");
                }}
                className="lg:hidden fixed bottom-6 right-6 z-20 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
                <Eye className="w-5 h-5" />
                <span className="font-medium">Preview</span>
            </button>

            {/*
        Off-screen PDF capture.
        - Outer: fixed A4 box (794×1123px), overflow hidden → clips to 1 page
        - Inner: renders at 794px width, natural height.
          On download, CSS transform:scale() shrinks it to fit A4 height.
        - html2canvas captures 794×1123 → addImage fills full A4 page
        - Result: no stretch, no white bars, proportional scaling
      */}
            <div
                ref={hiddenPreviewRef}
                style={{
                    position: "fixed",
                    left: "-9999px",
                    top: 0,
                    width: `${A4_WIDTH_PX}px`,
                    height: `${A4_HEIGHT_PX}px`,
                    overflow: "hidden",
                    backgroundColor: "white",
                    zIndex: -1,
                }}
            >
                <div
                    ref={hiddenContentRef}
                    style={{
                        width: `${A4_WIDTH_PX}px`,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <PortfolioPreview data={portfolioData} fullHeight />
                </div>
            </div>
        </div>
    );
}
