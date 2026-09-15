import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = () => {
    const { user, loading, isAuthenticated } = useAuthStore();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Nếu không có user đăng nhập (cookie hết hạn hoặc chưa đăng nhập)
    if (!isAuthenticated && !user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
