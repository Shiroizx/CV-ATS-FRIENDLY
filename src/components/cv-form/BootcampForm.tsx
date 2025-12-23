import type { CVData, Bootcamp } from '../../types';
import { Award, Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '../ui/RichTextEditor';

interface BootcampFormProps {
    data: CVData;
    onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function BootcampForm({ data, onUpdate }: BootcampFormProps) {
    const addBootcamp = () => {
        const newBootcamp: Bootcamp = {
            id: crypto.randomUUID(),
            name: '',
            institution: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
        };
        onUpdate('bootcamps', [...data.bootcamps, newBootcamp]);
    };

    const updateBootcamp = (id: string, field: keyof Bootcamp, value: string) => {
        const updated = data.bootcamps.map((b) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        onUpdate('bootcamps', updated);
    };

    const removeBootcamp = (id: string) => {
        onUpdate('bootcamps', data.bootcamps.filter((b) => b.id !== id));
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Kursus/Bootcamp/Pelatihan</span>
                </h2>
                <button
                    type="button"
                    onClick={addBootcamp}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Tambah
                </button>
            </div>

            {data.bootcamps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    Belum ada kursus/bootcamp. Klik tombol "Tambah" untuk menambahkan.
                </p>
            ) : (
                <div className="space-y-6">
                    {data.bootcamps.map((bootcamp, index) => (
                        <div
                            key={bootcamp.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">
                                    Kursus/Bootcamp #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeBootcamp(bootcamp.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Kursus/Bootcamp
                                    </label>
                                    <input
                                        type="text"
                                        value={bootcamp.name}
                                        onChange={(e) => updateBootcamp(bootcamp.id, 'name', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="IT Bootcamp Software Development"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Institusi Penyelenggara
                                    </label>
                                    <input
                                        type="text"
                                        value={bootcamp.institution}
                                        onChange={(e) => updateBootcamp(bootcamp.id, 'institution', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Universitas Bina Sarana Informatika"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        value={bootcamp.location}
                                        onChange={(e) => updateBootcamp(bootcamp.id, 'location', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Bogor"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={bootcamp.startDate}
                                            onChange={(e) => updateBootcamp(bootcamp.id, 'startDate', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            value={bootcamp.endDate}
                                            onChange={(e) => updateBootcamp(bootcamp.id, 'endDate', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi/Pencapaian
                                    </label>
                                    <RichTextEditor
                                        value={bootcamp.description || ''}
                                        onChange={(value) => updateBootcamp(bootcamp.id, 'description', value)}
                                        placeholder="Pemenang Juara 1, mengembangkan aplikasi website, dll..."
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
