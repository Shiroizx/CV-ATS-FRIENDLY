import { useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
    useEffect(() => {
        document.title = "Syarat & Ketentuan - FreeBuild CV";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/register" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Kembali">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Syarat & Ketentuan</h1>
                    </div>

                    <div className="prose prose-blue max-w-none text-gray-600">
                        <p className="text-sm border-b pb-4 mb-6 text-gray-500">
                            Terakhir diperbarui: 24 Februari 2026
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Penerimaan Syarat</h2>
                        <p>
                            Dengan mengakses dan menggunakan <strong>FreeBuild CV</strong>, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan untuk menggunakan layanan kami.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Deskripsi Layanan</h2>
                        <p>
                            FreeBuild CV adalah layanan berbasis web yang memungkinkan pengguna untuk membuat, mengedit, dan mengunduh Curriculum Vitae (CV) ATS-Friendly secara gratis. Kami menyediakan template desain dan alat pemformatan untuk mempermudah pembuatan CV.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Kewajiban Pengguna</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Anda bertanggung jawab atas keakuratan dan kebenaran data yang Anda masukkan ke dalam CV.</li>
                            <li>Anda setuju untuk tidak menggunakan layanan ini untuk tujuan penipuan, pemalsuan identitas, atau aktivitas ilegal lainnya.</li>
                            <li>Anda bertanggung jawab untuk menjaga kerahasiaan informasi login akun Anda.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Kebijakan Kredit Download</h2>
                        <p>
                            Kami menerapkan sistem kredit untuk pengunduhan PDF untuk menjaga kualitas layanan:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Pengguna Tamu (Guest):</strong> Diberikan kuota terbatas secara gratis.</li>
                            <li><strong>Pengguna Terdaftar:</strong> Diberikan kuota tambahan yang lebih besar setelah mendaftar dan login.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Batasan Tanggung Jawab</h2>
                        <p>
                            FreeBuild CV disediakan "sebagaimana adanya". Kami tidak menjamin bahwa penggunaan CV yang dihasilkan menggunakan layanan kami akan menghasilkan tawaran wawancara kerja atau pekerjaan. Kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan ini.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Perubahan Syarat</h2>
                        <p>
                            Kami berhak untuk mengubah, memodifikasi, atau mengganti Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
                        </p>

                        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm m-0">
                                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di <a href="mailto:support@freebuildcv.com" className="text-blue-600 hover:underline">support@freebuildcv.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
