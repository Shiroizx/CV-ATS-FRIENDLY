import {
    Mail, Phone, MapPin, Globe, Linkedin, Github,
    ExternalLink, FolderOpen, GraduationCap, Wrench, User,
} from "lucide-react";
import type { PortfolioData } from "../../types/portfolio";

const formatUrl = (url: string) => {
    if (!url) return "";
    try {
        const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
        let domain = urlObj.hostname.replace(/^www\./, '');
        let path = urlObj.pathname;
        if (path === '/') path = '';
        return (domain + path).replace(/\/$/, '');
    } catch {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }
};

// A4 at 96 dpi
const A4_HEIGHT_PX = 1123;

interface PortfolioPreviewProps {
    data: PortfolioData;
    /** When true the outer container fills 100% height of its parent (for PDF capture use) */
    fullHeight?: boolean;
}

// Hard limits — enforced silently in the preview
const MAX_PROJECTS = 4;
const MAX_SKILLS = 8;
const MAX_EDUCATION = 3;
const MAX_SUMMARY_CHARS = 350;

export default function PortfolioPreview({ data, fullHeight }: PortfolioPreviewProps) {
    const projects = data.projects.slice(0, MAX_PROJECTS);
    const skills = data.skills.slice(0, MAX_SKILLS);
    const education = data.education.slice(0, MAX_EDUCATION);
    const summary = data.summary.length > MAX_SUMMARY_CHARS
        ? data.summary.slice(0, MAX_SUMMARY_CHARS).trimEnd() + "…"
        : data.summary;

    const hasProjects = projects.length > 0;
    const hasSkills = skills.length > 0;
    const hasEducation = education.length > 0;
    const hasContact = data.email || data.phone || data.location || data.website || data.linkedin || data.github;

    const outerStyle = fullHeight ? { minHeight: `${A4_HEIGHT_PX}px` } : undefined;

    const theme = data.themeColor || "#4f46e5";

    return (
        <div
            className="w-full h-full flex-1 bg-white shadow-2xl overflow-hidden flex flex-col font-sans"
            style={outerStyle}
        >
            {/* ====== HEADER ====== */}
            <div
                className="relative px-8 py-8 text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme}, #1e293b)` }}
            >
                {/* Decorative dots */}
                <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="2" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="200" height="200" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="relative flex items-center gap-6">
                    {data.profilePhoto ? (
                        <img
                            src={data.profilePhoto}
                            alt={data.fullName}
                            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl flex-shrink-0"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-10 h-10 text-white/40" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <h1 className="text-3xl font-bold mb-1 truncate">
                            {data.fullName || "Nama Lengkap"}
                        </h1>
                        {data.title && (
                            <p className="text-lg text-white/90 font-medium">{data.title}</p>
                        )}
                        {hasContact && (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-300">
                                {data.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{data.email}</span>}
                                {data.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{data.phone}</span>}
                                {data.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{data.location}</span>}
                            </div>
                        )}
                        {(data.website || data.linkedin || data.github) && (
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                {data.website && <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"><Globe className="w-3.5 h-3.5 flex-shrink-0" />{formatUrl(data.website)}</a>}
                                {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"><Linkedin className="w-3.5 h-3.5 flex-shrink-0" />{formatUrl(data.linkedin)}</a>}
                                {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"><Github className="w-3.5 h-3.5 flex-shrink-0" />{formatUrl(data.github)}</a>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ====== BODY — flex-1 pushes footer down ====== */}
            <div className="px-8 py-6 space-y-6 flex-1">
                {/* About */}
                {summary && (
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2" style={{ borderColor: `${theme}30` }}>
                            <User className="w-5 h-5" style={{ color: theme }} /> Tentang Saya
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
                    </section>
                )}

                {/* Projects */}
                {hasProjects && (
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2" style={{ borderColor: `${theme}30` }}>
                            <FolderOpen className="w-5 h-5" style={{ color: theme }} /> Proyek
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {projects.map((project) => (
                                <div key={project.id} className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
                                    {project.imageUrl && (
                                        <div className="w-full h-32 overflow-hidden">
                                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <div className="p-3 space-y-1.5">
                                        <div className="flex items-start justify-between gap-1">
                                            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{project.title || "Untitled"}</h3>
                                            {project.category && (
                                                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full" style={{ backgroundColor: `${theme}15`, color: theme }}>{project.category}</span>
                                            )}
                                        </div>
                                        {project.description && (
                                            <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{project.description}</p>
                                        )}
                                        {project.techStack && (
                                            <div className="flex flex-wrap gap-1">
                                                {project.techStack.split(",").slice(0, 4).map((tech, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                        {project.projectUrl && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-medium hover:underline" style={{ color: theme }}>
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />{formatUrl(project.projectUrl)}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {hasSkills && (
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2" style={{ borderColor: `${theme}30` }}>
                            <Wrench className="w-5 h-5" style={{ color: theme }} /> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span key={skill} className="px-3 py-1.5 text-sm font-medium rounded-lg border" style={{ backgroundColor: `${theme}10`, color: theme, borderColor: `${theme}30` }}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {hasEducation && (
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2" style={{ borderColor: `${theme}30` }}>
                            <GraduationCap className="w-5 h-5" style={{ color: theme }} /> Pendidikan
                        </h2>
                        <div className="space-y-2">
                            {education.map((edu) => (
                                <div key={edu.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme}15` }}>
                                        <GraduationCap className="w-4 h-4" style={{ color: theme }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{edu.institution || "Institusi"}</h3>
                                        {edu.degree && <p className="text-xs text-gray-600">{edu.degree}</p>}
                                        {edu.year && <p className="text-xs text-gray-500 mt-0.5">{edu.year}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ====== FOOTER — stays at bottom because body is flex-1 ====== */}
            <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center flex-shrink-0">
                <p className="text-xs text-gray-400">Dibuat dengan FreeBuild CV — Portfolio Builder</p>
            </div>
        </div>
    );
}
