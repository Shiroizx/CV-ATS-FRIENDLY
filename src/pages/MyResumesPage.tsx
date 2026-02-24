import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserResumes, deleteResume, type SavedResume } from "../lib/resumeService";
import Swal from "sweetalert2";
import { FileText, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function MyResumesPage() {
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchResumes = async () => {
        setLoading(true);
        const { data, error } = await getUserResumes();
        if (error) {
            Swal.fire("Error", "Gagal memuat riwayat CV", "error");
        } else if (data) {
            setResumes(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        document.title = "Riwayat CV - FreeBuild CV";
        fetchResumes();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        const { isConfirmed } = await Swal.fire({
            title: "Hapus CV?",
            text: `Anda yakin ingin menghapus CV "${name}"? Tindakan ini tidak dapat dibatalkan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (isConfirmed) {
            const { error } = await deleteResume(id);
            if (error) {
                Swal.fire("Gagal", "Gagal menghapus CV", "error");
            } else {
                Swal.fire("Terhapus!", "CV berhasil dihapus.", "success");
                setResumes((prev) => prev.filter((r) => r.id !== id));
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-500 mb-6">Silakan login untuk melihat riwayat CV Anda.</p>
                    <Link to="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Login Sekarang
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Riwayat CV
                        </h1>
                        <p className="text-gray-600 mt-2">Kelola CV ATS yang pernah Anda buat sebelumnya.</p>
                    </div>
                    <Link
                        to="/cv-builder"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Buat CV Baru
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-500">Memuat riwayat CV Anda...</p>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada CV</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Anda belum menyimpan CV apapun. Mulai buat CV profesional Anda sekarang!</p>
                        <Link
                            to="/cv-builder"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Buat CV Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div key={resume.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-50 p-3 rounded-xl">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            {resume.template_type === 'ats_builder' ? 'ATS Friendly' : resume.template_type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={resume.resume_name}>
                                        {resume.resume_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Diperbarui: {new Date(resume.updated_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>

                                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-50">
                                        <button
                                            onClick={() => navigate(`/cv-builder/${resume.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors rounded-lg text-sm font-medium"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(resume.id, resume.resume_name)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-lg"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
