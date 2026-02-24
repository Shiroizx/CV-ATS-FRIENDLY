import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Loader2, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getRemainingDownloads, getDownloadHistory, type DownloadHistoryItem } from "../lib/downloadCredit";

const templateLabels: Record<string, string> = {
    ats_builder: "CV ATS Builder",
    creative_management: "Creative Management",
    portfolio: "Portfolio",
};

export default function DownloadHistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
    const [creditInfo, setCreditInfo] = useState<{ count: number; max: number; remaining: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Riwayat Download - FreeBuild CV";
        if (!user) { setLoading(false); return; }

        Promise.all([
            getDownloadHistory(),
            getRemainingDownloads(true),
        ]).then(([hist, credit]) => {
            setHistory(hist);
            setCreditInfo(credit);
            setLoading(false);
        });
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500 mb-6">Silakan login untuk melihat riwayat download Anda.</p>
                    <Link to="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Login Sekarang
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Download className="w-8 h-8 text-blue-600" />
                        Riwayat Download
                    </h1>
                    <p className="text-gray-600 mt-2">Lihat detail penggunaan kredit download Anda.</p>
                </div>

                {/* Credit Summary Card */}
                {creditInfo && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Kredit Download Terpakai</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {creditInfo.count}<span className="text-gray-400 text-lg font-normal">/{creditInfo.max}</span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${creditInfo.remaining === 0
                                        ? "bg-red-500"
                                        : creditInfo.remaining <= 2
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                    }`}
                                style={{ width: `${(creditInfo.count / creditInfo.max) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Sisa <strong>{creditInfo.remaining}</strong> kredit download tersedia
                        </p>
                    </div>
                )}

                {/* History List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Detail Penggunaan</h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                            <p className="text-gray-500 text-sm">Memuat riwayat...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum Ada Riwayat</h3>
                            <p className="text-gray-500 text-sm">Riwayat download akan muncul di sini setelah Anda mengunduh CV.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {history.map((item) => (
                                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Download className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.resume_name || "Untitled"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {templateLabels[item.template_type] || item.template_type}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 flex-shrink-0">
                                        {new Date(item.downloaded_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
