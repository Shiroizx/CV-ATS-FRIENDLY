import { useState, useEffect } from "react";
import { Lock, User as UserIcon, Check, Eye, EyeOff, Settings } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsPage() {
    const { user } = useAuth();

    const [currentUsername, setCurrentUsername] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        document.title = "Pengaturan Akun - FreeBuild CV";
        if (user?.user_metadata?.username) {
            setCurrentUsername(user.user_metadata.username);
        }
    }, [user]);

    const checkPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
        if (/\d/.test(pass)) strength++;
        if (/[^a-zA-Z0-9]/.test(pass)) strength++;
        setPasswordStrength(strength);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
        checkPasswordStrength(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUsername && !newPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Tidak Ada Perubahan',
                text: 'Silakan isi username baru atau password baru untuk menyimpan perubahan.',
                confirmButtonText: 'Tutup',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-gray-600 text-white',
                }
            });
            return;
        }

        setIsLoading(true);
        let successMessage = "Berhasil! ";
        let hasError = false;

        // Handle Username Change
        if (newUsername && newUsername !== currentUsername) {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(newUsername)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Username Tidak Valid',
                    text: 'Username hanya boleh berisi huruf, angka, garis bawah (_), dan harus antara 3 hingga 20 karakter.',
                    confirmButtonText: 'Perbaiki',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-blue-600 text-white',
                    }
                });
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.updateUser({
                data: { username: newUsername.toLowerCase() }
            });

            if (error) {
                hasError = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Ganti Username',
                    text: error.message,
                    confirmButtonText: 'Tutup',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-500 text-white',
                    }
                });
            } else {
                successMessage += 'Username ';
                setCurrentUsername(newUsername);
                setNewUsername("");
            }
        }

        // Handle Password Change
        if (newPassword && !hasError) {
            if (newPassword !== confirmPassword) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Password baru dan konfirmasi tidak cocok!',
                    confirmButtonText: 'Perbaiki',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-blue-600 text-white',
                    }
                });
                setIsLoading(false);
                return;
            }

            if (passwordStrength < 2) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Password Terlalu Lemah',
                    text: 'Gunakan kombinasi huruf, angka, dan simbol.',
                    confirmButtonText: 'Perbaiki',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-blue-600 text-white',
                    }
                });
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                hasError = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Ganti Password',
                    text: error.message,
                    confirmButtonText: 'Tutup',
                    buttonsStyling: false,
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-red-500 text-white',
                    }
                });
            } else {
                if (successMessage.includes('Username')) {
                    successMessage += 'dan password telah disetel.';
                } else {
                    successMessage += 'Password telah disetel.';
                }
                setNewPassword("");
                setConfirmPassword("");
                setCurrentPassword("");
                setPasswordStrength(0);
            }
        } else if (!hasError && newUsername) {
            successMessage += 'telah diperbarui.';
        }

        if (!hasError && (newUsername || newPassword)) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: successMessage,
                confirmButtonText: 'OK',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-2 rounded-xl font-semibold bg-green-500 text-white',
                }
            });
        }

        setIsLoading(false);
    };

    const renderStrengthBars = () => {
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
        const texts = ['Lemah', 'Cukup', 'Baik', 'Kuat'];

        if (!newPassword) return null;

        return (
            <div className="mt-2 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${index < passwordStrength ? colors[passwordStrength - 1] : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-xs font-medium" style={{
                    color: passwordStrength > 0 ? ['#ef4444', '#f97316', '#eab308', '#22c55e'][passwordStrength - 1] : '#6b7280'
                }}>
                    Kekuatan: {passwordStrength > 0 ? texts[passwordStrength - 1] : ''}
                </p>
            </div>
        );
    };

    return (
        <div className="w-full min-h-[calc(100vh-64px)] overflow-auto bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="min-h-full w-full flex items-center justify-center p-6 mt-4">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-cyan-600 shadow-lg shadow-cyan-500/30">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pengaturan Akun</h1>
                        <p className="text-gray-500 text-sm">Ubah username dan password Anda</p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl p-6 shadow-xl bg-white border border-gray-100">
                        <form onSubmit={handleSubmit}>

                            {/* Username Section */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    <UserIcon className="w-5 h-5 text-cyan-600" />
                                    Ubah Username
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="current-username" className="block text-sm font-medium text-gray-600 mb-1.5">Username Saat Ini</label>
                                        <input
                                            type="text"
                                            id="current-username"
                                            readOnly
                                            value={currentUsername}
                                            placeholder="Belum ada username"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="new-username" className="block text-sm font-medium text-gray-600 mb-1.5">Username Baru</label>
                                        <input
                                            type="text"
                                            id="new-username"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            placeholder="username_baru"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">dan</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* Password Section */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    <Lock className="w-5 h-5 text-cyan-600" />
                                    Ubah Password
                                </h2>
                                <div className="space-y-4">
                                    {/* Backend requirement doesn't need current password for Supabase updateUser, but kept for UI completeness if needed later */}
                                    <div className="hidden">
                                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-600 mb-1.5">Password Saat Ini</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                id="current-password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-600 mb-1.5">Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                id="new-password"
                                                value={newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {renderStrengthBars()}
                                    </div>

                                    <div>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600 mb-1.5">Konfirmasi Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirm-password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {confirmPassword && (
                                            <p className={`text-xs mt-1.5 ${confirmPassword === newPassword ? 'text-green-600' : 'text-red-500'}`}>
                                                {confirmPassword === newPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || (!newUsername && !newPassword)}
                                className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:-translate-y-[1px] shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none bg-cyan-600 hover:bg-cyan-700"
                            >
                                {isLoading ? (
                                    "Menyimpan..."
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Note */}
                    <p className="text-center text-gray-400 text-xs mt-6 mb-8">🔒 Pastikan password baru Anda kuat dan mudah diingat</p>

                </div>
            </div>
        </div>
    );
}
