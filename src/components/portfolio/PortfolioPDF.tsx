import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { PortfolioData } from "../../types/portfolio";

const c = {
    // Header
    headerBg: "#1e293b",
    headerAccent: "#a5b4fc",
    headerContact: "#cbd5e1",

    // Body
    dark: "#111827",
    text: "#374151",
    textLight: "#6b7280",
    textMuted: "#9ca3af",

    // Section borders (match preview border-b colors)
    indigo100: "#e0e7ff",
    orange100: "#ffedd5",
    teal100: "#ccfbf1",

    // Section title icon colors
    indigo500: "#6366f1",
    orange500: "#f97316",
    teal500: "#14b8a6",

    // Skill badge
    tealBadgeBg: "#f0fdfa",
    tealBadgeText: "#0f766e",
    tealBadgeBorder: "#99f6e4",

    // Tech badge
    techBg: "#f1f5f9",
    techText: "#475569",

    // Category badge
    orangeBadgeBg: "#fff7ed",
    orangeBadgeText: "#c2410c",

    // Education icon bg
    indigoBg: "#e0e7ff",
    indigoIcon: "#4f46e5",

    // Project card
    cardBg: "#f9fafb",
    cardBorder: "#e5e7eb",

    // Link colors
    blue600: "#2563eb",

    white: "#ffffff",
    bgLight: "#f9fafb",
    border: "#f3f4f6",
};

const s = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        color: c.text,
        backgroundColor: c.white,
        padding: 0,
        position: "relative",
    },

    /* ===== HEADER ===== */
    header: {
        backgroundColor: c.headerBg,
        paddingHorizontal: 32,
        paddingVertical: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
    },
    photo: {
        width: 68,
        height: 68,
        borderRadius: 12,
        objectFit: "cover",
    },
    photoPlaceholder: {
        width: 68,
        height: 68,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    headerInfo: { flex: 1 },
    name: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: c.white,
        marginBottom: 2,
    },
    title: {
        fontSize: 11,
        color: c.headerAccent,
        fontFamily: "Helvetica-Bold",
        marginBottom: 6,
    },
    contactRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 2,
    },
    contactItem: { fontSize: 8, color: c.headerContact },
    contactSep: { fontSize: 8, color: c.headerContact, marginHorizontal: 2 },
    socialRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    socialItem: { fontSize: 8, color: c.headerAccent },

    /* ===== BODY ===== */
    body: {
        paddingHorizontal: 32,
        paddingTop: 24,
        paddingBottom: 44,
    },
    section: { marginBottom: 18 },

    /* Section title: icon circle + text + colored underline */
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingBottom: 6,
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: c.indigo100,
    },
    sectionIconCircle: {
        width: 18,
        height: 18,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionIconText: {
        fontSize: 10,
        color: c.white,
        fontFamily: "Helvetica-Bold",
    },
    sectionTitleText: {
        fontSize: 13,
        fontFamily: "Helvetica-Bold",
        color: c.dark,
    },

    /* About */
    summaryText: {
        fontSize: 10,
        color: c.text,
        lineHeight: 1.6,
    },

    /* Projects grid */
    projectGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    projectCard: {
        width: "48.5%",
        borderWidth: 1,
        borderColor: c.cardBorder,
        borderRadius: 10,
        backgroundColor: c.cardBg,
        overflow: "hidden",
    },
    projectImage: {
        width: "100%",
        height: 85,
        objectFit: "cover",
    },
    projectBody: {
        padding: "8 10 10 10",
    },
    projectTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 6,
        marginBottom: 4,
    },
    projectTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: c.dark,
        flex: 1,
    },
    categoryBadge: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: c.orangeBadgeText,
        backgroundColor: c.orangeBadgeBg,
        paddingHorizontal: 6,
        paddingVertical: 2.5,
        borderRadius: 8,
    },
    projectDesc: {
        fontSize: 8,
        color: c.textLight,
        lineHeight: 1.5,
        marginBottom: 5,
    },
    techRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginBottom: 5,
    },
    techBadge: {
        fontSize: 7.5,
        fontFamily: "Helvetica-Bold",
        color: c.techText,
        backgroundColor: c.techBg,
        paddingHorizontal: 6,
        paddingVertical: 2.5,
        borderRadius: 4,
    },
    linkRow: {
        flexDirection: "row",
        gap: 10,
    },
    demoLink: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: c.blue600,
    },
    codeLink: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: c.textLight,
    },

    /* Skills — badges layout (matching preview) */
    skillsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    skillBadge: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: c.tealBadgeText,
        backgroundColor: c.tealBadgeBg,
        borderWidth: 1,
        borderColor: c.tealBadgeBorder,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },

    /* Education — card style (matching preview) */
    eduCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: c.cardBg,
        borderWidth: 1,
        borderColor: c.cardBorder,
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    eduIconBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: c.indigoBg,
        justifyContent: "center",
        alignItems: "center",
    },
    eduIconText: {
        fontSize: 12,
        color: c.indigoIcon,
    },
    eduInfo: { flex: 1 },
    eduInstitution: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: c.dark,
        marginBottom: 1,
    },
    eduDegree: {
        fontSize: 9,
        color: c.text,
    },
    eduYear: {
        fontSize: 8,
        color: c.textMuted,
        marginTop: 1,
    },

    /* Footer */
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
        backgroundColor: c.bgLight,
        borderTopWidth: 1,
        borderTopColor: c.border,
    },
    footerText: {
        fontSize: 7,
        color: c.textMuted,
        textAlign: "center",
    },
});

interface PortfolioPDFProps {
    data: PortfolioData;
}

export function PortfolioPDF({ data }: PortfolioPDFProps) {
    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* ======== HEADER ======== */}
                <View style={s.header}>
                    {data.profilePhoto ? (
                        <Image src={data.profilePhoto} style={s.photo} />
                    ) : (
                        <View style={s.photoPlaceholder} />
                    )}
                    <View style={s.headerInfo}>
                        <Text style={s.name}>{data.fullName || "Nama Lengkap"}</Text>
                        {data.title && <Text style={s.title}>{data.title}</Text>}

                        {/* Contact row with separators */}
                        <View style={s.contactRow}>
                            {data.email && <Text style={s.contactItem}>✉ {data.email}</Text>}
                            {data.phone && (
                                <>
                                    <Text style={s.contactSep}>•</Text>
                                    <Text style={s.contactItem}>☎ {data.phone}</Text>
                                </>
                            )}
                            {data.location && (
                                <>
                                    <Text style={s.contactSep}>•</Text>
                                    <Text style={s.contactItem}>📍 {data.location}</Text>
                                </>
                            )}
                        </View>

                        {/* Social links */}
                        {(data.website || data.linkedin || data.github) && (
                            <View style={s.socialRow}>
                                {data.website && <Text style={s.socialItem}>🌐 Website</Text>}
                                {data.linkedin && <Text style={s.socialItem}>🔗 LinkedIn</Text>}
                                {data.github && <Text style={s.socialItem}>💻 GitHub</Text>}
                            </View>
                        )}
                    </View>
                </View>

                {/* ======== BODY ======== */}
                <View style={s.body}>
                    {/* —— Tentang Saya —— */}
                    {data.summary && (
                        <View style={s.section}>
                            <View style={[s.sectionTitleRow, { borderBottomColor: c.indigo100 }]}>
                                <View style={[s.sectionIconCircle, { backgroundColor: c.indigo500 }]}>
                                    <Text style={s.sectionIconText}>👤</Text>
                                </View>
                                <Text style={s.sectionTitleText}>Tentang Saya</Text>
                            </View>
                            <Text style={s.summaryText}>{data.summary}</Text>
                        </View>
                    )}

                    {/* —— Proyek —— */}
                    {data.projects.length > 0 && (
                        <View style={s.section}>
                            <View style={[s.sectionTitleRow, { borderBottomColor: c.orange100 }]}>
                                <View style={[s.sectionIconCircle, { backgroundColor: c.orange500 }]}>
                                    <Text style={s.sectionIconText}>📁</Text>
                                </View>
                                <Text style={s.sectionTitleText}>Proyek</Text>
                            </View>

                            <View style={s.projectGrid}>
                                {data.projects.map((project) => (
                                    <View key={project.id} style={s.projectCard} wrap={false}>
                                        {project.imageUrl && (
                                            <Image src={project.imageUrl} style={s.projectImage} />
                                        )}
                                        <View style={s.projectBody}>
                                            <View style={s.projectTitleRow}>
                                                <Text style={s.projectTitle}>{project.title || "Untitled"}</Text>
                                                {project.category && (
                                                    <Text style={s.categoryBadge}>{project.category}</Text>
                                                )}
                                            </View>
                                            {project.description && (
                                                <Text style={s.projectDesc}>{project.description}</Text>
                                            )}
                                            {project.techStack && (
                                                <View style={s.techRow}>
                                                    {project.techStack.split(",").map((tech, i) => (
                                                        <Text key={i} style={s.techBadge}>{tech.trim()}</Text>
                                                    ))}
                                                </View>
                                            )}
                                            <View style={s.linkRow}>
                                                {project.projectUrl && (
                                                    <Text style={s.demoLink}>↗ Demo</Text>
                                                )}
                                                {project.repositoryUrl && (
                                                    <Text style={s.codeLink}>↗ Code</Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* —— Skills (badges) —— */}
                    {data.skills.length > 0 && (
                        <View style={s.section}>
                            <View style={[s.sectionTitleRow, { borderBottomColor: c.teal100 }]}>
                                <View style={[s.sectionIconCircle, { backgroundColor: c.teal500 }]}>
                                    <Text style={s.sectionIconText}>🔧</Text>
                                </View>
                                <Text style={s.sectionTitleText}>Skills</Text>
                            </View>

                            <View style={s.skillsWrap}>
                                {data.skills.map((skill) => (
                                    <Text key={skill} style={s.skillBadge}>{skill}</Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* —— Pendidikan (cards) —— */}
                    {data.education.length > 0 && (
                        <View style={s.section}>
                            <View style={[s.sectionTitleRow, { borderBottomColor: c.indigo100 }]}>
                                <View style={[s.sectionIconCircle, { backgroundColor: c.indigo500 }]}>
                                    <Text style={s.sectionIconText}>🎓</Text>
                                </View>
                                <Text style={s.sectionTitleText}>Pendidikan</Text>
                            </View>

                            {data.education.map((edu) => (
                                <View key={edu.id} style={s.eduCard}>
                                    <View style={s.eduIconBox}>
                                        <Text style={s.eduIconText}>🎓</Text>
                                    </View>
                                    <View style={s.eduInfo}>
                                        <Text style={s.eduInstitution}>{edu.institution || "Institusi"}</Text>
                                        {edu.degree && <Text style={s.eduDegree}>{edu.degree}</Text>}
                                        {edu.year && <Text style={s.eduYear}>{edu.year}</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* ======== FOOTER ======== */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>Dibuat dengan FreeBuild CV — Portfolio Builder</Text>
                </View>
            </Page>
        </Document>
    );
}
