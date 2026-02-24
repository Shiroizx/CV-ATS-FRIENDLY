import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function EmailConfirmedPage() {
    const [isProcessing, setIsProcessing] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Email Terkonfirmasi - FreeBuild CV";

        const handleConfirmation = async () => {
            // Ketika pengguna mendarat di sini, kemungkinan besar sesi mereka baru saja dibuat otomatis.
            // Sesuai permintaan: Dilarang langsung *login*, pengguna harus masuk manual terlebih dahulu.
            // Karena itu, jika ada sesi aktif, kita perlu logout pengguna.

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.auth.signOut();
            }

            // Hapus parameter URL agar tidak ada link-link sisa (seperti access_token) muncul.
            if (window.location.hash || window.location.search) {
                window.history.replaceState(null, "", window.location.pathname);
            }

            setIsProcessing(false);
        };

        handleConfirmation();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-12 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-[80px] -z-0"></div>

                    <div className="relative z-10">
                        {isProcessing ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                                <h2 className="text-xl font-bold text-gray-900">Memverifikasi Email...</h2>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-fadeIn">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                                    Email Berhasil Dikonfirmasi!
                                </h2>
                                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                                    Selamat, proses verifikasi akun Anda telah selesai. Mulai sekarang, Anda dapat membuat CV dan Portofolio impian.
                                </p>

                                <Link
                                    to="/login"
                                    className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Masuk Sekarang
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
