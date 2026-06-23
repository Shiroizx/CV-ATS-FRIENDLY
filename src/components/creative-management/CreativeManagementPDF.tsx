import { Document, Page, Text, View, StyleSheet, Image, Circle, Svg } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { CreativeManagementData } from "../../types/creativeManagement";

// Import font registration (side-effect)
import "../../lib/pdfFonts";

interface CreativeManagementPDFProps {
  data: CreativeManagementData;
}

// Colors matching Tailwind classes used in preview
const colors = {
  headerBg: "#1e3a5f",
  white: "#ffffff",
  whiteAlpha90: "rgba(255, 255, 255, 0.9)",
  gray900: "#111827",
  gray700: "#374151",
  gray600: "#4b5563",
  gray300: "#d1d5db",
};

// Font sizes calibrated to match Tailwind text-* classes at A4 scale
// Preview uses responsive classes; PDF targets the desktop (lg) sizes
const fontSize = {
  // Header
  fullName: 30,        // text-4xl ~ 36px, scaled down slightly for A4
  profession: 15,      // text-xl ~ 20px, scaled for A4
  // Section titles
  sectionTitle: 17,    // text-2xl ~ 24px, scaled for A4
  // Body text
  body: 10.5,          // prose-sm ~ 14px, scaled for A4
  bodySmall: 9.5,      // text-sm ~ 14px, scaled for A4
  // Meta text (dates, labels)
  meta: 9.5,           // text-gray-600 spans
  // Skills
  skill: 9.5,
  // Footer
  footer: 9,
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Inter",
    padding: 0,
    position: "relative",
  },

  // ── Header ──────────────────────────────────
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    objectFit: "cover",
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  fullName: {
    fontSize: fontSize.fullName,
    fontWeight: 700,
    color: colors.white,
    marginBottom: 4,
  },
  profession: {
    fontSize: fontSize.profession,
    fontWeight: 400,
    color: colors.whiteAlpha90,
  },

  // ── Content ─────────────────────────────────
  content: {
    paddingHorizontal: 32,
    paddingTop: 18,
    paddingBottom: 56, // space for absolute footer
  },

  // ── Sections ────────────────────────────────
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: fontSize.sectionTitle,
    fontWeight: 700,
    color: colors.gray900,
  },
  sectionLineContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  sectionLine: {
    height: 1.5,
    backgroundColor: colors.gray300,
  },
  sectionDot: {
    position: "absolute",
    right: 0,
    top: -4,
  },

  // ── Summary ─────────────────────────────────
  summaryText: {
    fontSize: fontSize.body,
    lineHeight: 1.55,
    color: colors.gray700,
    textAlign: "justify",
  },

  // ── Education ───────────────────────────────
  eduItem: {
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  eduDate: {
    fontSize: fontSize.meta,
    fontWeight: 500,
    color: colors.gray600,
    width: 90,
    paddingTop: 1,
  },
  eduContent: {
    flex: 1,
  },
  eduTitle: {
    fontSize: fontSize.body,
    fontWeight: 700,
    color: colors.gray900,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  eduDesc: {
    fontSize: fontSize.bodySmall,
    lineHeight: 1.5,
    color: colors.gray700,
    marginTop: 2,
    textAlign: "justify",
  },

  // ── Experience ──────────────────────────────
  expItem: {
    marginBottom: 12,
  },
  expMeta: {
    fontSize: fontSize.meta,
    fontWeight: 500,
    color: colors.gray600,
    marginBottom: 4,
  },
  expTitle: {
    fontSize: fontSize.body,
    fontWeight: 700,
    color: colors.gray900,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  expOrgName: {
    fontSize: fontSize.meta,
    fontWeight: 500,
    color: colors.gray600,
    marginBottom: 3,
  },
  expDesc: {
    fontSize: fontSize.bodySmall,
    lineHeight: 1.5,
    color: colors.gray700,
    marginTop: 2,
    textAlign: "justify",
  },

  // ── Skills ──────────────────────────────────
  skillsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  skillColumn: {
    flex: 1,
  },
  skillItem: {
    fontSize: fontSize.skill,
    color: colors.gray700,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skillBullet: {
    fontSize: fontSize.skill,
    color: colors.gray700,
    marginRight: 6,
  },
  skillText: {
    fontSize: fontSize.skill,
    color: colors.gray700,
    flex: 1,
  },

  // ── Footer ──────────────────────────────────
  footer: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: fontSize.footer,
    color: colors.white,
  },
  footerDotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.white,
  },
});

// ── Helpers ─────────────────────────────────────

const stripHtml = (html: string): string => {
  return html
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n● ")
    .replace(/<li[^>]*>/gi, "● ")
    .replace(/<\/li>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/ +/g, " ")
    .replace(/\n +/g, "\n")
    .replace(/ +\n/g, "\n")
    .trim();
};

const renderTextWithBullets = (text: string, style: Style) => {
  const lines = text.split("\n").filter((line) => line.trim());
  return (
    <>
      {lines.map((line, idx) => (
        <Text key={idx} style={style}>
          {line}
        </Text>
      ))}
    </>
  );
};

// Decorative dot at end of section line (matching preview's rounded-full dot)
const SectionDot = () => (
  <View style={styles.sectionDot}>
    <Svg width={10} height={10}>
      <Circle cx={5} cy={5} r={5} fill={colors.gray900} />
    </Svg>
  </View>
);

// Section header component matching preview layout
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLineContainer}>
      <View style={styles.sectionLine} />
      <SectionDot />
    </View>
  </View>
);

// ── Main Component ──────────────────────────────

export function CreativeManagementPDF({ data }: CreativeManagementPDFProps) {
  const formatDateRange = (start?: string, end?: string, isCurrent?: boolean) => {
    if (!start) return "";
    const startYear = start.includes("-") ? start.split("-")[0] : start;
    if (isCurrent) return `${startYear} - Sekarang`;
    if (!end) return startYear;
    const endYear = end.includes("-") ? end.split("-")[0] : end;
    return `${startYear} - ${endYear}`;
  };

  const formatEducationDate = (start?: string, end?: string) => {
    if (!start) return "";
    if (!end) return start;
    return `${start}-${end}`;
  };

  const skillsPerColumn = Math.ceil(data.skills.length / 3);
  const skillsColumns = [
    data.skills.slice(0, skillsPerColumn),
    data.skills.slice(skillsPerColumn, skillsPerColumn * 2),
    data.skills.slice(skillsPerColumn * 2),
  ];

  // Build footer items array for dot-separator rendering
  const footerItems: string[] = [];
  if (data.whatsapp) footerItems.push(data.whatsapp);
  if (data.email) footerItems.push(data.email);
  if (data.location) footerItems.push(data.location);
  if (data.linkedin) footerItems.push(data.linkedin);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          {data.profilePhoto && (
            <Image src={data.profilePhoto} style={styles.profilePhoto} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.fullName}>{data.fullName || "Nama Lengkap"}</Text>
            {data.profession && <Text style={styles.profession}>{data.profession}</Text>}
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Summary / Tentang Saya */}
          {data.summary && (
            <View style={styles.section}>
              <SectionHeader title="Tentang Saya" />
              <Text style={styles.summaryText}>{stripHtml(data.summary)}</Text>
            </View>
          )}

          {/* Pendidikan */}
          {data.education.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Pendidikan" />
              {data.education.map((edu, idx) => (
                <View key={idx} style={styles.eduItem}>
                  <Text style={styles.eduDate}>
                    {formatEducationDate(edu.startDate, edu.endDate)}
                  </Text>
                  <View style={styles.eduContent}>
                    <Text style={styles.eduTitle}>
                      {edu.university || "Universitas"}{" "}
                      {edu.major && `| ${edu.major.toUpperCase()}`}
                    </Text>
                    {edu.description &&
                      renderTextWithBullets(stripHtml(edu.description), styles.eduDesc)}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Pengalaman Kerja/Organisasi */}
          {data.experiences.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Pengalaman Kerja/Organisasi" />
              {data.experiences.map((exp, idx) => (
                <View key={idx} style={styles.expItem}>
                  {exp.type === "work" ? (
                    <>
                      <Text style={styles.expMeta}>
                        {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob)} |{" "}
                        {exp.company || "Perusahaan"}
                      </Text>
                      <Text style={styles.expTitle}>{exp.position || "Posisi"}</Text>
                      {exp.description &&
                        renderTextWithBullets(stripHtml(exp.description), styles.expDesc)}
                    </>
                  ) : (
                    <>
                      {(exp.startDate || exp.endDate) && (
                        <Text style={styles.expMeta}>
                          {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob)}
                        </Text>
                      )}
                      <Text style={styles.expTitle}>{exp.position || "Jabatan"}</Text>
                      <Text style={styles.expOrgName}>{exp.name || "Nama Organisasi"}</Text>
                      {exp.description &&
                        renderTextWithBullets(stripHtml(exp.description), styles.expDesc)}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Kemampuan */}
          {data.skills.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Kemampuan" />
              <View style={styles.skillsGrid}>
                {skillsColumns.map((column, colIdx) => (
                  <View key={colIdx} style={styles.skillColumn}>
                    {column.map((skill, idx) => (
                      <View key={idx} style={styles.skillItem}>
                        <Text style={styles.skillBullet}>•</Text>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          {footerItems.map((item, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {idx > 0 && <View style={styles.footerDotSeparator} />}
              <Text style={styles.footerText}>{item}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
