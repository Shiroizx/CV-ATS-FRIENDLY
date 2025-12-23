import type { CVData, Education } from "../../types";
import { educationLevels } from "../../types";
import { GraduationCap, Plus, Trash2, ChevronDown } from "lucide-react";
import RichTextEditor from "../ui/RichTextEditor";

interface EducationFormProps {
  data: CVData;
  onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function EducationForm({ data, onUpdate }: EducationFormProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      level: "",
      field: "",
      institution: "",
      city: "",
      startDate: "",
      endDate: "",
      isCurrentStudy: false,
      gpa: "",
      maxGpa: "",
      description: "",
    };
    onUpdate("education", [...data.education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    const updated = data.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu));
    onUpdate("education", updated);
  };

  const removeEducation = (id: string) => {
    onUpdate(
      "education",
      data.education.filter((edu) => edu.id !== id)
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>Riwayat Pendidikan (Sekolah & Kuliah)</span>
        </h2>
        <button type="button" onClick={addEducation} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {data.education.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm">
          Belum ada riwayat pendidikan. Klik tombol <strong>\"Tambah\"</strong> untuk mengisi data sekolah (SMP/SMA/SMK) atau kuliah kamu.
        </p>
      ) : (
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Pendidikan #{index + 1}</span>
                <button type="button" onClick={() => removeEducation(edu.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Pendidikan</label>
                  <div className="relative">
                    <select
                      value={edu.level}
                      onChange={(e) => updateEducation(edu.id, "level", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="">Pilih Jenjang</option>
                      {educationLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi/Jurusan</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Rekayasa Perangkat Lunak, Akuntansi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Universitas/Sekolah</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Universitas Indonesia/SMAN 1 Jakarta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                  <input
                    type="text"
                    value={edu.city}
                    onChange={(e) => updateEducation(edu.id, "city", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Jakarta Selatan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                      disabled={edu.isCurrentStudy}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-study-${edu.id}`}
                    checked={edu.isCurrentStudy}
                    onChange={(e) => updateEducation(edu.id, "isCurrentStudy", e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`current-study-${edu.id}`} className="text-sm text-gray-700">
                    Masih bersekolah/kuliah di sini
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IPK/Nilai</label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: 3.75 atau 85.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skala Maksimal</label>
                    <input
                      type="text"
                      value={edu.maxGpa || ""}
                      onChange={(e) => updateEducation(edu.id, "maxGpa", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contoh: 4.00 atau 100.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <RichTextEditor value={edu.description || ""} onChange={(value) => updateEducation(edu.id, "description", value)} placeholder="IPK, prestasi, atau informasi tambahan..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
