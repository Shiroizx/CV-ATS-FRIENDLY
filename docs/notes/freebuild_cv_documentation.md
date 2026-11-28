# FreeBuild CV — Dokumentasi Sistem

## 1. Penjelasan Umum Aplikasi

**FreeBuild CV** adalah aplikasi web builder CV (Curriculum Vitae) ATS-Friendly yang dibangun menggunakan **React + Vite + TypeScript** dengan backend **Supabase** (PostgreSQL + Auth + Storage). Aplikasi ini memungkinkan pengguna membuat, mengedit, menyimpan, dan mengunduh CV profesional dalam format PDF secara **gratis**.

### Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **CV Builder (ATS Simple)** | Pembuatan CV sederhana yang dioptimalkan untuk ATS |
| **Creative Management Builder** | Template CV kreatif untuk posisi manajemen |
| **Portfolio Builder** | Pembuatan portfolio web interaktif |
| **Multi-Template** | 3+ template CV dengan desain berbeda |
| **Download PDF** | Ekspor CV ke PDF langsung dari browser |
| **Cloud Save** | Simpan dan edit ulang CV dari perangkat manapun (user login) |
| **Download Credit System** | Pembatasan download (Guest: 3, User: 6, konfigurabel admin) |
| **Admin Dashboard** | Manajemen user, konfigurasi sistem, dan monitoring |
| **SPK/DSS Module** | Analitik keputusan menggunakan metode AHP + TOPSIS/SAW (admin only) |
| **Donasi QRIS** | Sistem donasi terintegrasi via QRIS |

### Flow Pengguna (User Journey)

```mermaid
flowchart TD
    A["Pengguna Membuka Website"] --> B{"Sudah Login?"}
    B -- Ya --> C["Halaman Utama (dengan fitur lengkap)"]
    B -- Tidak --> D["Halaman Utama (dengan notifikasi login)"]

    C --> E["Pilih Template CV"]
    D --> E

    E --> F["ATS Simple"]
    E --> G["Creative Management"]
    E --> H["Portfolio"]

    F --> I["Isi Form CV"]
    G --> J["Isi Form Creative Management"]
    H --> K["Isi Form Portfolio"]

    I --> L["Live Preview CV"]
    J --> M["Live Preview CM"]
    K --> N["Live Preview Portfolio"]

    L --> O{"Login?"}
    M --> O
    N --> O

    O -- Ya --> P["Simpan ke Cloud"]
    O -- Tidak --> Q["Langsung Download"]

    P --> R["Download PDF"]
    Q --> R

    R --> S{"Kredit Cukup?"}
    S -- Ya --> T["PDF Berhasil Diunduh"]
    S -- Tidak --> U["Muncul Alert Batas Download"]
```

---

## 2. Use Case Diagram

```mermaid
flowchart TB
    subgraph System ["FreeBuild CV System"]
        UC1["Melihat Landing Page"]
        UC2["Mendaftar Akun"]
        UC3["Login"]
        UC4["Memilih Template CV"]
        UC5["Mengisi Data CV"]
        UC6["Preview CV Realtime"]
        UC7["Download CV PDF"]
        UC8["Menyimpan CV ke Cloud"]
        UC9["Melihat Daftar Resume Tersimpan"]
        UC10["Mengedit Resume Tersimpan"]
        UC11["Menghapus Resume"]
        UC12["Melihat Riwayat Download"]
        UC13["Mengubah Pengaturan Akun"]
        UC14["Donasi via QRIS"]
        UC15["Melihat Changelog"]

        UC20["Mengelola Daftar User"]
        UC21["Menambah User Baru"]
        UC22["Mengedit User"]
        UC23["Menghapus User"]
        UC24["Melihat Guest Downloads"]
        UC25["Mengkonfigurasi Download Limit"]
        UC26["Reset Download Count User"]
        UC27["Mengakses SPK/DSS Analytics"]
    end

    Guest(["👤 Guest"])
    User(["👤 User (Login)"])
    Admin(["👤 Admin"])

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6
    Guest --> UC7
    Guest --> UC14
    Guest --> UC15

    User --> UC1
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14

    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
```

### Deskripsi Aktor

| Aktor | Deskripsi |
|---|---|
| **Guest** | Pengunjung yang belum memiliki akun atau belum login. Bisa membuat CV dan download dengan limit 3x/hari. |
| **User** | Pengguna yang telah mendaftar dan login. Mendapat limit download 6x/hari dan fitur cloud save. |
| **Admin** | Administrator sistem yang memiliki `is_admin = true` di user metadata. Akses penuh ke dashboard manajemen. |

---

## 3. Activity Diagram

### 3.1 Activity Diagram — Pembuatan & Download CV

```mermaid
flowchart TD
    Start(["▶ Start"]) --> A["Buka Halaman Utama"]
    A --> B["Pilih Template CV"]
    B --> C["Redirect ke Builder Page"]
    C --> D["Isi Data Personal Info"]
    D --> E["Isi Ringkasan / Summary"]
    E --> F["Isi Pengalaman Kerja"]
    F --> G["Isi Pendidikan"]
    G --> H["Isi Skills"]
    H --> I["Isi Bootcamp / Sertifikasi"]
    I --> J["Isi Penghargaan"]
    J --> K["Preview CV Realtime"]

    K --> L{"Ingin Menyimpan?"}
    L -- Ya --> M{"Sudah Login?"}
    M -- Ya --> N["Simpan CV ke Supabase"]
    M -- Tidak --> O["Redirect ke Login Page"]
    O --> P["Login / Register"]
    P --> N

    L -- Tidak --> Q{"Ingin Download?"}
    N --> Q

    Q -- Ya --> R["Klik Tombol Download"]
    R --> S{"Cek Kredit Download"}
    S -- Cukup --> T["Generate PDF via html2canvas"]
    T --> U["Record Download Log"]
    U --> V["PDF Terdownload"]
    S -- Tidak Cukup --> W["Tampilkan Alert Batas Tercapai"]

    Q -- Tidak --> X["Lanjut Edit / Keluar"]

    V --> End(["⏹ End"])
    W --> End
    X --> End
```

### 3.2 Activity Diagram — Admin Dashboard

```mermaid
flowchart TD
    Start(["▶ Start"]) --> A["Admin Login"]
    A --> B["Akses /admin"]
    B --> C{"AdminRoute Guard"}
    C -- "is_admin = true" --> D["Dashboard Admin"]
    C -- "Bukan Admin" --> E["Redirect ke Home"]

    D --> F{"Pilih Tab"}

    F -- "Users" --> G["Lihat Daftar User"]
    G --> G1["Search User"]
    G --> G2["Tambah User Baru"]
    G --> G3["Edit User"]
    G --> G4["Hapus User"]
    G --> G5["Reset Download Count"]

    F -- "Guests" --> H["Lihat Guest Downloads"]
    H --> H1["Monitor IP & Fingerprint"]

    F -- "Settings" --> I["Konfigurasi Download Limit"]
    I --> I1["Set Guest Limit"]
    I --> I2["Set User Limit"]
    I --> I3["Simpan Settings ke app_settings"]

    F -- "SPK/DSS" --> J["Navigasi ke /spk"]
    J --> J1["Input Kriteria & Alternatif"]
    J1 --> J2["Pilih Mode Bobot (AHP/Manual)"]
    J2 --> J3["Compute Ranking (TOPSIS/SAW)"]
    J3 --> J4["Visualisasi Hasil (Chart/Table)"]

    G1 --> End(["⏹ End"])
    G2 --> End
    G3 --> End
    G4 --> End
    G5 --> End
    H1 --> End
    I3 --> End
    J4 --> End
    E --> End
```

---

## 4. Development / Class Diagram

Diagram ini menunjukkan hubungan antara type/interface utama dalam aplikasi.

```mermaid
classDiagram
    class CVData {
        +string profilePhoto
        +string fullName
        +string phone
        +string email
        +string linkedin
        +boolean showLinkedinUnderline
        +string portfolio
        +boolean showPortfolioUnderline
        +string address
        +string summary
        +Experience[] experiences
        +Education[] education
        +Bootcamp[] bootcamps
        +Skills skills
        +Award[] awards
        +string hobbies
    }

    class Experience {
        +string id
        +string company
        +string position
        +string employmentType
        +string location
        +string startDate
        +string endDate
        +boolean isCurrentJob
        +string description
    }

    class Education {
        +string id
        +string level
        +string field
        +string institution
        +string city
        +string startDate
        +string endDate
        +boolean isCurrentStudy
        +string gpa
        +string maxGpa
        +string description
    }

    class Bootcamp {
        +string id
        +string name
        +string institution
        +string location
        +string startDate
        +string endDate
        +string description
    }

    class Skills {
        +string softSkills
        +string hardSkills
        +string softwareSkills
    }

    class Award {
        +string id
        +string title
        +string institution
        +string year
    }

    class CreativeManagementData {
        +string profilePhoto
        +string fullName
        +string profession
        +string whatsapp
        +string email
        +string location
        +string linkedin
        +string summary
        +CreativeExperience[] experiences
        +string[] skills
        +CreativeEducation[] education
    }

    class CreativeExperience {
        +string id
        +ExperienceType type
        +string position
        +string description
        +string company
        +string startDate
        +string endDate
        +boolean isCurrentJob
        +string name
    }

    class CreativeEducation {
        +string id
        +string university
        +string major
        +string startDate
        +string endDate
        +string description
    }

    class PortfolioData {
        +string profilePhoto
        +string fullName
        +string title
        +string email
        +string phone
        +string location
        +string website
        +string linkedin
        +string github
        +string summary
        +PortfolioProject[] projects
        +string[] skills
        +PortfolioEducation[] education
        +string themeColor
    }

    class PortfolioProject {
        +string id
        +string title
        +string category
        +string description
        +string techStack
        +string projectUrl
        +string repositoryUrl
        +string imageUrl
    }

    class SavedResume {
        +string id
        +string user_id
        +string template_type
        +string resume_name
        +string hobbies
        +string created_at
        +string updated_at
    }

    class SpkState {
        +SpkCriterion[] criteria
        +SpkAlternative[] alternatives
        +SpkScores scores
        +SpkWeightMode weightMode
        +Record manualWeights
        +number[][] ahpPairwise
    }

    CVData *-- Experience
    CVData *-- Education
    CVData *-- Bootcamp
    CVData *-- Skills
    CVData *-- Award
    CreativeManagementData *-- CreativeExperience
    CreativeManagementData *-- CreativeEducation
    PortfolioData *-- PortfolioProject
    SavedResume --> CVData : "cv_data (ATS)"
    SavedResume --> CreativeManagementData : "cm_data"
    SavedResume --> PortfolioData : "portfolio_data"
```

---

## 5. Component Diagram

```mermaid
flowchart TB
    subgraph App ["App.tsx (Root)"]
        AuthProvider["AuthProvider"]
        Router["BrowserRouter"]
        Navbar["Navbar"]
    end

    subgraph Pages ["Pages"]
        MainPage["MainPage"]
        LoginPage["LoginPage"]
        RegisterPage["RegisterPage"]
        EmailConfirmed["EmailConfirmedPage"]
        CVBuilder["CVBuilderPage"]
        CMBuilder["CreativeManagementBuilderPage"]
        PortfolioBuilder["PortfolioBuilderPage"]
        MyResumes["MyResumesPage"]
        DownloadHistory["DownloadHistoryPage"]
        Settings["SettingsPage"]
        AdminDashboard["AdminDashboardPage"]
        SpkDss["SpkDssPage"]
        Donate["DonatePage"]
        Changelog["ChangelogPage"]
        Terms["TermsPage"]
        Privacy["PrivacyPage"]
    end

    subgraph Guards ["Route Guards"]
        ProtectedRoute["ProtectedRoute"]
        AdminRoute["AdminRoute"]
    end

    subgraph CVComponents ["CV Builder Components"]
        CVForm["CVForm (index)"]
        PersonalInfoForm["PersonalInfoForm"]
        SummaryForm["SummaryForm"]
        ExperienceForm["ExperienceForm"]
        EducationForm["EducationForm"]
        SkillsForm["SkillsForm"]
        BootcampForm["BootcampForm"]
        AwardForm["AwardForm"]
        HobbyForm["HobbyForm"]
        CVPreview["CVPreview (index)"]
        PreviewHeader["PreviewHeader"]
        PreviewExperience["PreviewExperience"]
        PreviewEducation["PreviewEducation"]
        PreviewSkills["PreviewSkills"]
        PreviewBootcamp["PreviewBootcamp"]
        PreviewAwards["PreviewAwards"]
        PreviewHobby["PreviewHobby"]
    end

    subgraph CMComponents ["Creative Management Components"]
        CMForm["CreativeManagementForm"]
        CMPreview["CreativeManagementPreview"]
        CMPDF["CreativeManagementPDF"]
    end

    subgraph PortfolioComponents ["Portfolio Components"]
        PForm["PortfolioForm"]
        PPreview["PortfolioPreview"]
        PPDF["PortfolioPDF"]
    end

    subgraph SPKComponents ["SPK/DSS Components"]
        CriteriaEditor["CriteriaEditor"]
        AlternativesMatrix["AlternativesMatrix"]
        WeightsAHP["WeightsAHP"]
        WeightsManual["WeightsManual"]
        ResultsView["ResultsView"]
        SpkBarChart["SpkBarChart"]
        SpkPieChart["SpkPieChart"]
        SpkRadarChart["SpkRadarChart"]
        SpkRankingTable["SpkRankingTable"]
    end

    subgraph UIComponents ["Shared UI Components"]
        TextType["TextType"]
        DecryptedText["DecryptedText"]
        RichTextEditor["RichTextEditor"]
        SplashScreen["SplashScreen"]
    end

    subgraph Services ["Service Layer"]
        ResumeService["resumeService.ts"]
        DownloadCredit["downloadCredit.ts"]
        RateLimiter["rateLimiter.ts"]
        SupabaseClient["supabase.ts"]
        SPKLib["spk/ (ahp, topsis, saw)"]
    end

    App --> Pages
    App --> Guards

    ProtectedRoute --> MyResumes
    ProtectedRoute --> DownloadHistory
    ProtectedRoute --> Settings
    AdminRoute --> AdminDashboard
    AdminRoute --> SpkDss

    CVBuilder --> CVForm
    CVBuilder --> CVPreview
    CVForm --> PersonalInfoForm
    CVForm --> SummaryForm
    CVForm --> ExperienceForm
    CVForm --> EducationForm
    CVForm --> SkillsForm
    CVForm --> BootcampForm
    CVForm --> AwardForm
    CVForm --> HobbyForm

    CVPreview --> PreviewHeader
    CVPreview --> PreviewExperience
    CVPreview --> PreviewEducation
    CVPreview --> PreviewSkills
    CVPreview --> PreviewBootcamp
    CVPreview --> PreviewAwards
    CVPreview --> PreviewHobby

    CMBuilder --> CMForm
    CMBuilder --> CMPreview
    CMBuilder --> CMPDF

    PortfolioBuilder --> PForm
    PortfolioBuilder --> PPreview
    PortfolioBuilder --> PPDF

    SpkDss --> CriteriaEditor
    SpkDss --> AlternativesMatrix
    SpkDss --> WeightsAHP
    SpkDss --> WeightsManual
    SpkDss --> ResultsView
    ResultsView --> SpkBarChart
    ResultsView --> SpkPieChart
    ResultsView --> SpkRadarChart
    ResultsView --> SpkRankingTable

    Pages --> Services
    Services --> SupabaseClient
    SpkDss --> SPKLib
```

---

## 6. Deployment Diagram

```mermaid
flowchart TB
    subgraph Client ["Client (Browser)"]
        Browser["Web Browser"]
        SPA["React SPA (Vite Build)"]
        LocalStorage["localStorage / sessionStorage"]
    end

    subgraph Vercel ["Vercel (Hosting)"]
        CDN["Vercel CDN / Edge Network"]
        Static["Static Files (HTML/JS/CSS)"]
        Analytics["Vercel Analytics"]
    end

    subgraph Supabase ["Supabase (BaaS)"]
        subgraph Auth ["Authentication"]
            SupaAuth["Supabase Auth"]
            JWT["JWT Token Management"]
        end
        subgraph Database ["PostgreSQL Database"]
            Tables["Tables: user_resumes, resume_personal_info, resume_education, resume_experiences, resume_bootcamps, resume_skills, resume_awards, download_logs, download_history, app_settings"]
            RPC["RPC Functions: get_users_list, check_guest_download, log_download, get_guest_downloads"]
        end
        subgraph Storage ["Supabase Storage"]
            ProfilePhotos["Bucket: profile-photos"]
            PortfolioImages["Bucket: portfolio-images"]
        end
    end

    subgraph ExternalAPIs ["External APIs"]
        IPify["api.ipify.org"]
        IPAPI["ipapi.co"]
        DBIP["api.db-ip.com"]
    end

    Browser --> CDN
    CDN --> Static
    SPA --> SupaAuth
    SPA --> Tables
    SPA --> RPC
    SPA --> ProfilePhotos
    SPA --> PortfolioImages
    SPA --> Analytics
    SPA --> LocalStorage
    SPA --> ExternalAPIs
```

### Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS |
| **State Management** | React Context (AuthContext) + useState |
| **Routing** | React Router DOM v6 |
| **PDF Generation** | html2canvas + jsPDF |
| **Animations** | Lottie (lottie-react), Animate.css |
| **UI Alerts** | SweetAlert2 |
| **Rich Text** | Custom RichTextEditor component |
| **Backend (BaaS)** | Supabase (PostgreSQL + Auth + Storage + RPC) |
| **Hosting** | Vercel |
| **Analytics** | Vercel Analytics |
| **IP Detection** | ipify, ipapi.co, db-ip.com (fallback chain) |

---

## 7. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        string email
        jsonb raw_user_meta_data
        timestamp created_at
    }

    USER_RESUMES {
        uuid id PK
        uuid user_id FK
        string template_type
        string resume_name
        string hobbies
        jsonb cm_data
        jsonb portfolio_data
        timestamp created_at
        timestamp updated_at
    }

    RESUME_PERSONAL_INFO {
        uuid id PK
        uuid resume_id FK "UNIQUE"
        string profile_photo_url
        string full_name
        string phone
        string email
        string linkedin
        boolean show_linkedin_underline
        string portfolio
        boolean show_portfolio_underline
        string address
        text summary
    }

    RESUME_EDUCATION {
        uuid id PK
        uuid resume_id FK
        string level
        string field
        string institution
        string city
        string start_date
        string end_date
        boolean is_current_study
        string gpa
        string max_gpa
        text description
        int sort_order
    }

    RESUME_EXPERIENCES {
        uuid id PK
        uuid resume_id FK
        string company
        string position
        string employment_type
        string location
        string start_date
        string end_date
        boolean is_current_job
        text description
        int sort_order
    }

    RESUME_BOOTCAMPS {
        uuid id PK
        uuid resume_id FK
        string name
        string institution
        string location
        string start_date
        string end_date
        text description
        int sort_order
    }

    RESUME_SKILLS {
        uuid id PK
        uuid resume_id FK "UNIQUE"
        text soft_skills
        text hard_skills
        text software_skills
    }

    RESUME_AWARDS {
        uuid id PK
        uuid resume_id FK
        string title
        string institution
        string year
        int sort_order
    }

    DOWNLOAD_LOGS {
        uuid id PK
        string ip_address
        string fingerprint
        int download_count
        timestamp last_download
    }

    DOWNLOAD_HISTORY {
        uuid id PK
        uuid user_id FK
        string template_type
        string resume_name
        timestamp downloaded_at
    }

    APP_SETTINGS {
        uuid id PK
        string setting_key "UNIQUE"
        string setting_value
    }

    AUTH_USERS ||--o{ USER_RESUMES : "has many"
    AUTH_USERS ||--o{ DOWNLOAD_HISTORY : "has many"
    USER_RESUMES ||--|| RESUME_PERSONAL_INFO : "has one"
    USER_RESUMES ||--o{ RESUME_EDUCATION : "has many"
    USER_RESUMES ||--o{ RESUME_EXPERIENCES : "has many"
    USER_RESUMES ||--o{ RESUME_BOOTCAMPS : "has many"
    USER_RESUMES ||--|| RESUME_SKILLS : "has one"
    USER_RESUMES ||--o{ RESUME_AWARDS : "has many"
```

### Penjelasan Tabel

| Tabel | Deskripsi |
|---|---|
| `auth.users` | Tabel bawaan Supabase Auth. Menyimpan data otentikasi dan metadata user (username, is_admin, download_count). |
| `user_resumes` | Tabel induk untuk semua resume yang disimpan user. Field `template_type` menentukan jenis template (ats_simple, creative_management, portfolio). Data CM dan Portfolio disimpan sebagai JSONB. |
| `resume_personal_info` | Data info personal CV (1:1 dengan resume). |
| `resume_education` | Data pendidikan CV (1:N, diurutkan `sort_order`). |
| `resume_experiences` | Data pengalaman kerja CV (1:N, diurutkan `sort_order`). |
| `resume_bootcamps` | Data bootcamp/sertifikasi CV (1:N, diurutkan `sort_order`). |
| `resume_skills` | Data keahlian CV (1:1 dengan resume). |
| `resume_awards` | Data penghargaan CV (1:N, diurutkan `sort_order`). |
| `download_logs` | Tracking download untuk guest berdasarkan IP + fingerprint. |
| `download_history` | Riwayat download untuk user yang login. |
| `app_settings` | Konfigurasi sistem key-value (guest_download_limit, user_download_limit). |

### Supabase Storage Buckets

| Bucket | Deskripsi |
|---|---|
| `profile-photos` | Foto profil CV user. Path: `{user_id}/{resume_id}.{ext}` |
| `portfolio-images` | Gambar portfolio (foto profil + gambar proyek). Path: `{user_id}/{resume_id}/{key}.{ext}` |

### RPC Functions (Server-Side)

| Function | Deskripsi |
|---|---|
| `get_users_list()` | Mengembalikan daftar seluruh user (admin only). |
| `check_guest_download(p_ip, p_fingerprint, p_max)` | Mengecek apakah guest masih boleh download, dan merekam jika diizinkan. |
| `log_download(p_template_type, p_resume_name)` | Mencatat riwayat download untuk user yang login. |
| `get_guest_downloads()` | Mengembalikan aggregasi download per IP (admin monitoring). |

---

## Ringkasan Arsitektur

FreeBuild CV menggunakan arsitektur **SPA (Single Page Application)** yang di-deploy sebagai **static files** di Vercel, dengan seluruh backend logic ditangani oleh **Supabase** sebagai Backend-as-a-Service. Tidak ada server custom — semua operasi database dilakukan melalui Supabase client SDK dan RPC functions.

Keamanan diterapkan melalui:
- **Row Level Security (RLS)** di Supabase
- **Route Guards** di frontend (`ProtectedRoute`, `AdminRoute`)
- **Client-side Rate Limiting** untuk login/register
- **Device Fingerprinting + IP** untuk tracking guest downloads
- **Input Sanitization** untuk mencegah XSS
