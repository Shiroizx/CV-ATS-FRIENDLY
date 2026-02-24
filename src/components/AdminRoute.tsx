import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    // Require user to be logged in and have is_admin = true
    if (!user || user.user_metadata?.is_admin !== true) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
