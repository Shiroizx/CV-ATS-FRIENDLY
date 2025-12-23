import type { Award } from '../../types';

interface PreviewAwardsProps {
    awards: Award[];
}

export default function PreviewAwards({ awards }: PreviewAwardsProps) {
    if (awards.length === 0) return null;

    return (
        <section className="mb-5">
            <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">
                PENGHARGAAN
            </h2>
            <ul className="list-disc pl-5 text-sm text-black space-y-1">
                {awards.map((award) => (
                    <li key={award.id}>
                        {award.title}
                        {award.institution && `, ${award.institution}`}
                        {award.year && `, ${award.year}`}
                    </li>
                ))}
            </ul>
        </section>
    );
}
