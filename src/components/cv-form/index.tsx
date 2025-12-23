import { useState } from "react";
import type { CVData } from "../../types";
import { Eye, ArrowLeft } from "lucide-react";
import PersonalInfoForm from "./PersonalInfoForm";
import SummaryForm from "./SummaryForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExperienceForm";
import BootcampForm from "./BootcampForm";
import SkillsForm from "./SkillsForm";
import AwardForm from "./AwardForm";
import HobbyForm from "./HobbyForm";
// import { dummyData } from "../../utils/dummyData"; // Dummy data disimpan tapi tidak ditampilkan di UI

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onPreview: () => void;
  onBackToHome?: () => void;
}

export default function CVForm({ data, onChange, onPreview, onBackToHome }: CVFormProps) {
  const [formData, setFormData] = useState<CVData>(data);

  const updateField = <K extends keyof CVData>(field: K, value: CVData[K]) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  // const handleFillDummyData = () => {
  //   setFormData(dummyData);
  //   onChange(dummyData);
  // };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <header className="text-center mb-8">
        {onBackToHome && (
          <button onClick={onBackToHome} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 mx-auto transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV ATS Builder</h1>
        <p className="text-gray-600">Buat CV profesional untuk siswa SMA/SMK, mahasiswa, dan fresh graduate.</p>
        {/*
        <button
          onClick={handleFillDummyData}
          type="button"
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto shadow-md"
        >
          <Wand2 className="w-4 h-4" />
          Isi dengan Contoh CV
        </button>
        */}
      </header>

      <form className="space-y-8">
        <PersonalInfoForm data={formData} onUpdate={updateField} />
        <SummaryForm data={formData} onUpdate={updateField} />
        <EducationForm data={formData} onUpdate={updateField} />
        <ExperienceForm data={formData} onUpdate={updateField} />
        <BootcampForm data={formData} onUpdate={updateField} />
        <SkillsForm data={formData} onUpdate={updateField} />
        <AwardForm data={formData} onUpdate={updateField} />
        <HobbyForm data={formData} onUpdate={updateField} />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-500/30"
          >
            <Eye className="w-5 h-5" />
            Lihat Preview CV
          </button>
        </div>
      </form>
    </div>
  );
}
