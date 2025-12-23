import type { Education } from '../../types';

interface PreviewEducationProps {
    education: Education[];
    formatDate: (date: string) => string;
}

export default function PreviewEducation({ education, formatDate }: PreviewEducationProps) {
    if (education.length === 0) return null;

    return (
        <section className="mb-5">
            <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">
                PENDIDIKAN
            </h2>
            <div className="space-y-4">
                {education.map((edu) => (
                    <div key={edu.id}>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm text-black">
                                {edu.institution || 'Nama Institusi'}
                            </h3>
                            <span className="text-sm text-black font-semibold">
                                {edu.city}
                            </span>
                        </div>

                        <div className="flex justify-between items-start">
                            <p className="text-sm text-black italic">
                                {edu.level && edu.field
                                    ? `${edu.level} ${edu.field}`
                                    : edu.level || edu.field || 'Program Studi'}
                                {edu.gpa && (
                                    <span className="not-italic">
                                        {' '}| IPK: {edu.gpa}
                                        {edu.maxGpa && ` / ${edu.maxGpa}`}
                                    </span>
                                )}
                            </p>
                            <span className="text-sm text-black whitespace-nowrap">
                                {formatDate(edu.startDate)}
                                {edu.startDate && (edu.endDate || edu.isCurrentStudy) && ' - '}
                                {edu.isCurrentStudy ? 'Sekarang' : formatDate(edu.endDate)}
                            </span>
                        </div>

                        {edu.description && (
                            <div
                                className="cv-content text-sm text-black mt-1"
                                dangerouslySetInnerHTML={{ __html: edu.description }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
