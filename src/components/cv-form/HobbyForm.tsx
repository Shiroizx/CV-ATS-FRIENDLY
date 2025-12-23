import type { CVData } from "../../types";
import { Heart } from "lucide-react";

interface HobbyFormProps {
  data: CVData;
  onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function HobbyForm({ data, onUpdate }: HobbyFormProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Heart className="w-5 h-5 text-blue-600" />
        Hobi & Kegiatan Favorit
      </h2>
      <p className="text-xs text-gray-500 mb-3">Tulis hobi atau aktivitas yang sering kamu lakukan di waktu luang, misalnya: futsal, editing video, membuat konten, desain, dll.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Daftar Hobby (pisahkan dengan koma)</label>
        <input
          type="text"
          value={data.hobbies}
          onChange={(e) => onUpdate("hobbies", e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Contoh: Membaca, Bermain Game, Editing Video, Menonton Film"
        />
      </div>
    </section>
  );
}
