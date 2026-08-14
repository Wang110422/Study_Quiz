import { BellRing } from 'lucide-react';

interface ActivityItem {
    id: number;
    initial: string;
    bgColor: string;
    textColor: string;
    text: string;
    time: string;
}

const activities: ActivityItem[] = [
    {
        id: 1,
        initial: 'M',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        text: 'Cô Minh Tú vừa thêm bộ thẻ "Chương 5 - Hóa hữu cơ"',
        time: '5 phút trước',
    },
    {
        id: 2,
        initial: 'T',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-600',
        text: 'Bài kiểm tra Toán Đại số sẽ hết hạn sau 2 giờ',
        time: '1 giờ trước',
    },
    {
        id: 3,
        initial: 'N',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        text: 'Nam đã hoàn thành Lộ trình IELTS tháng 8',
        time: '3 giờ trước',
    },
];

const ClassUpdatesWidget = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Cập nhật lớp học</h3>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-3">
                        <div
                            className={`w-8 h-8 rounded-full ${act.bgColor} ${act.textColor} font-bold text-xs flex items-center justify-center shrink-0 mt-0.5`}
                        >
                            {act.initial}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800 leading-snug">
                                {act.text}
                            </p>
                            <span className="text-xs text-slate-400 font-normal mt-0.5 block">
                                {act.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassUpdatesWidget;
