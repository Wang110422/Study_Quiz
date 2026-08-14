import { Trophy, Flame } from 'lucide-react';

interface LeaderboardUser {
    rank: number;
    initial: string;
    name: string;
    isCurrentUser?: boolean;
    streakDays: number;
    xp: number;
    medalColor?: string;
}

const leaderboardData: LeaderboardUser[] = [
    { rank: 1, initial: 'K', name: 'Minh Khôi', streakDays: 21, xp: 2840, medalColor: 'text-amber-500' },
    { rank: 2, initial: 'A', name: 'Lan Anh (Bạn)', isCurrentUser: true, streakDays: 14, xp: 2610, medalColor: 'text-slate-400' },
    { rank: 3, initial: 'T', name: 'Thanh Tùng', streakDays: 9, xp: 2450, medalColor: 'text-amber-700' },
    { rank: 4, initial: 'L', name: 'Phương Linh', streakDays: 7, xp: 2200 },
    { rank: 5, initial: 'D', name: 'Đức Minh', streakDays: 5, xp: 1980 },
];

const LeaderboardWidget = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Bảng xếp hạng</h3>
                </div>
            </div>

            {/* User List */}
            <div className="space-y-1.5">
                {leaderboardData.map((user) => (
                    <div
                        key={user.rank}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                            user.isCurrentUser
                                ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank Medal / Number */}
                            <span className="w-5 text-center font-semibold text-slate-400 text-xs">
                                {user.rank <= 3 ? (
                                    <span className={`text-base ${user.medalColor}`}>
                                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                    </span>
                                ) : (
                                    user.rank
                                )}
                            </span>

                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                {user.initial}
                            </div>

                            {/* Name & Streak */}
                            <div>
                                <p className="line-clamp-1 text-xs font-semibold">{user.name}</p>
                                <span className="text-[11px] text-slate-400 font-normal flex items-center gap-0.5">
                                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500 inline" />
                                    {user.streakDays} ngày
                                </span>
                            </div>
                        </div>

                        {/* XP Score */}
                        <span className="font-bold text-blue-600 text-sm">
                            {user.xp.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardWidget;
