import type { CVData, Experience } from '../../types';
import { employmentTypes } from '../../types';
import { Briefcase, Plus, Trash2, ChevronDown } from 'lucide-react';
import RichTextEditor from '../ui/RichTextEditor';

interface ExperienceFormProps {
    data: CVData;
    onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function ExperienceForm({ data, onUpdate }: ExperienceFormProps) {
    const addExperience = () => {
        const newExp: Experience = {
            id: crypto.randomUUID(),
            company: '',
            position: '',
            employmentType: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrentJob: false,
            description: '',
        };
        onUpdate('experiences', [...data.experiences, newExp]);
    };

    const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
        const updated = data.experiences.map((exp) =>
            exp.id === id ? { ...exp, [field]: value } : exp
        );
        onUpdate('experiences', updated);
    };

    const removeExperience = (id: string) => {
        onUpdate('experiences', data.experiences.filter((exp) => exp.id !== id));
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Pengalaman Kerja</span>
                </h2>
                <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Tambah
                </button>
            </div>

            {data.experiences.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                    Belum ada pengalaman kerja. Klik tombol "Tambah" untuk menambahkan.
                </p>
            ) : (
                <div className="space-y-6">
                    {data.experiences.map((exp, index) => (
                        <div
                            key={exp.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-gray-600">
                                    Pengalaman #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeExperience(exp.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Perusahaan
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="PT. Contoh Indonesia"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Posisi/Jabatan
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Software Developer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status Karyawan
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={exp.employmentType}
                                            onChange={(e) => updateExperience(exp.id, 'employmentType', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                        >
                                            <option value="">Pilih Status</option>
                                            {employmentTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.location}
                                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Jakarta Selatan"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Mulai
                                        </label>
                                        <input
                                            type="date"
                                            value={exp.startDate}
                                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Selesai
                                        </label>
                                        <input
                                            type="date"
                                            value={exp.endDate}
                                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                            disabled={exp.isCurrentJob}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`current-job-${exp.id}`}
                                        checked={exp.isCurrentJob}
                                        onChange={(e) => updateExperience(exp.id, 'isCurrentJob', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`current-job-${exp.id}`} className="text-sm text-gray-700">
                                        Masih bekerja di sini
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi Pekerjaan
                                    </label>
                                    <RichTextEditor
                                        value={exp.description}
                                        onChange={(value) => updateExperience(exp.id, 'description', value)}
                                        placeholder="Jelaskan tanggung jawab dan pencapaian Anda..."
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
