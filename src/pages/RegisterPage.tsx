import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { checkRateLimit, resetRateLimit, sanitizeInput } from "../lib/rateLimiter";

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
        const rl = checkRateLimit('register', 3, 10 * 60 * 1000, 5 * 60 * 1000);
        if (rl.isLimited) {
            setLockoutSeconds(rl.remainingSeconds);
            Swal.fire({
                icon: 'error',
                title: 'Terlalu Banyak Percobaan',
                text: `Pendaftaran terkunci sementara untuk mencegah spam. Coba lagi dalam ${formatCountdown(rl.remainingSeconds)}.`,
                confirmButtonText: 'Mengerti',
                customClass: { popup: 'rounded-2xl', confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white' },
                buttonsStyling: false
            });
            return;
        }

        // Sanitize inputs
        const cleanEmail = sanitizeInput(email).toLowerCase();
        const cleanUsername = sanitizeInput(username).toLowerCase().replace(/[^a-z0-9_]/g, '');

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Password dan Konfirmasi Password tidak cocok!',
                confirmButtonText: 'Perbaiki',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
                },
                buttonsStyling: false
            });
            return;
        }

        if (password.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Password minimal harus 8 karakter!', // Sesuai placeholder target
                confirmButtonText: 'Perbaiki',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
                },
                buttonsStyling: false
            });
            return;
        }

        const usernameRegex = /^[a-z0-9_]{3,20}$/;
        if (!usernameRegex.test(cleanUsername)) {
            Swal.fire({
                icon: 'warning',
                title: 'Username Tidak Valid',
                text: 'Username hanya boleh berisi huruf kecil, angka, garis bawah (_), dan harus antara 3 hingga 20 karakter.',
                confirmButtonText: 'Perbaiki',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
                },
                buttonsStyling: false
            });
            return;
        }

        if (!termsAccepted) {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Tertarik menjadi bagian dari kami? Jangan lupa setujui Syarat dan Ketentuan.',
                confirmButtonText: 'Tutup',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
                },
                buttonsStyling: false
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
                    username: cleanUsername
                },
                emailRedirectTo: `${window.location.origin}/email-confirmed`
            }
        });

        if (error) {
            isRegistering.current = false;
            Swal.fire({
                icon: 'error',
                title: 'Pendaftaran Gagal',
                text: error.message,
                confirmButtonText: 'Coba Lagi',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white',
                },
                buttonsStyling: false
            });
            setLoading(false);
        } else {
            resetRateLimit('register'); // success → clear counter
            await supabase.auth.signOut();

            Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil',
                text: 'Akun Anda berhasil dibuat.',
                confirmButtonText: 'Ke Halaman Login',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-cyan-600 text-white',
                },
                buttonsStyling: false
            }).then(() => {
                navigate("/login");
            });
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen overflow-auto bg-gray-50 font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="min-h-full w-full flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out] py-8">
                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">FreeBuild CV</h1>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
                        <p className="text-gray-500 text-sm font-light">Daftar untuk memulai perjalanan Anda</p>
                    </div>

                    {/* Register Card */}
                    <div className="rounded-3xl p-8 shadow-2xl bg-white border border-gray-100">
                        <form onSubmit={handleRegister} autoComplete="off">
                            {/* Honeypot — invisible to humans */}
                            <div className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                <label htmlFor="company">Company</label>
                                <input type="text" id="company" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
                            </div>

                            {/* Lockout Banner */}
                            {lockoutSeconds > 0 && (
                                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                    <span>Pendaftaran terkunci. Coba lagi dalam <strong>{formatCountdown(lockoutSeconds)}</strong></span>
                                </div>
                            )}
                            {/* Email Input */}
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2.5">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@example.com"
                                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-gray-300 transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2.5">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="username_kecil"
                                    className="w-full px-4 py-3.5 rounded-xl border-[1.5px] border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-gray-300 transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                />
                                <p className="text-xs text-gray-400 mt-2">Hanya huruf kecil, angka, dan garis bawah (_).</p>
                            </div>

                            {/* Password Input */}
                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2.5">Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl border-[1.5px] border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-gray-300 transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex gap-1.5 h-1.5 w-full">
                                            <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${password.length >= 8 ? (
                                                /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' :
                                                    /[A-Z]/.test(password) || /[0-9]/.test(password) ? 'bg-yellow-400' : 'bg-red-400'
                                            ) : 'bg-red-400'
                                                }`}></div>
                                            <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password)) ? (
                                                /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-yellow-400'
                                            ) : 'bg-gray-200'
                                                }`}></div>
                                            <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-200'
                                                }`}></div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1.5 text-right font-medium">
                                            {password.length < 8 ? 'Terlalu Pendek' :
                                                /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'Sangat Kuat' :
                                                    /[A-Z]/.test(password) || /[0-9]/.test(password) ? 'Lumayan' : 'Lemah'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2.5">Konfirmasi Password</label>
                                <div className="relative group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulangi password Anda"
                                        className="w-full px-4 py-3.5 pr-12 rounded-xl border-[1.5px] border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-cyan-500 hover:border-gray-300 transition-all shadow-sm focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 mb-6">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-4 h-4 mt-1 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none leading-relaxed">
                                    Saya setuju dengan <Link to="/terms" target="_blank" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">Syarat & Ketentuan</Link> serta <Link to="/privacy" target="_blank" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">Kebijakan Privasi</Link>
                                </label>
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading || !termsAccepted || lockoutSeconds > 0}
                                className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}
                            >
                                {loading ? "Memproses..." : "Daftar"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-xs text-gray-400 font-medium">atau</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-gray-600 text-sm">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
