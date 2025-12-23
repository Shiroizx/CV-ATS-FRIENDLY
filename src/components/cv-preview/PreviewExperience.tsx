import type { Experience } from "../../types";
import { sanitizeHtml } from "../../utils/sanitizeHtml";

interface PreviewExperienceProps {
  experiences: Experience[];
  formatDate: (date: string) => string;
}

export default function PreviewExperience({ experiences, formatDate }: PreviewExperienceProps) {
  if (experiences.length === 0) return null;

  return (
    <section className="mb-5">
      <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">PENGALAMAN KERJA</h2>
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm text-black">{exp.company || "Nama Perusahaan"}</h3>
              <span className="text-sm text-black font-semibold">{exp.location}</span>
            </div>

            <div className="flex justify-between items-start">
              <p className="text-sm text-black italic">
                {exp.position || "Posisi"}
                {exp.employmentType && `, ${exp.employmentType}`}
              </p>
              <span className="text-sm text-black whitespace-nowrap">
                {formatDate(exp.startDate)}
                {exp.startDate && (exp.endDate || exp.isCurrentJob) && " - "}
                {exp.isCurrentJob ? "Sekarang" : formatDate(exp.endDate)}
              </span>
            </div>

            {exp.description && <div className="cv-content text-sm text-black mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.description) }} />}
          </div>
        ))}
      </div>
    </section>
  );
}
