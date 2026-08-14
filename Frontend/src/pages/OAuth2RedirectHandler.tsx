import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            localStorage.setItem('token', token);
            document.cookie = `auth_token=${token}; path=/; max-age=864000; SameSite=Lax`;
            navigate('/studyset', { replace: true });
        } else if (error) {
            console.error("OAuth2 Error:", error);
            navigate('/login?error=' + encodeURIComponent(error), { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

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
