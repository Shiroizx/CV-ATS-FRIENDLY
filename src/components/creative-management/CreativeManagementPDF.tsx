import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { CreativeManagementData } from "../../types/creativeManagement";

interface CreativeManagementPDFProps {
  data: CreativeManagementData;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 0,
    position: "relative",
  },
  header: {
    backgroundColor: "#1e3a5f",
    padding: "20pt 28pt",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  profilePhoto: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    objectFit: "cover",
  },
  headerText: {
    flex: 1,
  },
  fullName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  profession: {
    fontSize: 15,
    color: "#ffffff",
  },
  content: {
    padding: "18pt 28pt",
    paddingBottom: "60pt",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#374151",
    textAlign: "justify",
  },
  eduItem: {
    marginBottom: 16,
    flexDirection: "row",
    gap: 8,
  },
  eduDate: {
    fontSize: 9,
    color: "#4b5563",
    width: 80,
  },
  eduContent: {
    flex: 1,
  },
  eduTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
  },
  eduDesc: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#374151",
    marginTop: 3,
  },
  expItem: {
    marginBottom: 18,
  },
  expDate: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 5,
  },
  expTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
  },
  expDesc: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#374151",
    marginTop: 3,
  },
  skillsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  skillColumn: {
    flex: 1,
  },
  skillItem: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 3,
  },
  footer: {
    backgroundColor: "#1e3a5f",
    padding: "14pt 28pt",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 10,
    color: "#ffffff",
  },
});

const stripHtml = (html: string): string => {
  return html
    // Convert list items to bullets with newlines (using filled circle bullet ●)
    .replace(/<\/li>\s*<li[^>]*>/gi, "\n● ")
    .replace(/<li[^>]*>/gi, "● ")
    .replace(/<\/li>/gi, "")
    // Convert block elements to newlines
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, "")
    // Clean up entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    // Clean up excessive whitespace but preserve newlines
    .replace(/ +/g, " ")
    .replace(/\n +/g, "\n")
    .replace(/ +\n/g, "\n")
    .trim();
};

// Helper to render text with bullets - simple approach
const renderTextWithBulletImages = (text: string, style: any) => {
  // Split by newline and render each line as separate Text
  const lines = text.split('\n').filter(line => line.trim());
  return (
    <>
      {lines.map((line, idx) => (
        <Text key={idx} style={style}>{line}</Text>
      ))}
    </>
  );
};

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {data.profilePhoto && (
            <Image src={data.profilePhoto} style={styles.profilePhoto} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.fullName}>{data.fullName || "Nama Lengkap"}</Text>
            {data.profession && <Text style={styles.profession}>{data.profession}</Text>}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Summary */}
          {data.summary && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tentang Saya</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.summaryText}>{stripHtml(data.summary)}</Text>
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pendidikan</Text>
                <View style={styles.sectionLine} />
              </View>
              {data.education.map((edu, idx) => (
                <View key={idx} style={styles.eduItem}>
                  <Text style={styles.eduDate}>
                    {formatEducationDate(edu.startDate, edu.endDate)}
                  </Text>
                  <View style={styles.eduContent}>
                    <Text style={styles.eduTitle}>
                      {edu.university || "Universitas"} {edu.major && `| ${edu.major.toUpperCase()}`}
                    </Text>
                    {edu.description && renderTextWithBulletImages(stripHtml(edu.description), styles.eduDesc)}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Experience */}
          {data.experiences.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pengalaman Kerja/Organisasi</Text>
                <View style={styles.sectionLine} />
              </View>
              {data.experiences.map((exp, idx) => (
                <View key={idx} style={styles.expItem}>
                  {exp.type === "work" ? (
                    <>
                      <Text style={styles.expDate}>
                        {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob)} | {exp.company || "Perusahaan"}
                      </Text>
                      <Text style={styles.expTitle}>{exp.position || "Posisi"}</Text>
                      {exp.description && renderTextWithBulletImages(stripHtml(exp.description), styles.expDesc)}
                    </>
                  ) : (
                    <>
                      {(exp.startDate || exp.endDate) && (
                        <Text style={styles.expDate}>
                          {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob)}
                        </Text>
                      )}
                      <Text style={styles.expTitle}>{exp.position || "Jabatan"}</Text>
                      <Text style={styles.expDate}>{exp.name || "Nama Organisasi"}</Text>
                      {exp.description && renderTextWithBulletImages(stripHtml(exp.description), styles.expDesc)}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kemampuan</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.skillsGrid}>
                {skillsColumns.map((column, colIdx) => (
                  <View key={colIdx} style={styles.skillColumn}>
                    {column.map((skill, idx) => (
                      <Text key={idx} style={styles.skillItem}>• {skill}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {data.whatsapp && <Text style={styles.footerText}>{data.whatsapp}</Text>}
          {data.email && <Text style={styles.footerText}> • {data.email}</Text>}
          {data.location && <Text style={styles.footerText}> • {data.location}</Text>}
        </View>
      </Page>
    </Document>
  );
}
