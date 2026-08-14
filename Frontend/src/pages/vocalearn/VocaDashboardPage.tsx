import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import HeroBanner from '../../components/vocalearn/dashboard/HeroBanner';
import DailyReviewWidget from '../../components/vocalearn/dashboard/DailyReviewWidget';
import ClassUpdatesWidget from '../../components/vocalearn/dashboard/ClassUpdatesWidget';
import LeaderboardWidget from '../../components/vocalearn/dashboard/LeaderboardWidget';
import ContinueLearning from '../../components/vocalearn/dashboard/ContinueLearning';
import UserLibrarySection from '../../components/vocalearn/dashboard/UserLibrarySection';
import CommunitySection from '../../components/vocalearn/dashboard/CommunitySection';

const VocaDashboardPage = () => {
    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col">
            {/* Fixed Left Sidebar (w-[160px]) */}
            <VocaSidebar />

            {/* Main Wrapper with Sidebar Offset (pl-[200px]) */}
            <div className="pl-[200px] flex flex-col min-h-screen">
                {/* Top Header */}
                <VocaHeader />

                {/* Dashboard Content Container */}
                <main className="flex-1 p-7 max-w-[1600px] w-full mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Main Column (8 cols) */}
                        <div className="lg:col-span-8 space-y-1">
                            {/* Hero Welcome Banner */}
                            <HeroBanner />

                            {/* Section 1: Tiếp tục học */}
                            <ContinueLearning />

                            {/* Section 2: Thư viện của bạn */}
                            <UserLibrarySection />

                            {/* Section 3: Cộng đồng đang học gì? */}
                            <CommunitySection />
                        </div>

                        {/* Right Sidebar Widgets Column (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Widget 1: Lịch ôn hôm nay */}
                            <DailyReviewWidget />

                            {/* Widget 2: Cập nhật lớp học */}
                            <ClassUpdatesWidget />

                            {/* Widget 3: Bảng xếp hạng */}
                            <LeaderboardWidget />
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 font-medium">
                    © {new Date().getFullYear()} VocaLearn. Ôn tập từ vựng chuẩn trí nhớ dài hạn.
                </footer>
            </div>
        </div>
    );
};

export default VocaDashboardPage;
