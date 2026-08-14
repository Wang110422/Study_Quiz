import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

export interface FolderItem {
    id: number;
    initial: string;
    bgColor: string;
    title: string;
    description: string;
    tags: string[];
    setsCount: number;
    termsCount: number;
    updatedAt: string;
    slug: string;
}

interface FolderCardProps {
    folder: FolderItem;
    onDelete?: (id: number) => void;
    onEdit?: (folder: FolderItem) => void;
}

const FolderCard = ({ folder, onDelete, onEdit }: FolderCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        if (window.confirm(`Bạn có chắc chắn muốn chuyển Thư mục "${folder.title}" vào Thùng rác?`)) {
            if (onDelete) onDelete(folder.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        if (onEdit) onEdit(folder);
    };

    return (
        <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between select-none group">
            {/* Header Icon + Dropdown Menu */}
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`w-10 h-10 rounded-xl ${folder.bgColor} flex items-center justify-center font-bold text-slate-700 text-lg border border-slate-100`}
                >
                    {folder.initial}
                </div>

                {/* Nút 3 chấm ĐỨNG ĐỘC LẬP HOÀN TOÀN KHỎI LINK */}
                <div className="relative z-20">
                    <button
                        type="button"
                        onClick={handleMenuClick}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Tùy chọn"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu 3 chấm */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                            {onEdit && (
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                >
                                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Chỉnh sửa</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 border-t border-slate-100 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa thư mục</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Link Chuyển trang Chi tiết */}
            <Link to={`/folders/${folder.slug}`} className="block flex-1">
                <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                    {folder.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-4">
                    {folder.description}
                </p>

                {/* Footer Stats */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>{folder.setsCount} bộ thẻ</span>
                    <span className="font-extrabold text-slate-800">{folder.termsCount} thuật ngữ</span>
                </div>
            </Link>
        </div>
    );
};

export default FolderCard;
