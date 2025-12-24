// Creative Management CV Data Interfaces

export type ExperienceType = "work" | "organization";

export interface CreativeExperience {
  id: string;
  type: ExperienceType;
  // Common fields
  position: string;
  description: string;
  // Work experience fields
  company?: string;
  startDate?: string;
  endDate?: string;
  isCurrentJob?: boolean;
  // Organization fields
  name?: string;
}

export interface CreativeEducation {
  id: string;
  university: string;
  major: string;
  startDate?: string;
  endDate?: string;
  description?: string; // Paragraph description
}

export interface CreativeCertification {
  id: string;
  title: string;
  issuer: string; // e.g., Coursera, LinkedIn Learning, BNSP
  year?: string;
}

export interface CreativeManagementData {
  // Header & Profil Profesional
  profilePhoto: string;
  fullName: string;
  profession: string; // e.g., "Spesialis Grafis Desainer"
  whatsapp: string;
  email: string;
  location: string;
  linkedin: string; // Required

  // Summary (Profil)
  summary: string; // 3-4 sentences

  // Experience (Work & Organization combined, maks 2 total)
  experiences: CreativeExperience[];

  // Skill Set (maks 9 total)
  skills: string[]; // Combined hard and soft skills

  // Education (maks 2)
  education: CreativeEducation[];
}

export const initialCreativeManagementData: CreativeManagementData = {
  profilePhoto: "",
  fullName: "",
  profession: "",
  whatsapp: "",
  email: "",
  location: "",
  linkedin: "",
  summary: "",
  experiences: [],
  skills: [],
  education: [],
};
