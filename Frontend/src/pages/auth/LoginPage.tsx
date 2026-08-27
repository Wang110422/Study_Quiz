import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Eye,
    EyeOff,
    Flame,
    Sparkles,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import AuthService from '../../services/authService';
import { useAuthStore } from '../../store';

const LoginPage = () => {
    const navigate = useNavigate();
    const { fetchUser } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Form fields
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
            } else {
                await AuthService.register({ email, password, firstName, lastName, role });
            }
            await fetchUser();
            navigate('/dashboard');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 font-sans select-none">
            {/* 🌟 CỘT TRÁI: BANNER THƯƠNG HIỆU & HỌC LIỆU NỀN XANH ĐẬM (LINGOMASTER STYLE) */}
            <div className="hidden lg:flex lg:w-[48%] xl:w-[46%] bg-[#0B1536] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden shrink-0">
                {/* Background Ambient Glow */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* 1. Header Logo */}
                <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-display font-extrabold text-xl tracking-tight text-white block leading-tight">
                            LingoMaster
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                            Học từ vựng
                        </span>
                    </div>
                </div>

                {/* 2. Hero Image Box */}
                <div className="my-auto py-6 relative z-10">
                    {/* Card Hình Ảnh Minh Họa Thật */}
                    <div className="relative mx-auto w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20 group">
                        <img
                            src="/assets/login-hero.png"
                            alt="Học từ vựng cùng LingoMaster"
                            className="w-full h-auto object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    {/* Heading & Subtitle */}
                    <div className="mt-8">
                        <h2 className="text-2xl xl:text-3xl font-extrabold text-white font-display leading-tight">
                            Mỗi ngày một chút, vốn từ lớn dần lên.
                        </h2>
                        <p className="mt-3 text-xs xl:text-sm text-slate-300 leading-relaxed font-normal">
                            Ôn bộ thẻ theo lịch lặp lại ngắt quãng, theo dõi lộ trình và nhận nhận xét từ trợ lý AI sau mỗi bài làm.
                        </p>
                    </div>
                </div>

                {/* 3. Bottom Two Stats Boxes */}
                <div className="grid grid-cols-2 gap-4 relative z-10 pt-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <Flame className="w-4 h-4 fill-amber-400" />
                        </div>
                        <p className="text-xl xl:text-2xl font-extrabold text-white font-display">15</p>
                        <p className="text-[11px] text-slate-400 font-medium">ngày học liên tiếp</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-xl xl:text-2xl font-extrabold text-white font-display">1.240</p>
                        <p className="text-[11px] text-slate-400 font-medium">từ đã thuộc</p>
                    </div>
                </div>
            </div>

            {/* 🌟 CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ NỀN TRẮNG */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 xl:p-24 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-7">
                    {/* Form Header Title */}
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                            {isLogin ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản học tập'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                            {isLogin
                                ? 'Đăng nhập để tiếp tục lộ trình học từ vựng của bạn.'
                                : 'Bắt đầu hành trình chinh phục từ vựng thông minh cùng LingoMaster.'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nếu đang ở chế độ Đăng Ký -> Thêm các trường Họ tên & Vai trò */}
                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ & Tên đệm</label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Nguyễn Văn"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên</label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="An"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vai trò học tập</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole('STUDENT')}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${role === 'STUDENT'
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>🎓 Học sinh / Sinh viên</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('TEACHER')}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${role === 'TEACHER'
                                                ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>🏫 Giáo viên</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ban@email.com"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={() => alert('Vui lòng liên hệ quản trị viên hoặc sử dụng đăng nhập Google để khôi phục.')}
                                        className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                                    >
                                        Quên mật khẩu?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Checkbox Ghi nhớ đăng nhập */}
                        {isLogin && (
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 accent-blue-600 cursor-pointer"
                                />
                                <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 cursor-pointer">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                <span>{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</span>
                            )}
                        </button>
                    </form>

                    {/* Divider HOẶC */}
                    <div className="relative my-6 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <span className="relative bg-white px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            HOẶC
                        </span>
                    </div>

                    {/* Social Login Button (Chỉ giữ Google, bỏ Facebook) */}
                    <div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span>Tiếp tục với Google</span>
                        </button>
                    </div>

                    {/* Switch Login / Register Toggle */}
                    <div className="text-center text-xs text-slate-500 pt-2">
                        {isLogin ? (
                            <span>
                                Chưa có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(false);
                                        setErrorMsg('');
                                    }}
                                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                    Đăng ký miễn phí
                                </button>
                            </span>
                        ) : (
                            <span>
                                Đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(true);
                                        setErrorMsg('');
                                    }}
                                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                                >
                                    Đăng nhập ngay
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
