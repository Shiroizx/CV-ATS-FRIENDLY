import type { Bootcamp } from "../../types";
import { sanitizeHtml } from "../../utils/sanitizeHtml";

interface PreviewBootcampProps {
  bootcamps: Bootcamp[];
  formatDate: (date: string) => string;
}

export default function PreviewBootcamp({ bootcamps, formatDate }: PreviewBootcampProps) {
  if (bootcamps.length === 0) return null;

  return (
    <section className="mb-5">
      <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">KURSUS/BOOTCAMP/PELATIHAN</h2>
      <div className="space-y-4">
        {bootcamps.map((bootcamp) => (
          <div key={bootcamp.id}>
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm text-black">{bootcamp.name || "Nama Kursus/Bootcamp"}</h3>
              <span className="text-sm text-black font-semibold">{bootcamp.location}</span>
            </div>

            <div className="flex justify-between items-start">
              <p className="text-sm text-black italic">{bootcamp.institution || "Institusi"}</p>
              <span className="text-sm text-black whitespace-nowrap">
                {formatDate(bootcamp.startDate)}
                {bootcamp.startDate && bootcamp.endDate && " - "}
                {formatDate(bootcamp.endDate)}
              </span>
            </div>

            {bootcamp.description && <div className="cv-content text-sm text-black mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(bootcamp.description) }} />}
          </div>
        ))}
      </div>
    </section>
  );
}
