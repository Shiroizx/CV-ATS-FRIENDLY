import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, FileText, Heart, ScrollText, HelpCircle } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </button>
                            );
                        })}
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
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
