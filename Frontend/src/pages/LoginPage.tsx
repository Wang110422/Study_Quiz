import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import AuthService from '../services/authService';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                await AuthService.login({ email, password });
                navigate('/dashboard');
            } else {
                await AuthService.register({ email, password, firstName, lastName, role });
                navigate('/dashboard');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {isLogin
                            ? 'Đăng nhập để truy cập học liệu và bộ thẻ Quizlet'
                            : 'Bắt đầu hành trình học tập thông minh cùng Study Quiz'}
                    </p>
                </div>

                <div className="flex bg-slate-800/60 p-1.5 rounded-xl mb-6 border border-slate-700/50">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isLogin
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${!isLogin
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        Đăng ký
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md mb-6 cursor-pointer"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    <span>Tiếp tục với Google</span>
                </button>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-slate-800" />
                    <span className="px-4 text-xs text-slate-500 uppercase font-medium">Hoặc tài khoản</span>
                    <div className="flex-1 border-t border-slate-800" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tên</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Văn A"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Nguyễn"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tùy chọn Vai trò khi Đăng ký mới */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bạn đăng ký với vai trò:</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setRole('STUDENT')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                            role === 'STUDENT'
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        👨‍🎓 Học sinh (Student)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('TEACHER')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                            role === 'TEACHER'
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        👨‍🏫 Giáo viên (Teacher)
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
