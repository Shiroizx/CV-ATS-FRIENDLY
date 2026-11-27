import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, FileText, Heart, ScrollText, HelpCircle, LogOut, User, LogIn, ChevronDown, Settings, ShieldAlert, Download, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRemainingDownloads } from '../lib/downloadCredit';
import Swal from 'sweetalert2';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [creditInfo, setCreditInfo] = useState<{ count: number; max: number; remaining: number } | null>(null);

    // Fetch credit info when dropdown opens
    useEffect(() => {
        if (isProfileOpen && user) {
            getRemainingDownloads(true).then(info => setCreditInfo(info));
        }
    }, [isProfileOpen, user]);

    const scrollToSection = (sectionId: string) => {
        // Close mobile menu
        setIsMenuOpen(false);

        // If not on home page, navigate to home first
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    const navbarHeight = 64;
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navbarHeight;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 100);
            return;
        }

        // Scroll to section
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = 64;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navbarHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const navLinks = [
        { id: 'hero', label: 'Home', icon: Home },
        { id: 'templates', label: 'Template', icon: FileText },
        { id: 'faq', label: 'FAQ', icon: HelpCircle },
        { id: 'donate', label: 'Donate', icon: Heart },
        { id: 'changelog', label: 'Changelog', icon: ScrollText },
    ];

    const routeLinks: { to: string; label: string; icon: LucideIcon }[] = [
        { to: '/qr-generator', label: 'QR Generator', icon: QrCode },
    ];
    const handleSignOut = async () => {
        setIsMenuOpen(false);
        const result = await Swal.fire({
            title: 'Keluar',
            text: 'Apakah Anda yakin ingin keluar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700',
                cancelButton: 'px-6 py-2 rounded-xl font-semibold bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            await signOut();
            navigate("/");
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Keluar',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-2xl' }
            });
        }
    };

    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/q/')) {
        return null;
    }

    return (
        <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/favicon.png" alt="FreeBuild CV" className="w-9 h-9 object-contain" />
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                                FreeBuild CV
                            </h1>
                            <p className="text-xs text-zinc-500 font-medium tracking-wide">ATS-Friendly Builder</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{link.label}</span>
                                </button>
                            );
                        })}
                        {routeLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            );
                        })}
                        <div className="h-5 w-px bg-zinc-200 mx-2 hidden lg:block"></div>
                        {user ? (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                        <User className="w-4 h-4 text-zinc-700" />
                                    </div>
                                    <span className="max-w-[120px] truncate hidden lg:block font-medium">
                                        {user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                                                <p className="text-sm font-medium text-zinc-900 truncate">
                                                    @{user.user_metadata?.username || 'user'}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>

                                            {/* Download Credit Progress Bar */}
                                            {creditInfo && (
                                                <div
                                                    className="px-4 py-3 border-b border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors"
                                                    onClick={() => { setIsProfileOpen(false); navigate('/download-history'); }}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                                                            <Download className="w-3.5 h-3.5" />
                                                            Kredit Download
                                                        </span>
                                                        <span className="text-xs font-bold text-zinc-900">
                                                            {creditInfo.count}/{creditInfo.max}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${creditInfo.remaining === 0
                                                                    ? 'bg-red-500'
                                                                    : creditInfo.remaining <= 2
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-zinc-900'
                                                                }`}
                                                            style={{ width: `${(creditInfo.count / creditInfo.max) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 mt-1.5">Sisa {creditInfo.remaining} download · Lihat riwayat →</p>
                                                </div>
                                            )}

                                            <div className="p-1.5">
                                                {user.user_metadata?.is_admin && (
                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            navigate('/admin');
                                                        }}
                                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                                        <span className="font-medium">Admin Dashboard</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/my-resumes');
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-md transition-colors"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span className="font-medium">Riwayat CV</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/my-qr-codes');
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-md transition-colors"
                                                >
                                                    <QrCode className="w-4 h-4" />
                                                    <span className="font-medium">Riwayat QR Code</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/settings');
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-md transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Pengaturan Akun</span>
                                                </button>
                                            </div>

                                            <div className="p-1.5 border-t border-zinc-100">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        handleSignOut();
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="font-medium">Keluar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:scale-95 rounded-xl transition-all shadow-sm"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-zinc-900" />
                        ) : (
                            <Menu className="w-6 h-6 text-zinc-900" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-zinc-200 animate-fadeIn">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => scrollToSection(link.id)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 text-left w-full"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{link.label}</span>
                                    </button>
                                );
                            })}
                            {routeLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 text-left w-full"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}

                            <hr className="my-2 border-zinc-100 mx-4" />

                            {user ? (
                                <>
                                    <div className="px-4 py-3 flex flex-col gap-1 bg-zinc-50 rounded-xl mx-4 border border-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-zinc-700" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-bold text-zinc-900 truncate">
                                                    @{user.user_metadata?.username || user.email?.split('@')[0]}
                                                </span>
                                                <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 mt-2 px-2">
                                        {user.user_metadata?.is_admin && (
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/admin');
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-red-600 hover:bg-red-50 text-left w-full"
                                            >
                                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                                <span>Admin Dashboard</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/my-resumes');
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-left w-full"
                                        >
                                            <FileText className="w-5 h-5" />
                                            <span>Riwayat CV</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/my-qr-codes');
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-left w-full"
                                        >
                                            <QrCode className="w-5 h-5" />
                                            <span>Riwayat QR Code</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/settings');
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-left w-full"
                                        >
                                            <Settings className="w-5 h-5" />
                                            <span>Pengaturan Akun</span>
                                        </button>
                                        <hr className="my-2 border-zinc-100 mx-2" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-red-600 hover:bg-red-50 text-left w-full"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mt-4 px-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Masuk</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-sm"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
