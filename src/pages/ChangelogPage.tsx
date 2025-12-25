import { Calendar, Zap, Bug, Sparkles } from 'lucide-react';

export default function ChangelogPage() {
    const changelog = [
        {
            version: '1.2.0',
            date: '25 Desember 2024',
            type: 'feature',
            changes: [
                'Menambahkan SweetAlert2 untuk notifikasi yang lebih modern',
                'Implementasi navbar global dengan menu Template, Donate, dan Changelog',
                'Animasi smooth untuk mobile menu',
                'Perbaikan UI/UX di seluruh aplikasi',
            ],
        },
        {
            version: '1.1.0',
            date: '24 Desember 2024',
            type: 'feature',
            changes: [
                'Menambahkan template Creative Management CV',
                'Implementasi dark mode (removed)',
                'Optimasi spacing PDF untuk hasil yang lebih baik',
                'Penambahan character limit pada deskripsi',
            ],
        },
        {
            version: '1.0.0',
            date: '23 Desember 2024',
            type: 'release',
            changes: [
                'Rilis awal FreeBuild CV',
                'Template CV ATS-Friendly',
                'Export ke PDF',
                'Form builder interaktif',
                'Preview real-time',
            ],
        },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature':
                return <Sparkles className="w-5 h-5 text-blue-600" />;
            case 'bugfix':
                return <Bug className="w-5 h-5 text-red-600" />;
            case 'release':
                return <Zap className="w-5 h-5 text-yellow-600" />;
            default:
                return <Calendar className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'feature':
                return 'bg-blue-100 text-blue-700';
            case 'bugfix':
                return 'bg-red-100 text-red-700';
            case 'release':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6 shadow-lg">
                        <Calendar className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Changelog
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Semua perubahan dan update terbaru dari FreeBuild CV
                    </p>
                </div>

                {/* Changelog Timeline */}
                <div className="space-y-8">
                    {changelog.map((entry, index) => (
                        <div
                            key={entry.version}
                            className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden"
                        >
                            {/* Decorative Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-full opacity-50"></div>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {getTypeIcon(entry.type)}
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Version {entry.version}
                                        </h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeBadge(entry.type)}`}>
                                            {entry.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {entry.date}
                                    </p>
                                </div>
                            </div>

                            {/* Changes List */}
                            <ul className="space-y-3">
                                {entry.changes.map((change, changeIndex) => (
                                    <li key={changeIndex} className="flex items-start gap-3">
                                        <span className="text-blue-600 text-xl mt-0.5">✓</span>
                                        <span className="text-gray-700">{change}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Connector Line (except for last item) */}
                            {index < changelog.length - 1 && (
                                <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gradient-to-b from-blue-300 to-transparent"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600">
                        Punya saran atau menemukan bug? Hubungi kami di{' '}
                        <a href="mailto:support@freebuildcv.com" className="text-blue-600 hover:underline font-medium">
                            support@freebuildcv.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
