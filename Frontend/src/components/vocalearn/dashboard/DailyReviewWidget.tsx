import { useState } from 'react';
import { Calendar } from 'lucide-react';

const DailyReviewWidget = () => {
    const [showDefinition, setShowDefinition] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Lịch ôn hôm nay</h3>
                </div>
                <span className="text-xs font-medium text-slate-400">1/3 thẻ cần ôn</span>
            </div>

            {/* Flashcard Mini Preview Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center transition-all">
                <p className="text-base font-bold text-blue-900 mb-3">
                    {showDefinition ? 'Nơi ở, chỗ trọ tiện nghi' : 'Accommodation'}
                </p>
                <button
                    onClick={() => setShowDefinition((prev) => !prev)}
                    className="px-5 py-2 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer active:scale-95"
                >
                    {showDefinition ? 'Ẩn nghĩa' : 'Xem nghĩa'}
                </button>
            </div>
        </div>
    );
};

export default DailyReviewWidget;
