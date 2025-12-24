import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2, X, Wand2, Camera } from "lucide-react";
import type { CreativeManagementData, CreativeExperience, CreativeEducation, ExperienceType } from "../../types/creativeManagement";
import RichTextEditor from "../ui/RichTextEditor";

interface CreativeManagementFormProps {
  data: CreativeManagementData;
  onChange: (data: CreativeManagementData) => void;
}

export default function CreativeManagementForm({ data, onChange }: CreativeManagementFormProps) {
  const dataRef = useRef(data);
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const updateField = useCallback(
    <K extends keyof CreativeManagementData>(field: K, value: CreativeManagementData[K]) => {
      const newData = { ...dataRef.current, [field]: value };
      dataRef.current = newData;
      onChange(newData);
    },
    [onChange]
  );

  const handleFillDummyData = useCallback(() => {
    const dummyData: CreativeManagementData = {
      profilePhoto: "",
      fullName: "Rufus Stewart",
      profession: "Spesialis Grafis Desainer",
      whatsapp: "123-456-7890",
      email: "hello@reallygreatsite.com",
      location: "123 Anywhere St., Any City",
      linkedin: "https://linkedin.com/in/rufus-stewart",
      summary: "Saya sudah pengalaman 2 tahun bekerja sebagai desainer grafis profesional. Mampu berbahasa inggris aktif dan mampu cepat beradaptasi dengan lingkungan.",
      experiences: [
        {
          id: "1",
          type: "work",
          company: "Perusahaan Wardiere",
          position: "PERANCANG SOFTWARE GRAFIS",
          startDate: "2016",
          endDate: "",
          isCurrentJob: true,
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies tortor. In vestibulum vitae velit nec viverra. Proin non ultrices ex. Integer mattis dui vel pretium euismod.",
        },
        {
          id: "2",
          type: "organization",
          name: "Himpunan Mahasiswa Desain",
          position: "KETUA DIVISI KREATIF",
          startDate: "2014",
          endDate: "2016",
          isCurrentJob: false,
          description:
            "Mengelola tim 15 orang untuk event tahunan dengan budget 50 juta rupiah. Mengoptimalkan alokasi sumber daya untuk 5 program kerja divisi. Menyusun SOP untuk operasional harian yang meningkatkan efisiensi tim sebesar 30%.",
        },
      ],
      skills: ["Web Design", "Design Thinking", "Wireframe Creation", "Problem-Solving", "Computer Literacy", "Front End Coding", "Project Management Tools", "Strong Communication"],
      education: [
        {
          id: "1",
          university: "UNIVERSITAS LARANA",
          major: "S1 JURUSAN TELEKOMUNIKASI",
          startDate: "2014",
          endDate: "2016",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies tortor. In vestibulum vitae velit nec viverra. Proin non ultrices ex. Integer mattis dui vel pretium euismod.",
        },
        {
          id: "2",
          university: "SMA NEGERI 2",
          major: "JURUSAN IPA",
          startDate: "2010",
          endDate: "2014",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies tortor. In vestibulum vitae velit nec viverra. Proin non ultrices ex. Integer mattis dui vel pretium euismod.",
        },
      ],
    };
    // Reset local state
    setSkillInput("");
    // Create a new object to ensure React detects the change
    const newData = { ...dummyData };
    // Update dataRef first
    dataRef.current = newData;
    // Then call onChange to update parent state
    onChange(newData);
  }, [onChange]);

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran foto maksimal 2MB");
          return;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          alert("File harus berupa gambar");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          updateField("profilePhoto", reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [updateField]
  );

  const removePhoto = useCallback(() => {
    updateField("profilePhoto", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [updateField]);

  // Header & Profil Profesional
  const HeaderSection = useMemo(
    () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
          Header & Profil Profesional
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Profil <span className="text-gray-500 text-xs">(Opsional)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {data.profilePhoto ? (
                  <div className="relative w-20 h-24">
                    <img src={data.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                    <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10 shadow-md">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  {data.profilePhoto ? "Ganti Foto" : "Pilih Foto"}
                </button>
                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maksimal 2MB</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contoh: John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.profession}
              onChange={(e) => updateField("profession", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contoh: Spesialis Grafis Desainer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contoh: +62 812-3456-7890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Profesional <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contoh: john.doe@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domisili <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Contoh: Jakarta, Indonesia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link LinkedIn <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary (Profil) <span className="text-gray-500 text-xs">(3-4 kalimat)</span>
            </label>
            <RichTextEditor value={data.summary} onChange={(value) => updateField("summary", value)} placeholder="Contoh: Lulusan Manajemen dengan spesialisasi Operasional yang memiliki ketertarikan tinggi pada optimasi proses bisnis..." />
          </div>
        </div>
      </div>
    ),
    [data, updateField, handlePhotoChange, removePhoto]
  );

  // Experience Section (Work & Organization combined)
  const ExperienceSection = useMemo(() => {
    const addExperience = (type: ExperienceType) => {
      if (data.experiences.length >= 2) {
        alert("Maksimal 2 pengalaman (kerja atau organisasi)");
        return;
      }
      const newExp: CreativeExperience = {
        id: Date.now().toString(),
        type,
        position: "",
        description: "",
        ...(type === "work"
          ? {
            company: "",
            startDate: "",
            endDate: "",
            isCurrentJob: false,
          }
          : {
            name: "",
          }),
      };
      updateField("experiences", [...data.experiences, newExp]);
    };

    const removeExperience = (id: string) => {
      updateField(
        "experiences",
        data.experiences.filter((exp) => exp.id !== id)
      );
    };

    const updateExperience = (id: string, field: keyof CreativeExperience, value: any) => {
      updateField(
        "experiences",
        data.experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
      );
    };

    const updateExperienceDescription = (expId: string, value: string) => {
      updateField(
        "experiences",
        data.experiences.map((exp) => (exp.id === expId ? { ...exp, description: value } : exp))
      );
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
            Pengalaman Kerja/Organisasi <span className="text-sm font-normal text-gray-500">(Maksimal 2)</span>
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => addExperience("work")}
              disabled={data.experiences.length >= 2}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Kerja
            </button>
            <button
              type="button"
              onClick={() => addExperience("organization")}
              disabled={data.experiences.length >= 2}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Organisasi
            </button>
          </div>
        </div>
        <div className="space-y-6">
          {data.experiences.map((exp, idx) => (
            <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Pengalaman #{idx + 1}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${exp.type === "work" ? "bg-purple-100 text-purple-700" : "bg-pink-100 text-pink-700"}`}>{exp.type === "work" ? "Kerja" : "Organisasi"}</span>
                </div>
                <button type="button" onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {exp.type === "work" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                      <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Contoh: PT. ABC Indonesia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Contoh: Operations Manager"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Mulai</label>
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Contoh: 2016"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Selesai</label>
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.isCurrentJob}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 mb-2"
                          placeholder="Contoh: 2018"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.isCurrentJob || false}
                            onChange={(e) => updateExperience(exp.id, "isCurrentJob", e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                          <span>Masih bekerja</span>
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Organisasi</label>
                      <input
                        type="text"
                        value={exp.name || ""}
                        onChange={(e) => updateExperience(exp.id, "name", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Contoh: Himpunan Mahasiswa Manajemen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Contoh: Ketua Divisi Operasional"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Mulai</label>
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Contoh: 2016"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Selesai</label>
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.isCurrentJob}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 mb-2"
                          placeholder="Contoh: 2018"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.isCurrentJob || false}
                            onChange={(e) => updateExperience(exp.id, "isCurrentJob", e.target.checked)}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
                          />
                          <span>Masih di organisasi</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-gray-500 text-xs">(Paragraf deskripsi)</span>
                  </label>
                  <RichTextEditor
                    value={exp.description || ""}
                    onChange={(value) => updateExperienceDescription(exp.id, value)}
                    placeholder={
                      exp.type === "work"
                        ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies tortor. In vestibulum vitae velit nec viverra. Proin non ultrices ex. Integer mattis dui vel pretium euismod."
                        : "Contoh: Mengelola tim 15 orang untuk event tahunan dengan budget 50 juta rupiah. Mengoptimalkan alokasi sumber daya untuk 5 program kerja divisi."
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          {data.experiences.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada pengalaman. Klik tombol "Kerja" atau "Organisasi" untuk menambahkan.</p>}
        </div>
      </div>
    );
  }, [data, updateField]);

  // Skills Section
  const SkillsSection = useMemo(() => {
    const addSkill = () => {
      if (data.skills.length >= 9) {
        alert("Maksimal 9 kemampuan");
        return;
      }
      if (skillInput.trim()) {
        updateField("skills", [...data.skills, skillInput.trim()]);
        setSkillInput("");
      }
    };

    const removeSkill = (index: number) => {
      updateField(
        "skills",
        data.skills.filter((_, i) => i !== index)
      );
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
            Kemampuan <span className="text-sm font-normal text-gray-500">(Maksimal 9)</span>
          </h2>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
            placeholder="Contoh: Web Design, Leadership, Problem-Solving"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={data.skills.length >= 9}
          />
          <button type="button" onClick={addSkill} disabled={data.skills.length >= 9} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {skill}
              <button type="button" onClick={() => removeSkill(idx)} className="text-purple-700 hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {data.skills.length === 0 && <p className="text-sm text-gray-500 mt-2">Contoh: Web Design, Design Thinking, Problem-Solving, Leadership</p>}
        {data.skills.length >= 9 && <p className="text-sm text-amber-600 mt-2">Maksimal 9 kemampuan telah tercapai</p>}
      </div>
    );
  }, [data, updateField, skillInput]);

  // Education & Certification Section
  const EducationSection = useMemo(() => {
    const addEducation = () => {
      if (data.education.length >= 2) {
        alert("Maksimal 2 pendidikan");
        return;
      }
      const newEdu: CreativeEducation = {
        id: Date.now().toString(),
        university: "",
        major: "",
        startDate: "",
        endDate: "",
        description: "",
      };
      updateField("education", [...data.education, newEdu]);
    };

    const removeEducation = (id: string) => {
      updateField(
        "education",
        data.education.filter((edu) => edu.id !== id)
      );
    };

    const updateEducation = (id: string, field: keyof CreativeEducation, value: any) => {
      updateField(
        "education",
        data.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
      );
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
            Education
          </h2>
          <button
            type="button"
            onClick={addEducation}
            disabled={data.education.length >= 2}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Tambah {data.education.length >= 2 && "(Maks 2)"}
          </button>
        </div>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Pendidikan #{data.education.indexOf(edu) + 1}</h3>
                <button type="button" onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Universitas</label>
                  <input
                    type="text"
                    value={edu.university}
                    onChange={(e) => updateEducation(edu.id, "university", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: Universitas Indonesia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <input
                    type="text"
                    value={edu.major}
                    onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: S1 JURUSAN TELEKOMUNIKASI"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Mulai</label>
                    <input
                      type="text"
                      value={edu.startDate || ""}
                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Contoh: 2014"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Selesai</label>
                    <input
                      type="text"
                      value={edu.endDate || ""}
                      onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Contoh: 2016"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-gray-500 text-xs">(Paragraf deskripsi pendidikan)</span>
                  </label>
                  <RichTextEditor
                    value={edu.description || ""}
                    onChange={(value) => updateEducation(edu.id, "description", value)}
                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a ultricies tortor. In vestibulum vitae velit nec viverra. Proin non ultrices ex. Integer mattis dui vel pretium euismod."
                  />
                </div>
              </div>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-center text-gray-500 py-8">Belum ada data pendidikan. Klik tombol "Tambah" untuk menambahkan.</p>}
        </div>
      </div>
    );
  }, [data, updateField]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creative Management CV Builder</h1>
            <p className="text-gray-600">Isi form di sebelah kiri dan lihat preview realtime di sebelah kanan</p>
          </div>
          <button type="button" onClick={handleFillDummyData} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
            <Wand2 className="w-4 h-4" />
            Isi dengan Contoh CV
          </button>
        </div>
      </div>

      {HeaderSection}
      {ExperienceSection}
      {SkillsSection}
      {EducationSection}
    </div>
  );
}
