import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    CheckCircle,
    Zap,
    Shield,
    Download,
} from 'lucide-react';

const cvTemplates = [
    {
        id: 'ats-simple',
        name: 'ATS Simple',
        description: 'Template CV sederhana yang dioptimalkan untuk sistem ATS',
        features: ['Clean layout', 'ATS-friendly', 'Easy to read'],
        color: 'from-blue-500 to-blue-600',
        popular: true,
    },
];

export default function MainPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Zap,
            title: 'Cepat & Mudah',
            description: 'Buat CV profesional dalam hitungan menit',
        },
        {
            icon: Shield,
            title: 'ATS-Friendly',
            description: 'Dioptimalkan untuk lolos sistem pelacakan pelamar',
        },
        {
            icon: Download,
            title: 'Download Gratis',
            description: 'Download CV dalam format PDF tanpa biaya',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <header className="relative overflow-hidden bg-white">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/favicon.png" alt="FreeBuild CV" className="w-10 h-10" />
                            <span className="text-xl font-bold text-gray-900">FreeBuild CV</span>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>100% Gratis & ATS-Friendly</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Buat CV Profesional
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                dalam Hitungan Menit
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                            CV Builder gratis dengan template ATS-friendly yang membantu Anda
                            mendapatkan pekerjaan impian. Tidak perlu registrasi!
                        </p>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Templates Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Pilih Template CV
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Template profesional yang dioptimalkan untuk ATS dan mudah dibaca oleh recruiter
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => navigate('/builder')}
                                className="group cursor-pointer relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all hover:scale-[1.02]"
                            >
                                {template.popular && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full z-10">
                                        Popular
                                    </div>
                                )}

                                {/* Preview */}
                                <div className={`h-48 bg-gradient-to-br ${template.color} p-6`}>
                                    <div className="h-full bg-white rounded-lg shadow-xl p-4 overflow-hidden">
                                        <div className="w-16 h-3 bg-gray-800 rounded mb-2" />
                                        <div className="w-32 h-2 bg-gray-300 rounded mb-4" />
                                        <div className="space-y-2">
                                            <div className="w-full h-2 bg-gray-200 rounded" />
                                            <div className="w-3/4 h-2 bg-gray-200 rounded" />
                                            <div className="w-5/6 h-2 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {template.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {template.description}
                                    </p>
                                    <ul className="space-y-2 mb-4">
                                        {template.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium group-hover:bg-blue-700 transition-all">
                                        Gunakan Template
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Coming Soon Cards */}
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden opacity-60"
                            >
                                <div className="h-48 bg-gradient-to-br from-gray-400 to-gray-500 p-6">
                                    <div className="h-full bg-white/50 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-600 text-lg font-medium">Coming Soon</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
                                    <div className="w-48 h-3 bg-gray-200 rounded mb-4" />
                                    <div className="w-full h-10 bg-gray-200 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
                    <p>© 2025 FreeBuild CV. Made with Adlildzil</p>
                </div>
            </footer>
        </div>
    );
}
