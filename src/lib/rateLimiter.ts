/**
 * Client-side rate limiter utility for auth pages.
 * Uses localStorage to persist attempt counts across page reloads.
 * This is a DEFENSE-IN-DEPTH layer; Supabase also has server-side rate limiting.
 */

interface RateLimitEntry {
    attempts: number;
    firstAttemptAt: number;
    lockedUntil: number | null;
}

const STORAGE_PREFIX = 'rl_';

function getEntry(key: string): RateLimitEntry {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore parse errors */ }
    return { attempts: 0, firstAttemptAt: Date.now(), lockedUntil: null };
}

function setEntry(key: string, entry: RateLimitEntry) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
}

/**
 * Check if actions are currently rate-limited.
 * @param key - Unique identifier (e.g., 'login' or 'register')
 * @param maxAttempts - Max attempts allowed within the time window
 * @param windowMs - Time window in milliseconds
 * @param lockoutMs - Lockout duration in ms after exceeding max attempts
 * @returns Object with `isLimited`, `remainingMs`, and `record` function
 */
export function checkRateLimit(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 5 * 60 * 1000,   // 5 minutes
    lockoutMs: number = 2 * 60 * 1000   // 2 minutes lockout
) {
    const entry = getEntry(key);
    const now = Date.now();

    // Check if currently locked out
    if (entry.lockedUntil && now < entry.lockedUntil) {
        const remainingMs = entry.lockedUntil - now;
        return {
            isLimited: true,
            remainingMs,
            remainingSeconds: Math.ceil(remainingMs / 1000),
            record: () => { /* no-op while locked */ }
        };
    }

    // Reset window if expired
    if (now - entry.firstAttemptAt > windowMs) {
        const freshEntry: RateLimitEntry = { attempts: 0, firstAttemptAt: now, lockedUntil: null };
        setEntry(key, freshEntry);
        return {
            isLimited: false,
            remainingMs: 0,
            remainingSeconds: 0,
            record: () => {
                freshEntry.attempts++;
                setEntry(key, freshEntry);
            }
        };
    }

    // Check if max attempts reached → trigger lockout
    if (entry.attempts >= maxAttempts) {
        entry.lockedUntil = now + lockoutMs;
        setEntry(key, entry);
        return {
            isLimited: true,
            remainingMs: lockoutMs,
            remainingSeconds: Math.ceil(lockoutMs / 1000),
            record: () => { /* no-op while locked */ }
        };
    }

    return {
        isLimited: false,
        remainingMs: 0,
        remainingSeconds: 0,
        record: () => {
            entry.attempts++;
            setEntry(key, entry);
        }
    };
}

/**
 * Reset the rate limit counter for a key (e.g., after successful login).
 */
export function resetRateLimit(key: string) {
    localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Sanitize user input to prevent XSS.
 * Strips HTML tags and trims whitespace.
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')       // strip HTML tags
        .replace(/[<>"'`]/g, '')       // strip dangerous characters
        .trim();
}
