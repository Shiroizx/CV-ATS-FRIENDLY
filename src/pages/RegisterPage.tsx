import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "../lib/rateLimiter";
import { motion, AnimatePresence } from "motion/react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [honeypot, setHoneypot] = useState("");
    const lastSubmitRef = useRef(0);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isRegistering = useRef(false);

    // Lockout countdown timer
    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = setInterval(() => {
            setLockoutSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    const formatCountdown = useCallback((secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }, []);

    useEffect(() => {
        document.title = "Daftar Akun - FreeBuild CV";
        if (user && !isRegistering.current) {
            navigate("/builder");
        }
    }, [user, navigate]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot trap
        if (honeypot) return;

        // Debounce (min 2s between register attempts)
        const now = Date.now();
        if (now - lastSubmitRef.current < 2000) return;
        lastSubmitRef.current = now;

        // Rate limit check (3 attempts / 10 min, 5 min lockout)
        const rl = checkRateLimit("register", 3, 10 * 60 * 1000, 5 * 60 * 1000);
        if (rl.isLimited) {
            setLockoutSeconds(rl.remainingSeconds);
            Swal.fire({
                icon: "error",
                title: "Terlalu Banyak Percobaan",
                text: `Pendaftaran terkunci sementara untuk mencegah spam. Coba lagi dalam ${formatCountdown(rl.remainingSeconds)}.`,
                confirmButtonText: "Mengerti",
                customClass: { popup: "rounded-2xl", confirmButton: "px-6 py-2 rounded-xl font-semibold bg-red-600 text-white" },
                buttonsStyling: false,
            });
            return;
        }

        // Sanitize inputs
        const cleanEmail = sanitizeInput(email).toLowerCase();
        const cleanUsername = sanitizeInput(username)
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "");

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: "Password dan Konfirmasi Password tidak cocok!",
                confirmButtonText: "Perbaiki",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800",
                },
                buttonsStyling: false,
            });
            return;
        }

        if (password.length < 8) {
            Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: "Password minimal harus 8 karakter!",
                confirmButtonText: "Perbaiki",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800",
                },
                buttonsStyling: false,
            });
            return;
        }

        const usernameRegex = /^[a-z0-9_]{3,20}$/;
        if (!usernameRegex.test(cleanUsername)) {
            Swal.fire({
                icon: "warning",
                title: "Username Tidak Valid",
                text: "Username hanya boleh berisi huruf kecil, angka, garis bawah (_), dan harus antara 3 hingga 20 karakter.",
                confirmButtonText: "Perbaiki",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800",
                },
                buttonsStyling: false,
            });
            return;
        }

        if (!termsAccepted) {
            Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: "Tertarik menjadi bagian dari kami? Jangan lupa setujui Syarat dan Ketentuan.",
                confirmButtonText: "Tutup",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800",
                },
                buttonsStyling: false,
            });
            return;
        }

        setLoading(true);
        isRegistering.current = true;

        rl.record(); // count every registration attempt

        const { error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                data: {
                    username: cleanUsername,
                },
                emailRedirectTo: `${window.location.origin}/email-confirmed`,
            },
        });

        if (error) {
            isRegistering.current = false;
            Swal.fire({
                icon: "error",
                title: "Pendaftaran Gagal",
                text: error.message,
                confirmButtonText: "Coba Lagi",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-red-600 text-white",
                },
                buttonsStyling: false,
            });
            setLoading(false);
        } else {
            resetRateLimit("register"); // success → clear counter
            await supabase.auth.signOut();

            Swal.fire({
                icon: "success",
                title: "Pendaftaran Berhasil",
                text: "Akun Anda berhasil dibuat.",
                confirmButtonText: "Ke Halaman Login",
                customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white hover:bg-zinc-800",
                },
                buttonsStyling: false,
            }).then(() => {
                navigate("/login");
            });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex font-sans bg-white" style={{ fontFamily: "'Inter', 'Geist', 'Outfit', sans-serif" }}>
            
            {/* LEFT SIDE - VISUAL/BRANDING */}
            <div 
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white"
                style={{
                    backgroundImage: "url('/assets/background.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Overlay for text legibility */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-2">
                    <div className="bg-white p-1.5 rounded-sm flex items-center justify-center">
                        <img src="/favicon.png" alt="FreeBuild CV Logo" className="w-5 h-5 object-contain" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">FreeBuild CV</span>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-6 leading-[1.1]">
                        Bergabunglah dan tingkatkan peluang Anda.
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-[45ch]">
                        Dapatkan akses ke builder CV premium yang dioptimalkan untuk sistem pelacakan pelamar secara gratis.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500">
                    <div className="w-10 h-px bg-zinc-800" />
                    <p>© {new Date().getFullYear()} FreeBuild CV</p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:px-24 md:py-16 relative bg-white overflow-y-auto">
                <Link to="/" className="absolute top-8 right-8 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Kembali
                </Link>

                <div className="w-full max-w-[400px] my-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Buat Akun</h1>
                        <p className="text-zinc-500 mb-8">Daftar secara gratis dan mulai membuat CV Anda.</p>

                        <form onSubmit={handleRegister} autoComplete="off" className="space-y-4">
                            {/* Honeypot */}
                            <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                <label htmlFor="company">Company</label>
                                <input type="text" id="company" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                            </div>

                            <AnimatePresence>
                                {lockoutSeconds > 0 && (
                                    <motion.div
                                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm"
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    >
                                        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                                        <p>Pendaftaran terkunci sementara. Coba lagi dalam <span className="font-bold">{formatCountdown(lockoutSeconds)}</span></p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all sm:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-sm font-medium text-zinc-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                    placeholder="johndoe"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all sm:text-sm"
                                />
                                <p className="text-xs text-zinc-500 font-medium pt-1">Hanya huruf kecil, angka, dan garis bawah (_).</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-zinc-700">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 8 karakter"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all sm:text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">Konfirmasi</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password"
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all sm:text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 font-medium pt-1">⚠️ Password tidak cocok</p>
                            )}

                            <div className="pt-2 pb-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-offset-0 cursor-pointer transition-colors appearance-none checked:bg-zinc-900 checked:border-zinc-900"
                                        />
                                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <span className="text-sm text-zinc-600 leading-relaxed select-none">
                                        Saya setuju dengan{" "}
                                        <Link to="/terms" target="_blank" className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-all">
                                            Syarat & Ketentuan
                                        </Link>{" "}
                                        serta{" "}
                                        <Link to="/privacy" target="_blank" className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-all">
                                            Kebijakan Privasi
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading || !termsAccepted || lockoutSeconds > 0}
                                className="w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
                                whileTap={!loading && !lockoutSeconds && termsAccepted ? { scale: 0.98 } : {}}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Daftar Sekarang</span>
                                )}
                            </motion.button>
                        </form>

                        <p className="mt-8 text-center text-sm text-zinc-500">
                            Sudah punya akun?{" "}
                            <Link to="/login" className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-all">
                                Masuk di sini
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
