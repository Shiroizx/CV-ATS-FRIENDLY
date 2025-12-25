import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Zap, Shield, Download, HeartHandshake, ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import LoopingDecryptedText from "../components/ui/LoopingDecryptedText";
import TextType from "../components/ui/TextType";
import thunderAnimation from "../assets/animations/thunder.json";
import shieldAnimation from "../assets/animations/shield.json";
import downloadAnimation from "../assets/animations/download.json";
import starAnimation from "../assets/animations/star.json";
import comingSoonAnimation from "../assets/animations/coming-soon.json";

const cvTemplates = [
  {
    id: "ats-simple",
    name: "ATS Simple",
    description: "Template CV sederhana yang dioptimalkan untuk sistem ATS",
    features: ["Clean layout", "ATS-friendly", "Easy to read"],
    color: "from-blue-400 via-blue-500 to-cyan-500",
    popular: true,
  },
  {
    id: "creative-management",
    name: "Creative Management",
    description: "Template CV kreatif dengan desain modern untuk posisi manajemen",
    features: ["Modern design", "Professional look", "Creative layout"],
    color: "from-purple-400 via-pink-500 to-rose-500",
    popular: false,
  },
];

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<"dana" | "gopay" | null>(null);

  const features = [
    {
      icon: Zap,
      title: "Cepat & Mudah",
      description: "Buat CV profesional dalam hitungan menit",
      gradient: "from-amber-400 to-orange-500",
      animation: thunderAnimation,
    },
    {
      icon: Shield,
      title: "ATS-Friendly",
      description: "Dioptimalkan untuk lolos sistem pelacakan pelamar",
      gradient: "from-emerald-400 to-teal-500",
      animation: shieldAnimation,
    },
    {
      icon: Download,
      title: "Download Gratis",
      description: "Download CV dalam format PDF tanpa biaya",
      gradient: "from-blue-400 to-indigo-500",
      animation: downloadAnimation,
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <header id="hero" className="relative overflow-hidden">
        {/* Decorative Background Elements */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="text-center">
            <div className="text-sm font-medium mb-8">
              <LoopingDecryptedText
                text="100% Gratis & ATS-Friendly"
                speed={50}
                maxIterations={15}
                className="text-gray-600"
                loopDelay={3000}
              />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Buat CV Profesional
              <br />
              <TextType
                text={["dalam Hitungan Menit", "Cepat & Mudah", "ATS-Friendly"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="_"
                className="text-blue-600"
                as="span"
              />
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              CV Builder gratis dengan template ATS-friendly yang membantu Anda mendapatkan pekerjaan impian.
              <span className="font-semibold text-gray-800"> Tidak perlu registrasi!</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/builder")}
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
              >
                Mulai Buat CV
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-gray-200"
              >
                Lihat Template
              </button>
            </div>
          </div>
        </div>
      </header >

      {/* Features Section */}
      < section className="py-20 relative" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Kenapa Pilih <span className="text-blue-600">FreeBuild CV?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Fitur unggulan yang membuat pembuatan CV jadi lebih mudah</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>

                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg overflow-hidden">
                  <Lottie animationData={feature.animation} loop={true} className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Templates Section */}
      < section id="templates" className="py-20 bg-white relative overflow-hidden" >
        {/* Decorative Elements */}


        < div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-6">
              <Lottie animationData={starAnimation} loop={true} className="w-5 h-5" />
              <span className="text-sm font-semibold text-gray-700">Template Pilihan</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Pilih Template CV Favorit</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Template profesional yang dioptimalkan untuk ATS dan mudah dibaca oleh recruiter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cvTemplates.map((template, index) => (
              <div
                key={template.id}
                onClick={() => navigate(template.id === "creative-management" ? "/builder/creative-management" : "/builder")}
                className="group cursor-pointer relative bg-white rounded-3xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-transparent transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {template.popular && (
                  <div className="absolute top-4 right-4 px-4 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-full z-10 shadow-lg flex items-center gap-1">
                    <Lottie animationData={starAnimation} loop={true} className="w-4 h-4" />
                    Popular
                  </div>
                )}

                {/* Preview */}
                <div className={`h-56 bg-gradient-to-br ${template.color} p-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative h-full bg-white rounded-2xl shadow-2xl p-6 overflow-hidden transform group-hover:scale-105 transition-transform">
                    <div className="w-20 h-4 bg-gray-800 rounded-full mb-3"></div>
                    <div className="w-36 h-3 bg-gray-300 rounded-full mb-6"></div>
                    <div className="space-y-2.5">
                      <div className="w-full h-2.5 bg-gray-200 rounded-full"></div>
                      <div className="w-4/5 h-2.5 bg-gray-200 rounded-full"></div>
                      <div className="w-11/12 h-2.5 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">{template.description}</p>

                  <ul className="space-y-2.5 mb-6">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold group-hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    Gunakan Template
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}

            {/* Coming Soon Cards */}
            {[1, 2].map((item) => (
              <div key={item} className="relative bg-white rounded-3xl border-2 border-dashed border-gray-300 overflow-hidden">
                <div className="h-56 bg-gray-100 p-8 flex items-center justify-center">
                  <Lottie animationData={comingSoonAnimation} loop={true} className="w-32 h-32" />
                </div>
                <div className="p-6">
                  {/* Skeleton Loading with Smooth Shimmer */}
                  <div className="space-y-3">
                    <Skeleton height={20} width={144} borderRadius={9999} />
                    <Skeleton height={16} borderRadius={9999} />
                    <div className="space-y-2 pt-2">
                      <Skeleton height={12} width={128} borderRadius={9999} />
                      <Skeleton height={12} width={112} borderRadius={9999} />
                      <Skeleton height={12} width={144} borderRadius={9999} />
                    </div>
                    <div className="mt-4">
                      <Skeleton height={48} borderRadius={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div >
      </section >

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Yang Sering Ditanyakan</h2>
            <p className="text-lg text-gray-600">Jawaban untuk pertanyaan umum seputar FreeBuild CV</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Apakah FreeBuild CV benar-benar gratis?",
                a: "Ya, 100% gratis! Semua fitur, template, dan download PDF bisa digunakan tanpa biaya sepeserpun. Tidak ada watermark, tidak ada fitur premium tersembunyi."
              },
              {
                q: "Apakah data saya aman?",
                a: "Sangat aman. FreeBuild CV bekerja sepenuhnya di browser Anda (client-side). Kami tidak menyimpan data pribadi atau CV Anda di server kami. Data Anda tersimpan di local storage browser Anda sendiri."
              },
              {
                q: "Apakah template CV ini ATS-friendly?",
                a: "Ya, semua template kami dirancang khusus agar mudah dibaca oleh sistem ATS (Applicant Tracking System). Kami menggunakan struktur yang standar, font yang terbaca jelas, dan menghindari elemen grafis yang membingungkan ATS."
              },
              {
                q: "Bisakah saya mengedit CV yang sudah didownload?",
                a: "CV yang didownload dalam format PDF tidak bisa diedit secara langsung. Namun, Anda bisa kembali ke website ini kapan saja, dan data Anda akan tetap ada (selama Anda menggunakan browser dan perangkat yang sama) untuk diedit dan didownload ulang."
              },
              {
                q: "Apakah bisa digunakan di HP?",
                a: "Bisa, website ini responsif dan bisa digunakan di HP. Namun, untuk pengalaman terbaik saat mengedit dan mengatur layout CV, kami menyarankan menggunakan laptop atau komputer desktop."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md open:bg-white open:shadow-lg">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none">
                  <h3 className="text-lg font-semibold text-gray-800 group-open:text-blue-600 transition-colors text-left">{faq.q}</h3>
                  <div className="relative flex-shrink-0 w-6 h-6 ml-4">
                    <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-gray-400 group-open:bg-blue-600 transition-all rounded-full group-open:rotate-180"></div>
                    <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-400 group-open:bg-blue-600 transition-all -translate-x-1/2 rounded-full group-open:rotate-90 group-open:opacity-0"></div>
                  </div>
                </summary>
                <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-transparent group-open:border-gray-100 animate-fadeIn">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section id="donate" className="py-20 bg-gray-50 relative overflow-hidden">


        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium mb-6 shadow-lg">
            <HeartHandshake className="w-5 h-5" />
            <span>Dukung Pengembangan FreeBuild CV</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ingin Ikut Membantu?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            FreeBuild CV sepenuhnya gratis dan tanpa iklan. Jika kamu merasa terbantu, kamu bisa memberikan dukungan sukarela.
            Pilih metode di bawah ini untuk menampilkan QRIS donasi.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedMethod(selectedMethod === "dana" ? null : "dana")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${selectedMethod === "dana"
                ? "bg-blue-600 text-white scale-105"
                : "bg-white border-2 border-blue-200 text-blue-700 hover:border-blue-400"
                }`}
            >
              QRIS Dana
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod(selectedMethod === "gopay" ? null : "gopay")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${selectedMethod === "gopay"
                ? "bg-green-600 text-white scale-105"
                : "bg-white border-2 border-green-200 text-green-700 hover:border-green-400"
                }`}
            >
              QRIS GoPay
            </button>
          </div>

          {selectedMethod && (
            <div className="flex flex-col items-center gap-4 animate-fadeIn">
              <div className="rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-xl inline-block">
                {selectedMethod === "dana" && <img src="/assets/qrisdana.png" alt="QRIS Dana - Donate" className="w-64 h-64 object-contain" />}
                {selectedMethod === "gopay" && <img src="/assets/qrisgopay.png" alt="QRIS GoPay - Donate" className="w-64 h-64 object-contain" />}
              </div>
              <p className="text-base font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded-full">
                {selectedMethod === "dana" ? "QRIS via Dana" : "QRIS via GoPay"}
              </p>
            </div>
          )}

          {!selectedMethod && (
            <p className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full inline-block">
              Pilih salah satu metode di atas untuk menampilkan kode QR
            </p>
          )}

          <p className="mt-8 text-sm text-gray-500">*Donasi bersifat opsional. Aplikasi ini akan tetap gratis untuk semua pengguna.</p>
        </div>
      </section >

      {/* Changelog Section */}
      <section id="changelog" className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Update Terbaru</h2>
            <p className="text-gray-600">Lihat apa saja yang baru di FreeBuild CV</p>
          </div>

          <div className="space-y-3">
            {/* Version 1.2.0 */}
            <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-gray-900">Version 1.2.0</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Latest</span>
                  <span className="text-sm text-gray-500">25 Des 2024</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Redesign halaman utama dengan tampilan modern</li>
                  <li>• Perbaikan form input dengan bahasa Indonesia</li>
                  <li>• Optimasi spacing pada template Creative Management</li>
                </ul>
              </div>
            </details>

            {/* Version 1.1.0 */}
            <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-gray-900">Version 1.1.0</span>
                  <span className="text-sm text-gray-500">24 Des 2024</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Penambahan template Creative Management CV</li>
                  <li>• Splash alert untuk panduan menyimpan CV</li>
                  <li>• Peningkatan responsivitas tampilan mobile</li>
                </ul>
              </div>
            </details>

            {/* Version 1.0.0 */}
            <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-gray-900">Version 1.0.0</span>
                  <span className="text-sm text-gray-500">22 Des 2024</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li>• Peluncuran FreeBuild CV dengan template ATS Simple</li>
                  <li>• Fitur download PDF gratis tanpa watermark</li>
                  <li>• Real-time preview CV</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section >

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-gray-600">© 2025 FreeBuild CV. Made with ❤️ by Adlildzil</p>
          <div>
            <a
              href="https://adlzil.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
            >
              Contact Developer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
