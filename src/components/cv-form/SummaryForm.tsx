import type { CVData } from '../../types';
import { FileText } from 'lucide-react';
import RichTextEditor from '../ui/RichTextEditor';

interface SummaryFormProps {
    data: CVData;
    onUpdate: <K extends keyof CVData>(field: K, value: CVData[K]) => void;
}

export default function SummaryForm({ data, onUpdate }: SummaryFormProps) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Ringkasan Profesional
            </h2>
            <RichTextEditor
                value={data.summary}
                onChange={(value) => onUpdate('summary', value)}
                placeholder="Sebagai Mahasiswa Sistem Informasi yang bersemangat dalam Software Development dan teknologi..."
            />
        </section>
    );
}
