import { Users, Layers, Clock, ArrowRight } from 'lucide-react';

export interface ClassItem {
    id: number;
    title: string;
    teacher: string;
    studentsCount: number;
    setsCount: number;
    progress: number;
    icon: string;
    alertText?: string;
    alertType?: 'urgent' | 'normal';
}

interface ClassCardProps {
    classItem: ClassItem;
}

const ClassCard = ({ classItem }: ClassCardProps) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all select-none">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shrink-0">
                        {classItem.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                            {classItem.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {classItem.teacher}
                        </p>
                    </div>
                </div>
                {classItem.alertType === 'urgent' && (
                    <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-full flex items-center gap-1 shrink-0">
                        ⚡ KHẨN
                    </span>
                )}
            </div>

            {/* Sub Info */}
            <div className="flex items-center gap-5 text-xs font-medium text-slate-400 mb-3.5">
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{classItem.studentsCount} học viên</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{classItem.setsCount} bộ thẻ</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3.5">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-400">Tiến độ</span>
                    <span className="text-blue-600 font-semibold">{classItem.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${classItem.progress}%` }}
                    />
                </div>
            </div>

            {/* Alert Banner / Action Button */}
            {classItem.alertText && (
                <div
                    className={`rounded-xl p-3 flex items-center justify-between text-xs ${
                        classItem.alertType === 'urgent'
                            ? 'bg-rose-50 border border-rose-100 text-rose-700'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                    }`}
                >
                    <div className="flex items-center gap-2 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{classItem.alertText}</span>
                    </div>
                    <button className="font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                        <span>Vào lớp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClassCard;
