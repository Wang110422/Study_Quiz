import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Bell, User, Settings, Star, LogOut } from 'lucide-react';
import CreateNewModal from '../modals/CreateNewModal';
import { useAuthStore } from '../../../store';

interface VocaHeaderProps {
    onSearch?: (query: string) => void;
}

const VocaHeader = ({ onSearch }: VocaHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Search Input */}
            <label className="relative hidden flex-1 max-w-xl items-center md:flex">
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Tìm bộ thẻ, ghi chú, lớp học..."
                    className="h-11 w-full rounded-full border border-input bg-muted/60 pl-11 pr-4 text-sm outline-none transition focus:border-ring focus:bg-card"
                />
            </label>

            {/* Right Action Buttons */}
            <div className="ml-auto flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Tạo mới
                </button>
                {/* Notification Bell */}
                <button
                    type="button"
                    aria-label="Thông báo"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </button>

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
