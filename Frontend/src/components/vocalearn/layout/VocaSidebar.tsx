import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, FolderKanban, Route, Trash2, FileSearch, GraduationCap, School, Shield, Library } from 'lucide-react';
import AuthService, { type UserProfile } from '../../../services/authService';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ElementType;
    to: string;
}

const VocaSidebar = () => {
    const location = useLocation();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        AuthService.getCurrentUser().then((u) => setUser(u));

        const handleUserUpdated = (e: any) => {
            if (e.detail) {
                setUser(e.detail);
            } else {
                AuthService.getCurrentUser().then((u) => setUser(u));
            }
        };

        window.addEventListener('user-profile-updated', handleUserUpdated);
        return () => window.removeEventListener('user-profile-updated', handleUserUpdated);
    }, []);

    const role = user?.role || 'STUDENT';
    const isTeacher = role === 'TEACHER';
    const isAdmin = role === 'ADMIN';

    // Đổi label menu linh hoạt theo Role: TEACHER -> "Lớp học", STUDENT -> "Nhóm học"
    const sidebarItems: SidebarItem[] = [
        { id: 'dashboard', label: 'Trang chủ', icon: LayoutGrid, to: '/dashboard' },
        {
            id: 'classes',
            label: isTeacher ? 'Lớp học' : isAdmin ? 'Quản lý Lớp học' : 'Nhóm học',
            icon: Users,
            to: isTeacher || isAdmin ? '/classes' : '/study-groups',
        },
        { id: 'folders', label: 'Thư viện của bạn', icon: Library, to: '/folders' },
        { id: 'paths', label: 'Lộ trình học', icon: Route, to: '/paths' },
        { id: 'scan', label: 'Quét tài liệu', icon: FileSearch, to: '/scan' },
        { id: 'trash', label: 'Đã xóa', icon: Trash2, to: '/trash' },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-[200px] bg-white border-r border-slate-200 z-40 flex flex-col select-none">
            {/* Top Brand Logo & User Role Badge */}
            <div>
                <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                            V
                        </div>
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                            VocaLearn
                        </span>
                    </div>

                    {/* Role Badge Indicator */}
                    <span
                        title={isTeacher ? 'Tài khoản Giáo viên' : isAdmin ? 'Tài khoản Quản trị viên' : 'Tài khoản Học sinh'}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
                            isTeacher
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : isAdmin
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                    >
                        {isTeacher ? <School className="w-3 h-3" /> : isAdmin ? <Shield className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        <span>{isTeacher ? 'GV' : isAdmin ? 'AD' : 'HS'}</span>
                    </span>
                </div>

                {/* Navigation Menu Items */}
                <nav className="p-3 space-y-1 mt-2">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            location.pathname === item.to ||
                            (item.id === 'classes' && (location.pathname.startsWith('/classes') || location.pathname.startsWith('/study-groups') || location.pathname.startsWith('/study_group'))) ||
                            (item.to === '/folders' && location.pathname.startsWith('/folders')) ||
                            (item.to === '/dashboard' && (location.pathname === '/' || location.pathname === '/studyset'));

                        return (
                            <Link
                                key={item.id}
                                to={item.to}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default VocaSidebar;
