import { Link, useNavigate } from 'react-router-dom';
import { Play, Loader2, Compass } from 'lucide-react';
import useRoadmaps from '../../../hooks/useRoadmaps';

const ContinueLearning = () => {
    const { roadmaps, loading } = useRoadmaps();
    const navigate = useNavigate();

    // Lọc ra các lộ trình CHƯA HOÀN THÀNH từ Database
    const uncompletedRoadmaps = roadmaps.filter((r) => !r.isCompleted);

    return (
        <div className="mt-7 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                        Tiếp tục học (Lộ trình chưa hoàn thành)
                    </h2>
                    {uncompletedRoadmaps.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[11px] rounded-full">
                            {uncompletedRoadmaps.length} lộ trình
                        </span>
                    )}
                </div>
                <Link to="/paths" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Quản lý Lộ trình →
                </Link>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Đang tải lộ trình học từ Database...</span>
                </div>
            ) : uncompletedRoadmaps.length === 0 ? (
                /* Empty state: Nếu không có lộ trình nào chưa hoàn thành */
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                        🏆
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                        Bạn chưa có lộ trình dở dang nào!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Tất cả các chặng và tác vụ trong lộ trình của bạn đều đã hoàn thành xuất sắc hoặc chưa có lộ trình.
                    </p>
                    <Link
                        to="/paths"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                        <Compass className="w-4 h-4" />
                        <span>Khám phá hoặc Tạo Lộ trình mới</span>
                    </Link>
                </div>
            ) : (
                /* Grid hiển thị các lộ trình chưa hoàn thành */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {uncompletedRoadmaps.map((roadmap) => {
                        const total = roadmap.totalTasks || 1;
                        const done = roadmap.completedTasks || 0;
                        const pct = roadmap.progressPercent || 0;

                        // Tìm task đang học hiện tại
                        const currentPhase = roadmap.phases?.find((p) => p.id === roadmap.currentPhaseId) || roadmap.phases?.[0];
                        const currentTask = currentPhase?.tasks?.find((t) => t.id === roadmap.currentTaskId) || currentPhase?.tasks?.[0];

                        const handleContinue = () => {
                            if (currentTask && currentTask.link) {
                                navigate(currentTask.link, {
                                    state: {
                                        from: '/paths',
                                        taskId: currentTask.id,
                                    },
                                });
                            } else {
                                navigate('/paths');
                            }
                        };

                        return (
                            <div
                                key={roadmap.id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Icon & Badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl font-bold">
                                            🎯
                                        </div>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-lg">
                                            Mục tiêu {roadmap.targetScore || 650}đ
                                        </span>
                                    </div>

                                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {roadmap.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">
                                        {done}/{total} tác vụ · {roadmap.phases?.length || 0} chặng
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-100 h-2 rounded-full mt-3.5 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Button Học tiếp */}
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="mt-5 w-full py-2.5 bg-slate-50 border border-slate-200 hover:bg-blue-600 hover:border-blue-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Học tiếp</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ContinueLearning;
