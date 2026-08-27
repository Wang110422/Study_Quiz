import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    Layers,
    Trash2,
    Brain,
    FileText,
    PenTool,
    BookMarked,
    Folder,
    Star,
    Volume2,
} from "lucide-react";
import VocaHeader from "../../components/vocalearn/layout/VocaHeader";
import VocaSidebar from "../../components/vocalearn/layout/VocaSidebar";
import FlashCard from "../../components/features/flashcard/FlashCard";
import FlashCardControl from "../../components/features/flashcard/FlashCardControl";
import { useVocal } from "../../hooks/useVocal";
import { fetchDbItemProgress, type PathItemProgress } from "../../utils/pathProgress";

interface SetMetaInfo {
    title: string;
    description: string;
    folderTitle?: string;
    folderSlug?: string;
    terms: {
        id?: number;
        term: string;
        definition: string;
        ipa?: string;
        pos?: string;
        partOfSpeech?: string;
        level?: string;
        example?: string;
        hint?: string;
        meaning?: string;
        synonyms?: string;
    }[];
}

const studySetTitlesMap: Record<string, SetMetaInfo> = {
    'tieng-anh-du-lich': {
        title: 'Tiếng Anh Du Lịch',
        description: '45 từ vựng giao tiếp thiết yếu khi đi sân bay, khách sạn và nhà hàng nước ngoài.',
        folderTitle: 'Tiếng Anh',
        folderSlug: 'tieng-anh',
        terms: [
            { term: 'Boarding pass', definition: 'Thẻ lên máy bay', ipa: '/ˈbɔː.dɪŋ ˌpɑːs/', pos: 'noun', example: 'Please show your boarding pass at gate 4.' },
            { term: 'Luggage allowance', definition: 'Hành lý miễn cước quy định', ipa: '/ˈlʌɡ.ɪdʒ əˌlaʊ.əns/', pos: 'noun', example: 'The luggage allowance is 23kg per passenger.' },
            { term: 'Customs declaration', definition: 'Tờ khai hải quan', ipa: '/ˈkʌs.təmz ˌdek.ləˈreɪ.ʃən/', pos: 'noun', example: 'Fill out this customs declaration form before arriving.' },
            { term: 'Reservation', definition: 'Đặt chỗ trước', ipa: '/ˌrez.əˈveɪ.ʃən/', pos: 'noun', example: 'I have a reservation under the name Lan Anh.' },
            { term: 'Itinerary', definition: 'Lịch trình chuyến đi', ipa: '/aɪˈtɪn.ər.ər.i/', pos: 'noun', example: 'Here is our travel itinerary for 5 days in Tokyo.' },
        ],
    },
    'tieng-anh-chuyen-nganh-it': {
        title: 'Tiếng Anh Chuyên ngành IT',
        description: 'Các thuật ngữ kỹ thuật phổ biến dành cho lập trình viên và kỹ sư phần mềm.',
        folderTitle: 'Tiếng Anh',
        folderSlug: 'tieng-anh',
        terms: [
            { term: 'Repository', definition: 'Kho lưu trữ mã nguồn (Git)', ipa: '/rɪˈpɒz.ɪ.tər.i/', pos: 'noun', example: 'Clone the repository to your local computer.' },
            { term: 'Deployment', definition: 'Triển khai phần mềm lên máy chủ', ipa: '/dɪˈplɔɪ.mənt/', pos: 'noun', example: 'Automated deployment reduces manual errors.' },
            { term: 'Authentication', definition: 'Xác thực người dùng (Đăng nhập)', ipa: '/ɔːˌθen.tɪˈkeɪ.ʃən/', pos: 'noun', example: 'JWT is widely used for API authentication.' },
            { term: 'Asynchronous', definition: 'Bất đồng bộ (không chờ đợi)', ipa: '/eɪˈsɪŋ.krə.nəs/', pos: 'adjective', example: 'Promises handle asynchronous operations in JS.' },
        ],
    },
};

const defaultSetInfo: SetMetaInfo = {
    title: 'Từ vựng học phần',
    description: 'Danh sách từ vựng và thuật ngữ ôn tập chuẩn ghi nhớ lâu dài.',
    folderTitle: 'Thư mục đã tạo',
    folderSlug: 'tieng-anh',
    terms: [
        { term: 'hello', definition: 'xin chào', ipa: '/həˈloʊ/', pos: 'interjection', synonyms: 'hi; hey', example: 'Hello, how are you?' },
        { term: 'Accommodation', definition: 'Chỗ ở, nơi ở tiện nghi', ipa: '/əˌkɒm.əˈdeɪ.ʃən/', pos: 'noun', example: 'The hotel provides comfortable accommodation.' },
        { term: 'Perspective', definition: 'Góc nhìn, quan điểm', ipa: '/pəˈspek.tɪv/', pos: 'noun', example: 'Try to see the problem from a different perspective.' },
        { term: 'Efficiency', definition: 'Hiệu suất, năng suất làm việc', ipa: '/ɪˈfɪʃ.ən.si/', pos: 'noun', example: 'Automation improves work efficiency.' },
    ],
};

const FlashCardDetailPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { vocabularyList, deleteVocabulary } = useVocal(slug || "");
    const [starredTerms, setStarredTerms] = useState<Set<string | number>>(new Set());

    const setMeta = (slug && studySetTitlesMap[slug]) || defaultSetInfo;

    const customFrom = location.state?.from;
    const customFromName = location.state?.fromName;
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

    const termsData = vocabularyList && vocabularyList.length > 0
        ? vocabularyList
        : setMeta.terms;

    const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;

    const handleNextCard = () => {
        if (currentCardIndex < termsData.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        }
    };

    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
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

    const activeCard = termsData[currentCardIndex] || termsData[0];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <VocaSidebar />

            <div className="pl-[260px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    {/* Breadcrumbs Navigation */}
                    <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                        {customFrom ? (
                            <Link to={customFrom} className="hover:text-blue-600 flex items-center gap-1 font-bold text-blue-600 transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Quay lại {customFromName || 'trang trước'}</span>
                            </Link>
                        ) : folderSlug ? (
                            <>
                                <Link to="/folders" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Thư viện của bạn</span>
                                </Link>
                                <span>/</span>
                                <Link to={`/folders/${folderSlug}`} className="hover:text-blue-600 font-bold text-blue-600 transition-colors">
                                    Quay lại Thư mục {folderSlug}
                                </Link>
                            </>
                        ) : (
                            <Link to="/folders" className="hover:text-blue-600 flex items-center gap-1 font-bold text-blue-600 transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Quay lại danh sách Bộ từ vựng</span>
                            </Link>
                        )}
                        <span>/</span>
                        <span className="text-slate-900 font-bold">{setMeta.title}</span>
                    </div>

                    {/* Title & Folder Header (Quizlet Style) */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                            <Folder className="w-4 h-4 text-slate-400" />
                            <span>{setMeta.folderTitle || 'Thư mục từ vựng'}</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            {setMeta.title}
                        </h1>
                    </div>

                    {/* 🎯 LỘ TRÌNH HỌC BANNER TIẾN ĐỘ */}
                    {(() => {
                        const pathItemId = location.state?.pathItemId;
                        return (
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                                        🎯
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                            <span>Tiến độ Lộ trình học của bộ thẻ này</span>
                                            {dbProgress.isCompleted ? (
                                                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                                                    ✓ ĐÃ HOÀN THÀNH MỐC
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                                                    Lộ trình học tập (Lưu Database)
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                            {dbProgress.isCompleted
                                                ? 'Chúc mừng! Bạn đã đạt đủ chỉ tiêu Học và Kiểm tra cho mốc này.'
                                                : 'Bấm vào nút Học hoặc Kiểm tra bên dưới để vào bài học và nâng chỉ tiêu mốc.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Các nút bấm trực tiếp: Học X/3, Kiểm tra Y/3 */}
                                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`${basePath}/learn`, { state: { ...location.state, pathItemId } })}
                                        className="px-3.5 py-2 bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                                        title="Bấm vào để vào trang Học"
                                    >
                                        <Brain className="w-4 h-4 text-purple-600" />
                                        <span>Học: {dbProgress.completedLearnCount}/{dbProgress.targetLearnCount} lần</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`${basePath}/test`, { state: { ...location.state, pathItemId } })}
                                        className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 shadow-2xs transition-all cursor-pointer active:scale-95"
                                        title="Bấm vào để vào trang Kiểm tra"
                                    >
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        <span>Kiểm tra: {dbProgress.completedTestCount}/{dbProgress.targetTestCount} lần</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 🌟 NÚT CHUYỂN SANG TRANG CHUYÊN BIỆT TỪNG CHỨC NĂNG (MỖI CHỨC NĂNG LÀ 1 TRANG MỚI) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-8">
                        {/* 1. THẺ GHI NHỚ */}
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/flashcards`)}
                            className="p-4 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl transition-all flex items-center gap-3 cursor-pointer select-none active:scale-98 group shadow-2xs"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-slate-900 block">Thẻ ghi nhớ</span>
                                <span className="text-[10px] text-slate-400">Trang lật thẻ</span>
                            </div>
                        </button>

                        {/* 2. HỌC */}
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/learn`)}
                            className="p-4 bg-white border-2 border-slate-200 hover:border-purple-500 rounded-2xl transition-all flex items-center gap-3 cursor-pointer select-none active:scale-98 group shadow-2xs"
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-slate-900 block">Học</span>
                                <span className="text-[10px] text-slate-400">Trang học Quizlet</span>
                            </div>
                        </button>

                        {/* 3. KIỂM TRA */}
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/test`)}
                            className="p-4 bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl transition-all flex items-center gap-3 cursor-pointer select-none active:scale-98 group shadow-2xs"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-slate-900 block">Kiểm tra</span>
                                <span className="text-[10px] text-slate-400">Trang làm bài test</span>
                            </div>
                        </button>

                        {/* 4. NGỮ PHÁP */}
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/grammar`)}
                            className="p-4 bg-white border-2 border-slate-200 hover:border-amber-500 rounded-2xl transition-all flex items-center gap-3 cursor-pointer select-none active:scale-98 group shadow-2xs"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs">
                                <PenTool className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-slate-900 block">Ngữ pháp</span>
                                <span className="text-[10px] text-slate-400">Trang ngữ pháp</span>
                            </div>
                        </button>

                        {/* 5. ĐỌC HIỂU */}
                        <button
                            type="button"
                            onClick={() => navigate(`${basePath}/reading`)}
                            className="p-4 bg-white border-2 border-slate-200 hover:border-rose-500 rounded-2xl transition-all flex items-center gap-3 cursor-pointer select-none active:scale-98 group shadow-2xs"
                        >
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-2xs">
                                <BookMarked className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-slate-900 block">Đọc hiểu</span>
                                <span className="text-[10px] text-slate-400">Trang luyện đọc</span>
                            </div>
                        </button>
                    </div>

                    {/* Interactive Flashcard Section Overview */}
                    <div className="w-full max-w-5xl mx-auto mb-10">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3 px-1">
                            <div className="flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>Thẻ ghi nhớ ({currentCardIndex + 1}/{termsData.length})</span>
                            </div>
                            <span className="text-[11px] text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg">
                                Nhấp vào thẻ để lật mặt xem nghĩa
                            </span>
                        </div>

                        <div className="w-full">
                            <FlashCard
                                term={activeCard?.term || "..."}
                                definition={activeCard?.definition || "..."}
                            />
                        </div>

                        <div className="mt-4">
                            <FlashCardControl
                                onNext={handleNextCard}
                                onPrev={handlePrevCard}
                                currentIndex={currentCardIndex + 1}
                                totalCards={termsData.length}
                            />
                        </div>
                    </div>

                    {/* Terms List Section - THIẾT KẾ CHUẨN XÁC THEO HÌNH ẢNH MẪU */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span>Các thuật ngữ trong bộ thẻ này ({termsData.length})</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {termsData.map((item, index) => {
                                const termKey = (item as any).id || `${item.term}-${index}`;
                                const isStarred = starredTerms.has(termKey);
                                const posVal = (item as any).pos || (item as any).partOfSpeech;
                                const ipaVal = (item as any).ipa;
                                const synVal = (item as any).synonyms || (item as any).hint;

                                const subDetails = [
                                    posVal,
                                    ipaVal,
                                    synVal
                                ].filter(Boolean).join(' - ');

                                const meaningVal = item.definition || (item as any).meaning;
                                const exampleVal = item.example;

                                return (
                                    <div
                                        key={termKey}
                                        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-4 relative group"
                                    >
                                        {/* Cột trái: Thuật ngữ (in đậm) + (loại từ - phát âm - từ đồng nghĩa) */}
                                        <div className="flex-1 pr-4 min-w-0">
                                            <p className="text-base font-bold text-slate-900 tracking-tight">
                                                {item.term}
                                            </p>
                                            {subDetails && (
                                                <p className="text-xs text-slate-400 mt-1 font-normal truncate">
                                                    {subDetails}
                                                </p>
                                            )}
                                        </div>

                                        {/* Cột phải: Vạch ngăn cách dọc + Định nghĩa tiếng Việt + Ví dụ in nghiêng */}
                                        <div className="flex-1 pl-6 border-l border-slate-200/80 min-w-0">
                                            <p className="text-sm font-medium text-slate-800">
                                                {meaningVal}
                                            </p>
                                            {exampleVal && (
                                                <p className="text-xs text-slate-400 italic mt-0.5 font-normal">
                                                    {exampleVal}
                                                </p>
                                            )}
                                        </div>

                                        {/* Cột ngoài cùng: Nút Đánh dấu sao + Nút Loa phát âm + Nút Xóa */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => toggleStar(termKey)}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isStarred ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-500'
                                                    }`}
                                                title={isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao'}
                                            >
                                                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => playAudio(item.term)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                title="Nghe phát âm"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </button>

                                            {(item as any).id && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (window.confirm(`Chuyển từ vựng "${item.term}" vào Thùng Rác?`)) {
                                                            await deleteVocabulary((item as any).id);
                                                        }
                                                    }}
                                                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                    title="Xóa từ vựng"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
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
