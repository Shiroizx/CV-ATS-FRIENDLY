import type { CVData } from "../types";

export const dummyData: CVData = {
  profilePhoto: "",
  fullName: "MUHAMAD ADLILDZIL ARIFAH",
  phone: "085156693650",
  email: "adldzl4002@gmail.com",
  linkedin: "https://www.linkedin.com/in/muhamad-adlildzil-arifah-a4263ba42",
  showLinkedinUnderline: true,
  portfolio: "https://bit.ly/Portofolio-Adlidzl",
  showPortfolioUnderline: true,
  address: "DKI Jakarta, Jakarta Utara",
  summary:
    "<p>Sebagai Mahasiswa Sistem Informasi yang bersemangat dalam Software Development dan teknologi, dengan fokus pada Artificial Intelligence, Machine Learning, Web Development, dan Mobile Development. Memadukan latar belakang kreatif sebagai Video Editor untuk menciptakan solusi yang fungsional dan menarik. Mencari kesempatan untuk mengembangkan keahlian teknis dan berkontribusi dalam proyek-proyek yang menantang.</p>",

  experiences: [
    {
      id: "1",
      company: "Dynamic Buzz Agency",
      position: "Video Editor, Magang",
      employmentType: "Internship",
      location: "Remote",
      startDate: "2024-12",
      endDate: "2025-02",
      isCurrentJob: false,
      description:
        "<ul><li>Menyunting beragam format video untuk iklan digital (Digital Ads), konten media sosial (Reels, TikTok, YouTube), dan video profil perusahaan (company profile).</li><li>Melakukan proses color grading, sound mixing, dan penambahan efek visual (motion graphics) untuk meningkatkan kualitas visual dan daya tarik video.</li><li>Memastikan semua proyek video diselesaikan tepat waktu sesuai dengan jadwal produksi dan standar kualitas agensi.</li></ul>",
    },
    {
      id: "2",
      company: "Dinas Kebudayaan Jakarta Utara",
      position: "Video Editor, Magang",
      employmentType: "Internship",
      location: "Jakarta Utara",
      startDate: "2023-10",
      endDate: "2023-11",
      isCurrentJob: false,
      description:
        "<ul><li>Terlibat langsung dalam produksi dua film dokumenter kebudayaan dari tahap pra-produksi hingga pascaproduksi.</li><li>Bertanggung jawab pada proses penyuntingan dengan jadwal yang ketat dan standar kualitas tinggi.</li><li>Melakukan color grading dan sound mixing untuk memastikan kualitas visual dan audio sesuai standar Dinas Kebudayaan.</li><li>Menambahkan elemen grafis dan teks informatif untuk memperkaya narasi dokumenter.</li></ul>",
    },
    {
      id: "3",
      company: "Youtube Channel Gaming",
      position: "Video Editor, Kontrak",
      employmentType: "Contract",
      location: "Remote",
      startDate: "2023-07",
      endDate: "2023-12",
      isCurrentJob: false,
      description:
        "<ul><li>Menyunting konten gaming seperti gameplay highlights, montage, walkthrough, dan ulasan (review) game.</li><li>Menambahkan efek visual, teks, dan transisi yang menarik sesuai karakter target audiens gaming.</li><li>Menjaga konsistensi kualitas visual dan audio untuk setiap konten yang diunggah ke platform YouTube.</li></ul>",
    },
  ],

  education: [
    {
      id: "1",
      level: "SMA/SMK/Sederajat",
      field: "Bahasa",
      institution: "SMAN 110 Jakarta",
      city: "Jakarta Utara",
      startDate: "2019-07",
      endDate: "2022-06",
      isCurrentStudy: false,
      gpa: "70.40",
      maxGpa: "100.00",
      description: "Mengikuti kegiatan organisasi seperti Pramuka dan Paskibra. Mengikuti perlombaan seperti Short Movie & Content Creation.",
    },
    {
      id: "2",
      level: "S1",
      field: "Sistem Informasi",
      institution: "Universitas Bina Sarana Informatika",
      city: "Jakarta Pusat",
      startDate: "2023-09",
      endDate: "",
      isCurrentStudy: true,
      gpa: "3.49",
      maxGpa: "4.00",
      description: "Membuat website user friendly menggunakan Laravel. Membuat mobile app Vape Store menggunakan Flutter. Mengikuti kegiatan IT Bootcamp Software Development.",
    },
  ],

  bootcamps: [
    {
      id: "1",
      name: "IT Bootcamp Software Development",
      institution: "Universitas Bina Sarana Informatika",
      location: "Bogor",
      startDate: "2025-07",
      endDate: "2025-07",
      description:
        "Pemenang Juara 1: berhasil meraih peringkat pertama dalam kompetisi proyek akhir bootcamp. Mengembangkan aplikasi Website Smart Tahfidz School dengan fokus pada efisiensi, user friendly, keamanan, dan fitur biometrik wajah.",
    },
    {
      id: "2",
      name: "Seminar Inovasi & Pameran Karya Mahasiswa",
      institution: "Universitas Bina Sarana Informatika",
      location: "Jakarta",
      startDate: "2024-07",
      endDate: "2024-07",
      description: "Berpartisipasi dalam seminar dan pameran karya inovasi teknologi dan pengembangan aplikasi mahasiswa Sistem Informasi.",
    },
    {
      id: "3",
      name: "Workshop IT Bootcamp Software Development For Industry",
      institution: "Universitas Bina Sarana Informatika",
      location: "Jakarta",
      startDate: "2025-06",
      endDate: "2025-06",
      description: "Mengikuti pelatihan intensif mengenai standar dan metodologi pengembangan perangkat lunak industri serta best practices penulisan kode.",
    },
  ],

  skills: {
    softSkills: "Public Speaking, Leadership, Creative, Cooperation, Communication",
    hardSkills: "Editing Video, Design Grafis, Website Developer",
    softwareSkills: "Adobe After Effect, Adobe Premiere Pro, CapCut, Visual Studio Code",
  },

  awards: [
    {
      id: "1",
      title: "Juara 1 IT Bootcamp Software Development, Universitas Bina Sarana Informatika",
      institution: "Universitas Bina Sarana Informatika",
      year: "2025",
    },
    {
      id: "2",
      title: "Pemenang Lomba Laravel Basic, SMK Muhammadiyah 15 Jakarta",
      institution: "SMK Muhammadiyah 15 Jakarta",
      year: "2025",
    },
    {
      id: "3",
      title: "Juara 1 Content Contest, Premium Portal",
      institution: "Premium Portal",
      year: "2025",
    },
  ],

  hobbies: "Gaming, Coding, Editing",
};
