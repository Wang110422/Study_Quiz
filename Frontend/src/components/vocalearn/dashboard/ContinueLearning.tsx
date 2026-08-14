import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

interface ContinueItem {
    id: number;
    icon: string;
    title: string;
    learned: number;
    total: number;
    color: string;
    slug: string;
}

const items: ContinueItem[] = [
    { id: 1, icon: '✈️', title: 'Tiếng Anh Du Lịch', learned: 28, total: 45, color: 'bg-blue-600', slug: 'tieng-anh-du-lich' },
    { id: 2, icon: '💻', title: 'Tiếng Anh Chuyên ngành IT', learned: 15, total: 60, color: 'bg-indigo-600', slug: 'tieng-anh-chuyen-nganh-it' },
    { id: 3, icon: '📖', title: 'Từ vựng IELTS Band 7+', learned: 72, total: 120, color: 'bg-emerald-600', slug: 'tu-vung-ielts-band-7' },
    { id: 4, icon: 'JP', title: 'Tiếng Nhật N3', learned: 10, total: 80, color: 'bg-amber-500', slug: 'tieng-nhat-n3' },
];

const ContinueLearning = () => {
    return (
        <div className="mt-7 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                    Tiếp tục học
                </h2>
                <Link to="/studyset" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Xem tất cả →
                </Link>
            </div>

            {/* Grid 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                    const percent = Math.round((item.learned / item.total) * 100);

                    return (
                        <div
                            key={item.id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
                        >
                            <div>
                                {/* Icon */}
                                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-3.5 font-bold text-slate-700">
                                    {item.icon}
                                </div>

                                <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">
                                    {item.learned}/{item.total} đã học
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3.5 overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-300`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Button */}
                            <Link
                                to={`/folders/tieng-anh/${item.slug}`}
                                className="mt-5 w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 text-slate-600 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Học tiếp</span>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ContinueLearning;
