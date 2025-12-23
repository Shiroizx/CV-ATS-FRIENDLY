import type { CVData, Skills } from "../../types";
import { Lightbulb } from "lucide-react";

interface SkillsFormProps {
  data: CVData;
  onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function SkillsForm({ data, onUpdate }: SkillsFormProps) {
  const updateSkill = (field: keyof Skills, value: string) => {
    onUpdate("skills", { ...data.skills, [field]: value });
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        Keahlian & Kelebihan Kamu
      </h2>
      <p className="text-xs text-gray-500 mb-3">Tulis kemampuan yang kamu punya, baik dari sekolah, organisasi, magang, maupun hobi.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soft Skill (sikap & cara kamu bekerja sama)</label>
          <input
            type="text"
            value={data.skills.softSkills}
            onChange={(e) => updateSkill("softSkills", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: Public Speaking, Leadership, Creative, Cooperation, Communication"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hard Skill (kemampuan teknis)</label>
          <input
            type="text"
            value={data.skills.hardSkills}
            onChange={(e) => updateSkill("hardSkills", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: Editing Video, Design Grafis, Website Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Software Skill (aplikasi yang kamu kuasai)</label>
          <input
            type="text"
            value={data.skills.softwareSkills}
            onChange={(e) => updateSkill("softwareSkills", e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contoh: Adobe After Effect, Adobe Premiere Pro, Capcut, Visual Studio Code"
          />
        </div>
      </div>
    </section>
  );
}
