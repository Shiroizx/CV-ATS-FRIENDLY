import type { CVData, Award } from '../../types';
import { Trophy, Plus, Trash2 } from 'lucide-react';

interface AwardFormProps {
    data: CVData;
    onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function AwardForm({ data, onUpdate }: AwardFormProps) {
    const addAward = () => {
        const newAward: Award = {
            id: crypto.randomUUID(),
            title: '',
            institution: '',
            year: '',
        };
        onUpdate('awards', [...data.awards, newAward]);
    };

    const updateAward = (id: string, field: keyof Award, value: string) => {
        const updated = data.awards.map((a) =>
            a.id === id ? { ...a, [field]: value } : a
        );
        onUpdate('awards', updated);
    };

    const removeAward = (id: string) => {
        onUpdate('awards', data.awards.filter((a) => a.id !== id));
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Penghargaan</span>
                </h2>
                <button
                    type="button"
                    onClick={addAward}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Tambah
                </button>
            </div>

            {data.awards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    Belum ada penghargaan. Klik tombol "Tambah" untuk menambahkan.
                </p>
            ) : (
                <div className="space-y-4">
                    {data.awards.map((award, index) => (
                        <div
                            key={award.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-600">
                                    Penghargaan #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAward(award.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Penghargaan
                                    </label>
                                    <input
                                        type="text"
                                        value={award.title}
                                        onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Juara 1"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Institusi/Event
                                    </label>
                                    <input
                                        type="text"
                                        value={award.institution}
                                        onChange={(e) => updateAward(award.id, 'institution', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="IT Bootcamp Software Development"
                                    />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tahun
                                    </label>
                                    <input
                                        type="text"
                                        value={award.year}
                                        onChange={(e) => updateAward(award.id, 'year', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="2025"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
