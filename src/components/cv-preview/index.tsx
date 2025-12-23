import { useState, useRef } from 'react';
import type { CVData } from '../../types';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PreviewHeader from './PreviewHeader';
import PreviewEducation from './PreviewEducation';
import PreviewExperience from './PreviewExperience';
import PreviewBootcamp from './PreviewBootcamp';
import PreviewSkills from './PreviewSkills';
import PreviewAwards from './PreviewAwards';
import PreviewHobby from './PreviewHobby';

interface CVPreviewProps {
    data: CVData;
    onBack: () => void;
    onPrint: () => void;
}

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
        return dateString;
    }
};

export default function CVPreview({ data, onBack, onPrint }: CVPreviewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const cvRef = useRef<HTMLElement>(null);

    const downloadPDF = async () => {
        if (!cvRef.current) return;

        setIsGenerating(true);

        try {
            const element = cvRef.current;

            // Create canvas from the CV content
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');

            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            // Calculate dimensions to fit A4
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // If content is taller than one page, we need to handle multiple pages
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // Generate filename from user's name
            const fileName = data.fullName
                ? `CV_${data.fullName.replace(/\s+/g, '_')}.pdf`
                : 'CV_Curriculum_Vitae.pdf';

            // Get PDF as blob for more reliable download
            const pdfBlob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(pdfBlob);

            // Create a link and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);

            // Try to click the link
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal membuat PDF. Silakan coba lagi atau gunakan tombol Print.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white">
            <nav className="print:hidden sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Form
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadPDF}
                            disabled={isGenerating}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Membuat PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                        <button
                            onClick={onPrint}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
                    💡 <strong>Tips:</strong> Gunakan tombol <strong>"Download PDF"</strong> untuk mobile, atau <strong>"Print"</strong> untuk desktop.
                </div>
            </nav>

            <main className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:max-w-none my-4 print:my-0">
                <article ref={cvRef} className="p-8 md:p-10 print:p-[0.75in] font-serif">
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
                            <div
                                className="cv-content text-sm text-black leading-relaxed text-justify"
                                dangerouslySetInnerHTML={{ __html: data.summary }}
                            />
                        </section>
                    )}

                    <PreviewEducation education={data.education} formatDate={formatDate} />
                    <PreviewExperience experiences={data.experiences} formatDate={formatDate} />
                    <PreviewBootcamp bootcamps={data.bootcamps} formatDate={formatDate} />
                    <PreviewSkills skills={data.skills} />
                    <PreviewAwards awards={data.awards} />
                    <PreviewHobby hobbies={data.hobbies} />

                    {!data.fullName &&
                        !data.summary &&
                        data.experiences.length === 0 &&
                        data.education.length === 0 && (
                            <div className="text-center py-12 text-gray-500 print:hidden">
                                <p className="text-lg">Belum ada data CV</p>
                                <p className="text-sm mt-1">
                                    Kembali ke form untuk mengisi data CV Anda
                                </p>
                            </div>
                        )}
                </article>
            </main>
        </div>
    );
}
