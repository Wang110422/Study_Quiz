import { Link } from "react-router-dom";
import {
    Play,
    MoreHorizontal,
    Sparkles,
    ArrowRight,
    PenLine,
    Mic,
    MessageCircle,
} from "lucide-react";
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import { SectionTitle } from '../../components/app/PageHeader';
import { EmojiTile, Pill, Progress } from '../../components/app/ui-bits';
import { cardSets, homeStats, roadmaps } from '../../data/mock';
import { useAuthStore } from '../../store';

const aiFeatures = [
    { icon: PenLine, title: "Writing AI", desc: "Chấm bài viết, sửa lỗi và gợi ý bài mẫu." },
    { icon: Mic, title: "Speaking AI", desc: "Nhận xét transcript, điểm mạnh và cách nói tốt hơn." },
    { icon: MessageCircle, title: "Lingo", desc: "Hỏi nhanh ngữ pháp, từ vựng và cách làm bài." },
];

const VocaDashboardPage = () => {
    const { user } = useAuthStore();
    const displayName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0]
        : 'Bạn';

    const today = new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date());

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none">
            {/* Fixed Left Sidebar */}
            <VocaSidebar />

            {/* Main Wrapper with Sidebar Offset */}
            <div className="pl-[260px] flex flex-col min-h-screen">
                {/* Top Header */}
                <VocaHeader />

                {/* Dashboard Content Container */}
                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-8 animate-fadeIn">
                    {/* 1. Hero Section Aptis ESOL + 3 AI Features */}
                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                        <div className="surface-card flex flex-col justify-center p-6 sm:p-9">
                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-xs font-bold text-primary">
                                <Sparkles className="h-4 w-4" /> LingoMaster Aptis ESOL
                            </span>
                            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl text-foreground">
                                Luyện Aptis theo bộ đề, học mẹo nhanh và nhận nhận xét AI sau khi làm bài
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                                Web hỗ trợ Reading, Listening, Speaking, Writing và Grammar với giao diện luyện thi rõ
                                ràng. Phần Writing và Speaking có chấm AI để ước tính điểm, CEFR, chỉ ra lỗi chính và gợi
                                ý cách cải thiện bài làm.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link
                                    to="/exams"
                                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-pop transition hover:opacity-90 cursor-pointer"
                                >
                                    Vào bộ đề <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/mock-test"
                                    className="inline-flex h-12 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted cursor-pointer text-foreground"
                                >
                                    Thi thử AI
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                            {aiFeatures.map((f) => (
                                <article key={f.title} className="surface-card p-5">
                                    <span className="icon-tile">
                                        <f.icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-3 font-bold text-foreground">{f.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <div className="space-y-8">
                        {/* 2. Welcome & Daily Stats */}
                        <section className="surface-card overflow-hidden p-6 sm:p-8">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{today}</p>
                            <h2 className="mt-3 text-2xl font-bold sm:text-3xl text-foreground">
                                Chào {displayName}, học tiếp nhé 👋
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Hôm nay bạn muốn ôn lại thẻ cũ hay khám phá một chủ đề từ vựng mới?
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {homeStats.map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-border bg-muted/40 p-4">
                                        <span className="text-lg">{s.emoji}</span>
                                        <p className="mt-2 font-display text-3xl font-bold text-foreground">{s.value}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. Tiếp Tục Học (Lộ Trình) */}
                        <section className="space-y-4">
                            <SectionTitle
                                title="Tiếp tục học"
                                badge={String(roadmaps.length)}
                                right={
                                    <Link to="/paths" className="text-sm font-semibold text-primary hover:underline">
                                        Quản lý Lộ trình →
                                    </Link>
                                }
                            />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {roadmaps.map((r) => (
                                    <article key={r.id} className="surface-card flex flex-col p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <EmojiTile>{r.emoji}</EmojiTile>
                                            <Pill tone={r.level === "Nâng cao" ? "warning" : r.level === "Trung bình" ? "info" : "success"}>
                                                {r.level}
                                            </Pill>
                                        </div>
                                        <h3 className="mt-4 font-bold text-foreground">{r.name}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {r.done}/{r.total} mốc đã hoàn thành
                                        </p>
                                        <div className="mt-3">
                                            <Progress value={(r.done / r.total) * 100} />
                                        </div>
                                        <Link
                                            to="/paths"
                                            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-pop cursor-pointer"
                                        >
                                            <Play className="h-4 w-4" /> Học tiếp
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* 4. Thư Viện Của Bạn */}
                        <section className="space-y-4">
                            <SectionTitle
                                title="Thư viện của bạn"
                                right={
                                    <Link to="/folders" className="text-sm font-semibold text-primary hover:underline">
                                        Xem tất cả →
                                    </Link>
                                }
                            />
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {cardSets.map((s) => (
                                    <article key={s.id} className="surface-card p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <EmojiTile>{s.emoji}</EmojiTile>
                                            <button
                                                type="button"
                                                aria-label="Tùy chọn"
                                                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted cursor-pointer"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h3 className="mt-4 font-bold text-foreground">{s.name}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {s.terms} thuật ngữ · cập nhật {s.updated}
                                        </p>
                                        <Link
                                            to={`/studyset/${(s as any).slug ?? s.id}`}
                                            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                        >
                                            Vào bộ thẻ →
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border py-6 px-6 text-center text-xs text-muted-foreground font-medium mt-10">
                    © {new Date().getFullYear()} LingoMaster. Luyện thi Aptis ESOL & Ôn tập từ vựng thông minh.
                </footer>
            </div>
        </div>
    );
};

export default VocaDashboardPage;
