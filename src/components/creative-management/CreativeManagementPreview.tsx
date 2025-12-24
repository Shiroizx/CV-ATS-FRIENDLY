import type { CreativeManagementData } from "../../types/creativeManagement";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import "./print.css";
import "./preview.css";

interface CreativeManagementPreviewProps {
  data: CreativeManagementData;
}

export default function CreativeManagementPreview({ data }: CreativeManagementPreviewProps) {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/4c4db015-1b90-47a8-95d7-ee1bde821bce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "CreativeManagementPreview.tsx:8",
      message: "Preview component render started",
      data: { fullName: data.fullName, educationCount: data.education.length, experienceCount: data.experiences.length, skillsCount: data.skills.length, hasSummary: !!data.summary },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => { });
  // #endregion

  const formatDateRange = (start?: string, end?: string, isCurrent?: boolean) => {
    if (!start) return "";
    const startYear = start.includes("-") ? start.split("-")[0] : start;
    if (isCurrent) {
      return `${startYear} - Sekarang`;
    }
    if (!end) return startYear;
    const endYear = end.includes("-") ? end.split("-")[0] : end;
    return `${startYear} - ${endYear}`;
  };

  const formatEducationDate = (start?: string, end?: string) => {
    if (!start) return "";
    if (!end) return start;
    return `${start}-${end}`;
  };

  // Split skills into 3 columns
  const skillsPerColumn = Math.ceil(data.skills.length / 3);
  const skillsColumns = [data.skills.slice(0, skillsPerColumn), data.skills.slice(skillsPerColumn, skillsPerColumn * 2), data.skills.slice(skillsPerColumn * 2)];

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/4c4db015-1b90-47a8-95d7-ee1bde821bce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "CreativeManagementPreview.tsx:27",
      message: "Preview layout info",
      data: {
        skillsPerColumn,
        columnsCount: skillsColumns.length,
        columnSizes: skillsColumns.map((c) => c.length),
        previewClasses: "max-w-4xl mx-auto bg-white shadow-2xl",
        headerClasses: "bg-[#1e3a5f] text-white px-8 md:px-12 print:px-[0.75in] pt-8 md:pt-12 print:pt-[0.75in] pb-6",
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "E",
    }),
  }).catch(() => { });
  // #endregion

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none creative-management-cv">
      <article>
        {/* Header - Dark Blue */}
        <header
          className="bg-[#1e3a5f] text-white px-8 md:px-12 pt-8 md:pt-10 pb-4"
          style={{ backgroundColor: "#1e3a5f", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
        >
          <div className="flex items-start gap-6">
            {data.profilePhoto && (
              <img
                src={data.profilePhoto}
                alt={data.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl print:text-3xl font-bold mb-2">{data.fullName || "Nama Lengkap"}</h1>
              {data.profession && <p className="text-xl print:text-base text-white/90">{data.profession}</p>}
            </div>
          </div>
        </header>

        {/* Main Content - White */}
        <div className="px-8 md:px-12 py-6 md:py-8">
          {/* Tentang Saya */}
          {data.summary && (
            <section className="mb-6 print:mb-4">
              <div className="flex items-center gap-3 mb-3 print:mb-2">
                <h2 className="text-2xl print:text-lg font-bold text-gray-900">Tentang Saya</h2>
                <div className="flex-1 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 print:w-2 print:h-2 bg-gray-900 rounded-full"></div>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed print:leading-snug print:text-xs text-justify" dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.summary) }} />
            </section>
          )}

          {/* Pendidikan */}
          {data.education.length > 0 && (
            <section className="mb-6 print:mb-4">
              <div className="flex items-center gap-3 mb-4 print:mb-2">
                <h2 className="text-2xl print:text-lg font-bold text-gray-900">Pendidikan</h2>
                <div className="flex-1 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 print:w-2 print:h-2 bg-gray-900 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4 print:space-y-2">
                {data.education.map((edu, idx) => {
                  // #region agent log
                  const eduDate = formatEducationDate(edu.startDate, edu.endDate);
                  const eduTitle = `${edu.university || "Universitas"} ${edu.major ? `| ${edu.major.toUpperCase()}` : ""}`;
                  fetch("http://127.0.0.1:7242/ingest/4c4db015-1b90-47a8-95d7-ee1bde821bce", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      location: "CreativeManagementPreview.tsx:80",
                      message: "Preview education item rendering",
                      data: { index: idx, date: eduDate, titleLength: eduTitle.length, hasDescription: !!edu.description, descriptionLength: edu.description?.length || 0, classes: "flex items-start gap-4 mb-2" },
                      timestamp: Date.now(),
                      sessionId: "debug-session",
                      runId: "run1",
                      hypothesisId: "B",
                    }),
                  }).catch(() => { });
                  // #endregion
                  return (
                    <div key={edu.id || idx}>
                      <div className="flex items-start gap-4 print:gap-2 mb-2 print:mb-1">
                        <span className="text-gray-600 print:text-xs font-medium whitespace-nowrap">{eduDate}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 print:text-sm uppercase">{eduTitle}</h3>
                          {edu.description && <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed print:leading-snug print:text-xs text-justify mt-2 print:mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(edu.description) }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pengalaman Kerja/Organisasi */}
          {data.experiences.length > 0 && (
            <section className="mb-6 print:mb-4">
              <div className="flex items-center gap-3 mb-4 print:mb-2">
                <h2 className="text-2xl print:text-lg font-bold text-gray-900">Pengalaman Kerja/Organisasi</h2>
                <div className="flex-1 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 print:w-2 print:h-2 bg-gray-900 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4 print:space-y-2">
                {data.experiences.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    {exp.type === "work" ? (
                      <>
                        <div className="flex items-start gap-4 print:gap-2 mb-2 print:mb-1">
                          <span className="text-gray-600 print:text-xs font-medium whitespace-nowrap">
                            {formatDateRange(exp.startDate || "", exp.endDate || "", exp.isCurrentJob || false)} | {exp.company || "Perusahaan"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 print:mb-1 print:text-sm uppercase">{exp.position || "Posisi"}</h3>
                        {exp.description && <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed print:leading-snug print:text-xs text-justify mt-2 print:mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.description) }} />}
                      </>
                    ) : (
                      <>
                        {(exp.startDate || exp.endDate) && (
                          <div className="flex items-start gap-4 print:gap-2 mb-2 print:mb-1">
                            <span className="text-gray-600 print:text-xs font-medium whitespace-nowrap">
                              {formatDateRange(exp.startDate || "", exp.endDate || "", exp.isCurrentJob || false)}
                            </span>
                          </div>
                        )}
                        <div className="mb-2 print:mb-1">
                          <h3 className="font-bold text-gray-900 mb-1 print:text-sm uppercase">{exp.position || "Jabatan"}</h3>
                          <p className="text-gray-600 print:text-xs font-medium">{exp.name || "Nama Organisasi"}</p>
                        </div>
                        {exp.description && <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed print:leading-snug print:text-xs text-justify mt-2 print:mt-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(exp.description) }} />}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kemampuan */}
          {data.skills.length > 0 && (
            <section className="mb-6 print:mb-3">
              <div className="flex items-center gap-3 mb-4 print:mb-2">
                <h2 className="text-2xl print:text-lg font-bold text-gray-900">Kemampuan</h2>
                <div className="flex-1 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 print:w-2 print:h-2 bg-gray-900 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 print:gap-2">
                {skillsColumns.map((column, colIdx) => (
                  <ul key={colIdx} className="space-y-1 print:space-y-0">
                    {column.map((skill, skillIdx) => (
                      <li key={skillIdx} className="text-gray-700 text-sm print:text-xs flex items-start">
                        <span className="mr-2">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!data.fullName && !data.summary && data.experiences.length === 0 && data.education.length === 0 && (
            <div className="text-center py-12 text-gray-500 print:hidden">
              <p className="text-lg">Mulai isi form di sebelah kiri untuk melihat preview CV di sini</p>
            </div>
          )}
        </div>

        {/* Footer - Dark Blue */}
        <footer className="bg-[#1e3a5f] text-white px-8 md:px-12 py-4" style={{ backgroundColor: "#1e3a5f", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {data.whatsapp && (
              <>
                <span>{data.whatsapp}</span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </>
            )}
            {data.email && (
              <>
                <span>{data.email}</span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </>
            )}
            {data.location && <span>{data.location}</span>}
          </div>
        </footer>
      </article>
    </div>
  );
}
