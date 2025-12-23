import type { Skills } from '../../types';

interface PreviewSkillsProps {
    skills: Skills;
}

export default function PreviewSkills({ skills }: PreviewSkillsProps) {
    const hasSkills = skills.softSkills || skills.hardSkills || skills.softwareSkills;

    if (!hasSkills) return null;

    return (
        <section className="mb-5">
            <h2 className="text-base font-bold text-black uppercase border-b border-black pb-1 mb-3 tracking-wide">
                SKILL
            </h2>
            <table className="w-full text-sm text-black">
                <tbody>
                    {skills.softSkills && (
                        <tr>
                            <td className="py-0.5 pr-4 align-top whitespace-nowrap" style={{ width: '120px' }}>
                                Soft Skill
                            </td>
                            <td className="py-0.5">{skills.softSkills}</td>
                        </tr>
                    )}
                    {skills.hardSkills && (
                        <tr>
                            <td className="py-0.5 pr-4 align-top whitespace-nowrap">
                                Hard Skill
                            </td>
                            <td className="py-0.5">{skills.hardSkills}</td>
                        </tr>
                    )}
                    {skills.softwareSkills && (
                        <tr>
                            <td className="py-0.5 pr-4 align-top whitespace-nowrap">
                                Software Skill
                            </td>
                            <td className="py-0.5">{skills.softwareSkills}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
}
