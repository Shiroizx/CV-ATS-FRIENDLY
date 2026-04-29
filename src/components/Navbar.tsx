import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, FileText, Heart, ScrollText, HelpCircle, LogOut, User, LogIn, ChevronDown, Settings, ShieldAlert, Download } from 'lucide-react';
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

    const routeLinks: any[] = [];
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
                cancelButton: 'px-6 py-2 rounded-xl font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300'
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

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <img src="/favicon.png" alt="FreeBuild CV" className="w-10 h-10 drop-shadow-lg" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-blue-600">
                                FreeBuild CV
                            </h1>
                            <p className="text-xs text-gray-500 -mt-1">ATS-Friendly Builder</p>
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
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    <Icon className="w-4 h-4" />
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
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden lg:block"></div>
                        {user ? (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="max-w-[120px] truncate hidden lg:block font-medium">
                                        {user.user_metadata?.username || user.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    @{user.user_metadata?.username || 'user'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            </div>

                                            {/* Download Credit Progress Bar */}
                                            {creditInfo && (
                                                <div
                                                    className="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => { setIsProfileOpen(false); navigate('/download-history'); }}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                            <Download className="w-3.5 h-3.5" />
                                                            Kredit Download
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {creditInfo.count}/{creditInfo.max}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${creditInfo.remaining === 0
                                                                    ? 'bg-red-500'
                                                                    : creditInfo.remaining <= 2
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-emerald-500'
                                                                }`}
                                                            style={{ width: `${(creditInfo.count / creditInfo.max) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1">Sisa {creditInfo.remaining} download · Lihat riwayat →</p>
                                                </div>
                                            )}

                                            <div className="p-1.5">
                                                {user.user_metadata?.is_admin && (
                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            navigate('/admin');
                                                        }}
                                                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                                                >
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">Riwayat CV</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/settings');
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    <span>Pengaturan Akun</span>
                                                </button>
                                            </div>

                                            <div className="p-1.5 border-t border-gray-100">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        handleSignOut();
                                                    }}
                                                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                            <div className="flex items-center gap-2 ml-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Masuk</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => scrollToSection(link.id)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left w-full"
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
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left w-full"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}

                            <hr className="my-2 border-gray-100" />

                            {user ? (
                                <>
                                    <div className="px-4 py-3 flex flex-col gap-1 bg-blue-50/50 rounded-lg mx-2 border border-blue-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-bold text-gray-900 truncate">
                                                    @{user.user_metadata?.username || user.email?.split('@')[0]}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 px-2 mt-2">
                                        {user.user_metadata?.is_admin && (
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/admin');
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-red-600 hover:bg-red-50 text-left w-full mx-2"
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
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left w-full mx-2"
                                        >
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <span>Riwayat CV</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/settings');
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left w-full"
                                        >
                                            <Settings className="w-5 h-5" />
                                            <span>Pengaturan Akun</span>
                                        </button>
                                        <hr className="my-1 border-gray-100 mx-2" />
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-red-600 hover:bg-red-50 text-left w-full"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Masuk</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex justify-center flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
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
