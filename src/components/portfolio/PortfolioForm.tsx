import { useState } from "react";
import {
    User, Mail, Phone, MapPin, Globe, Linkedin, Github,
    Plus, Trash2, FolderOpen, GraduationCap, Wrench,
    FileText, Camera, Link2, ChevronDown, ChevronUp, Loader2, Palette
} from "lucide-react";
import type { PortfolioData, PortfolioProject, PortfolioEducation } from "../../types/portfolio";
import { uploadImage, deleteImage } from "../../lib/supabase";
import Swal from "sweetalert2";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_PROJECTS = 4;
const MAX_SKILLS = 8;
const MAX_EDUCATION = 3;
const MAX_SUMMARY_LENGTH = 350;

interface PortfolioFormProps {
    data: PortfolioData;
    onChange: (data: PortfolioData) => void;
}

export default function PortfolioForm({ data, onChange }: PortfolioFormProps) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        personal: true,
        about: true,
        projects: true,
        skills: true,
        education: true,
    });
    const [skillInput, setSkillInput] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const updateField = <K extends keyof PortfolioData>(field: K, value: PortfolioData[K]) => {
        onChange({ ...data, [field]: value });
    };

    // Photo upload — uploads to Supabase Storage
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({ icon: "error", title: "Format Tidak Sesuai", text: "Hanya menerima gambar berformat PNG, JPG, atau JPEG." });
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            Swal.fire({ icon: "error", title: "File Terlalu Besar", text: "Maksimal ukuran foto adalah 1MB." });
            e.target.value = "";
            return;
        }
        setUploadingPhoto(true);
        try {
            const publicUrl = await uploadImage(file);

            // Delete old image if it's a supabase URL to prevent piling up
            if (data.profilePhoto) {
                await deleteImage(data.profilePhoto);
            }

            updateField("profilePhoto", publicUrl);
        } catch (err) {
            console.error("Photo upload failed:", err);
            // Fallback to local data URL
            const reader = new FileReader();
            reader.onloadend = () => updateField("profilePhoto", reader.result as string);
            reader.readAsDataURL(file);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Project helpers
    const addProject = () => {
        if (data.projects.length >= MAX_PROJECTS) {
            Swal.fire({ icon: "warning", title: "Batas Maksimum", text: `Maksimal ${MAX_PROJECTS} proyek diperbolehkan.` });
            return;
        }
        const newProject: PortfolioProject = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
            title: "",
            category: "",
            description: "",
            techStack: "",
            projectUrl: "",
            imageUrl: "",
        };
        updateField("projects", [...data.projects, newProject]);
    };

    const updateProject = (id: string, field: keyof PortfolioProject, value: string) => {
        updateField(
            "projects",
            data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const removeProject = async (id: string) => {
        // Find project to check if it has an image to delete
        const projectToDelete = data.projects.find((p) => p.id === id);
        if (projectToDelete?.imageUrl) {
            await deleteImage(projectToDelete.imageUrl);
        }
        updateField("projects", data.projects.filter((p) => p.id !== id));
    };

    const handleProjectImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({ icon: "error", title: "Format Tidak Sesuai", text: "Hanya menerima gambar berformat PNG, JPG, atau JPEG." });
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            Swal.fire({ icon: "error", title: "File Terlalu Besar", text: "Maksimal ukuran gambar adalah 1MB." });
            e.target.value = "";
            return;
        }
        try {
            const publicUrl = await uploadImage(file);

            // Find old image to delete
            const projectToUpdate = data.projects.find((p) => p.id === id);
            if (projectToUpdate?.imageUrl) {
                await deleteImage(projectToUpdate.imageUrl);
            }

            updateProject(id, "imageUrl", publicUrl);
        } catch (err) {
            console.error("Project image upload failed:", err);
            // Fallback to local data URL
            const reader = new FileReader();
            reader.onloadend = () => updateProject(id, "imageUrl", reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Skill helpers
    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (!trimmed || data.skills.length >= MAX_SKILLS) return;
        if (!data.skills.includes(trimmed)) {
            updateField("skills", [...data.skills, trimmed]);
        }
        setSkillInput("");
    };

    const removeSkill = (skill: string) => {
        updateField("skills", data.skills.filter((s) => s !== skill));
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill();
        }
    };

    // Education helpers
    const addEducation = () => {
        if (data.education.length >= MAX_EDUCATION) {
            Swal.fire({ icon: "warning", title: "Batas Maksimum", text: `Maksimal ${MAX_EDUCATION} riwayat pendidikan diperbolehkan.` });
            return;
        }
        const newEdu: PortfolioEducation = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
            institution: "",
            degree: "",
            year: "",
        };
        updateField("education", [...data.education, newEdu]);
    };

    const updateEducation = (id: string, field: keyof PortfolioEducation, value: string) => {
        updateField(
            "education",
            data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
    };

    const removeEducation = (id: string) => {
        updateField("education", data.education.filter((e) => e.id !== id));
    };

    // Section Header Component
    const SectionHeader = ({
        icon: Icon,
        title,
        sectionKey,
        gradient,
    }: {
        icon: React.ElementType;
        title: string;
        sectionKey: string;
        gradient: string;
    }) => (
        <button
            type="button"
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all"
            style={{ backgroundImage: `linear-gradient(to right, ${gradient})` }}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{title}</span>
            </div>
            {openSections[sectionKey] ? (
                <ChevronUp className="w-5 h-5" />
            ) : (
                <ChevronDown className="w-5 h-5" />
            )}
        </button>
    );

    const inputClass =
        "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-gray-800 bg-white placeholder-gray-400";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="space-y-6">
            {/* ====== PERSONAL INFO ====== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                    icon={User}
                    title="Informasi Pribadi"
                    sectionKey="personal"
                    gradient="#3b82f6, #6366f1"
                />
                {openSections.personal && (
                    <div className="p-6 space-y-4">
                        {/* Photo */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                {uploadingPhoto ? (
                                    <div className="w-full h-full flex items-center justify-center text-blue-500">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : data.profilePhoto ? (
                                    <img src={data.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Foto Profil</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handlePhotoUpload}
                                    disabled={uploadingPhoto}
                                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium file:cursor-pointer hover:file:bg-blue-100 transition-all disabled:opacity-50"
                                />
                                <p className="text-xs text-gray-500 mt-1.5">* Format PNG/JPG/JPEG, Maks 1MB</p>
                                {uploadingPhoto && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                            </div>
                        </div>

                        {/* Theme Color Picker */}
                        <div>
                            <label className={labelClass}>
                                <Palette className="w-3.5 h-3.5 inline mr-1.5" />
                                Warna Tema
                            </label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {[
                                    { name: "Indigo", value: "#4f46e5" },
                                    { name: "Blue", value: "#2563eb" },
                                    { name: "Emerald", value: "#059669" },
                                    { name: "Teal", value: "#0d9488" },
                                    { name: "Rose", value: "#e11d48" },
                                    { name: "Orange", value: "#ea580c" },
                                    { name: "Slate", value: "#475569" },
                                    { name: "Purple", value: "#7c3aed" },
                                    { name: "Pink", value: "#ec4899" },
                                    { name: "Fuchsia", value: "#d946ef" },
                                    { name: "Violet", value: "#8b5cf6" },
                                ].map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => updateField("themeColor", color.value)}
                                        className={`w-8 h-8 rounded-full shadow-sm border-2 flex-shrink-0 transition-transform hover:scale-110 ${(data.themeColor || "#4f46e5") === color.value ? "border-gray-900 scale-110" : "border-transparent"
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <User className="w-3.5 h-3.5 inline mr-1.5" />
                                    Nama Lengkap
                                </label>
                                <input type="text" className={inputClass} placeholder="John Doe" value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                                    Title / Status
                                </label>
                                <input type="text" className={inputClass} placeholder="Mahasiswa / Fresh Graduate / Content Creator" value={data.title} onChange={(e) => updateField("title", e.target.value)} />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                                    Email
                                </label>
                                <input type="email" className={inputClass} placeholder="john@mail.com" value={data.email} onChange={(e) => updateField("email", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                                    Telepon
                                </label>
                                <input type="tel" className={inputClass} placeholder="081234567890" value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className={labelClass}>
                                <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                                Lokasi
                            </label>
                            <input type="text" className={inputClass} placeholder="Jakarta, Indonesia" value={data.location} onChange={(e) => updateField("location", e.target.value)} />
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                                    Website
                                </label>
                                <input type="url" className={inputClass} placeholder="https://mysite.com" value={data.website || ""} onChange={(e) => updateField("website", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Linkedin className="w-3.5 h-3.5 inline mr-1.5" />
                                    LinkedIn
                                </label>
                                <input type="url" className={inputClass} placeholder="https://linkedin.com/in/..." value={data.linkedin || ""} onChange={(e) => updateField("linkedin", e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Github className="w-3.5 h-3.5 inline mr-1.5" />
                                    GitHub
                                </label>
                                <input type="url" className={inputClass} placeholder="https://github.com/..." value={data.github || ""} onChange={(e) => updateField("github", e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ====== ABOUT ====== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                    icon={FileText}
                    title="Tentang Saya"
                    sectionKey="about"
                    gradient="#8b5cf6, #a855f7"
                />
                {openSections.about && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Deskripsi singkat tentang diri kamu</label>
                            <span className={`text - xs ${data.summary.length >= MAX_SUMMARY_LENGTH ? "text-red-500 font-bold" : "text-gray-500"} `}>
                                {data.summary.length} / {MAX_SUMMARY_LENGTH}
                            </span>
                        </div>
                        <textarea
                            className={`${inputClass} min - h - [120px] resize - y ${data.summary.length >= MAX_SUMMARY_LENGTH ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""} `}
                            placeholder="Ceritakan tentang dirimu, pengalaman, passion, dan apa yang kamu cari..."
                            value={data.summary}
                            onChange={(e) => updateField("summary", e.target.value)}
                            maxLength={MAX_SUMMARY_LENGTH}
                            rows={5}
                        />
                    </div>
                )}
            </div>

            {/* ====== PROJECTS ====== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                    icon={FolderOpen}
                    title={`Proyek(${data.projects.length})`}
                    sectionKey="projects"
                    gradient="#f59e0b, #f97316"
                />
                {openSections.projects && (
                    <div className="p-6 space-y-5">
                        {data.projects.map((project, index) => (
                            <div key={project.id} className="relative bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-700">Proyek #{index + 1}</h4>
                                    <button type="button" onClick={() => removeProject(project.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Project Image */}
                                <div>
                                    <label className={labelClass}>
                                        <Camera className="w-3.5 h-3.5 inline mr-1.5" />
                                        Screenshot / Thumbnail
                                    </label>
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2 border border-gray-200" />
                                    )}
                                    <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleProjectImage(project.id, e)} className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-600 file:font-medium file:cursor-pointer hover:file:bg-orange-100" />
                                    <p className="text-xs text-gray-500 mt-1.5">* Format PNG/JPG/JPEG, Maks 1MB</p>
                                </div>

                                {/* Title & Category */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Judul Proyek / Karya</label>
                                        <input type="text" className={inputClass} placeholder="Penelitian Biologi / Kampanye Pemasaran" value={project.title} onChange={(e) => updateProject(project.id, "title", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Kategori / Bidang</label>
                                        <input type="text" className={inputClass} placeholder="Tugas Akhir / Seni / Organisasi" value={project.category} onChange={(e) => updateProject(project.id, "category", e.target.value)} />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Deskripsi</label>
                                    <textarea className={`${inputClass} min - h - [80px] resize - y`} placeholder="Jelaskan proyek ini..." value={project.description} onChange={(e) => updateProject(project.id, "description", e.target.value)} rows={3} />
                                </div>

                                {/* Alat / Keahlian */}
                                <div>
                                    <label className={labelClass}>
                                        <Wrench className="w-3.5 h-3.5 inline mr-1.5" />
                                        Alat / Keahlian yang Digunakan
                                    </label>
                                    <input type="text" className={inputClass} placeholder="Canva, Excel, Kepemimpinan, Public Speaking" value={project.techStack} onChange={(e) => updateProject(project.id, "techStack", e.target.value)} />
                                    <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
                                </div>

                                {/* URL */}
                                <div>
                                    <label className={labelClass}>
                                        <Link2 className="w-3.5 h-3.5 inline mr-1.5" />
                                        Link Bukti / File / Referensi
                                    </label>
                                    <input type="url" className={inputClass} placeholder="https://drive.google.com/... atau tautan karya" value={project.projectUrl || ""} onChange={(e) => updateProject(project.id, "projectUrl", e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addProject} disabled={data.projects.length >= MAX_PROJECTS} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-medium hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                            <Plus className="w-5 h-5" />
                            {data.projects.length >= MAX_PROJECTS ? "Batas Maksimal Proyek Tercapai" : "Tambah Proyek"}
                        </button>
                    </div>
                )}
            </div>

            {/* ====== SKILLS ====== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                    icon={Wrench}
                    title={`Skills(${data.skills.length} / ${MAX_SKILLS})`}
                    sectionKey="skills"
                    gradient="#10b981, #14b8a6"
                />
                {openSections.skills && (
                    <div className="p-6 space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className={`${inputClass} flex - 1`}
                                placeholder="Cth: Public Speaking, Photoshop, Matematika..."
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                disabled={data.skills.length >= MAX_SKILLS}
                            />
                            <button type="button" onClick={addSkill} disabled={!skillInput.trim() || data.skills.length >= MAX_SKILLS} className="px-4 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {data.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill) => (
                                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-200">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ====== EDUCATION ====== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SectionHeader
                    icon={GraduationCap}
                    title={`Pendidikan(${data.education.length})`}
                    sectionKey="education"
                    gradient="#6366f1, #8b5cf6"
                />
                {openSections.education && (
                    <div className="p-6 space-y-5">
                        {data.education.map((edu, index) => (
                            <div key={edu.id} className="relative bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-700">Pendidikan #{index + 1}</h4>
                                    <button type="button" onClick={() => removeEducation(edu.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Sekolah / Institusi</label>
                                        <input type="text" className={inputClass} placeholder="SMA Negeri 1 / Universitas X" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gelar / Jurusan</label>
                                        <input type="text" className={inputClass} placeholder="IPA / S1 Manajemen Bisnis" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Tahun</label>
                                    <input type="text" className={inputClass} placeholder="2020 - 2024" value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addEducation} disabled={data.education.length >= MAX_EDUCATION} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
                            <Plus className="w-5 h-5" />
                            {data.education.length >= MAX_EDUCATION ? "Batas Maksimal Pendidikan Tercapai" : "Tambah Pendidikan"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
