import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, HeartHandshake, ArrowRight, Sparkles, Star, ChevronRight, Users, X } from "lucide-react";
import Lottie from "lottie-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import TextType from "../components/ui/TextType";
import thunderAnimation from "../assets/animations/thunder.json";
import shieldAnimation from "../assets/animations/shield.json";
import downloadAnimation from "../assets/animations/download.json";
import starAnimation from "../assets/animations/star.json";
import comingSoonAnimation from "../assets/animations/coming-soon.json";
import websiteAnimation from "../assets/animations/website.json";
import loginAnimation from "../assets/animations/login.json";
import { useAuth } from "../contexts/AuthContext";

const cvTemplates = [
  {
    id: "ats-simple",
    name: "ATS Simple",
    description: "Template CV sederhana yang dioptimalkan untuk sistem ATS. Cocok untuk melamar ke perusahaan besar.",
    features: ["Clean layout", "ATS-friendly", "Easy to read"],
    accent: "#2563eb",
    accentLight: "#dbeafe",
    popular: true,
  },
  {
    id: "creative-management",
    name: "Creative Management",
    description: "Template CV kreatif dengan desain modern. Tampil beda untuk posisi manajemen & leadership.",
    features: ["Modern design", "Professional look", "Creative layout"],
    accent: "#9333ea",
    accentLight: "#f3e8ff",
    popular: false,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Buat portofolio profesional untuk menampilkan proyek-proyek terbaikmu secara visual.",
    features: ["Project showcase", "Skill badges", "PDF download"],
    accent: "#059669",
    accentLight: "#d1fae5",
    popular: false,
  },
];

/* ── Floating shapes component removed for sleek design ── */

/* ── CV Mockup component for hero ── */
function CVMockup() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      {/* Shadow layer */}
      <div className="absolute inset-2 bg-zinc-200/50 rounded-2xl blur-xl" />
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">
        {/* Header bar */}
        <div className="bg-zinc-900 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-white/80" />
            </div>
            <div>
              <div className="w-28 h-3.5 bg-white/90 rounded-full" />
              <div className="w-20 h-2.5 bg-white/40 rounded-full mt-2" />
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div>
            <div className="w-16 h-2.5 bg-zinc-800 rounded-full mb-2.5" />
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-zinc-100 rounded-full" />
              <div className="w-11/12 h-2 bg-zinc-100 rounded-full" />
              <div className="w-4/5 h-2 bg-zinc-100 rounded-full" />
            </div>
          </div>
          {/* Experience */}
          <div>
            <div className="w-20 h-2.5 bg-zinc-800 rounded-full mb-2.5" />
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-zinc-300 mt-1.5 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-3/4 h-2 bg-zinc-100 rounded-full" />
                <div className="w-1/2 h-2 bg-zinc-50 rounded-full" />
              </div>
            </div>
            <div className="flex items-start gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-zinc-300 mt-1.5 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-5/6 h-2 bg-zinc-100 rounded-full" />
                <div className="w-2/5 h-2 bg-zinc-50 rounded-full" />
              </div>
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="w-12 h-2.5 bg-zinc-800 rounded-full mb-2.5" />
            <div className="flex flex-wrap gap-1.5">
              {[56, 48, 40, 52, 36, 44].map((w, i) => (
                <div key={i} className="h-5 rounded-full bg-zinc-50 border border-zinc-100" style={{ width: w }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 bg-zinc-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        ATS Pass
      </div>
    </div>
  );
}

/* ── Stat counter ── */
function StatCounter({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        {value}<span className="text-blue-600">{suffix}</span>
      </div>
      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function MainPage() {
  useEffect(() => {
    document.title = "FreeBuild CV - Buat CV ATS-Friendly Gratis | CV Builder Indonesia";
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<"qris" | null>(null);
  const [showSplashNotif, setShowSplashNotif] = useState(true);
  const templatesSectionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {!user && showSplashNotif && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100%-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn p-5">
          <button 
            onClick={() => setShowSplashNotif(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-blue-50 p-2 rounded-2xl shrink-0 mt-1">
              <Lottie animationData={loginAnimation} loop={true} className="w-12 h-12" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Benefit Ekstra untuk Anda! ✨</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Ingin mendapatkan kredit download CV tambahan? Silakan login untuk mendapatkan benefit yang lebih baik dan menyimpan history CV tanpa takut kehilangan data yang telah Anda buat.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors text-center"
                >
                  Daftar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <header id="hero" className="relative overflow-hidden bg-white border-b border-zinc-100">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
          style={{ backgroundImage: 'url(/assets/herobackground.png)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600" />
                </span>
                <span className="text-sm font-semibold text-zinc-700">100% Gratis • Tanpa Registrasi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-zinc-900 leading-[1.1] tracking-tight mb-6">
                Buat CV yang
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10">
                    <TextType
                      text={["Lolos ATS", "Profesional", "Memikat HR"]}
                      typingSpeed={80}
                      pauseDuration={2000}
                      showCursor={true}
                      cursorCharacter="_"
                      className="text-zinc-900"
                      as="span"
                    />
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-zinc-200 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="text-lg text-zinc-600 max-w-lg leading-relaxed mb-8">
                Template CV ATS-friendly yang dirancang agar lolos seleksi sistem perusahaan.
                Sempurna untuk <span className="font-semibold text-zinc-900">mahasiswa</span>,{" "}
                <span className="font-semibold text-zinc-900">fresh graduate</span>, maupun{" "}
                <span className="font-semibold text-zinc-900">profesional muda</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <button
                  onClick={() => navigate("/builder")}
                  id="cta-hero-primary"
                  className="group px-7 py-4 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white rounded-xl font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Mulai Buat CV
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => templatesSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                  id="cta-hero-secondary"
                  className="px-7 py-4 bg-white hover:bg-zinc-50 active:scale-95 text-zinc-700 rounded-xl font-semibold text-base shadow-sm border border-zinc-200 transition-all w-full sm:w-auto text-center"
                >
                  Lihat Template
                </button>
              </div>

              {/* Micro social proof */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-200/80">
                <StatCounter value="3" label="Template" suffix="+" />
                <div className="w-px h-10 bg-gray-200" />
                <StatCounter value="100" label="Pengguna" suffix="%" />
                <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                <div className="hidden sm:block">
                  <StatCounter value="0" label="Biaya" suffix=" Rp" />
                </div>
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <CVMockup />
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════ FEATURES / VALUE PROP ═══════════════════ */}
      <section className="relative py-24 sm:py-32 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              KENAPA FREEBUILD CV?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Semua yang kamu butuhkan
              <br />
              <span className="text-zinc-500">dalam satu platform</span>
            </h2>
          </div>

          {/* Bento-style grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {/* Large feature — spans 4 cols */}
            <div className="md:col-span-4 bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden">
                  <Lottie animationData={thunderAnimation} loop={true} className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3">Cepat & Mudah Digunakan</h3>
                <p className="text-zinc-600 leading-relaxed max-w-md">
                  Tidak perlu keahlian desain. Isi data kamu, pilih template, dan CV profesional langsung siap download dalam hitungan menit.
                </p>
              </div>
            </div>

            {/* Small feature — spans 2 cols */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden">
                <Lottie animationData={shieldAnimation} loop={true} className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">ATS-Friendly</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Dioptimalkan untuk lolos Applicant Tracking System di perusahaan besar.
              </p>
            </div>

            {/* Small feature — spans 2 cols */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden">
                <Lottie animationData={downloadAnimation} loop={true} className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Download Gratis</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Download CV dalam format PDF tanpa biaya sepeserpun, langsung dari browser.
              </p>
            </div>

            {/* Large feature — spans 4 cols */}
            <div className="md:col-span-4 bg-zinc-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform overflow-hidden">
                  <Lottie animationData={websiteAnimation} loop={true} className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Akses Dimana Saja</h3>
                <p className="text-zinc-400 leading-relaxed max-w-md">
                  Login untuk menyimpan CV secara online. Edit kembali dari perangkat manapun — desktop, tablet, atau HP.
                  Data kamu aman tersimpan di cloud.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TEMPLATES SECTION ═══════════════════ */}
      <section ref={templatesSectionRef} id="templates" className="py-24 sm:py-32 bg-white border-t border-zinc-100 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold mb-5">
                <Lottie animationData={starAnimation} loop={true} className="w-4 h-4" />
                TEMPLATE PILIHAN
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                Pilih template yang
                <br />
                cocok untukmu
              </h2>
            </div>
            <p className="text-zinc-500 max-w-sm text-sm leading-relaxed mb-2">
              Setiap template dirancang oleh desainer profesional dan dioptimalkan untuk ATS serta recruiter manusia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cvTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  const routes: Record<string, string> = {
                    "creative-management": "/builder/creative-management",
                    portfolio: "/builder/portfolio",
                  };
                  navigate(routes[template.id] || "/builder");
                }}
                className="group cursor-pointer relative bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:border-zinc-300 transition-all duration-300 hover:-translate-y-1"
                id={`template-card-${template.id}`}
              >
                {template.popular && (
                  <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                    <Star className="w-3 h-3 text-white" />
                    Popular
                  </div>
                )}

                {/* Color top */}
                <div className="h-44 relative overflow-hidden bg-zinc-50 border-b border-zinc-100">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  {/* Mini CV mockup */}
                  <div className="absolute inset-x-6 top-6 bottom-0 bg-white rounded-t-xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-zinc-100 p-4 group-hover:top-4 transition-all duration-300">
                    <div className="w-16 h-2 rounded-full mb-3 bg-zinc-900" />
                    <div className="w-24 h-1.5 bg-zinc-200 rounded-full mb-5" />
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full" />
                      <div className="w-4/5 h-1.5 bg-zinc-100 rounded-full" />
                      <div className="w-11/12 h-1.5 bg-zinc-100 rounded-full" />
                      <div className="w-3/5 h-1.5 bg-zinc-100 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{template.name}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-5">{template.description}</p>

                  <ul className="space-y-2 mb-6">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-zinc-600 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-all flex items-center justify-center gap-1.5 group-hover:gap-2.5 bg-zinc-900 text-white group-hover:bg-zinc-800 shadow-sm active:scale-95">
                    Gunakan Template
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon */}
            <div className="relative bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden flex flex-col" id="template-card-coming-soon">
              <div className="h-44 flex items-center justify-center bg-zinc-50 border-b border-zinc-100">
                <Lottie animationData={comingSoonAnimation} loop={true} className="w-24 h-24 opacity-60 grayscale" />
              </div>
              <div className="p-5 flex-1">
                <Skeleton height={18} width={130} borderRadius={9999} />
                <div className="mt-2">
                  <Skeleton height={14} borderRadius={9999} />
                </div>
                <div className="space-y-1.5 mt-3">
                  <Skeleton height={11} width={110} borderRadius={9999} />
                  <Skeleton height={11} width={95} borderRadius={9999} />
                  <Skeleton height={11} width={120} borderRadius={9999} />
                </div>
                <div className="mt-5">
                  <Skeleton height={42} borderRadius={12} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
      <section id="faq" className="py-24 sm:py-32 bg-[#fafafa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold mb-5">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Pertanyaan yang sering
              <br />
              <span className="text-zinc-500">ditanyakan</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Apakah FreeBuild CV benar-benar gratis?",
                a: "Ya! Anda bisa langsung membuat dan mengunduh CV tanpa login. Guest (tanpa login) mendapatkan kuota 3 kali download gratis. Jika butuh lebih, cukup daftar dan login secara gratis untuk mendapatkan 6 kredit download tambahan!",
              },
              {
                q: "Apakah data saya aman?",
                a: "Sangat aman. Jika Anda tidak login, data hanya tersimpan di browser Anda sendiri. Jika Anda login, data CV Anda akan disimpan dengan aman di database kami agar Anda bisa mengaksesnya kembali kapan saja dan dari perangkat mana saja.",
              },
              {
                q: "Apakah template CV ini ATS-friendly?",
                a: "Ya, kami memiliki template ATS Builder yang dirancang khusus agar mudah dibaca oleh sistem ATS (Applicant Tracking System). Selain itu, kami juga menyediakan template Creative dan Portfolio untuk kebutuhan spesifik lainnya.",
              },
              {
                q: "Bisakah saya mengedit CV yang sudah didownload?",
                a: 'Tentu! Jika Anda login, semua CV yang Anda buat akan tersimpan di menu \'Riwayat CV\'. Anda bisa membuka, mengedit kembali, dan mengunduh ulang CV tersebut kapan pun Anda mau.',
              },
              {
                q: "Apakah bisa digunakan di HP?",
                a: "Bisa, website ini responsif dan bisa digunakan di HP. Kami juga baru saja mengoptimalkan tampilan preview khusus untuk pengguna mobile agar lebih nyaman digunakan.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all duration-200 hover:shadow-sm open:shadow-md open:border-zinc-300"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none">
                  <h3 className="text-base font-semibold text-zinc-700 group-open:text-zinc-900 transition-colors text-left pr-4">
                    {faq.q}
                  </h3>
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 group-open:bg-zinc-900 group-open:border-zinc-900 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-open:text-white group-open:rotate-90 transition-all" />
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-0 text-zinc-600 leading-relaxed text-sm animate-fadeIn">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DONATE SECTION ═══════════════════ */}
      <section id="donate" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl border border-zinc-200 p-10 sm:p-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-6 shadow-md">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-3">Dukung FreeBuild CV</h2>
            <p className="text-zinc-600 max-w-lg mx-auto mb-8 leading-relaxed">
              FreeBuild CV sepenuhnya gratis dan tanpa iklan. Jika kamu merasa terbantu, kamu bisa memberikan dukungan sukarela.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => setSelectedMethod(selectedMethod === "qris" ? null : "qris")}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  selectedMethod === "qris"
                    ? "bg-zinc-900 text-white shadow-md active:scale-95"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100"
                }`}
              >
                QRIS (All Payment)
              </button>
            </div>

            {selectedMethod && (
              <div className="flex flex-col items-center gap-4 animate-fadeIn">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm inline-block">
                  <img src="/assets/qrissallpayment.jpeg" alt="QRIS All Payment - Donate" className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-lg" />
                </div>
                <span className="text-sm font-semibold text-zinc-800 bg-zinc-100 px-5 py-2 rounded-full border border-zinc-200">
                  Scan QRIS untuk Donasi
                </span>
              </div>
            )}

            {!selectedMethod && (
              <p className="text-xs text-zinc-400">Pilih tombol di atas untuk menampilkan kode QR</p>
            )}

            <p className="mt-8 text-xs text-zinc-400 font-medium">
              *Donasi bersifat opsional. Aplikasi ini akan tetap gratis untuk semua pengguna.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CHANGELOG SECTION ═══════════════════ */}
      <section id="changelog" className="py-20 border-t border-zinc-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Update Terbaru</h2>
            <p className="text-zinc-500 text-sm">Lihat apa saja yang baru di FreeBuild CV</p>
          </div>

          <div className="space-y-3">
            {[
              {
                version: "1.6.0",
                date: "23 Juni 2026",
                latest: true,
                items: [
                  "Redesign total antarmuka (Auth & Landing Page) dengan gaya Premium Sleek Monochrome",
                  "Penambahan background gambar kustom pada Hero section",
                ],
              },
              {
                version: "1.5.0",
                date: "2 Mei 2026",
                latest: false,
                items: [
                  "Sistem Pendukung Keputusan (SPK DSS) dengan metode SAW, TOPSIS, dan AHP",
                  "Visualisasi data interaktif: Bar Chart, Pie Chart, Radar Chart, dan Ranking Table",
                  "Flowchart Mermaid untuk visualisasi proses pengambilan keputusan",
                  "Analytics Dashboard untuk tracking penggunaan SPK DSS",
                  "Export hasil analisis SPK ke PDF dengan format profesional",
                ],
              },
              {
                version: "1.4.0",
                date: "24 Februari 2026",
                latest: false,
                items: [
                  "Integrasi Database: Simpan CV secara online bagi pengguna yang login",
                  "Sistem Kredit Download: Kuota gratis untuk Guest dan User terdaftar",
                  "Halaman Riwayat CV & Riwayat Download untuk memantau aktivitas",
                  "Admin Dashboard terpusat untuk memantau pengguna dan statistik web",
                  "Fitur Upload Foto Profil yang tersimpan aman di Cloud Storage",
                ],
              },
              {
                version: "1.3.0",
                date: "23 Januari 2026",
                items: [
                  "Rilis fitur Portfolio Builder baru untuk memamerkan proyek terbaikmu",
                  "Kustomisasi warna tema dinamis dengan pilihan warna feminin",
                  "Halaman Preview yang responsif dan dioptimalkan khusus untuk layar Mobile",
                  "Peringatan khusus untuk unduhan PDF di iOS/iPhone",
                ],
              },
              {
                version: "1.2.0",
                date: "25 Desember 2025",
                items: [
                  "Redesign halaman utama dengan tampilan modern",
                  "Perbaikan form input dengan bahasa Indonesia",
                  "Optimasi spacing pada template Creative Management",
                ],
              },
              {
                version: "1.1.0",
                date: "20 November 2025",
                items: [
                  "Penambahan template Creative Management CV",
                  "Splash alert untuk panduan menyimpan CV",
                  "Peningkatan responsivitas tampilan mobile",
                ],
              },
            ].map((release) => (
              <details
                key={release.version}
                className="group bg-white rounded-xl border border-zinc-200 overflow-hidden"
                open={release.latest}
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-900">v{release.version}</span>
                    {release.latest && (
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 text-[10px] font-bold rounded-full uppercase tracking-wide">
                        Latest
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">{release.date}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 py-4 bg-zinc-50/50 border-t border-zinc-100">
                  <ul className="space-y-1.5 text-sm text-zinc-600">
                    {release.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-zinc-300 mt-1.5 text-[8px]">●</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-10 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} FreeBuild CV. Made with ❤️ by Adlildzil</p>
            <a
              href="https://adlzil.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full text-xs font-medium transition-colors"
            >
              Contact Developer
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
