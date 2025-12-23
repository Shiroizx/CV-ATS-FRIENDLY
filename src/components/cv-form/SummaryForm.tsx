import type { CVData } from "../../types";
import { FileText } from "lucide-react";
import RichTextEditor from "../ui/RichTextEditor";

interface SummaryFormProps {
  data: CVData;
  onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function SummaryForm({ data, onUpdate }: SummaryFormProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Cerita Singkat Tentang Kamu
      </h2>
      <p className="text-xs text-gray-500 mb-3">Tulis gambaran singkat tentang diri kamu. Cocok untuk siswa SMA/SMK, mahasiswa, ataupun yang sudah bekerja.</p>
      <RichTextEditor
        value={data.summary}
        onChange={(value) => onUpdate("summary", value)}
        placeholder="Contoh: Siswa SMK yang tertarik pada dunia teknologi dan kreatif. Aktif di organisasi sekolah dan sering mengikuti lomba desain, konten digital, atau kompetisi lainnya..."
      />
    </section>
  );
}
