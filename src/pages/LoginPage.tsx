import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "../lib/rateLimiter";
import { motion, AnimatePresence } from "motion/react";

export default function LoginPage() {
    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [honeypot, setHoneypot] = useState("");
    const lastSubmitRef = useRef(0);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Lockout countdown timer
    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = setInterval(() => {
            setLockoutSeconds(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    const formatCountdown = useCallback((secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        document.title = "Login - FreeBuild CV";
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot trap — bots will fill hidden fields
        if (honeypot) return;

        // Debounce — prevent rapid double-submit (min 1.5s between attempts)
        const now = Date.now();
        if (now - lastSubmitRef.current < 1500) return;
        lastSubmitRef.current = now;

        // Rate limit check
        const rl = checkRateLimit('login', 5, 5 * 60 * 1000, 2 * 60 * 1000);
        if (rl.isLimited) {
            setLockoutSeconds(rl.remainingSeconds);
            Swal.fire({
                icon: 'error',
                title: 'Terlalu Banyak Percobaan',
                text: `Akun Anda terkunci sementara. Coba lagi dalam ${formatCountdown(rl.remainingSeconds)}.`,
                confirmButtonText: 'Mengerti',
                customClass: { popup: 'rounded-2xl', confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white' },
                buttonsStyling: false
            });
            return;
        }

        setLoading(true);

        // Sanitize inputs
        const cleanIdentifier = sanitizeInput(loginIdentifier);

        let finalEmail = cleanIdentifier;

        // If it doesn't look like an email, assume it's a username
        if (!cleanIdentifier.includes('@')) {
            try {
                const { data, error: rpcError } = await supabase.rpc('get_email_by_username', {
                    p_username: cleanIdentifier.toLowerCase()
                });

                if (rpcError) throw rpcError;

                if (!data) {
                    rl.record(); // count as failed attempt
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Gagal',
                        text: 'Username tidak ditemukan.',
                        confirmButtonText: 'Coba Lagi',
                        customClass: {
                            popup: 'rounded-2xl',
                            confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white',
                        },
                        buttonsStyling: false
                    });
                    setLoading(false);
                    return;
                }

                finalEmail = data;
            } catch (err: any) {
                console.error("Error fetching email by username:", err);
                rl.record();
                Swal.fire({
                    icon: 'error',
                    title: 'Terjadi Kesalahan',
                    text: 'Gagal memverifikasi username. Pastikan fungsi database sudah ditambahkan atau coba gunakan email.',
                    confirmButtonText: 'Tutup',
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white',
                    },
                    buttonsStyling: false
                });
                setLoading(false);
                return;
            }
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: finalEmail,
            password,
        });

        if (error) {
            rl.record(); // count failed login
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: error.message,
                confirmButtonText: 'Coba Lagi',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-zinc-900 text-white',
                },
                buttonsStyling: false
            });
            setLoading(false);
        } else {
            resetRateLimit('login'); // success → clear counter
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Login',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-2xl' }
            });
            navigate("/");
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
                        Bangun karier profesional Anda dimulai dari CV yang tepat.
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-[45ch]">
                        Sistem kami memastikan resume Anda dioptimalkan untuk ATS, memberikan Anda peluang terbaik untuk melewati tahap seleksi pertama.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500">
                    <div className="w-10 h-px bg-zinc-800" />
                    <p>© {new Date().getFullYear()} FreeBuild CV</p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 relative bg-white">
                <Link to="/" className="absolute top-8 right-8 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2 group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Kembali
                </Link>

                <div className="w-full max-w-[400px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Selamat Datang</h1>
                        <p className="text-zinc-500 mb-8">Masuk ke akun Anda untuk melanjutkan.</p>

                        <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
                            {/* Honeypot */}
                            <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                <label htmlFor="website">Website</label>
                                <input type="text" id="website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
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
                                        <p>Akun terkunci sementara. Coba lagi dalam <span className="font-bold">{formatCountdown(lockoutSeconds)}</span></p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label htmlFor="loginIdentifier" className="block text-sm font-medium text-zinc-700">
                                    Email atau Username
                                </label>
                                <input
                                    type="text"
                                    id="loginIdentifier"
                                    required
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    placeholder="nama@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all sm:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
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

                            <div className="flex items-center justify-between pt-1 pb-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-offset-0 cursor-pointer transition-colors"
                                    />
                                    <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">Ingat saya</span>
                                </label>
                                <button type="button" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                                    Lupa password?
                                </button>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading || lockoutSeconds > 0}
                                className="w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
                                whileTap={!loading && !lockoutSeconds ? { scale: 0.98 } : {}}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </motion.button>
                        </form>

                        <p className="mt-8 text-center text-sm text-zinc-500">
                            Belum punya akun?{' '}
                            <Link to="/register" className="font-medium text-zinc-900 hover:underline underline-offset-4 transition-all">
                                Daftar sekarang
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
