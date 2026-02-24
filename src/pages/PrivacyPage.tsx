import { useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
    useEffect(() => {
        document.title = "Kebijakan Privasi - FreeBuild CV";
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
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi</h1>
                    </div>

                    <div className="prose prose-green max-w-none text-gray-600">
                        <p className="text-sm border-b pb-4 mb-6 text-gray-500">
                            Terakhir diperbarui: 24 Februari 2026
                        </p>

                        <p>
                            Privasi Anda sangat penting bagi kami di <strong>FreeBuild CV</strong>. Kebijakan Privasi ini menguraikan jenis informasi pribadi yang kami kumpulkan dan bagaimana kami menggunakannya.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Informasi yang Kami Kumpulkan</h2>
                        <p>Kami mengumpulkan informasi dari Anda ketika Anda menggunakan situs web kami:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Informasi Pendaftaran:</strong> Email dan Username saat Anda membuat akun.</li>
                            <li><strong>Data Curriculum Vitae (CV):</strong> Data pribadi, pendidikan, pengalaman kerja, dan informasi lain yang Anda masukkan ke dalam form pembuatan CV untuk keperluan penyimpanan (hanya bagi pengguna yang login).</li>
                            <li><strong>Log Penggunaan:</strong> Catatan unduhan (riwayat unduhan) beserta jenis template yang digunakan.</li>
                            <li><strong>IP Address:</strong> Digunakan secara sementara untuk membatasi kuota unduhan bagi pengguna tamu (Guest).</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Untuk menyediakan layanan utama kami: yaitu membantu Anda menyusun dan mengunduh CV.</li>
                            <li>Untuk menyimpan riwayat CV Anda agar bisa diedit kembali di lain waktu (fitur khusus login).</li>
                            <li>Untuk mengelola sistem kuota (kredit download) secara adil.</li>
                            <li>Untuk meningkatkan kualitas dan keamanan layanan web kami.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Keamanan Data Pembuatan CV</h2>
                        <p>
                            Bagi pengguna <strong>Guest</strong> (tanpa login), data yang diketikkan di dalam form CV hanya diproses secara lokal pada browser perangkat Anda melalui <em>Local Storage</em> dan <strong>tidak dikirim maupun disimpan</strong> di server kami.
                        </p>
                        <p className="mt-2">
                            Bagi pengguna <strong>Terdaftar</strong>, data CV diunggah ke database online (Supabase) yang dienkripsi dan diamankan dengan kebijakan <em>Row Level Security (RLS)</em> sehingga hanya akun Anda yang dapat membaca dan mengakses riwayat CV Anda sendiri.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Berbagi Informasi Pihak Ketiga</h2>
                        <p>
                            Kami <strong>tidak menjual, memperdagangkan, atau menyewakan</strong> informasi identitas pribadi Anda kepada pihak ketiga mana pun. Kami mungkin membagikan data anonim secara agregat untuk keperluan analitik situs.
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Penghapusan Data</h2>
                        <p>
                            Jika Anda ingin menghapus akun dan semua data CV Anda dari server kami, Anda dapat menghubungi kami dan kami akan memproses penghapusan seluruh data Anda dari database kami secara permanen.
                        </p>

                        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm m-0">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di <a href="mailto:support@freebuildcv.com" className="text-green-600 hover:underline">support@freebuildcv.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
