// Portfolio Builder Data Interfaces

export interface PortfolioProject {
    id: string;
    title: string;
    category: string;
    description: string;
    techStack: string;
    projectUrl?: string;
    repositoryUrl?: string;
    imageUrl?: string;
}

export interface PortfolioEducation {
    id: string;
    institution: string;
    degree: string;
    year: string;
}

export interface PortfolioData {
    // Personal Info
    profilePhoto: string;
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;

    // About
    summary: string;

    // Projects
    projects: PortfolioProject[];

    // Skills
    skills: string[];

    // Education
    education: PortfolioEducation[];

    // Styling
    themeColor?: string;
}

export const initialPortfolioData: PortfolioData = {
    profilePhoto: "",
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    projects: [],
    skills: [],
    education: [],
    themeColor: "#4f46e5", // Default Indigo
};
