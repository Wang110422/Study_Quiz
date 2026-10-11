import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface CustomSelectProps {
    value?: string | number;
    onChange: (value: any) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    prefixIcon?: React.ReactNode;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyText?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Chọn một mục...',
    disabled = false,
    className = '',
    prefixIcon,
    searchable,
    searchPlaceholder = 'Tìm kiếm tùy chọn...',
    emptyText = 'Không tìm thấy kết quả',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Tự động focus ô tìm kiếm khi mở
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchTerm('');
        }
    }, [isOpen]);

    // Tự động bật tìm kiếm nếu danh sách có trên 5 mục
    const shouldSearch = searchable ?? options.length > 5;

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative select-none ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all outline-none text-left cursor-pointer ${
                    disabled
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isOpen
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/15 text-slate-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-800'
                }`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                    {/* Prefix Icon hoặc Icon của mục đang chọn */}
                    {(selectedOption?.icon || prefixIcon) && (
                        <div className="shrink-0 text-slate-500 flex items-center justify-center">
                            {selectedOption?.icon || prefixIcon}
                        </div>
                    )}
                    <span className={`truncate ${selectedOption ? 'text-slate-800 font-semibold' : 'text-slate-400 font-normal'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>

                <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                />
            </button>

            {/* Floating Dropdown Popover */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 text-slate-800 animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Search Input */}
                    {shouldSearch && (
                        <div className="px-2.5 py-2 mb-1 border-b border-slate-100 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full bg-transparent text-xs font-medium outline-none text-slate-800 placeholder-slate-400"
                            />
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 overscroll-contain">
                        {filteredOptions.length === 0 ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-medium">
                                {emptyText}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={opt.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                                            isSelected
                                                ? 'bg-blue-50/90 text-blue-600 font-bold'
                                                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            {opt.icon && (
                                                <div className={`shrink-0 flex items-center justify-center ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    {opt.icon}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="truncate leading-tight">{opt.label}</div>
                                                {opt.description && (
                                                    <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                                                        {opt.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
