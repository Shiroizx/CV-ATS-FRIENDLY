import type { CVData } from "../types";
import type { CreativeManagementData } from "../types/creativeManagement";
import type { PortfolioData } from "../types/portfolio";

export const dummyCVData: CVData = {
    profilePhoto: "",
    fullName: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "081234567890",
    linkedin: "linkedin.com/in/budisantoso",
    portfolio: "budisantoso.com",
    address: "Jakarta, Indonesia",
    summary: "Professional Software Engineer dengan pengalaman 3+ tahun mengembangkan aplikasi web berskala besar. Berfokus pada performa, aksesibilitas, dan pengalaman pengguna yang optimal. Mahir bekerja dalam tim lintas fungsi menggunakan metodologi Agile.",
    education: [
        {
            id: "edu1",
            level: "S1",
            field: "Teknik Informatika",
            institution: "Universitas Teknologi Nusantara",
            city: "Jakarta",
            startDate: "2018-08-01",
            endDate: "2022-07-01",
            isCurrentStudy: false,
            gpa: "3.85",
            maxGpa: "4.00",
            description: "Lulus dengan predikat Cum Laude. Aktif dalam himpunan mahasiswa tingkat jurusan."
        }
    ],
    experiences: [
        {
            id: "exp1",
            company: "PT Inovasi Digital",
            position: "Frontend Web Developer",
            employmentType: "Full-time",
            location: "Jakarta",
            startDate: "2022-08-01",
            endDate: "",
            isCurrentJob: true,
            description: "<li>Mengembangkan dashboard internal perusahaan menggunakan React dan TypeScript</li><li>Meningkatkan skor Lighthouse performa dari 65 ke 95</li><li>Mentoring developer junior dalam best-practices frontend</li>"
        }
    ],
    skills: {
        softSkills: "Problem Solving, Komunikasi, Mentoring, Agile, Manajemen Waktu",
        hardSkills: "Web Development, RESTful API, Performance Optimization",
        softwareSkills: "ReactJS, TypeScript, TailwindCSS, Node.js, PostgreSQL, Git"
    },
    bootcamps: [
        {
            id: "boot1",
            name: "Fullstack JavaScript Immersive",
            institution: "Hacktiv8 Indonesia",
            location: "Jakarta",
            startDate: "2022-01-01",
            endDate: "2022-04-01",
            description: "Intensive 16-week bootcamp mempelajari ekosistem JavaScript dari frontend hingga backend."
        }
    ],
    awards: [
        {
            id: "awd1",
            title: "Juara 1 Nasional Hackathon",
            institution: "Kementerian Kominfo",
            year: "2021"
        }
    ],
    hobbies: "Membaca artikel teknologi, Fotografi jalanan, Catur",
    showLinkedinUnderline: false,
    showPortfolioUnderline: false
};

export const dummyCreativeManagementData: CreativeManagementData = {
    profilePhoto: "https://i.pravatar.cc/300?img=11",
    fullName: "Budi Santoso",
    profession: "Frontend Web Developer",
    whatsapp: "081234567890",
    email: "budi.santoso@email.com",
    location: "Jakarta, Indonesia",
    linkedin: "linkedin.com/in/budisantoso",
    summary: "Professional Software Engineer dengan pengalaman 3+ tahun mengembangkan aplikasi web berskala besar. Berfokus pada performa, aksesibilitas, dan pengalaman pengguna yang optimal.",
    experiences: [
        {
            id: "cex1",
            type: "work",
            company: "PT Inovasi Digital",
            position: "Frontend Lead",
            startDate: "2022-08-01",
            endDate: "",
            isCurrentJob: true,
            description: "Mengembangkan dashboard internal perusahaan dan membimbing developer junior."
        },
        {
            id: "cex2",
            type: "organization",
            name: "Komunitas WebDev Jakarta",
            position: "Ketua Event",
            description: "Menyelenggarakan meetup bulanan dengan menghadirkan tech lead lokal."
        }
    ],
    skills: ["ReactJS", "TypeScript", "TailwindCSS", "Node.js", "Problem Solving", "Mentoring"],
    education: [
        {
            id: "ced1",
            university: "Universitas Teknologi Nusantara",
            major: "Teknik Informatika",
            startDate: "2018-08-01",
            endDate: "2022-07-01",
            description: "Lulus Cum Laude (IPK 3.85)."
        }
    ]
};

export const dummyPortfolioData: PortfolioData = {
    profilePhoto: "https://i.pravatar.cc/300?img=5",
    fullName: "Siti Rahmawati",
    title: "UI/UX Designer & Frontend Dev",
    summary: "Saya adalah seorang desainer dan developer web yang antusias menciptakan pengalaman digital yang intuitif dan estetik. Berfokus pada perpaduan antara desain visual yang menarik dengan performa teknis yang andal.",
    email: "siti.rahma@email.com",
    phone: "+62 821-3344-5566",
    location: "Bandung, Indonesia",
    website: "sitirahma.design",
    github: "github.com/sitirahmadesign",
    linkedin: "linkedin.com/in/sitirahmawati",
    projects: [
        {
            id: "proj1",
            title: "Aplikasi E-Commerce 'BeliLokal'",
            category: "UI/UX Design",
            description: "Aplikasi e-commerce yang didesain khusus untuk memberdayakan UMKM lokal dengan antarmuka yang ramah pengguna awam.",
            techStack: "Figma, React Native",
            imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80",
            projectUrl: "behance.net/belilokal-case-study"
        },
        {
            id: "proj2",
            title: "Dashboard Analitik Crypto",
            category: "Web Development",
            description: "Dashboard web kompleks untuk menampilkan data dari berbagai sumber cryptocurrency secara real-time.",
            techStack: "React, Tailwind, Recharts",
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
            repositoryUrl: "github.com/sitirahmadesign/crypto-dash"
        }
    ],
    skills: ["Figma", "React", "Tailwind CSS", "Adobe XD"],
    education: [
        {
            id: "pedu1",
            degree: "S1 Desain Komunikasi Visual",
            institution: "Institut Seni Indonesia",
            year: "2016 - 2020",
        }
    ],
    themeColor: "#4f46e5"
};
