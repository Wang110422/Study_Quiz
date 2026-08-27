import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Award, Sparkles, FileText, Check } from 'lucide-react';
import { type StudyPathDTO, type StudyPathItemDTO } from '../../../services/studyPathService';
import { useAuthStore } from '../../../store';


interface PathDetailCardProps {
    path: StudyPathDTO;
    onUpdateProgress?: (itemId: number, mode: 'LEARN' | 'TEST') => void;
}

const PathDetailCard = ({ path }: PathDetailCardProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [isFinalExamDone, setIsFinalExamDone] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);

    const items = path.items || [];
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.isCompleted).length;

    // Kiểm tra xem tất cả các mốc bài tập đã hoàn thành chưa
    const allMilestonesCompleted = totalItems > 0 && completedItems === totalItems;
    const isPathPassed = allMilestonesCompleted && isFinalExamDone;

    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const handleMilestoneClick = (setSlug: string, itemId: number, targetLearn: number, targetTest: number) => {
        // Truyền pathItemId để lấy và lưu tiến trình trực tiếp từ MySQL Database
        navigate(`/studyset/${setSlug}`, {
            state: {
                from: '/paths',
                fromName: 'Lộ trình học',
                pathItemId: itemId,
                targetLearnCount: targetLearn,
                targetTestCount: targetTest,
            },
        });
    };

    const handleCompleteFinalExam = () => {
        setIsFinalExamDone(true);
        setShowFinalModal(false);
    };

    return (
        <div className="space-y-6 select-none animate-in fade-in">
            {/* Top Detail Card */}
            <div
                className={`border rounded-3xl p-6 sm:p-8 shadow-2xs relative transition-all ${isPathPassed
                        ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                        : allMilestonesCompleted
                            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-white border-slate-200/80'
                    }`}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                        <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-bold border ${isPathPassed
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                    : allMilestonesCompleted
                                        ? 'bg-amber-100 border-amber-200 text-amber-800'
                                        : 'bg-blue-50 border-blue-100 text-blue-600'
                                }`}
                        >
                            {isPathPassed ? '🏆' : path.icon || '🎓'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-slate-900">{path.title}</h2>
                                {isPathPassed && (
                                    <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1">
                                        <Award className="w-4 h-4" /> ✓ ĐẠT
                                    </span>
                                )}
                                {allMilestonesCompleted && !isPathPassed && (
                                    <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1">
                                        <Sparkles className="w-4 h-4" /> CẦN LÀM BÀI KIỂM TRẢ TỔNG HỢP 🟡
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                {path.description || 'Lộ trình học bài bản giúp nâng cao trình độ nhanh chóng.'}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-3">
                                <span>⏱️ {path.durationDays || 30} ngày</span>
                                <span>📚 {totalItems} mốc bộ thẻ</span>
                                <span>⚡ {path.level || 'Trung bình'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-slate-600">Tiến trình hoàn thành mốc</span>
                        <span className={isPathPassed ? 'text-emerald-700 font-black' : allMilestonesCompleted ? 'text-amber-700 font-black' : 'text-blue-600 font-extrabold'}>
                            {completedItems}/{totalItems} mốc hoàn thành ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full bg-slate-200/60 h-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isPathPassed ? 'bg-emerald-600' : allMilestonesCompleted ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Milestones List */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>📍 Các mốc bộ thẻ trong lộ trình</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">Nhấp vào mốc để bắt đầu học bộ thẻ</span>
                </div>

                <div className="space-y-3">
                    {items.map((item: StudyPathItemDTO) => {
                        const setSlug = item.studySet?.slug || 'tieng-anh-du-lich';
                        const termCount = item.studySet?.vocabulariesCount || 45;
                        const completedLearn = item.completedLearnCount ?? 0;
                        const completedTest = item.completedTestCount ?? 0;
                        const targetLearn = item.targetLearnCount ?? 3;
                        const targetTest = item.targetTestCount ?? 3;
                        const isCompleted = item.isCompleted || (completedLearn >= targetLearn && completedTest >= targetTest);

                        // Requirement #1: Tác giả sẽ lấy tên của người tạo
                        const creatorName =
                            item.studySet?.creatorName ||
                            (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') ||
                            'Giáo viên VocaLearn';

                        return (
                            <div
                                key={item.id}
                                onClick={() => handleMilestoneClick(setSlug, item.id, targetLearn, targetTest)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 group relative ${isCompleted
                                        ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 shadow-xs'
                                        : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                                    }`}
                            >
                                {/* Header Mốc */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors ${isCompleted
                                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                                    : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                                }`}
                                        >
                                            #{item.stepOrder}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                                {item.title}{' '}
                                                {item.studySet && item.studySet.titleName !== item.title && `(${item.studySet.titleName})`}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                                                <span>📚 {termCount} thuật ngữ</span>
                                                <span className="text-slate-300">·</span>
                                                <span className={isCompleted ? 'text-emerald-700 font-bold' : 'text-purple-600 font-bold'}>
                                                    🎯 Học: {completedLearn}/{targetLearn} | Kiểm tra: {completedTest}/{targetTest}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Requirement #3: Khi 1 mốc hoàn thành đổi màu xanh lá và có chữ hoàn thành ở phía trên bên phải */}
                                    <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                            <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Hoàn thành
                                            </span>
                                        ) : (
                                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0" />
                                        )}
                                    </div>
                                </div>

                                {/* Requirement #1: Phía dưới hiển thị Người tạo bộ thẻ */}
                                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                                            {creatorName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-slate-600">
                                            Tác giả: <strong className="text-slate-800">{creatorName}</strong>
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                                        Vào học bộ thẻ →
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Requirement #4: Tự động xuất hiện mốc Kiểm tra tổng hợp khi tất cả các mốc bài tập đã hoàn thành */}
                    {allMilestonesCompleted && (
                        <div
                            onClick={() => {
                                if (!isFinalExamDone) setShowFinalModal(true);
                            }}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 group relative ${isFinalExamDone
                                    ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-xs'
                                    : 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 hover:border-amber-500 shadow-md'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-sm shrink-0 ${isFinalExamDone
                                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                                : 'bg-amber-100 border-amber-200 text-amber-800'
                                            }`}
                                    >
                                        📝
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                            <span>Bài kiểm tra tổng hợp lộ trình</span>
                                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-md">
                                                MỐC CUỐI
                                            </span>
                                        </h4>
                                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                            Bài kiểm tra tổng hợp lại toàn bộ từ vựng trong lộ trình học
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    {isFinalExamDone ? (
                                        <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> ✓ Hoàn thành
                                        </span>
                                    ) : (
                                        <span className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer">
                                            Làm bài ngay →
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Làm bài kiểm tra tổng hợp */}
            {showFinalModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 text-center">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto font-bold">
                            📝
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900">Bài kiểm tra tổng hợp lộ trình</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                Bạn đã hoàn thành tất cả các mốc học! Hãy thực hiện bài kiểm tra tổng hợp này để đạt chứng chỉ lộ trình.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 space-y-2">
                            <div className="flex justify-between">
                                <span>Số câu hỏi:</span>
                                <span className="text-blue-600 font-extrabold">20 câu</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Thời gian làm bài:</span>
                                <span className="text-blue-600 font-extrabold">15 phút</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowFinalModal(false)}
                                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                            >
                                Để sau
                            </button>
                            <button
                                type="button"
                                onClick={handleCompleteFinalExam}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-amber-500/20"
                            >
                                Nộp bài & Đạt lộ trình
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PathDetailCard;
