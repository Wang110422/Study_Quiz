import { useState, useEffect } from 'react';
import { User, Settings, Shield, GraduationCap, School, Moon, Sun, Monitor, Globe, Bell, Clock, Check, Loader2, Save, Lock } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import AuthService from '../../services/authService';
import { useAuthStore } from '../../store';

const VocaProfilePage = () => {
    const { user, updateUserStore } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [loading, setLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Form fields
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | string>(user?.role || 'STUDENT');
    const [bio, setBio] = useState(user?.bio || '');

    // Settings fields
    const [themePreference, setThemePreference] = useState<string>(user?.themePreference || 'light');
    const [languagePreference, setLanguagePreference] = useState<string>(user?.languagePreference || 'vi');
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(user?.reminderEnabled !== undefined ? user.reminderEnabled : true);
    const [reminderTime, setReminderTime] = useState<string>(user?.reminderTime || '20:00');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setRole(user.role || 'STUDENT');
            setBio(user.bio || '');
            setThemePreference(user.themePreference || 'light');
            setLanguagePreference(user.languagePreference || 'vi');
            setReminderEnabled(user.reminderEnabled !== undefined ? user.reminderEnabled : true);
            setReminderTime(user.reminderTime || '20:00');
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        setIsSaving(true);
        setSaveMessage(null);
        try {
            const updated = await AuthService.updateUserProfile({
                firstName,
                lastName,
                email,
                role,
                bio,
                themePreference,
                languagePreference,
                reminderEnabled,
                reminderTime,
            });

            if (updated) {
                updateUserStore(updated);
                setSaveMessage('Đã lưu thông tin hồ sơ và cài đặt thành công!');
                setTimeout(() => setSaveMessage(null), 3500);
            }
        } catch (err) {
            console.error('Lỗi khi lưu cài đặt:', err);
            setSaveMessage('Không thể lưu thông tin. Vui lòng thử lại!');
        } finally {
            setIsSaving(false);
        }
    };

    const fullName = `${firstName} ${lastName}`.trim() || 'Người dùng VocaLearn';
    const avatarInitial = fullName.charAt(0).toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <VocaSidebar />

            <div className="pl-[260px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
                    {/* Header Banner */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                                {avatarInitial}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
                                <p className="text-xs text-slate-400 font-medium">{email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${
                                        role === 'TEACHER'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : role === 'ADMIN'
                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {role === 'TEACHER' ? <School className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                                        <span>{role === 'TEACHER' ? 'Giáo viên (Teacher)' : role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Học sinh (Student)'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === 'profile'
                                        ? 'bg-white text-blue-600 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>Hồ sơ cá nhân</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === 'settings'
                                        ? 'bg-white text-blue-600 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Settings className="w-4 h-4" />
                                <span>Cài đặt & Lời nhắc</span>
                            </button>
                        </div>
                    </div>

                    {/* Alert Message Banner */}
                    {saveMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl p-4 mb-6 flex items-center gap-2.5 shadow-xs animate-in fade-in">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{saveMessage}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                            <span className="text-xs font-semibold">Đang tải thông tin hồ sơ...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* TAB 1: THÔNG TIN CÁ NHÂN & VAI TRÒ */}
                            {activeTab === 'profile' && (
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 mb-1">
                                            Thông tin cá nhân & Vai trò người dùng
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Quản lý thông tin định danh và vai trò của bạn trên nền tảng VocaLearn.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Họ (First Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Nhập họ..."
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Tên (Last Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Nhập tên..."
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700">
                                                Địa chỉ Email đăng nhập
                                            </label>
                                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                                <Lock className="w-3 h-3 text-slate-400" />
                                                <span>Định danh tài khoản cố định</span>
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            readOnly
                                            className="w-full bg-slate-100/80 border border-slate-200 text-slate-500 font-semibold rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed select-all"
                                        />
                                    </div>

                                    {/* LỰA CHỌN VAI TRÒ (ROLE) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">
                                            Vai trò cá nhân (Role) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setRole('STUDENT')}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                                                    role === 'STUDENT'
                                                        ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                                    role === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">👨‍🎓 Học sinh / Người học (Student)</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5 font-normal">
                                                        Học từ vựng, tạo các bộ thẻ cá nhân và ôn luyện các lộ trình học.
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                onClick={() => setRole('TEACHER')}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                                                    role === 'TEACHER'
                                                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                                    role === 'TEACHER' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    <School className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">👨‍🏫 Giáo viên / Giảng viên (Teacher)</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5 font-normal">
                                                        Tạo các lớp học, giao bài tập bộ thẻ và quản lý học sinh.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CÀI ĐẶT GIAO DIỆN, NGÔN NGỮ & LỜI NHẮC */}
                            {activeTab === 'settings' && (
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-8">
                                    {/* 🎨 1. CÀI ĐẶT GIAO DIỆN */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-amber-500" />
                                            <span>Giao diện màn hình (Theme)</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-3">Tùy chỉnh màu nền giao diện phù hợp với tầm mắt của bạn.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'light', label: 'Chế độ Sáng (Light)', icon: Sun, desc: 'Màu nền trắng sáng dễ nhìn' },
                                                { id: 'dark', label: 'Chế độ Tối (Dark)', icon: Moon, desc: 'Màu nền tối bảo vệ mắt ban đêm' },
                                                { id: 'system', label: 'Tự động (System)', icon: Monitor, desc: 'Theo chế độ của thiết bị' },
                                            ].map((item) => {
                                                const Icon = item.icon;
                                                const isActive = themePreference === item.id;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => setThemePreference(item.id)}
                                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                                            isActive
                                                                ? 'border-blue-600 bg-blue-50/40 shadow-2xs'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-xs">{item.label}</h4>
                                                            <p className="text-[11px] text-slate-400">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 🌐 2. CÀI ĐẶT NGÔN NGỮ */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-600" />
                                            <span>Ngôn ngữ hiển thị (Language)</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-3">Chọn ngôn ngữ bạn muốn sử dụng trên ứng dụng VocaLearn.</p>

                                        <select
                                            value={languagePreference}
                                            onChange={(e) => setLanguagePreference(e.target.value)}
                                            className="w-full max-w-xs bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="vi">🇻🇳 Tiếng Việt (Vietnamese)</option>
                                            <option value="en">🇺🇸 English (Tiếng Anh)</option>
                                            <option value="ja">🇯🇵 日本語 (Tiếng Nhật)</option>
                                            <option value="ko">🇰🇷 한국어 (Tiếng Hàn)</option>
                                        </select>
                                    </div>

                                    {/* 🔔 3. THÔNG BÁO & LỜI NHẮC HỌC TẬP TỰ ĐỘNG */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-rose-500" />
                                            <span>Thông báo & Lời nhắc ôn từ vựng hàng ngày</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-4">
                                            Hệ thống sẽ gửi thông báo hẹn giờ nhắc nhở bạn vào thời điểm cố định để giữ thói quen học tập.
                                        </p>

                                        <div className="space-y-4 max-w-lg">
                                            {/* Công tắc Bật/Tắt Lời nhắc */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">Bật lời nhắc học từ vựng</h4>
                                                    <p className="text-[11px] text-slate-400">Nhận chuông nhắc nhở ôn lại các bộ thẻ học phần</p>
                                                </div>

                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={reminderEnabled}
                                                        onChange={(e) => setReminderEnabled(e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {/* CÀI ĐẶT THỜI ĐIỂM NHẮC NHỞ */}
                                            {reminderEnabled && (
                                                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-blue-900">
                                                        <Clock className="w-4 h-4 text-blue-600" />
                                                        <span>Cài đặt thời điểm nhắc nhở trong ngày:</span>
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="time"
                                                            value={reminderTime}
                                                            onChange={(e) => setReminderTime(e.target.value)}
                                                            className="bg-white border border-blue-300 focus:border-blue-600 rounded-xl px-4 py-2 text-sm font-bold text-blue-900 outline-none shadow-2xs cursor-pointer"
                                                        />
                                                        <span className="text-xs font-medium text-blue-700">
                                                            (Hệ thống sẽ nhắc vào lúc {reminderTime} mỗi ngày)
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Floating Save Button */}
                            <div className="flex items-center justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Lưu thay đổi hồ sơ & cài đặt</span>
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VocaProfilePage;
