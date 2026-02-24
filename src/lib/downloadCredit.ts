import { supabase } from "./supabase";

/**
 * Fetch dynamic download limits from app_settings
 */
export async function getDownloadLimits(): Promise<{ guest: number; user: number }> {
    try {
        const { data, error } = await supabase
            .from("app_settings")
            .select("setting_key, setting_value")
            .in("setting_key", ["guest_download_limit", "user_download_limit"]);

        if (error || !data) return { guest: 3, user: 6 };

        let guest = 3;
        let user = 6;

        data.forEach(setting => {
            if (setting.setting_key === "guest_download_limit") guest = parseInt(setting.setting_value) || 3;
            if (setting.setting_key === "user_download_limit") user = parseInt(setting.setting_value) || 6;
        });

        return { guest, user };
    } catch {
        return { guest: 3, user: 6 };
    }
}

/**
 * Generate a device fingerprint from browser properties.
 * Uses multiple signals for reasonable uniqueness without external libraries.
 */
export function getDeviceFingerprint(): string {
    const components = [
        navigator.userAgent,
        screen.width,
        screen.height,
        screen.colorDepth,
        navigator.language,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.hardwareConcurrency || 0,
        navigator.maxTouchPoints || 0,
        // Canvas fingerprint — renders text and hashes the result
        (() => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return "no-canvas";
                ctx.textBaseline = "top";
                ctx.font = "14px Arial";
                ctx.fillText("fingerprint", 2, 2);
                return canvas.toDataURL().slice(-50);
            } catch {
                return "no-canvas";
            }
        })(),
    ].join("|");

    // djb2 hash
    let hash = 5381;
    for (let i = 0; i < components.length; i++) {
        hash = ((hash << 5) + hash + components.charCodeAt(i)) & 0xffffffff;
    }
    return `fp_${(hash >>> 0).toString(36)}`;
}

/**
 * Get the client's public IP address using multiple fallback APIs.
 * Caches the result in sessionStorage so it persists across page reloads
 * within the same browser session.
 */
const IP_CACHE_KEY = "dl_client_ip";

async function fetchIPFromAPI(url: string, extractor: (data: any) => string): Promise<string | null> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return null;
        const data = await res.json();
        const ip = extractor(data);
        return ip && ip !== "" ? ip : null;
    } catch {
        return null;
    }
}

export async function getClientIP(): Promise<string> {
    // 1. Check sessionStorage cache first
    try {
        const cached = sessionStorage.getItem(IP_CACHE_KEY);
        if (cached && cached !== "unknown") return cached;
    } catch { /* sessionStorage may not be available */ }

    // 2. Try multiple APIs in sequence
    const apis: Array<{ url: string; extractor: (d: any) => string }> = [
        { url: "https://api.ipify.org?format=json", extractor: (d) => d.ip },
        { url: "https://ipapi.co/json/", extractor: (d) => d.ip },
        { url: "https://api.db-ip.com/v2/free/self", extractor: (d) => d.ipAddress },
    ];

    for (const api of apis) {
        const ip = await fetchIPFromAPI(api.url, api.extractor);
        if (ip) {
            // Cache in sessionStorage
            try { sessionStorage.setItem(IP_CACHE_KEY, ip); } catch { /* ignore */ }
            return ip;
        }
    }

    // 3. All APIs failed — use fingerprint-only mode by returning a stable fallback
    // Instead of "unknown", use a hash so we don't create duplicate rows
    const fallback = `no-ip_${getDeviceFingerprint()}`;
    try { sessionStorage.setItem(IP_CACHE_KEY, fallback); } catch { /* ignore */ }
    return fallback;
}

/**
 * Check if a guest can download, and record the download if allowed.
 * Uses Supabase RPC `check_guest_download`.
 */
export async function checkAndRecordGuestDownload(): Promise<{
    allowed: boolean;
    count: number;
    max: number;
}> {
    const ip = await getClientIP();
    const fingerprint = getDeviceFingerprint();

    const limits = await getDownloadLimits();

    const { data, error } = await supabase.rpc("check_guest_download", {
        p_ip: ip,
        p_fingerprint: fingerprint,
        p_max: limits.guest,
    });

    if (error) {
        console.error("Guest download check failed:", error);
        // On error, allow download (fail-open) to avoid blocking legitimate users
        return { allowed: true, count: 0, max: limits.guest };
    }

    return data as { allowed: boolean; count: number; max: number };
}

/**
 * Check if a logged-in user can download, and record it.
 * Uses Supabase user_metadata.download_count.
 * Optionally logs download history with template and resume details.
 */
export async function checkAndRecordUserDownload(
    templateType?: string,
    resumeName?: string
): Promise<{
    allowed: boolean;
    count: number;
    max: number;
}> {
    const limits = await getDownloadLimits();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: false, count: 0, max: limits.user };

    const currentCount = user.user_metadata?.download_count || 0;

    if (currentCount >= limits.user) {
        return { allowed: false, count: currentCount, max: limits.user };
    }

    const { error } = await supabase.auth.updateUser({
        data: { download_count: currentCount + 1 },
    });

    if (error) {
        console.error("User download count update failed:", error);
        return { allowed: true, count: currentCount, max: limits.user };
    }

    // Log download history
    if (templateType) {
        await supabase.rpc("log_download", {
            p_template_type: templateType,
            p_resume_name: resumeName || "",
        });
    }

    return { allowed: true, count: currentCount + 1, max: limits.user };
}

/**
 * Get remaining downloads for display purposes.
 */
export async function getRemainingDownloads(isLoggedIn: boolean): Promise<{
    remaining: number;
    max: number;
    count: number;
}> {
    const limits = await getDownloadLimits();

    if (isLoggedIn) {
        const { data: { user } } = await supabase.auth.getUser();
        const count = user?.user_metadata?.download_count || 0;
        return { remaining: Math.max(0, limits.user - count), max: limits.user, count };
    }

    // Guest: query by IP address — aggregate ALL downloads from this IP
    const ip = await getClientIP();

    const { data, error } = await supabase
        .from("download_logs")
        .select("download_count")
        .eq("ip_address", ip);

    if (error || !data || data.length === 0) {
        return { remaining: limits.guest, max: limits.guest, count: 0 };
    }

    // Sum all download counts from all devices sharing this IP
    const totalCount = data.reduce((sum: number, row: { download_count: number }) => sum + (row.download_count || 0), 0);

    return {
        remaining: Math.max(0, limits.guest - totalCount),
        max: limits.guest,
        count: totalCount,
    };
}

/**
 * Get download history for the current user.
 */
export interface DownloadHistoryItem {
    id: string;
    template_type: string;
    resume_name: string;
    downloaded_at: string;
}

export async function getDownloadHistory(): Promise<DownloadHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("download_history")
        .select("*")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch download history:", error);
        return [];
    }

    if (!data) return [];

    return data;
}
