import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getPartnerAccountMeta } from "../lib/qrHelpers";
import type { PartnerAccountMeta } from "../lib/qrHelpers";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isPartnerAccount: boolean;
    partnerMeta: PartnerAccountMeta | null;
    signOut: () => Promise<{ blocked?: boolean }>;
    forceSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isPartnerAccount: false,
    partnerMeta: null,
    signOut: async () => ({}),
    forceSignOut: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current session
        const getSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
            }
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
        };

        getSession();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                if (event === "SIGNED_OUT") {
                    setSession(null);
                    setUser(null);
                } else {
                    setSession((prevSession) => {
                        if (
                            prevSession?.access_token === newSession?.access_token &&
                            prevSession?.user?.id === newSession?.user?.id
                        ) {
                            return prevSession;
                        }
                        return newSession;
                    });
                    setUser((prevUser) => {
                        if (
                            prevUser?.id === newSession?.user?.id &&
                            prevUser?.email === newSession?.user?.email &&
                            prevUser?.updated_at === newSession?.user?.updated_at
                        ) {
                            return prevUser;
                        }
                        return newSession?.user || null;
                    });
                }
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const partnerMeta = useMemo(
        () => getPartnerAccountMeta(user?.user_metadata as Record<string, unknown> | undefined),
        [user]
    );
    const isPartnerAccount = Boolean(partnerMeta?.isPartner);

    // Blokir logout manual jika user sedang memakai akun terkelola Partner (mis. Nara Institute)
    const signOut = async (): Promise<{ blocked?: boolean }> => {
        if (isPartnerAccount) {
            return { blocked: true };
        }
        await supabase.auth.signOut();
        return { blocked: false };
    };

    // Logout paksa yang hanya boleh dipanggil setelah verifikasi konfirmasi ganti akun dari Dashboard Nara
    const forceSignOut = async (): Promise<void> => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                isPartnerAccount,
                partnerMeta,
                signOut,
                forceSignOut,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
