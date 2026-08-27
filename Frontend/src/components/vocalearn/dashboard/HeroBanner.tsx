import { Sparkles, ArrowRight, PenLine, Mic, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const aiFeatures = [
    { icon: PenLine, title: "Writing AI", desc: "Chấm bài viết, sửa lỗi và gợi ý bài mẫu." },
    { icon: Mic, title: "Speaking AI", desc: "Nhận xét transcript, điểm mạnh và cách nói tốt hơn." },
    { icon: MessageCircle, title: "Lingo", desc: "Hỏi nhanh ngữ pháp, từ vựng và cách làm bài." },
];

interface HeroBannerProps {
    userName?: string;
}

export const HeroBanner = (_props: HeroBannerProps = {}) => {
    return (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] select-none">
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
    );
};

export default HeroBanner;
