import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Volume2,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { StudyModeHeader } from '@/components/features/study/StudyModeHeader';
import { Pill, Progress } from '@/components/app/ui-bits';
import { useVocal } from '@/hooks/useVocal';

interface StudySetData {
  title: string;
  terms: {
    id?: number;
    word: string;
    vi: string;
    ipa?: string;
    pos?: string;
    cefr?: string;
    example?: string;
  }[];
}

const studySetTitlesMap: Record<string, StudySetData> = {
  'tieng-anh-du-lich': {
    title: 'Tiếng Anh Du Lịch',
    terms: [
      { word: 'Boarding pass', vi: 'Thẻ lên máy bay', ipa: '/ˈbɔː.dɪŋ ˌpɑːs/', pos: 'noun', cefr: 'B1', example: 'Please show your boarding pass at gate 4.' },
      { word: 'Luggage allowance', vi: 'Hành lý miễn cước quy định', ipa: '/ˈlʌɡ.ɪdʒ əˌlaʊ.əns/', pos: 'noun', cefr: 'B2', example: 'The luggage allowance is 23kg per passenger.' },
      { word: 'Customs declaration', vi: 'Tờ khai hải quan', ipa: '/ˈkʌs.təmz ˌdek.ləˈreɪ.ʃən/', pos: 'noun', cefr: 'B2', example: 'Fill out this customs declaration form before arriving.' },
      { word: 'Reservation', vi: 'Đặt chỗ trước', ipa: '/ˌrez.əˈveɪ.ʃən/', pos: 'noun', cefr: 'A2', example: 'I have a reservation under the name Lan Anh.' },
      { word: 'Itinerary', vi: 'Lịch trình chuyến đi', ipa: '/aɪˈtɪn.ər.ər.i/', pos: 'noun', cefr: 'B1', example: 'Here is our travel itinerary for 5 days in Tokyo.' },
    ],
  },
  'tieng-anh-chuyen-nganh-it': {
    title: 'Tiếng Anh Chuyên ngành IT',
    terms: [
      { word: 'Repository', vi: 'Kho lưu trữ mã nguồn (Git)', ipa: '/rɪˈpɒz.ɪ.tər.i/', pos: 'noun', cefr: 'B2', example: 'Clone the repository to your local computer.' },
      { word: 'Deployment', vi: 'Triển khai phần mềm lên máy chủ', ipa: '/dɪˈplɔɪ.mənt/', pos: 'noun', cefr: 'B2', example: 'Automated deployment reduces manual errors.' },
      { word: 'Authentication', vi: 'Xác thực người dùng (Đăng nhập)', ipa: '/ɔːˌθen.tɪˈkeɪ.ʃən/', pos: 'noun', cefr: 'B2', example: 'JWT is widely used for API authentication.' },
      { word: 'Asynchronous', vi: 'Bất đồng bộ (không chờ đợi)', ipa: '/eɪˈsɪŋ.krə.nəs/', pos: 'adjective', cefr: 'C1', example: 'Promises handle asynchronous operations in JS.' },
    ],
  },
};

const defaultTerms = [
  { word: 'Accommodation', vi: 'Chỗ ở, nơi ở tiện nghi', ipa: '/əˌkɒm.əˈdeɪ.ʃən/', pos: 'noun', cefr: 'B1', example: 'The hotel provides comfortable accommodation.' },
  { word: 'Perspective', vi: 'Góc nhìn, quan điểm', ipa: '/pəˈspek.tɪv/', pos: 'noun', cefr: 'B2', example: 'Try to see the problem from a different perspective.' },
  { word: 'Efficiency', vi: 'Hiệu suất, năng suất làm việc', ipa: '/ɪˈfɪʃ.ən.si/', pos: 'noun', cefr: 'B2', example: 'Automation improves work efficiency.' },
];

const StudyFlashcardsPage = () => {
  const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [starredTerms, setStarredTerms] = useState<Set<string | number>>(new Set());
  const { vocabularyList } = useVocal(slug || '');

  const setMeta = (slug && studySetTitlesMap[slug]) || { title: 'Từ vựng học phần', terms: defaultTerms };

  // Chuẩn hóa danh sách từ vựng từ database (useVocal) hoặc fallback
  const words = React.useMemo(() => {
    if (vocabularyList && vocabularyList.length > 0) {
      return vocabularyList.map((v: any, idx: number) => ({
        id: v.id,
        word: v.term || v.word || `Term ${idx + 1}`,
        vi: v.definition || v.vi || v.meaning || 'Đang cập nhật nghĩa',
        ipa: v.ipa || '',
        pos: v.pos || v.partOfSpeech || 'noun',
        cefr: v.level || v.cefr || (v.pos ? v.pos.toUpperCase() : 'B1'),
        example: v.example || 'No example sentence provided.',
      }));
    }
    return setMeta.terms;
  }, [vocabularyList, setMeta.terms]);

  const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;
  const card = words[currentCardIndex] || words[0] || { word: '...', vi: '...', ipa: '', pos: '', cefr: '', example: '' };

  const handleNextCard = () => {
    setFlipped(false);
    if (currentCardIndex < words.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    setFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else {
      setCurrentCardIndex(words.length - 1);
    }
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Bắt sự kiện phím Space, ArrowLeft, ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, words.length]);

  const isCardStarred = starredTerms.has(card.id || card.word);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-16">
      {/* Top Navigation Mode Header */}
      <StudyModeHeader currentMode="flashcards" basePath={basePath} />

      <main className="flex-1 max-w-[1080px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between animate-fadeIn">
        {/* Header Thông Tin & Tiến Độ */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Link
              to={basePath}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại {setMeta.title}</span>
            </Link>

            <span className="text-xs font-bold font-mono text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
              Thẻ {currentCardIndex + 1} / {words.length}
            </span>
          </div>

          <Progress value={words.length > 0 ? Math.round(((currentCardIndex + 1) / words.length) * 100) : 0} />
        </div>

        {/* Khung Thẻ Lật 3D (Đồng bộ phong cách trang từ vựng) */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-border shadow-2xs my-auto">
          <div className="w-full [perspective:1400px]">
            <div
              onClick={() => setFlipped((f) => !f)}
              className={`relative w-full min-h-[400px] sm:min-h-[450px] md:min-h-[480px] rounded-3xl transition-transform duration-600 ease-in-out [transform-style:preserve-3d] cursor-pointer select-none ${
                flipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* MẶT TRƯỚC (FRONT) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center gap-3.5 p-8 sm:p-14 text-center rounded-3xl border border-border bg-muted/40 hover:border-primary/40 shadow-xs transition-colors">
                <p className="font-display text-[34px] sm:text-[40px] font-bold text-foreground tracking-tight">{card.word}</p>
                {card.ipa ? <p className="text-[17px] sm:text-[18px] text-muted-foreground font-mono font-medium">{card.ipa}</p> : null}
                <div className="flex gap-2.5 pt-0.5">
                  {card.cefr ? <Pill tone="info" className="text-[13px] px-3 py-1 font-semibold">{card.cefr}</Pill> : null}
                  {card.pos ? <Pill tone="muted" className="text-[13px] px-3 py-1 font-semibold">{card.pos}</Pill> : null}
                </div>
              </div>

              {/* MẶT SAU (BACK) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center gap-3.5 p-8 sm:p-14 text-center rounded-3xl border border-border bg-muted/40 shadow-xs">
                <p className="text-[24px] sm:text-[28px] font-bold text-foreground">{card.vi}</p>
                {card.example ? (
                  <p className="max-w-xl text-[16px] sm:text-[18px] text-muted-foreground italic font-serif leading-relaxed">
                    “{card.example}”
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Thanh Điều Khiển Thao Tác Thẻ */}
          <div className="mt-6 flex items-center justify-between gap-3 px-2">
            <button
              type="button"
              aria-label="Thẻ trước"
              onClick={handlePrevCard}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition hover:bg-muted cursor-pointer shadow-2xs active:scale-95"
              title="Thẻ trước (Mũi tên trái)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Phát âm"
                onClick={() => playAudio(card.word)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer shadow-2xs active:scale-95"
                title="Nghe phát âm chuẩn"
              >
                <Volume2 className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Lưu từ"
                onClick={() => toggleStar(card.id || card.word)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border border-border transition cursor-pointer shadow-2xs active:scale-95 ${
                  isCardStarred
                    ? 'text-warning bg-warning-soft border-warning/40'
                    : 'text-muted-foreground hover:bg-warning-soft hover:text-warning'
                }`}
                title={isCardStarred ? 'Bỏ lưu từ' : 'Lưu từ yêu thích'}
              >
                <Star className={`h-5 w-5 ${isCardStarred ? 'fill-warning' : ''}`} />
              </button>

              <button
                type="button"
                aria-label="Lật thẻ"
                onClick={() => setFlipped((f) => !f)}
                className="px-4 py-2.5 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer shadow-2xs hidden sm:inline-flex items-center gap-1.5"
                title="Phím Space để lật"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Lật thẻ (Space)
              </button>
            </div>

            <button
              type="button"
              aria-label="Thẻ sau"
              onClick={handleNextCard}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition hover:bg-muted cursor-pointer shadow-2xs active:scale-95"
              title="Thẻ tiếp theo (Mũi tên phải)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyFlashcardsPage;
