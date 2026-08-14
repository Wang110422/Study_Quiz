import { Flame, Brain, Hourglass } from 'lucide-react';

interface HeroBannerProps {
    userName?: string;
    streakDays?: number;
    totalVocab?: number;
    todayCards?: number;
}

const HeroBanner = ({
    userName = 'Lan Anh',
    streakDays = 5,
    totalVocab = 120,
    todayCards = 15,
}: HeroBannerProps) => {
    const days = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateStr = `${dayName}, ${now.getDate()} THÁNG ${now.getMonth() + 1} · ${now.getFullYear()}`;

    return (
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-md shadow-blue-500/15 select-none">
            {/* Background Decorative Circles */}
            <div className="absolute right-[-10%] top-[-20%] w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-[20%] bottom-[-30%] w-56 h-56 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

            <div className="relative z-10">
                {/* Date Header */}
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 mb-1.5">
                    {dateStr}
                </p>

                {/* Greeting Title */}
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    Chào mừng trở lại, {userName}! 👋
                </h1>
                <p className="text-xs text-blue-100 mt-1 mb-4 font-normal">
                    Hôm nay bạn muốn chinh phục môn học nào?
                </p>

                {/* 3 Stat Cards */}
                <div className="grid grid-cols-3 gap-3 max-w-lg">
                    {/* Stat 1: Streak */}
                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-amber-300">
                            <Flame className="w-4 h-4 fill-amber-400" />
                        </div>
                        <div className="mt-2">
                            <span className="text-lg font-bold text-white">{streakDays} ngày</span>
                            <p className="text-[11px] text-blue-100 font-normal mt-0.5">liên tiếp</p>
                        </div>
                    </div>

                    {/* Stat 2: Total Vocab */}
                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-pink-300">
                            <Brain className="w-4 h-4" />
                        </div>
                        <div className="mt-2">
                            <span className="text-lg font-bold text-white">{totalVocab}</span>
                            <p className="text-[11px] text-blue-100 font-normal mt-0.5">từ vựng</p>
                        </div>
                    </div>

                    {/* Stat 3: Today Cards */}
                    <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-300">
                            <Hourglass className="w-4 h-4" />
                        </div>
                        <div className="mt-2">
                            <span className="text-lg font-bold text-white">{todayCards}</span>
                            <p className="text-[11px] text-blue-100 font-normal mt-0.5">thẻ hôm nay</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
