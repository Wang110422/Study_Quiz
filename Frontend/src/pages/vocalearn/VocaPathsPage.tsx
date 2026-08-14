import { useState } from 'react';
import { Route, Plus } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import PathDetailCard, { type PathItem } from '../../components/vocalearn/paths/PathDetailCard';

const pathsList: PathItem[] = [
    {
        id: 1,
        icon: '🎓',
        title: 'Lộ trình IELTS 7.0',
        description: 'Từ band 5.5 lên 7.0 trong 3 tháng với lịch học bài bản',
        durationDays: 90,
        setsCount: 24,
        completedSets: 16,
        level: 'Trung bình - Nâng cao',
        status: 'ĐANG HỌC',
        currentXp: 3200,
        totalXp: 4800,
        progressPercent: 67,
        milestones: [
            { id: 1, title: 'Từ vựng cơ bản', status: 'completed' },
            { id: 2, title: 'Reading & Vocabulary', status: 'completed' },
            { id: 3, title: 'Writing Academic', status: 'completed' },
            { id: 4, title: 'Listening Skills', status: 'in_progress' },
        ],
    },
    {
        id: 2,
        icon: 'JP',
        title: 'Tiếng Nhật N3 Cấp tốc',
        description: 'Chinh phục 800 Kanji và 1,200 từ vựng N3 trong 6 tháng',
        durationDays: 180,
        setsCount: 36,
        completedSets: 4,
        level: 'Trung bình',
        status: 'ĐANG HỌC',
        currentXp: 800,
        totalXp: 6000,
        progressPercent: 11,
        milestones: [
            { id: 1, title: 'Kanji N3 căn bản', status: 'in_progress' },
            { id: 2, title: 'Từ vựng N3 phần 1', status: 'locked' },
        ],
    },
    {
        id: 3,
        icon: '💻',
        title: 'Lập trình English',
        description: 'Thuật ngữ Tiếng Anh chuyên ngành Công nghệ thông tin',
        durationDays: 45,
        setsCount: 12,
        completedSets: 0,
        level: 'Cơ bản',
        status: 'CHƯA HỌC',
        currentXp: 0,
        totalXp: 2400,
        progressPercent: 0,
        milestones: [
            { id: 1, title: 'Khái niệm lập trình cơ bản', status: 'locked' },
        ],
    },
];

const VocaPathsPage = () => {
    const [selectedPathId, setSelectedPathId] = useState<number>(1);

    const activePath = pathsList.find((p) => p.id === selectedPathId) || pathsList[0];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
                    {/* Header Title */}
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-0.5">
                            <Route className="w-4 h-4 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900">
                                Lộ trình học
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-normal">
                            Theo dõi hành trình học tập có hệ thống của bạn
                        </p>
                    </div>

                    {/* Layout 2 columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Selector List (4 cols) */}
                        <div className="lg:col-span-4 space-y-3">
                            {pathsList.map((item) => {
                                const isSelected = item.id === selectedPathId;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedPathId(item.id)}
                                        className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                                                : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                        {item.durationDays} ngày · {item.level}
                                                    </p>
                                                </div>
                                            </div>

                                            {item.progressPercent > 0 && (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">
                                                    ĐANG HỌC
                                                </span>
                                            )}
                                        </div>

                                        {/* Mini Progress */}
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                                            <span className="text-slate-400">
                                                {item.completedSets}/{item.setsCount} bộ thẻ
                                            </span>
                                            <span className="text-blue-600 font-bold">
                                                {item.progressPercent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            <button className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-3xl text-xs font-bold text-slate-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <Plus className="w-4 h-4" />
                                <span>Tạo lộ trình mới</span>
                            </button>
                        </div>

                        {/* Right Detail Card View (8 cols) */}
                        <div className="lg:col-span-8">
                            <PathDetailCard path={activePath} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VocaPathsPage;
