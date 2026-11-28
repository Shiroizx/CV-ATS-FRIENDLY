import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";

export interface AdminQRDomainItem {
  id: string;
  user_id: string;
  owner_email: string;
  owner_name: string;
  owner_is_partner: boolean;
  title: string;
  qr_type: "vcard" | "business" | "url" | string;
  short_code: string;
  public_domain: string;
  live_url: string;
  org_slug: string | null;
  external_owner_ref: string | null;
  destination_url: string | null;
  content_summary: Record<string, string | boolean | undefined>;
  is_active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminQRDomainsTab() {
  const [items, setItems] = useState<AdminQRDomainItem[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([
    "freebuildcv.tech",
    "narainstitute.net",
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<AdminQRDomainItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states for edit modal
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDomain, setEditDomain] = useState("freebuildcv.tech");
  const [editActive, setEditActive] = useState(true);
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  const getBearerToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getBearerToken();
      if (!token) throw new Error("Sesi admin tidak ditemukan.");

      const res = await fetch("/api/admin-qr-domains", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        items?: AdminQRDomainItem[];
        availableDomains?: string[];
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Gagal memuat data domain (HTTP ${res.status}).`);
      }

      setItems(data.items || []);
      if (Array.isArray(data.availableDomains) && data.availableDomains.length > 0) {
        setAvailableDomains(data.availableDomains);
      }
    } catch (err) {
      Swal.fire(
        "Gagal Memuat Domain",
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat daftar domain QR.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDomains();
  }, [fetchDomains]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (domainFilter !== "all" && item.public_domain !== domainFilter) return false;
      if (typeFilter !== "all" && item.qr_type !== typeFilter) return false;
      if (!q) return true;

      const summaryValues = Object.values(item.content_summary || {})
        .filter((v): v is string => typeof v === "string")
        .join(" ")
        .toLowerCase();

      return (
        item.short_code.toLowerCase().includes(q) ||
        item.public_domain.toLowerCase().includes(q) ||
        item.live_url.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.owner_email.toLowerCase().includes(q) ||
        item.owner_name.toLowerCase().includes(q) ||
        summaryValues.includes(q)
      );
    });
  }, [items, searchQuery, domainFilter, typeFilter]);

  const stats = useMemo(() => {
    const activeCount = items.filter((i) => i.is_active).length;
    const partnerCount = items.filter((i) => i.public_domain === "narainstitute.net").length;
    const totalScans = items.reduce((acc, i) => acc + (i.scan_count || 0), 0);
    return { total: items.length, activeCount, partnerCount, totalScans };
  }, [items]);

  const openEditModal = (item: AdminQRDomainItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditSlug(item.short_code || "");
    setEditDomain(item.public_domain || "freebuildcv.tech");
    setEditActive(item.is_active);

    const summary = item.content_summary || {};
    if (item.qr_type === "vcard") {
      setEditFields({
        fullName: String(summary.fullName || ""),
        title: String(summary.title || ""),
        company: String(summary.company || ""),
        email: String(summary.email || ""),
        phone: String(summary.phone || ""),
        whatsapp: String(summary.whatsapp || ""),
        website: String(summary.website || ""),
        address: String(summary.address || ""),
        bio: String(summary.bio || ""),
      });
    } else if (item.qr_type === "business") {
      setEditFields({
        companyName: String(summary.companyName || ""),
        tagline: String(summary.tagline || ""),
        phone: String(summary.phone || ""),
        email: String(summary.email || ""),
        website: String(summary.website || ""),
        address: String(summary.address || ""),
      });
    } else {
      setEditFields({
        url: String(summary.url || item.destination_url || ""),
      });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const token = await getBearerToken();
      if (!token) throw new Error("Sesi admin tidak valid.");

      const res = await fetch("/api/admin-qr-domains", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle,
          short_code: editSlug,
          public_domain: editDomain,
          is_active: editActive,
          content_patch: editFields,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        live_url?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Gagal menyimpan perubahan.");
      }

      setEditingItem(null);
      await Swal.fire(
        "Berhasil Diperbarui",
        `Domain & data utama berhasil disimpan (${data.live_url || ""}).`,
        "success"
      );
      void fetchDomains();
    } catch (err) {
      Swal.fire(
        "Gagal Menyimpan",
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan perubahan.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: AdminQRDomainItem) => {
    const isPartner = item.public_domain === "narainstitute.net";
    const { isConfirmed } = await Swal.fire({
      title: "Hapus Domain & Data QR?",
      html: `<div style="text-align:left;font-size:13px;line-height:1.6">
        <p>Anda akan menghapus permanen:</p>
        <p style="margin-top:6px"><strong>${item.live_url}</strong><br/>Pemilik: ${item.owner_name} (${item.owner_email})</p>
        <p style="margin-top:8px;color:#b91c1c">Alamat domain akan langsung nonaktif, gambar terkait ikut terhapus, dan nama subdomain kembali bisa dipakai.${
          isPartner ? " Data di Dashboard Nara Institute juga akan ikut dibersihkan otomatis." : ""
        }</p>
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus Permanen",
      cancelButtonText: "Batal",
    });

    if (!isConfirmed) return;

    try {
      const token = await getBearerToken();
      if (!token) throw new Error("Sesi admin tidak valid.");

      const res = await fetch("/api/admin-qr-domains", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: item.id }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Gagal menghapus domain QR.");
      }

      Swal.fire("Terhapus!", `Domain ${item.live_url} berhasil dihapus permanen.`, "success");
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      Swal.fire(
        "Gagal Menghapus",
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus.",
        "error"
      );
    }
  };

  const handleCopy = (url: string) => {
    void navigator.clipboard.writeText(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "URL disalin!",
      showConfirmButton: false,
      timer: 1400,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Domain / QR</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Status Aktif</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Domain Partner (Nara)</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.partnerCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Total Scan</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalScans}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari subdomain, nama, email, perusahaan, judul..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Semua Domain</option>
            {availableDomains.map((d) => (
              <option key={d} value={d}>
                *.{d}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="vcard">vCard</option>
            <option value="business">Business</option>
            <option value="url">URL</option>
          </select>

          <button
            type="button"
            onClick={() => void fetchDomains()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <p className="text-sm">Memuat daftar domain &amp; data QR...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <QrCode className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-medium">Tidak ada domain QR yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Domain / Subdomain
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Data Utama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pemilik Akun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status &amp; Scan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredItems.map((item) => {
                  const s = item.content_summary || {};
                  const primaryLine =
                    item.qr_type === "vcard"
                      ? String(s.fullName || item.title)
                      : item.qr_type === "business"
                        ? String(s.companyName || item.title)
                        : item.title;
                  const secondaryLine =
                    item.qr_type === "vcard"
                      ? [s.title, s.company, s.phone || s.email].filter(Boolean).join(" • ")
                      : item.qr_type === "business"
                        ? [s.tagline, s.phone || s.email].filter(Boolean).join(" • ")
                        : String(s.url || item.destination_url || "-");

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <a
                            href={item.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono font-bold text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {item.short_code}.{item.public_domain}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.live_url)}
                            title="Salin URL"
                            className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                            {item.qr_type}
                          </span>
                          {item.public_domain === "narainstitute.net" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Partner Nara
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-top max-w-xs">
                        <p className="font-semibold text-gray-900 truncate">{primaryLine}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{secondaryLine || "-"}</p>
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">
                          {item.owner_name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{item.owner_email}</p>
                      </td>

                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{item.scan_count} scan</p>
                      </td>

                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Domain & Data Utama"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Domain &amp; Data Utama ({editingItem.qr_type.toUpperCase()})
                </h3>
                <p className="text-xs text-gray-500">
                  Pemilik: {editingItem.owner_name} ({editingItem.owner_email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subdomain
                  </label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Domain Induk
                  </label>
                  <select
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {availableDomains.map((d) => (
                      <option key={d} value={d}>
                        .{d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Judul QR
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-xs font-semibold text-gray-700">Domain Aktif</span>
                </label>
              </div>

              <hr className="border-gray-200" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Data Utama Konten
              </p>

              {editingItem.qr_type === "vcard" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ["fullName", "Nama Lengkap"],
                    ["title", "Jabatan / Posisi"],
                    ["company", "Perusahaan"],
                    ["email", "Email"],
                    ["phone", "Telepon"],
                    ["whatsapp", "WhatsApp"],
                    ["website", "Website"],
                    ["address", "Alamat"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={editFields[key] || ""}
                        onChange={(e) =>
                          setEditFields((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bio / Ringkasan
                    </label>
                    <textarea
                      rows={2}
                      value={editFields.bio || ""}
                      onChange={(e) =>
                        setEditFields((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {editingItem.qr_type === "business" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ["companyName", "Nama Bisnis"],
                    ["tagline", "Tagline"],
                    ["phone", "Telepon"],
                    ["email", "Email"],
                    ["website", "Website"],
                    ["address", "Alamat"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={editFields[key] || ""}
                        onChange={(e) =>
                          setEditFields((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {editingItem.qr_type === "url" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    URL Tujuan
                  </label>
                  <input
                    type="url"
                    required
                    value={editFields.url || ""}
                    onChange={(e) =>
                      setEditFields((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
