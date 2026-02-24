import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, ArrowLeft, Eye, EyeOff, User, ShieldAlert } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "../lib/rateLimiter";

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
                            confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
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
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
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
        <div className="w-full flex h-screen overflow-hidden bg-gray-50 font-sans items-center justify-center p-4 relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">

                {/* Logo Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">FreeBuild CV</h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
                    <p className="text-gray-500 text-sm font-light">Masukkan kredensial Anda untuk melanjutkan</p>
                </div>

                {/* Login Card */}
                <div className="rounded-3xl p-8 shadow-2xl bg-white border border-gray-100">
                    <form onSubmit={handleLogin} autoComplete="off">
                        {/* Honeypot — invisible to humans, bots fill it */}
                        <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                            <label htmlFor="website">Website</label>
                            <input type="text" id="website" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                        </div>

                        {/* Lockout Banner */}
                        {lockoutSeconds > 0 && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                <span>Terlalu banyak percobaan. Coba lagi dalam <strong>{formatCountdown(lockoutSeconds)}</strong></span>
                            </div>
                        )}
                        {/* Email Input */}
                        <div className="mb-6">
                            <label htmlFor="loginIdentifier" className="block text-sm font-semibold text-gray-800 mb-2.5">
                                Email atau Username
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                                <input
                                    type="text"
                                    id="loginIdentifier"
                                    required
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    placeholder="nama@example.com atau username"
                                    className="w-full px-4 py-3.5 pl-12 rounded-xl bg-white border-2 border-gray-100 focus:border-cyan-500 focus:ring-0 text-gray-800 placeholder-gray-400 outline-none transition-all hover:border-gray-200 shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2.5">
                                Password
                            </label>
                            <div className="relative group">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 pl-12 pr-12 rounded-xl bg-white border-2 border-gray-100 focus:border-cyan-500 focus:ring-0 text-gray-800 placeholder-gray-400 outline-none transition-all hover:border-gray-200 shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between mb-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" />
                                <span className="text-sm text-gray-600 font-medium">Ingat saya</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors">Lupa password?</a>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={loading || lockoutSeconds > 0}
                                className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
                            >
                                {loading ? (
                                    "Memproses..."
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Masuk</span>
                                    </>
                                )}
                            </button>

                            <Link
                                to="/"
                                className="w-full py-3.5 rounded-xl text-gray-700 bg-gray-50 border border-gray-200 font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-100 hover:-translate-y-[2px] shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Halaman Dashboard</span>
                            </Link>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">atau</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-600 text-sm">
                        Belum punya akun?{' '}
                        <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                            Daftar di sini
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
