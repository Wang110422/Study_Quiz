import { Play, CheckCircle2, CircleDot } from 'lucide-react';

export interface Milestone {
    id: number;
    title: string;
    status: 'completed' | 'in_progress' | 'locked';
}

export interface PathItem {
    id: number;
    icon: string;
    title: string;
    description: string;
    durationDays: number;
    setsCount: number;
    completedSets: number;
    level: string;
    status: string;
    currentXp: number;
    totalXp: number;
    progressPercent: number;
    milestones: Milestone[];
}

interface PathDetailCardProps {
    path: PathItem;
}

const PathDetailCard = ({ path }: PathDetailCardProps) => {
    return (
        <div className="space-y-6 select-none">
            {/* Top Detail Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs relative">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">
                        {path.icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                            {path.title}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            {path.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-3">
                            <span>⏱️ {path.durationDays} ngày</span>
                            <span>📚 {path.setsCount} bộ thẻ</span>
                            <span>⚡ {path.level}</span>
                        </div>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500">Kinh nghiệm tích lũy</span>
                        <span className="text-blue-600 font-extrabold">
                            {path.currentXp.toLocaleString()} / {path.totalXp.toLocaleString()} XP
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${path.progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Continue Action Button */}
                <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95">
                    <Play className="w-4 h-4 fill-current" />
                    <span>Tiếp tục lộ trình</span>
                </button>
            </div>

            {/* Bottom Milestones List */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4">
                    📍 Các mốc trong lộ trình
                </h3>

                <div className="space-y-3">
                    {path.milestones.map((m) => (
                        <div
                            key={m.id}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-all ${
                                m.status === 'completed'
                                    ? 'bg-blue-50/60 border-blue-100 text-slate-800'
                                    : m.status === 'in_progress'
                                    ? 'bg-white border-blue-500 ring-1 ring-blue-500 text-blue-900 font-bold'
                                    : 'bg-slate-50 border-slate-100 text-slate-400'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {m.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/10" />
                                ) : (
                                    <CircleDot className="w-5 h-5 text-blue-600" />
                                )}
                                <span className="font-bold">{m.title}</span>
                            </div>

                            <span
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                                    m.status === 'completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {m.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PathDetailCard;
