import { Heart, Coffee, DollarSign } from 'lucide-react';

export default function DonatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-6 shadow-lg">
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Support FreeBuild CV
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Bantu kami terus mengembangkan tools gratis untuk membantu pencari kerja di Indonesia
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                    <div className="prose prose-lg max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Coffee className="w-6 h-6 text-amber-600" />
                            Mengapa Donasi?
                        </h2>
                        <p className="text-gray-700 mb-6">
                            FreeBuild CV adalah tools <strong>100% gratis</strong> yang dibuat untuk membantu pencari kerja membuat CV yang ATS-friendly.
                            Tidak ada biaya tersembunyi, tidak ada premium features, semuanya gratis!
                        </p>
                        <p className="text-gray-700 mb-6">
                            Donasi Anda akan membantu kami untuk:
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">✓</span>
                                <span className="text-gray-700">Membayar biaya hosting dan domain</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">✓</span>
                                <span className="text-gray-700">Menambah template CV baru</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">✓</span>
                                <span className="text-gray-700">Mengembangkan fitur-fitur baru</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">✓</span>
                                <span className="text-gray-700">Maintenance dan bug fixes</span>
                            </li>
                        </ul>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-green-600" />
                                Cara Donasi
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Donasi berapapun sangat berarti bagi kami! Anda bisa berdonasi melalui:
                            </p>

                            {/* Donation Methods */}
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-2">💳 Transfer Bank</h4>
                                    <p className="text-sm text-gray-600 mb-2">BCA: 1234567890</p>
                                    <p className="text-sm text-gray-600">a.n. FreeBuild CV</p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-2">📱 E-Wallet</h4>
                                    <p className="text-sm text-gray-600 mb-1">GoPay / OVO / Dana: 08123456789</p>
                                    <p className="text-sm text-gray-600">a.n. FreeBuild CV</p>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-2">☕ Trakteer</h4>
                                    <p className="text-sm text-gray-600 mb-2">Belikan kami kopi virtual!</p>
                                    <a
                                        href="https://trakteer.id/freebuildcv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                    >
                                        Trakteer Sekarang
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600 italic">
                                "Setiap donasi, sekecil apapun, sangat berarti bagi kami. Terima kasih atas dukungannya! ❤️"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Thank You Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-3">Terima Kasih! 🙏</h2>
                    <p className="text-blue-100">
                        Dukungan Anda membuat FreeBuild CV tetap gratis untuk semua orang
                    </p>
                </div>
            </div>
        </div>
    );
}
