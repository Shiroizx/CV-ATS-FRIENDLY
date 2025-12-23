// Constants for CV Builder
import type { CVData } from './cv';

export const initialCVData: CVData = {
    profilePhoto: '',
    fullName: '',
    phone: '',
    email: '',
    linkedin: '',
    showLinkedinUnderline: true,
    portfolio: '',
    showPortfolioUnderline: true,
    address: '',
    summary: '',
    experiences: [],
    education: [],
    bootcamps: [],
    skills: {
        softSkills: '',
        hardSkills: '',
        softwareSkills: '',
    },
    awards: [],
    hobbies: '',
};

export const educationLevels = [
    'SD',
    'SMP',
    'SMA/SMK/Sederajat',
    'D1',
    'D2',
    'D3',
    'D4',
    'S1',
    'S2',
    'S3',
];

export const employmentTypes = [
    'Full-time',
    'Part-time',
    'Magang',
    'Kontrak',
    'Freelance',
    'Wiraswasta',
];
