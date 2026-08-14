import { Link } from 'react-router-dom';
import { Heart, Users } from 'lucide-react';

interface CommunityItem {
    id: number;
    icon: string;
    title: string;
    termCount: number;
    author: string;
    likes: number;
    usersCount: number;
    slug: string;
}

const communityItems: CommunityItem[] = [
    {
        id: 1,
        icon: '📋',
        title: '2000 từ TOEIC cơ bản',
        termCount: 2000,
        author: 'Admin VocaLearn',
        likes: 1840,
        usersCount: 12400,
        slug: '2000-tu-toeic-co-ban',
    },
    {
        id: 2,
        icon: '💬',
        title: 'Tiếng Anh giao tiếp hàng ngày',
        termCount: 300,
        author: 'Teacher Lan',
        likes: 980,
        usersCount: 8700,
        slug: 'tieng-anh-giao-tiep-hang-ngay',
    },
    {
        id: 3,
        icon: '🎓',
        title: 'Vocabulary for SAT',
        termCount: 500,
        author: 'StudyGroup',
        likes: 730,
        usersCount: 5100,
        slug: 'vocabulary-for-sat',
    },
];

const CommunitySection = () => {
    return (
        <div className="mt-7 mb-7 select-none">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                    Cộng đồng đang học gì?
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-1">
                    Bộ thẻ phổ biến từ cộng đồng VocaLearn
                </p>
            </div>

            {/* Rows List */}
            <div className="space-y-3">
                {communityItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 font-bold">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {item.termCount} thuật ngữ · {item.author}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 shrink-0">
                            {/* Likes */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                <span>{item.likes.toLocaleString()}</span>
                            </div>

                            {/* Users */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>{item.usersCount.toLocaleString()}</span>
                            </div>

                            {/* Action Button */}
                            <Link
                                to={`/folders/tieng-anh/${item.slug}`}
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
                            >
                                Học ngay
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunitySection;
