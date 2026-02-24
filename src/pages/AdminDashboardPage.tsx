import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, Plus, Pencil, Trash2, Search, ArrowLeft, Loader2, ShieldAlert, Globe, RefreshCw, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { getDownloadLimits } from "../lib/downloadCredit";

interface AppUser {
    id: string;
    email: string;
    created_at: string;
    raw_user_meta_data: {
        username?: string;
        full_name?: string;
        is_admin?: boolean;
        download_count?: number;
    };
}

interface GuestDownload {
    ip_address: string;
    total_downloads: number;
    last_download: string;
}

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [guests, setGuests] = useState<GuestDownload[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "guests" | "settings">("users");

    // Limits state
    const [limits, setLimits] = useState({ guest: 3, user: 6 });
    const [savingLimits, setSavingLimits] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc("get_users_list");

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal Mengambil Data User",
                text: error.message || "Pastikan Anda memiliki hak akses admin."
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchGuests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc("get_guest_downloads");
            if (error) throw error;
            setGuests(data || []);
        } catch (error: any) {
            console.error("Error fetching guests:", error);
            Swal.fire("Error", "Gagal mengambil data guest", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getDownloadLimits();
            setLimits(data);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers();
        } else if (activeTab === "guests") {
            fetchGuests();
        } else {
            fetchSettings();
        }
    }, [activeTab]);

    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.raw_user_meta_data?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGuests = guests.filter((g) =>
        g.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateUser = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah User Baru',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Nama Lengkap">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Email (Wajib)" type="email">' +
                '<input id="swal-input3" class="swal2-input" placeholder="Password (Wajib)" type="password">' +
                '<div style="text-align: left; margin-top: 10px; margin-left: 10px;"><label><input id="swal-input4" type="checkbox"> Jadikan Admin</label></div>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
                const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
                const password = (document.getElementById('swal-input3') as HTMLInputElement).value;
                const isAdmin = (document.getElementById('swal-input4') as HTMLInputElement).checked;

                if (!email || !password) {
                    Swal.showValidationMessage('Email & Password wajib diisi');
                    return false;
                }
                return { name, email, password, isAdmin };
            }
        });

        if (formValues) {
            setIsSubmitting(true);
            try {
                const { error } = await supabase.rpc("admin_create_user", {
                    p_email: formValues.email,
                    p_password: formValues.password,
                    p_name: formValues.name,
                    p_is_admin: formValues.isAdmin
                });

                if (error) throw error;

                Swal.fire('Berhasil!', 'User baru telah ditambahkan.', 'success');
                fetchUsers();
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Gagal menambahkan user', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleEditUser = async (user: AppUser) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit User',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Nama Lengkap" value="${user.raw_user_meta_data?.full_name || ''}">` +
                `<input id="swal-input2" class="swal2-input" placeholder="Email" value="${user.email}" type="email">` +
                `<input id="swal-input3" class="swal2-input" placeholder="Password Baru (Kosongkan bila tak ingin diubah)" type="password">` +
                `<input id="swal-input5" class="swal2-input" placeholder="Download Count" type="number" value="${user.raw_user_meta_data?.download_count || 0}">` +
                `<div style="text-align: left; margin-top: 10px; margin-left: 10px;"><label><input id="swal-input4" type="checkbox" ${user.raw_user_meta_data?.is_admin ? 'checked' : ''}> Jadikan Admin</label></div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const name = (document.getElementById('swal-input1') as HTMLInputElement).value;
                const email = (document.getElementById('swal-input2') as HTMLInputElement).value;
                const password = (document.getElementById('swal-input3') as HTMLInputElement).value;
                const isAdmin = (document.getElementById('swal-input4') as HTMLInputElement).checked;
                const downloadCount = parseInt((document.getElementById('swal-input5') as HTMLInputElement).value) || 0;

                if (!email) {
                    Swal.showValidationMessage('Email wajib diisi');
                    return false;
                }
                return { name, email, password, isAdmin, downloadCount };
            }
        });

        if (formValues) {
            setIsSubmitting(true);
            try {
                const { error } = await supabase.rpc("admin_update_user", {
                    p_user_id: user.id,
                    p_email: formValues.email,
                    p_password: formValues.password === "" ? null : formValues.password,
                    p_name: formValues.name,
                    p_is_admin: formValues.isAdmin,
                    p_download_count: formValues.downloadCount
                });

                if (error) throw error;

                Swal.fire('Berhasil!', 'Data user telah diupdate.', 'success');
                fetchUsers();
            } catch (error: any) {
                Swal.fire('Error', error.message || 'Gagal mengubah user', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        const { isConfirmed } = await Swal.fire({
            title: "Hapus User?",
            text: `Anda yakin ingin menghapus akun ${email}? Tindakan ini tidak dapat dibatalkan!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal"
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                const { error } = await supabase.rpc("admin_delete_user", {
                    p_user_id: userId
                });

                if (error) throw error;

                Swal.fire("Terhapus!", "Akun telah dihapus.", "success");
                fetchUsers();
            } catch (error: any) {
                Swal.fire("Gagal", error.message || "Terjadi kesalahan saat menghapus", "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleResetGuest = async (ipAddress: string) => {
        const { isConfirmed } = await Swal.fire({
            title: "Reset Kuota Guest?",
            text: `Anda yakin ingin me-reset kuota download untuk IP: ${ipAddress}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Reset!",
            cancelButtonText: "Batal"
        });

        if (isConfirmed) {
            setIsSubmitting(true);
            try {
                const { error } = await supabase.rpc("admin_reset_guest_download", {
                    p_ip_address: ipAddress
                });

                if (error) throw error;

                Swal.fire("Berhasil!", "Kuota download untuk IP ini telah direset.", "success");
                fetchGuests();
            } catch (error: any) {
                Swal.fire("Gagal", error.message || "Terjadi kesalahan saat mereset kuota", "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleSaveLimits = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingLimits(true);
        try {
            const { error: error1 } = await supabase.rpc("admin_update_setting", {
                p_key: "guest_download_limit",
                p_value: limits.guest.toString()
            });
            if (error1) throw error1;

            const { error: error2 } = await supabase.rpc("admin_update_setting", {
                p_key: "user_download_limit",
                p_value: limits.user.toString()
            });
            if (error2) throw error2;

            Swal.fire("Berhasil", "Download limit berhasil diperbarui!", "success");
        } catch (error: any) {
            Swal.fire("Gagal", error.message || "Gagal memperbarui limit", "error");
        } finally {
            setSavingLimits(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShieldAlert className="w-6 h-6 text-red-600" />
                                Admin Dashboard
                            </h1>
                        </div>
                        {activeTab === "users" && (
                            <button
                                onClick={handleCreateUser}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Tambah User</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs navigation under header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6 border-b border-gray-200">
                        <button
                            onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                        >
                            <Users className="w-4 h-4" />
                            Registered Users
                        </button>
                        <button
                            onClick={() => { setActiveTab("guests"); setSearchQuery(""); }}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "guests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                        >
                            <Globe className="w-4 h-4" />
                            Guest Downloads
                        </button>
                        <button
                            onClick={() => { setActiveTab("settings"); setSearchQuery(""); }}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                        >
                            <Settings className="w-4 h-4" />
                            App Settings
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab !== "settings" && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
                            {activeTab === "users" ? <Users className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                            <div>
                                <p className="text-sm font-medium">Total {activeTab === "users" ? "Pengguna" : "IP Guest"}</p>
                                <p className="text-2xl font-bold">{activeTab === "users" ? users.length : guests.length}</p>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={activeTab === "users" ? "Cari email / nama..." : "Cari IP Address..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {activeTab === "settings" ? (
                    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 animate-fadeIn">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                                <Settings className="w-5 h-5 text-blue-600" />
                                Download Limits Configuration
                            </h2>
                            <p className="text-sm text-gray-500">
                                Atur maksimal jumlah download per IP address untuk pengguna tamu (guest) maupun akun terdaftar (user).
                            </p>
                        </div>

                        {loading ? (
                            <div className="py-12 text-center text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                Memuat konfigurasi...
                            </div>
                        ) : (
                            <form onSubmit={handleSaveLimits} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Download Limit</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={limits.guest}
                                            onChange={(e) => setLimits({ ...limits, guest: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Batas maksimal download untuk pengunjung yang belum login (diakumulasi berdasar IP).</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered User Download Limit</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={limits.user}
                                            onChange={(e) => setLimits({ ...limits, user: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Batas maksimal download untuk pengguna yang sudah login dengan akun.</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={savingLimits}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {savingLimits ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-200">
                                    {activeTab === "users" ? (
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Download Count</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Dibuat Pada</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-6 py-4">IP Address</th>
                                            <th className="px-6 py-4">Total Downloads</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Terakhir Akses</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading && (activeTab === "users" ? users.length : guests.length) === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                                                Memuat data...
                                            </td>
                                        </tr>
                                    ) : (activeTab === "users" ? filteredUsers.length : filteredGuests.length) === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                {activeTab === "users" ? (
                                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                ) : (
                                                    <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                )}
                                                {activeTab === "users" ? "Tidak ada data pengguna ditemukan." : "Tidak ada catatan download guest ditemukan."}
                                            </td>
                                        </tr>
                                    ) : activeTab === "users" ? (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{u.raw_user_meta_data?.username || u.raw_user_meta_data?.full_name || 'Tanpa Nama'}</div>
                                                    <div className="text-gray-500 text-xs mt-1">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.raw_user_meta_data?.is_admin ? (
                                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">Admin</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">User</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    {u.raw_user_meta_data?.download_count || 0}
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                                    {new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditUser(u)}
                                                            disabled={isSubmitting}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 disabled:opacity-50"
                                                            title="Edit User"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                                            disabled={isSubmitting}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                                                            title="Hapus User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        filteredGuests.map((g) => (
                                            <tr key={g.ip_address} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-gray-900 border-l-[3px] border-l-orange-400">
                                                    {g.ip_address}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${g.total_downloads >= 3 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                        {g.total_downloads} / 3
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                                    {new Date(g.last_download).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleResetGuest(g.ip_address)}
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 disabled:opacity-50"
                                                        title="Reset Kuota Guest"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Reset Kuota
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
