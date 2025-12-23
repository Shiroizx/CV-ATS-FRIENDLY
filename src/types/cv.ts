// CV Data Interfaces

export interface Experience {
    id: string;
    company: string;
    position: string;
    employmentType: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrentJob: boolean;
    description: string;
}

export interface Education {
    id: string;
    level: string;
    field: string;
    institution: string;
    city: string;
    startDate: string;
    endDate: string;
    isCurrentStudy: boolean;
    gpa?: string;
    maxGpa?: string;
    description?: string;
}
export interface Bootcamp {
    id: string;
    name: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface Skills {
    softSkills: string;
    hardSkills: string;
    softwareSkills: string;
}

export interface Award {
    id: string;
    title: string;
    institution: string;
    year: string;
}

export interface CVData {
    fullName: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolio: string;
    address: string;
    summary: string;
    experiences: Experience[];
    education: Education[];
    bootcamps: Bootcamp[];
    skills: Skills;
    awards: Award[];
    hobbies: string;
}
