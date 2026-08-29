import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import VocaHeader from "@/components/vocalearn/layout/VocaHeader";
import VocaSidebar from "@/components/vocalearn/layout/VocaSidebar";
import {
  Progress,
  Pill,
} from "@/components/app/ui-bits";
import { SectionTitle } from "@/components/app/PageHeader";

interface GrammarQuestion {
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

const mockGrammarQuestionsMap: Record<string, { set: { id: string | number; name: string }; questions: GrammarQuestion[] }> = {
  "tieng-anh-du-lich": {
    set: {
      id: "tieng-anh-du-lich",
      name: "Ngữ pháp Tiếng Anh Du Lịch",
    },
    questions: [
      {
        topic: "Yêu cầu lịch sự",
        question: "Điền vào chỗ trống: '_____ you please show me the way to the baggage claim area?'",
        options: ["Could", "Are", "Do", "Have"],
        answer: 0,
        explain: "'Could you please + V' là cấu trúc chuẩn để đưa ra lời yêu cầu chỉ đường lịch sự tại sân bay.",
      },
      {
        topic: "Trải nghiệm du lịch",
        question: "Chọn câu đúng: 'I _____ to London twice, but I _____ there last year.'",
        options: [
          "have been / went",
          "went / have been",
          "am / was",
          "have gone / had gone",
        ],
        answer: 0,
        explain: "Vế đầu diễn tả trải nghiệm đến nay dùng thì Hiện tại hoàn thành ('have been'), vế sau có mốc thời gian cụ thể 'last year' nên dùng Quá khứ đơn 'went'.",
      },
      {
        topic: "Xin phép lịch sự",
        question: "Chọn từ thích hợp: 'Excuse me, _____ I take this seat near the window?'",
        options: ["May", "Must", "Should", "Would"],
        answer: 0,
        explain: "'May I + V' là cấu trúc trang trọng và lịch sự nhất dùng để xin phép làm một hành động.",
      },
      {
        topic: "Yêu cầu lịch sự",
        question: "Chọn dạng đúng của động từ: 'Would you mind _____ my heavy luggage for a moment?'",
        options: ["holding", "hold", "held", "to hold"],
        answer: 0,
        explain: "Sau 'Would you mind' bắt buộc dùng động từ ở dạng V-ing ('holding').",
      },
    ],
  },
  "tieng-anh-chuyen-nganh-it": {
    set: {
      id: "tieng-anh-chuyen-nganh-it",
      name: "Ngữ pháp Tiếng Anh IT & Kỹ Thuật",
    },
    questions: [
      {
        topic: "Câu điều kiện",
        question: "If user authentication _____, the server will redirect to the login page.",
        options: ["fails", "will fail", "failed", "failing"],
        answer: 0,
        explain: "Mệnh đề If trong câu điều kiện loại 1 chia ở thì Hiện tại đơn: 'fails'.",
      },
      {
        topic: "Câu bị động",
        question: "The new microservice architecture _____ by our engineering team last month.",
        options: ["was deployed", "deployed", "is deployed", "has been deployed"],
        answer: 0,
        explain: "Câu bị động ở quá khứ đơn có mốc 'last month': was/were + V3/ed -> 'was deployed'.",
      },
    ],
  },
};

const defaultGrammarQuestions: { set: { id: string | number; name: string }; questions: GrammarQuestion[] } = {
  set: {
    id: "co-ban",
    name: "Ngữ pháp Tiếng Anh Trọng Tâm",
  },
  questions: [
    {
      topic: "Hiện tại đơn",
      question: "My father _____ coffee every morning before going to work.",
      options: ["drinks", "drink", "drinking", "is drinking"],
      answer: 0,
      explain: "Chủ ngữ 'My father' là ngôi thứ 3 số ít, diễn tả thói quen nên động từ chia 'drinks'.",
    },
    {
      topic: "So sánh hơn",
      question: "This learning method is _____ than traditional rote memorization.",
      options: ["more effective", "effective", "most effective", "effectiver"],
      answer: 0,
      explain: "'Effective' là tính từ dài nên dạng so sánh hơn là 'more effective'.",
    },
    {
      topic: "Câu bị động",
      question: "The new bridge _____ by the construction company last year.",
      options: ["was built", "built", "is built", "has built"],
      answer: 0,
      explain: "Câu bị động ở thì quá khứ đơn ('last year') có dạng: was/were + V3/ed -> 'was built'.",
    },
  ],
};

const StudyGrammarTestPage = () => {
  const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
  const navigate = useNavigate();

  const data = (slug && mockGrammarQuestionsMap[slug]) || defaultGrammarQuestions;
  const { set, questions } = data;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const answered = Object.keys(answers).length;

  const score = useMemo(() => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correctCount++;
      }
    });
    return correctCount;
  }, [answers, questions]);

  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backUrl = folderSlug && slug
    ? `/folders/${folderSlug}/${slug}/grammar`
    : `/studyset/${slug || "tieng-anh-du-lich"}/grammar`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-10 max-w-[1080px] w-full mx-auto animate-fadeIn">
          <div className="space-y-6">
            {/* 1. Breadcrumbs Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to={backUrl}
                className="inline-flex items-center gap-2 font-semibold hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> {set.name}
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground">Kiểm tra</span>
            </div>

            {/* 2. Hero Header & Tiến Độ */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold sm:text-[28px] font-display text-foreground tracking-tight">
                    Kiểm tra: {set.name}
                  </h1>
                  <Pill tone="info">{questions.length} câu</Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Chọn đáp án đúng cho từng câu, sau đó nộp bài để xem điểm và giải thích.
                </p>
              </div>

              <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{submitted ? "Kết quả" : "Đã trả lời"}</span>
                  <span className="text-primary font-bold">
                    {submitted ? `${score}/${questions.length}` : `${answered}/${questions.length}`}
                  </span>
                </div>
                <div className="mt-3">
                  <Progress
                    value={submitted ? percent : Math.round((answered / questions.length) * 100)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Banner Kết Quả (Khi đã nộp bài) */}
            {submitted ? (
              <section className="surface-card flex flex-wrap items-center gap-4 p-5 rounded-3xl border border-border shadow-xs animate-fadeIn">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-2xs">
                  <Trophy className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-foreground">
                    Bạn đúng {score}/{questions.length} câu ({percent}%)
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {percent >= 80
                      ? "Rất tốt! Bạn đã nắm vững các chủ điểm ngữ pháp này."
                      : percent >= 50
                      ? "Khá ổn, hãy xem lại các câu sai để chắc kiến thức hơn."
                      : "Hãy học lại lý thuyết rồi kiểm tra lại nhé."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-5 text-sm font-bold transition hover:bg-muted cursor-pointer active:scale-95 text-foreground shadow-2xs"
                >
                  <RotateCcw className="h-4 w-4" /> Làm lại
                </button>
              </section>
            ) : null}

            {/* 4. Tiêu Đề Danh Sách Câu Hỏi */}
            <SectionTitle title="Câu hỏi" badge={`${questions.length}`} />

            {/* 5. Danh Sách Câu Hỏi */}
            <div className="space-y-4">
              {questions.map((q, qi) => {
                const picked = answers[qi];
                return (
                  <article key={`${q.topic}-${qi}`} className="surface-card p-6 rounded-3xl border border-border shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                        {qi + 1}
                      </span>
                      <Pill tone="muted">{q.topic}</Pill>
                    </div>

                    <p className="text-base font-bold text-foreground leading-relaxed">{q.question}</p>

                    <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                      {q.options.map((o, i) => {
                        const isPicked = picked === i;
                        const isAnswer = i === q.answer;
                        const state = !submitted
                          ? isPicked
                            ? "border-primary bg-primary-soft text-primary font-bold shadow-xs"
                            : "border-border bg-card hover:border-primary/50 text-foreground"
                          : isAnswer
                          ? "border-success bg-success-soft text-success font-bold"
                          : isPicked
                          ? "border-destructive bg-destructive/10 text-destructive font-semibold"
                          : "border-border bg-card opacity-60 text-muted-foreground";

                        return (
                          <button
                            key={o}
                            type="button"
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: i }))}
                            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition cursor-pointer select-none ${state}`}
                          >
                            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="min-w-0 flex-1">{o}</span>
                            {submitted && isAnswer ? (
                              <CheckCircle2 className="h-4 w-4 flex-none text-success" />
                            ) : null}
                            {submitted && isPicked && !isAnswer ? (
                              <XCircle className="h-4 w-4 flex-none text-destructive" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lời giải thích khi đã nộp bài */}
                    {submitted ? (
                      <div className="mt-3 rounded-2xl bg-muted/60 border border-border p-4 text-sm animate-fadeIn">
                        <p className="font-bold flex items-center gap-1.5">
                          {picked === q.answer ? (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác!
                            </span>
                          ) : (
                            <span className="text-destructive flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Chưa đúng.
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{q.explain}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {/* 6. Nút Nộp Bài (Khi chưa nộp) */}
            {!submitted ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={answered === 0}
                  onClick={() => {
                    setSubmitted(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-pop cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4" /> Nộp bài
                </button>
                <span className="text-xs text-muted-foreground font-medium">
                  {questions.length - answered > 0
                    ? `Còn ${questions.length - answered} câu chưa trả lời`
                    : "Đã hoàn thành toàn bộ câu hỏi"}
                </span>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyGrammarTestPage;
