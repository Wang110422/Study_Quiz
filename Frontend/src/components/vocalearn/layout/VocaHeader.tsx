import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Bell, User, Settings, Star, LogOut } from 'lucide-react';
import CreateNewModal from '../modals/CreateNewModal';
import AuthService, { type UserProfile } from '../../../services/authService';

interface VocaHeaderProps {
    onSearch?: (query: string) => void;
}

const VocaHeader = ({ onSearch }: VocaHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

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

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setAvatarDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('user-profile-updated', handleUserUpdated);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    const fullName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Nguyễn Lan Anh'
        : 'Nguyễn Lan Anh';

    const userEmail = user?.email || 'lan.anh@email.com';
    const avatarInitial = fullName.charAt(0).toUpperCase() || 'N';

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Tìm bộ thẻ, ghi chú, lớp học..."
                    className="w-full bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
                {/* Create New Button */}
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tạo mới</span>
                </button>

                {/* Notification Bell */}
                <button
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all relative cursor-pointer"
                    title="Thông báo"
                >
                    <Bell className="w-4.5 h-4.5 text-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-1 ring-white" />
                </button>

                {/* User Avatar with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setAvatarDropdownOpen((prev) => !prev)}
                        className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-500/25 cursor-pointer hover:opacity-90 transition-all active:scale-95 outline-none"
                    >
                        {avatarInitial}
                    </button>

                    {/* Avatar Dropdown Popup */}
                    {avatarDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-900">
                            {/* User Header Info */}
                            <div className="pb-3 px-1 border-b border-slate-100">
                                <h4 className="text-sm font-bold text-slate-900">
                                    {fullName}
                                </h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {userEmail}
                                </p>
                            </div>

                            {/* Navigation List */}
                            <div className="pt-2 space-y-0.5">
                                <Link
                                    to="/profile"
                                    onClick={() => setAvatarDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all text-left cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span>Hồ sơ cá nhân</span>
                                </Link>

                                <Link
                                    to="/profile"
                                    onClick={() => setAvatarDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all text-left cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <span>Cài đặt</span>
                                </Link>

                                <button
                                    onClick={() => setAvatarDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all text-left cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    </div>
                                    <span>Nâng cấp Premium</span>
                                </button>

                                <div className="border-t border-slate-100 my-1.5" />

                                <button
                                    onClick={() => {
                                        setAvatarDropdownOpen(false);
                                        AuthService.logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create New Options Modal */}
            <CreateNewModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </header>
    );
};

export default VocaHeader;
