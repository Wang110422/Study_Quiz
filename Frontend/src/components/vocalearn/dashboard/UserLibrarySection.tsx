import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

interface LibraryItem {
    id: number;
    icon: string;
    title: string;
    termCount: number;
    updatedAt: string;
    slug: string;
}

const libraryItems: LibraryItem[] = [
    { id: 1, icon: '✈️', title: 'Tiếng Anh Du Lịch', termCount: 45, updatedAt: 'Hôm nay', slug: 'tieng-anh-du-lich' },
    { id: 2, icon: '📖', title: 'Từ vựng IELTS', termCount: 120, updatedAt: '2 ngày trước', slug: 'tu-vung-ielts' },
    { id: 3, icon: 'JP', title: 'Tiếng Nhật N3', termCount: 80, updatedAt: '4 ngày trước', slug: 'tieng-nhat-n3' },
    { id: 4, icon: '🧪', title: 'Hóa học Hữu cơ', termCount: 55, updatedAt: '1 tuần trước', slug: 'hoa-hoc-huu-co' },
    { id: 5, icon: '🌍', title: 'Lịch sử Thế giới', termCount: 90, updatedAt: '2 tuần trước', slug: 'lich-su-the-gioi' },
    { id: 6, icon: '📐', title: 'Toán Giải tích', termCount: 30, updatedAt: '3 tuần trước', slug: 'toan-giai-tich' },
];

const UserLibrarySection = () => {
    return (
        <div className="mt-7 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                    Thư viện của bạn
                </h2>
                <Link to="/folders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Xem tất cả →
                </Link>
            </div>

            {/* Grid 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {libraryItems.map((item) => (
                    <Link
                        key={item.id}
                        to={`/folders/tieng-anh/${item.slug}`}
                        className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between">
                            {/* Icon */}
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700">
                                {item.icon}
                            </div>
                            <button
                                onClick={(e) => e.preventDefault()}
                                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">
                                {item.termCount} thuật ngữ · {item.updatedAt}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default UserLibrarySection;
