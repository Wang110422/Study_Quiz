import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, X, Layers, Brain, FileText, PenTool, BookMarked, Home, Search, Settings } from 'lucide-react';

interface StudyModeHeaderProps {
    currentMode: 'flashcards' | 'learn' | 'test' | 'grammar' | 'reading';
    basePath: string;
    rightContent?: React.ReactNode;
}

export const StudyModeHeader = ({ currentMode, basePath, rightContent }: StudyModeHeaderProps) => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const modes = [
        { id: 'flashcards', label: 'Thẻ ghi nhớ', icon: Layers, color: 'text-blue-600', path: `${basePath}/flashcards` },
        { id: 'learn', label: 'Học', icon: Brain, color: 'text-purple-600', path: `${basePath}/learn` },
        { id: 'test', label: 'Kiểm tra', icon: FileText, color: 'text-emerald-600', path: `${basePath}/test` },
        { id: 'reading', label: 'Đọc hiểu', icon: BookMarked, color: 'text-rose-600', path: `${basePath}/reading` },
    ];

    const activeModeObj = modes.find((m) => m.id === currentMode) || modes[0];
    const ActiveIcon = activeModeObj.icon;

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none shadow-2xs">
            {/* Left side: Mode Dropdown Selector */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100/80 rounded-xl transition-all font-bold text-slate-800 text-sm cursor-pointer outline-none active:scale-95"
                >
                    <ActiveIcon className={`w-5 h-5 ${activeModeObj.color}`} />
                    <span>{activeModeObj.label}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Popup Menu (Quizlet Style) */}
                {dropdownOpen && (
                    <div className="absolute top-12 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
                        <div className="space-y-1">
                            {modes.map((m) => {
                                const Icon = m.icon;
                                const isActive = m.id === currentMode;

                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            navigate(m.path);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 shadow-2xs'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${m.color}`} />
                                        <span>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="border-t border-slate-100 my-2" />

                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate('/dashboard');
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer"
                            >
                                <Home className="w-4 h-4 text-slate-400" />
                                <span>Trang chủ</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate('/folders');
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer"
                            >
                                <Search className="w-4 h-4 text-slate-400" />
                                <span>Thư viện của bạn</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right side: Right Content & Close Button */}
            <div className="flex items-center gap-4">
                {rightContent}
                <button
                    type="button"
                    onClick={() => navigate(basePath)}
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Thoát về tổng quan bộ thẻ"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default StudyModeHeader;
