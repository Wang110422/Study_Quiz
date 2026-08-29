import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ListChecks,
  Quote,
  Lightbulb,
  BookOpenText,
  ChevronRight,
  Volume2,
  Star,
  Loader2,
} from "lucide-react";
import VocaHeader from "@/components/vocalearn/layout/VocaHeader";
import VocaSidebar from "@/components/vocalearn/layout/VocaSidebar";
import {
  Progress,
  Pill,
  EmojiTile,
} from "@/components/app/ui-bits";
import { SectionTitle } from "@/components/app/PageHeader";
import grammarService, { type GrammarSetDTO, type GrammarDTO } from "@/services/grammarService";

interface TopicItem {
  id: number | string;
  name: string;
  formula: string;
  usage: string[];
  examples: { en: string; vi: string }[];
  notes: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explain: string;
  };
}

const mockGrammarSetsMap: Record<string, { set: { id: string | number; name: string; emoji: string; level: string; overview: string }; topics: TopicItem[] }> = {
  "tieng-anh-du-lich": {
    set: {
      id: "tieng-anh-du-lich",
      name: "Ngữ pháp Tiếng Anh Du Lịch",
      emoji: "✈️",
      level: "B1 - B2",
      overview: "Tổng hợp các cấu trúc câu giao tiếp, hỏi thông tin, đề xuất và đưa ra yêu cầu lịch sự khi đi du lịch quốc tế.",
    },
    topics: [
      {
        id: 1,
        name: "Cấu trúc đưa ra yêu cầu lịch sự (Could / Would you...)",
        formula: "Could / Would you (please) + V(bare) + O...?",
        usage: [
          "Dùng khi muốn nhờ vả hoặc đưa ra yêu cầu một cách trang trọng, lịch thiệp.",
          "Thường dùng tại quầy làm thủ tục check-in sân bay, khách sạn hoặc nhà hàng.",
          "Trả lời đồng ý: 'Certainly, sir/madam' hoặc 'Sure, right away'.",
        ],
        examples: [
          { en: "Could you please check my boarding pass?", vi: "Bạn có thể kiểm tra thẻ lên máy bay giúp tôi được không?" },
          { en: "Would you mind helping me with this heavy suitcase?", vi: "Bạn có phiền giúp tôi mang chiếc vali nặng này không?" },
        ],
        notes: "Lưu ý: Sau 'Would you mind' dùng V-ing, còn sau 'Could / Would you' dùng động từ nguyên thể V(bare).",
        quiz: {
          question: "Điền vào chỗ trống: '_____ you please show me the way to the baggage claim area?'",
          options: ["Could", "Are", "Do", "Have"],
          answer: 0,
          explain: "'Could you please + V' là cấu trúc chuẩn để đưa ra lời yêu cầu chỉ đường lịch sự.",
        },
      },
      {
        id: 2,
        name: "Thì Hiện Tại Hoàn Thành diễn tả trải nghiệm (Have you ever...)",
        formula: "S + have/has + V3/ed + (ever/never)...",
        usage: [
          "Dùng để hỏi hoặc kể về những trải nghiệm du lịch đã từng hoặc chưa từng làm tính đến hiện tại.",
          "Dấu hiệu nhận biết phổ biến: ever, never, already, yet, several times.",
        ],
        examples: [
          { en: "Have you ever traveled to Japan during cherry blossom season?", vi: "Bạn đã từng du lịch Nhật Bản vào mùa hoa anh đào chưa?" },
          { en: "I have visited Tokyo three times so far.", vi: "Tôi đã đến thăm Tokyo ba lần tính đến nay." },
        ],
        notes: "Khi nêu rõ mốc thời gian cụ thể trong quá khứ (ví dụ: in 2023, last year), phải chuyển sang dùng Thì Quá khứ đơn.",
        quiz: {
          question: "Chọn câu đúng: 'I _____ to London twice, but I _____ there last year.'",
          options: [
            "have been / went",
            "went / have been",
            "am / was",
            "have gone / had gone"
          ],
          answer: 0,
          explain: "Vế đầu diễn tả trải nghiệm đến nay ('have been twice'), vế sau có mốc thời gian 'last year' nên dùng quá khứ đơn 'went'.",
        },
      },
      {
        id: 3,
        name: "Cấu trúc hỏi xin phép (May I / Can I...)",
        formula: "May / Can I + V(bare) + please?",
        usage: [
          "Dùng khi muốn xin phép làm một hành động nào đó trong khu vực dịch vụ.",
          "'May I' mang sắc thái trang trọng, lịch sự hơn 'Can I'.",
        ],
        examples: [
          { en: "May I have a window seat, please?", vi: "Tôi có thể đổi sang ghế cạnh cửa sổ được không?" },
          { en: "Can I leave my luggage here until 2 PM?", vi: "Tôi có thể gửi hành lý ở đây tới 2 giờ chiều được không?" },
        ],
        notes: "Trong các tình huống trang trọng tại hải quan hoặc thủ tục xuất nhập cảnh, nên ưu tiên dùng 'May I'.",
        quiz: {
          question: "Chọn từ thích hợp: 'Excuse me, _____ I take this seat?'",
          options: ["May", "Must", "Should", "Would"],
          answer: 0,
          explain: "'May I + V' là cấu trúc chuẩn để xin phép ngồi vào một ghế trống một cách lịch sự.",
        },
      },
    ],
  },
  "tieng-anh-chuyen-nganh-it": {
    set: {
      id: "tieng-anh-chuyen-nganh-it",
      name: "Ngữ pháp Tiếng Anh IT & Kỹ Thuật",
      emoji: "💻",
      level: "B2 - C1",
      overview: "Các cấu trúc câu điều kiện, câu bị động và mệnh đề quan hệ rút gọn chuyên sâu trong tài liệu kỹ thuật phần mềm.",
    },
    topics: [
      {
        id: 1,
        name: "Câu điều kiện loại 1 trong mô tả luồng phần mềm",
        formula: "If + S + V(hiện tại đơn), S + will/can + V(bare)",
        usage: [
          "Mô tả hành vi của hệ thống khi một điều kiện logic hoặc sự kiện người dùng xảy ra.",
          "Thường dùng trong viết Unit Test, User Stories và tài liệu API.",
        ],
        examples: [
          { en: "If the token is invalid, the API will return a 401 Unauthorized status.", vi: "Nếu mã token không hợp lệ, API sẽ trả về mã lỗi 401 Unauthorized." },
          { en: "If the database connection fails, the app can automatically retry.", vi: "Nếu kết nối cơ sở dữ liệu thất bại, ứng dụng có thể tự động thử lại." },
        ],
        notes: "Trong tài liệu kỹ thuật có thể thay 'If' bằng 'When' hoặc 'Whenever' để nhấn mạnh tính định kỳ.",
        quiz: {
          question: "If user authentication _____, the server will redirect to the login page.",
          options: ["fails", "will fail", "failed", "failing"],
          answer: 0,
          explain: "Mệnh đề If trong câu điều kiện loại 1 dùng thì Hiện tại đơn: 'fails'.",
        },
      },
    ],
  },
};

const defaultSet = {
  id: "co-ban",
  name: "Ngữ pháp Tiếng Anh Trọng Tâm",
  emoji: "📐",
  level: "A2 - B1",
  overview: "Bộ bài học cấu trúc ngữ pháp then chốt giúp bạn tự tin giao tiếp và làm bài thi chuẩn format quốc tế.",
};

const defaultTopics: TopicItem[] = [
  {
    id: 1,
    name: "Thì Hiện Tại Đơn (Present Simple)",
    formula: "S + V(s/es) + O / S + do/does not + V(bare)",
    usage: [
      "Diễn tả chân lý, sự thật hiển nhiên hoặc quy luật tự nhiên.",
      "Diễn tả thói quen, hành động lặp đi lặp lại có tính chu kỳ.",
      "Diễn tả lịch trình, thời gian biểu cố định (tàu xe, máy bay, lịch học).",
    ],
    examples: [
      { en: "The sun rises in the east and sets in the west.", vi: "Mặt trời mọc ở hướng đông và lặn ở hướng tây." },
      { en: "She practices English vocabulary every morning.", vi: "Cô ấy luyện từ vựng tiếng Anh vào mỗi buổi sáng." },
    ],
    notes: "Chú ý quy tắc thêm -s/-es sau các động từ tận cùng bằng o, s, z, ch, x, sh.",
    quiz: {
      question: "My father _____ coffee every morning before going to work.",
      options: ["drinks", "drink", "drinking", "is drinking"],
      answer: 0,
      explain: "Chủ ngữ 'My father' là ngôi thứ 3 số ít, diễn tả thói quen nên động từ thêm s: 'drinks'.",
    },
  },
  {
    id: 2,
    name: "Cấu trúc So sánh hơn của Tính từ (Comparative Adjectives)",
    formula: "Ngắn: S1 + be + Adj-er + than + S2 / Dài: S1 + be + more + Adj + than + S2",
    usage: [
      "Dùng để so sánh đặc điểm, tính chất giữa 2 đối tượng hoặc 2 sự vật.",
      "Tính từ ngắn (1 âm tiết): thêm đuôi -er (fast -> faster, tall -> taller).",
      "Tính từ dài (2 âm tiết trở lên): thêm 'more' phía trước (more beautiful, more efficient).",
    ],
    examples: [
      { en: "Learning with flashcards is more effective than passive reading.", vi: "Học bằng thẻ ghi nhớ hiệu quả hơn đọc thụ động." },
      { en: "Today is colder than yesterday.", vi: "Hôm nay trời lạnh hơn hôm qua." },
    ],
    notes: "Bất quy tắc: good -> better, bad -> worse, far -> farther/further.",
    quiz: {
      question: "This laptop is _____ than my old one.",
      options: ["more powerful", "powerfuler", "most powerful", "powerfuller"],
      answer: 0,
      explain: "'Powerful' là tính từ dài 3 âm tiết nên dạng so sánh hơn là 'more powerful'.",
    },
  },
  {
    id: 3,
    name: "Câu Bị Động Cơ Bản (Passive Voice)",
    formula: "S + be + V3/ed + (by O)",
    usage: [
      "Dùng khi muốn nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người thực hiện.",
      "Dùng khi người thực hiện hành động không rõ hoặc không quan trọng.",
    ],
    examples: [
      { en: "English is spoken all over the world.", vi: "Tiếng Anh được nói trên toàn thế giới." },
      { en: "The report was completed yesterday by the project team.", vi: "Bản báo cáo đã được hoàn thành hôm qua bởi nhóm dự án." },
    ],
    notes: "Động từ 'be' chia theo thì của câu chủ động gốc và hòa hợp với chủ ngữ mới.",
    quiz: {
      question: "The new bridge _____ by the construction company last year.",
      options: ["was built", "built", "is built", "has built"],
      answer: 0,
      explain: "Câu bị động ở thì quá khứ đơn ('last year') có dạng: was/were + V3/ed -> 'was built'.",
    },
  },
];

const StudyGrammarPage = () => {
  const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState<(string | number)[]>([]);
  const [starredTopics, setStarredTopics] = useState<Set<string | number>>(new Set());

  const [grammarSetData, setGrammarSetData] = useState<{
    set: { id: string | number; name: string; emoji: string; level: string; overview: string };
    topics: TopicItem[];
  }>({
    set: defaultSet,
    topics: defaultTopics,
  });

  // Tải dữ liệu từ API hoặc mock map
  useEffect(() => {
    const fetchGrammar = async () => {
      if (!slug) return;
      if (mockGrammarSetsMap[slug]) {
        setGrammarSetData(mockGrammarSetsMap[slug]);
        return;
      }

      setLoading(true);
      try {
        const data: GrammarSetDTO | null = await grammarService.getGrammarSetBySlug(slug);
        if (data && data.grammars && data.grammars.length > 0) {
          const apiTopics: TopicItem[] = data.grammars.map((g: GrammarDTO, idx: number) => ({
            id: g.id || idx + 1,
            name: g.title || `Chủ điểm ${idx + 1}`,
            formula: g.structure || "Cấu trúc: S + V + O",
            usage: [g.explanation || "Giải thích cách sử dụng cấu trúc ngữ pháp này."],
            examples: [
              {
                en: g.example || "This is a sample sentence.",
                vi: "Đây là câu ví dụ minh họa ngữ cảnh.",
              },
            ],
            notes: g.note || "Hãy luyện tập thường xuyên để sử dụng tự nhiên.",
            quiz: {
              question: `Chọn cấu trúc chuẩn xác cho "${g.title}":`,
              options: [
                g.structure || "S + V + O",
                "S + will + V-ing",
                "S + have + V1",
                "S + is + being + Adj",
              ].sort(() => 0.5 - Math.random()),
              answer: 0,
              explain: `Cấu trúc chính xác là: ${g.structure || "S + V + O"}.`,
            },
          }));

          setGrammarSetData({
            set: {
              id: data.id,
              name: data.title,
              emoji: data.emoji || "📐",
              level: data.level || "B1",
              overview: data.description || "Bộ bài học ngữ pháp chuyên sâu.",
            },
            topics: apiTopics,
          });
        } else {
          setGrammarSetData({
            set: defaultSet,
            topics: defaultTopics,
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrammar();
  }, [slug]);

  const { set, topics } = grammarSetData;
  const topic = topics[index] || topics[0] || {
    id: 1,
    name: "...",
    formula: "...",
    usage: [],
    examples: [],
    notes: "...",
    quiz: { question: "...", options: [], answer: 0, explain: "..." },
  };

  const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}/grammar` : `/studyset/${slug || "tieng-anh-du-lich"}/grammar`;
  const pathItemId = location.state?.pathItemId;

  const select = (id: string | number) => {
    const foundIdx = topics.findIndex((t) => t.id === id);
    if (foundIdx !== -1) {
      setIndex(foundIdx);
      setPicked(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const complete = () => {
    if (!done.includes(topic.id)) {
      setDone((prev) => [...prev, topic.id]);
    }
    if (index < topics.length - 1) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleStar = (key: string | number) => {
    setStarredTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const percent = topics.length > 0 ? Math.round((done.length / topics.length) * 100) : 0;
  const correct = picked !== null && picked === topic.quiz.answer;
  const isTopicStarred = starredTopics.has(topic.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 font-semibold text-sm">Đang tải nội dung bài học ngữ pháp...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-10 max-w-[1360px] w-full mx-auto animate-fadeIn">
          <div className="space-y-6">
            {/* 1. Breadcrumbs Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to="/lessons"
                className="inline-flex items-center gap-2 font-semibold hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Bài học
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground truncate">{set.name}</span>
            </div>

            {/* 2. Hero Header */}
            <div className="flex flex-wrap items-start gap-4">
              <EmojiTile>{set.emoji}</EmojiTile>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold sm:text-[28px] font-display text-foreground tracking-tight">
                    {set.name}
                  </h1>
                  <Pill tone="info">{set.level}</Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {set.overview}
                </p>
              </div>

              {/* Nút Kiểm tra */}
              <button
                type="button"
                onClick={() => navigate(`${basePath}/test`, { state: { ...location.state, pathItemId } })}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-pop cursor-pointer active:scale-95"
              >
                <FileCheck2 className="h-4 w-4" /> Kiểm tra
              </button>

              {/* Card Tiến độ chủ điểm */}
              <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Tiến độ chủ điểm</span>
                  <span className="text-primary font-bold">{percent}%</span>
                </div>
                <div className="mt-3">
                  <Progress value={percent} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Đã hoàn thành {done.length}/{topics.length} chủ điểm
                </p>
              </div>
            </div>

            {/* 3. Layout 2 Cột: Sidebar Chủ điểm bên trái & Nội dung chi tiết bên phải */}
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              {/* CỘT TRÁI: DANH SÁCH CHỦ ĐIỂM */}
              <aside className="surface-card h-fit p-4 rounded-3xl border border-border shadow-2xs">
                <SectionTitle title="Chủ điểm" badge={`${topics.length}`} />
                <div className="mt-3 space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
                  {topics.map((t, i) => {
                    const active = t.id === topic.id;
                    const isDone = done.includes(t.id);

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => select(t.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition cursor-pointer ${
                          active
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg text-xs font-bold ${
                            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{t.name}</span>
                        {isDone ? (
                          <CheckCircle2 className={`h-4 w-4 flex-none ${active ? "text-primary-foreground" : "text-success"}`} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* CỘT PHẢI: NỘI DUNG CHI TIẾT & BÀI KIỂM TRA NHANH */}
              <div className="space-y-5">
                {/* 3.1 Card Chi Tiết Chủ Điểm Ngữ Pháp */}
                <article className="overflow-hidden rounded-3xl border border-border bg-muted/40 shadow-xs">
                  {/* Banner Header Primary */}
                  <div className="bg-primary px-6 py-5 text-primary-foreground relative">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                        Chủ điểm {index + 1}/{topics.length}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playAudio(topic.name)}
                          className="h-8 w-8 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center text-primary-foreground transition cursor-pointer"
                          title="Phát âm"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStar(topic.id)}
                          className="h-8 w-8 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 flex items-center justify-center text-primary-foreground transition cursor-pointer"
                          title="Lưu chủ điểm"
                        >
                          <Star className={`h-4 w-4 ${isTopicStarred ? "fill-warning text-warning" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold">{topic.name}</h2>
                    <div className="mt-3 rounded-2xl bg-primary-foreground/12 px-4 py-2.5 font-mono text-sm">
                      {topic.formula}
                    </div>
                  </div>

                  {/* Thân Nội Dung */}
                  <div className="space-y-5 p-6">
                    {/* Phần Cách Dùng */}
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <ListChecks className="h-4 w-4 text-primary" /> Cách dùng
                      </h3>
                      <div className="mt-3 space-y-2">
                        {topic.usage.map((u, uIdx) => (
                          <div
                            key={uIdx}
                            className="flex items-start gap-3 rounded-2xl bg-card border border-border/60 px-4 py-3 text-sm font-semibold shadow-2xs"
                          >
                            <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-none text-success" />
                            <span className="text-foreground/90">{u}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Phần Ví Dụ */}
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Quote className="h-4 w-4 text-primary" /> Ví dụ
                      </h3>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {topic.examples.map((e, eIdx) => (
                          <div key={eIdx} className="rounded-2xl bg-card border border-border/60 p-4 shadow-2xs space-y-1">
                            <p className="text-sm font-semibold text-foreground">{e.en}</p>
                            <p className="text-xs text-muted-foreground italic font-serif">{e.vi}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Phần Ghi Chú / Lưu Ý */}
                    {topic.notes && (
                      <section className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3.5 text-warning-foreground">
                        <Lightbulb className="mt-0.5 h-[18px] w-[18px] flex-none text-warning" />
                        <p className="text-sm font-semibold">{topic.notes}</p>
                      </section>
                    )}
                  </div>
                </article>

                {/* 3.2 Card Kiểm Tra Nhanh */}
                <article className="surface-card p-6 rounded-3xl border border-border shadow-2xs">
                  <SectionTitle title="Kiểm tra nhanh" badge="1 câu" />
                  <p className="mt-3 text-sm font-bold text-foreground">{topic.quiz.question}</p>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {topic.quiz.options.map((o, i) => {
                      const isPicked = picked === i;
                      const isAnswer = i === topic.quiz.answer;
                      const state =
                        picked === null
                          ? "border-border bg-card hover:border-primary cursor-pointer"
                          : isAnswer
                          ? "border-success bg-success-soft text-success"
                          : isPicked
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border bg-card opacity-50";

                      return (
                        <button
                          key={o}
                          type="button"
                          disabled={picked !== null}
                          onClick={() => setPicked(i)}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${state}`}
                        >
                          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-muted text-xs font-bold">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="min-w-0 flex-1">{o}</span>
                          {picked !== null && isAnswer ? (
                            <CheckCircle2 className="h-4 w-4 flex-none text-success" />
                          ) : null}
                          {picked !== null && isPicked && !isAnswer ? (
                            <XCircle className="h-4 w-4 flex-none text-destructive" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Lời Giải Thích Khi Đã Chọn Đáp Án */}
                  {picked !== null ? (
                    <div className="mt-4 rounded-2xl bg-muted/60 border border-border p-4 text-sm animate-fadeIn">
                      <p className="font-bold flex items-center gap-1.5">
                        {correct ? (
                          <span className="text-success flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Chính xác!
                          </span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Chưa đúng rồi.
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{topic.quiz.explain}</p>
                    </div>
                  ) : null}

                  {/* Nút Hoàn Thành & Tiếp Tục / Làm Lại */}
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={complete}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-pop cursor-pointer active:scale-95"
                    >
                      <BookOpenText className="h-4 w-4" />
                      {index === topics.length - 1 ? "Hoàn thành bộ" : "Hoàn thành & học tiếp"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPicked(null)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-5 text-sm font-bold transition hover:bg-muted cursor-pointer active:scale-95 text-foreground"
                    >
                      Làm lại câu hỏi
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudyGrammarPage;
