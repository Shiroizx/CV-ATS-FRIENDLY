# FreeBuild CV - ATS-Friendly CV Builder

![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)

Platform lengkap untuk membuat CV ATS-Friendly, Portfolio, Creative Management, dan Sistem Pendukung Keputusan (SPK DSS) dengan antarmuka modern dan intuitif.

## 🚀 Fitur Utama

### 📄 CV Builder
- **Template ATS-Friendly** - CV yang dioptimalkan untuk Applicant Tracking System
- **Real-time Preview** - Lihat perubahan secara langsung
- **Export to PDF** - Download CV dalam format PDF berkualitas tinggi
- **Cloud Storage** - Simpan CV online dengan akun terdaftar
- **Upload Foto Profil** - Integrasi dengan Supabase Storage

### 🎨 Portfolio Builder
- **Responsive Design** - Tampilan optimal di semua perangkat
- **Custom Color Themes** - Pilihan warna dinamis
- **Mobile Optimized** - Preview khusus untuk layar mobile
- **PDF Export** - Export portfolio ke format PDF

### 📊 Creative Management
- **Professional Templates** - Template untuk creative brief dan project management
- **Rich Text Editor** - Editor teks dengan formatting lengkap
- **PDF Generation** - Export ke PDF dengan layout profesional

### 🎯 SPK DSS (Sistem Pendukung Keputusan)
- **Multi-Method Analysis** - SAW, TOPSIS, dan AHP
- **Interactive Charts** - Bar Chart, Pie Chart, Radar Chart
- **Ranking Table** - Tabel peringkat alternatif
- **Mermaid Flowchart** - Visualisasi proses keputusan
- **Analytics Dashboard** - Tracking penggunaan SPK
- **Export to PDF** - Export hasil analisis

### 👤 User Management
- **Authentication** - Login/Register dengan Supabase Auth
- **Download Credits** - Sistem kuota download untuk Guest dan User
- **Download History** - Riwayat download dan aktivitas
- **My Resumes** - Kelola semua CV yang tersimpan

### 🔐 Admin Dashboard
- **User Management** - Kelola pengguna dan hak akses
- **Statistics** - Monitoring aktivitas website
- **SPK Analytics** - Statistik penggunaan SPK DSS
- **Download Monitoring** - Pantau aktivitas download

## 🛠️ Tech Stack

- **Frontend Framework:** React 19.2.0 + TypeScript
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Routing:** React Router DOM 7.11.0
- **Backend:** Supabase (Database + Auth + Storage)
- **PDF Generation:** html2pdf.js, jsPDF, @react-pdf/renderer
- **Charts:** Custom React components
- **Animations:** GSAP, Lottie React, Motion
- **Rich Text Editor:** Tiptap
- **Notifications:** SweetAlert2, Sonner
- **Icons:** Lucide React
- **Diagrams:** Mermaid

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/Shiroizx/CV-ATS-FRIENDLY.git

# Masuk ke direktori
cd CV-ATS-FRIENDLY

# Install dependencies
npm install

# Setup environment variables
# Buat file .env dan isi dengan:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
```

## 🚀 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── cv-form/        # CV form components
│   ├── cv-preview/     # CV preview components
│   ├── portfolio/      # Portfolio components
│   ├── creative-management/  # Creative management components
│   ├── spk/            # SPK DSS components
│   └── ui/             # UI components
├── contexts/           # React contexts (Auth)
├── lib/                # Utilities and services
│   ├── spk/           # SPK algorithms (SAW, TOPSIS, AHP)
│   ├── supabase.ts    # Supabase client
│   └── ...
├── pages/              # Page components
├── types/              # TypeScript types
└── utils/              # Helper functions
```

## 🗄️ Database Setup

Jalankan SQL scripts di Supabase SQL Editor:

1. `sql_admin_setup.sql` - Setup admin users
2. `sql_user_resumes_setup.sql` - Setup user resumes table
3. `sql_download_limits_setup.sql` - Setup download limits
4. `sql_download_history_setup.sql` - Setup download history
5. `sql_spk_analytics.sql` - Setup SPK analytics
6. `sql_cm_column.sql` - Setup creative management columns

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Changelog

### Version 1.5.0 (2 Mei 2026)
- ✨ Sistem Pendukung Keputusan (SPK DSS) dengan metode SAW, TOPSIS, dan AHP
- 📊 Visualisasi data interaktif dengan berbagai jenis chart
- 📈 Analytics Dashboard untuk tracking penggunaan SPK
- 📄 Export hasil analisis SPK ke PDF
- 📚 Dokumentasi lengkap SPK DSS

### Version 1.4.0 (24 Februari 2026)
- 💾 Integrasi Database dengan Supabase
- 🎫 Sistem Kredit Download
- 📋 Halaman Riwayat CV & Download
- 👨‍💼 Admin Dashboard
- 📸 Upload Foto Profil

[Lihat changelog lengkap](src/pages/ChangelogPage.tsx)

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**MuhFaturRohman**
- Email: 19230340@bsi.ac.id
- GitHub: [@Shiroizx](https://github.com/Shiroizx)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Supabase for the backend infrastructure
- All contributors and users of FreeBuild CV

---

Made with ❤️ by MuhFaturRohman
