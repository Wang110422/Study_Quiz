import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Layers,
  FileCheck2,
  Brain,
  FileText,
  PenTool,
  BookMarked,
  Star,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import VocaHeader from "@/components/vocalearn/layout/VocaHeader";
import VocaSidebar from "@/components/vocalearn/layout/VocaSidebar";
import {
  Progress,
  Pill,
  BtnPrimary,
  BtnOutline,
  EmojiTile,
} from "@/components/app/ui-bits";
import { SectionTitle } from "@/components/app/PageHeader";
import { useVocal } from "@/hooks/useVocal";
import { fetchDbItemProgress, type PathItemProgress } from "@/utils/pathProgress";

interface SetMetaInfo {
  title: string;
  description: string;
  emoji?: string;
  folderTitle?: string;
  folderSlug?: string;
  updated?: string;
  terms: {
    id?: number;
    word: string;
    vi: string;
    ipa?: string;
    pos?: string;
    cefr?: string;
    example?: string;
    synonyms?: string;
  }[];
}

const studySetTitlesMap: Record<string, SetMetaInfo> = {
  "tieng-anh-du-lich": {
    title: "Tiếng Anh Du Lịch",
    description: "45 từ vựng giao tiếp thiết yếu khi đi sân bay, khách sạn và nhà hàng nước ngoài.",
    emoji: "✈️",
    folderTitle: "Tiếng Anh Giao Tiếp",
    folderSlug: "tieng-anh",
    updated: "hôm nay",
    terms: [
      { word: "Boarding pass", vi: "Thẻ lên máy bay", ipa: "/ˈbɔː.dɪŋ ˌpɑːs/", pos: "noun", cefr: "B1", example: "Please show your boarding pass at gate 4." },
      { word: "Luggage allowance", vi: "Hành lý miễn cước quy định", ipa: "/ˈlʌɡ.ɪdʒ əˌlaʊ.əns/", pos: "noun", cefr: "B2", example: "The luggage allowance is 23kg per passenger." },
      { word: "Customs declaration", vi: "Tờ khai hải quan", ipa: "/ˈkʌs.təmz ˌdek.ləˈreɪ.ʃən/", pos: "noun", cefr: "B2", example: "Fill out this customs declaration form before arriving." },
      { word: "Reservation", vi: "Đặt chỗ trước", ipa: "/ˌrez.əˈveɪ.ʃən/", pos: "noun", cefr: "A2", example: "I have a reservation under the name Lan Anh." },
      { word: "Itinerary", vi: "Lịch trình chuyến đi", ipa: "/aɪˈtɪn.ər.ər.i/", pos: "noun", cefr: "B1", example: "Here is our travel itinerary for 5 days in Tokyo." },
    ],
  },
  "tieng-anh-chuyen-nganh-it": {
    title: "Tiếng Anh Chuyên ngành IT",
    description: "Các thuật ngữ kỹ thuật phổ biến dành cho lập trình viên và kỹ sư phần mềm.",
    emoji: "💻",
    folderTitle: "Công Nghệ Thông Tin",
    folderSlug: "tieng-anh",
    updated: "hôm qua",
    terms: [
      { word: "Repository", vi: "Kho lưu trữ mã nguồn (Git)", ipa: "/rɪˈpɒz.ɪ.tər.i/", pos: "noun", cefr: "B2", example: "Clone the repository to your local computer." },
      { word: "Deployment", vi: "Triển khai phần mềm lên máy chủ", ipa: "/dɪˈplɔɪ.mənt/", pos: "noun", cefr: "B2", example: "Automated deployment reduces manual errors." },
      { word: "Authentication", vi: "Xác thực người dùng (Đăng nhập)", ipa: "/ɔːˌθen.tɪˈkeɪ.ʃən/", pos: "noun", cefr: "B2", example: "JWT is widely used for API authentication." },
      { word: "Asynchronous", vi: "Bất đồng bộ (không chờ đợi)", ipa: "/eɪˈsɪŋ.krə.nəs/", pos: "adjective", cefr: "C1", example: "Promises handle asynchronous operations in JS." },
    ],
  },
};

const defaultSetInfo: SetMetaInfo = {
  title: "Từ vựng học phần",
  description: "Danh sách từ vựng và thuật ngữ ôn tập chuẩn ghi nhớ lâu dài.",
  emoji: "📚",
  folderTitle: "Thư mục từ vựng",
  folderSlug: "tieng-anh",
  updated: "2 ngày trước",
  terms: [
    { word: "hello", vi: "xin chào", ipa: "/həˈloʊ/", pos: "interjection", cefr: "A1", example: "Hello, how are you?" },
    { word: "Accommodation", vi: "Chỗ ở, nơi ở tiện nghi", ipa: "/əˌkɒm.əˈdeɪ.ʃən/", pos: "noun", cefr: "B1", example: "The hotel provides comfortable accommodation." },
    { word: "Perspective", vi: "Góc nhìn, quan điểm", ipa: "/pəˈspek.tɪv/", pos: "noun", cefr: "B2", example: "Try to see the problem from a different perspective." },
    { word: "Efficiency", vi: "Hiệu suất, năng suất làm việc", ipa: "/ɪˈfɪʃ.ən.si/", pos: "noun", cefr: "B2", example: "Automation improves work efficiency." },
  ],
};

const modes = [
  { id: "flashcards", name: "Thẻ ghi nhớ", desc: "Lật thẻ & ghi nhớ từ", icon: Layers, pathSuffix: "/flashcards" },
  { id: "learn", name: "Học", desc: "Lộ trình học thông minh", icon: Brain, pathSuffix: "/learn" },
  { id: "test", name: "Kiểm tra", desc: "Bài test trắc nghiệm & tự luận", icon: FileText, pathSuffix: "/test" },
  { id: "reading", name: "Đọc hiểu", desc: "Luyện đọc đoạn văn", icon: BookMarked, pathSuffix: "/reading" },
];

const FlashCardDetailPage = () => {
  const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { vocabularyList, deleteVocabulary } = useVocal(slug || "");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>("flashcards");
  const [starredTerms, setStarredTerms] = useState<Set<string | number>>(new Set());

  const setMeta = (slug && studySetTitlesMap[slug]) || defaultSetInfo;
  const pathItemId = location.state?.pathItemId;

  const [dbProgress, setDbProgress] = useState<PathItemProgress>({
    completedLearnCount: 0,
    completedTestCount: 0,
    targetLearnCount: location.state?.targetLearnCount || 3,
    targetTestCount: location.state?.targetTestCount || 3,
    isCompleted: false,
  });

  useEffect(() => {
    if (pathItemId) {
      fetchDbItemProgress(pathItemId).then((res) => {
        setDbProgress(res);
      });
    }
  }, [pathItemId]);

  // Chuẩn hóa danh sách từ vựng từ database (useVocal) hoặc fallback
  const words = React.useMemo(() => {
    if (vocabularyList && vocabularyList.length > 0) {
      return vocabularyList.map((v: any, idx: number) => ({
        id: v.id,
        word: v.term || v.word || `Term ${idx + 1}`,
        vi: v.definition || v.vi || v.meaning || "Đang cập nhật nghĩa",
        ipa: v.ipa || "",
        pos: v.pos || v.partOfSpeech || "noun",
        cefr: v.level || v.cefr || (v.pos ? v.pos.toUpperCase() : "B1"),
        example: v.example || "No example sentence provided.",
        synonyms: v.synonyms || v.hint || "",
      }));
    }
    return setMeta.terms;
  }, [vocabularyList, setMeta.terms]);

  const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || "tieng-anh-du-lich"}`;
  const card = words[index] || words[0] || { word: "...", vi: "...", ipa: "", pos: "", cefr: "", example: "" };

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((prev) => {
      const next = prev + delta;
      if (next < 0) return words.length - 1;
      if (next >= words.length) return 0;
      return next;
    });
  };

  const toggleStar = (key: string | number) => {
    setStarredTerms((prev) => {
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

  // Tính số lượng từ đã thuộc
  const learned = Math.min(words.length, Math.max(1, Math.round(words.length * (dbProgress.isCompleted ? 1 : 0.6))));
  const isCardStarred = starredTerms.has(card.id || card.word);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-10 max-w-[1280px] w-full mx-auto animate-fadeIn">
          <div className="space-y-6">
            {/* 1. Breadcrumbs Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                to="/folders"
                className="inline-flex items-center gap-2 font-semibold hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Thư viện của bạn
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground truncate">{setMeta.title}</span>
            </div>

            {/* 2. Hero Header */}
            <div className="flex flex-wrap items-start gap-4">
              <EmojiTile>{setMeta.emoji || "📚"}</EmojiTile>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold sm:text-[28px] font-display text-foreground tracking-tight">
                    {setMeta.title}
                  </h1>
                  {setMeta.folderTitle ? <Pill tone="muted">{setMeta.folderTitle}</Pill> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {setMeta.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <BtnOutline
                  onClick={() => navigate(`${basePath}/test`, { state: { ...location.state, pathItemId } })}
                  className="cursor-pointer"
                >
                  <FileCheck2 className="h-4 w-4" /> Kiểm tra
                </BtnOutline>
                <BtnPrimary
                  onClick={() => navigate(`${basePath}/learn`, { state: { ...location.state, pathItemId } })}
                  className="cursor-pointer shadow-pop"
                >
                  <BookOpen className="h-4 w-4" /> Học ngay
                </BtnPrimary>
              </div>
            </div>

            {/* 3. Card Tiến Độ Bộ Thẻ */}
            <section className="surface-card p-5 rounded-3xl border border-border shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Tiến độ bộ thẻ</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Đã thuộc {learned}/{words.length} thuật ngữ · cập nhật {setMeta.updated || "gần đây"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Pill tone="success">Đã thuộc {learned}</Pill>
                  <Pill tone="warning">Cần ôn {Math.min(words.length - learned, 2)}</Pill>
                  <Pill tone="info">Chưa học {Math.max(0, words.length - learned - 2)}</Pill>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={words.length > 0 ? Math.round((learned / words.length) * 100) : 0} />
              </div>
            </section>

            {/* 4. Grid Các Chế Độ Học (Modes) */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {modes.map((m) => {
                const Icon = m.icon;
                const active = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMode(m.id);
                      navigate(`${basePath}${m.pathSuffix}`, { state: { ...location.state, pathItemId } });
                    }}
                    className={`surface-card flex items-center gap-3 p-4 text-left rounded-3xl border transition cursor-pointer select-none ${active
                        ? "border-primary ring-2 ring-primary/25 bg-card shadow-xs"
                        : "border-border hover:border-primary/40"
                      }`}
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-2xs">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-foreground line-clamp-1">{m.name}</span>
                      <span className="block text-xs text-muted-foreground line-clamp-1">{m.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 5. Tiêu Đề Thẻ Ghi Nhớ */}
            <SectionTitle
              icon={Layers}
              title="Thẻ ghi nhớ"
              badge={`${index + 1}/${words.length}`}
            />

            {/* 6. Card Lật Thẻ Tương Tác 3D */}
            <div className="surface-card p-5 sm:p-7 rounded-3xl border border-border shadow-2xs">
              <div className="w-full [perspective:1400px]">
                <div
                  onClick={() => setFlipped((f) => !f)}
                  className={`relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[440px] rounded-3xl transition-transform duration-600 ease-in-out [transform-style:preserve-3d] cursor-pointer select-none ${flipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                >
                  {/* MẶT TRƯỚC (FRONT) */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center gap-3.5 p-6 sm:p-10 text-center rounded-3xl border border-border bg-muted/40 hover:border-primary/40 shadow-xs transition-colors">
                    <p className="font-display text-[32px] sm:text-[36px] font-bold text-foreground tracking-tight">{card.word}</p>
                    {card.ipa ? <p className="text-[16px] sm:text-[17px] text-muted-foreground font-mono font-medium">{card.ipa}</p> : null}
                    <div className="flex gap-2.5 pt-0.5">
                      {card.cefr ? <Pill tone="info" className="text-[13px] px-3 py-1 font-semibold">{card.cefr}</Pill> : null}
                      {card.pos ? <Pill tone="muted" className="text-[13px] px-3 py-1 font-semibold">{card.pos}</Pill> : null}
                    </div>
                  </div>

                  {/* MẶT SAU (BACK) */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center gap-3.5 p-6 sm:p-10 text-center rounded-3xl border border-border bg-muted/40 shadow-xs">
                    <p className="text-[23px] sm:text-[25px] font-bold text-foreground">{card.vi}</p>
                    {card.example ? (
                      <p className="max-w-xl text-[16px] sm:text-[17px] text-muted-foreground italic font-serif leading-relaxed">
                        “{card.example}”
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Thanh Điều Khiển Thẻ Ghi Nhớ */}
              <div className="mt-5 flex items-center justify-between gap-3 px-2">
                <button
                  type="button"
                  aria-label="Thẻ trước"
                  onClick={() => go(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:bg-muted cursor-pointer shadow-2xs"
                  title="Thẻ trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Phát âm"
                    onClick={() => playAudio(card.word)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer shadow-2xs"
                    title="Nghe phát âm chuẩn"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Lưu từ"
                    onClick={() => toggleStar(card.id || card.word)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition cursor-pointer shadow-2xs ${isCardStarred
                        ? "text-warning bg-warning-soft border-warning/40"
                        : "text-muted-foreground hover:bg-warning-soft hover:text-warning"
                      }`}
                    title={isCardStarred ? "Bỏ lưu từ" : "Lưu từ yêu thích"}
                  >
                    <Star className={`h-4 w-4 ${isCardStarred ? "fill-warning" : ""}`} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Thẻ sau"
                  onClick={() => go(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:bg-muted cursor-pointer shadow-2xs"
                  title="Thẻ tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 7. Tiêu Đề Danh Sách Thuật Ngữ */}
            <SectionTitle icon={BookOpen} title="Danh sách thuật ngữ" badge={String(words.length)} />

            {/* 8. Grid 2 Cột Danh Sách Thuật Ngữ */}
            <div className="grid gap-3 lg:grid-cols-2">
              {words.map((w, i) => {
                const isSelected = i === index;
                const isItemStarred = starredTerms.has(w.id || w.word);

                return (
                  <article
                    key={w.word + i}
                    onClick={() => {
                      setIndex(i);
                      setFlipped(false);
                    }}
                    className={`surface-card flex items-start gap-4 p-4 rounded-3xl border transition cursor-pointer group ${isSelected ? "border-primary ring-2 ring-primary/20 shadow-xs" : "border-border hover:border-primary/40"
                      }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground text-base tracking-tight">{w.word}</h3>
                        {w.ipa ? (
                          <span className="text-xs text-muted-foreground font-mono">{w.ipa}</span>
                        ) : null}
                        {w.cefr ? <Pill tone="info">{w.cefr}</Pill> : null}
                        {w.pos ? <Pill tone="muted">{w.pos}</Pill> : null}
                      </div>
                      <p className="text-sm font-medium text-foreground/90">{w.vi}</p>
                      {w.example ? (
                        <p className="text-xs text-muted-foreground italic font-serif">“{w.example}”</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Phát âm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(w.word);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        aria-label="Lưu từ"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(w.id || w.word);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer ${isItemStarred ? "text-warning" : "text-muted-foreground hover:text-warning"
                          }`}
                        title="Đánh dấu sao"
                      >
                        <Star className={`h-4 w-4 ${isItemStarred ? "fill-warning" : ""}`} />
                      </button>

                      {w.id && (
                        <button
                          type="button"
                          aria-label="Xóa từ"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Chuyển từ vựng "${w.word}" vào Thùng Rác?`)) {
                              await deleteVocabulary(w.id);
                            }
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Xóa từ vựng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FlashCardDetailPage;
