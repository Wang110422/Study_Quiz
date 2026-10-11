import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUser } = useAuthStore();

    useEffect(() => {
        const error = searchParams.get('error');

        if (error) {
            console.error("OAuth2 Error:", error);
            navigate('/login?error=' + encodeURIComponent(error), { replace: true });
            return;
        }

        // Cookie auth_token đã được Backend tự động set qua response header Set-Cookie
        // Frontend chỉ cần fetchUser để lấy thông tin tài khoản và điều hướng
        fetchUser().then((user) => {
            if (user) {
                navigate('/lessons', { replace: true });
            } else {
                navigate('/login?error=auth_failed', { replace: true });
            }
        });
    }, [searchParams, navigate, fetchUser]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            <div className="text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold mb-2">Đang xác thực Google OAuth2...</h2>
                <p className="text-slate-400 text-sm">Vui lòng chờ trong giây lát.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
