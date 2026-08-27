import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudyModeHeader from '../../components/features/study/StudyModeHeader';
import { useVocal } from '../../hooks/useVocal';
import { updateDbLearnProgress } from '../../utils/pathProgress';
import { Flag, HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const studySetTitlesMap: Record<string, any> = {
    'tieng-anh-du-lich': {
        title: 'Tiếng Anh Du Lịch',
        terms: [
            { term: 'Boarding pass', definition: 'Thẻ lên máy bay' },
            { term: 'Luggage allowance', definition: 'Hành lý miễn cước quy định' },
            { term: 'Customs declaration', definition: 'Tờ khai hải quan' },
            { term: 'Reservation', definition: 'Đặt chỗ trước' },
            { term: 'Itinerary', definition: 'Lịch trình chuyến đi' },
        ],
    },
};

const defaultTerms = [
    { term: 'Accommodation', definition: 'Chỗ ở, nơi ở tiện nghi' },
    { term: 'Perspective', definition: 'Góc nhìn, quan điểm' },
    { term: 'Efficiency', definition: 'Hiệu suất, năng suất làm việc' },
];

const StudyLearnPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const { vocabularyList } = useVocal(slug || '');
    const setMeta = (slug && studySetTitlesMap[slug]) || { title: 'Từ vựng học phần', terms: defaultTerms };
    const termsData = vocabularyList && vocabularyList.length > 0 ? vocabularyList : setMeta.terms;
    const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;

    const currentTermObj = termsData[currentIndex] || termsData[0];

    const handleSubmitAnswer = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isAnswered) return;

        const cleanUser = userAnswer.trim().toLowerCase();
        const cleanCorrect = currentTermObj.term.trim().toLowerCase();
        const match = cleanUser === cleanCorrect;

        setIsCorrect(match);
        setIsAnswered(true);
        if (match) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        setIsAnswered(false);
        setIsCorrect(false);
        setUserAnswer('');
        setShowHint(false);
        if (currentIndex + 1 >= termsData.length) {
            setIsCompleted(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    };



    if (isCompleted) {
        return (
            <div className="min-h-screen bg-slate-100/90 flex flex-col font-sans select-none">
                <StudyModeHeader currentMode="learn" basePath={basePath} />
                <main className="flex-1 max-w-xl w-full mx-auto p-6 flex flex-col justify-center items-center">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center space-y-6 w-full animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center text-4xl mx-auto font-bold shadow-xs">
                            🎉
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Xuất sắc! Bạn đã học xong bài học này!</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                                Kết quả: Trả lời đúng <strong className="text-purple-600 font-extrabold">{score} / {termsData.length}</strong> thuật ngữ.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl text-xs font-bold text-purple-900">
                            ⚡ Tiến trình chế độ Học đã được tự động lưu vào Lộ trình học của bạn!
                        </div>

                        {/* Requirement #5: Nút Hoàn thành quay về trang bộ từ vựng chi tiết */}
                        <button
                            type="button"
                            onClick={async () => {
                                const pathItemId = location.state?.pathItemId;
                                if (pathItemId) {
                                    await updateDbLearnProgress(pathItemId);
                                }
                                navigate(basePath, { state: location.state });
                            }}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Hoàn thành bài học</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const handleIDontKnow = () => {
        setUserAnswer(currentTermObj.term);
        setIsCorrect(false);
        setIsAnswered(true);
    };

    return (
        <div className="min-h-screen bg-slate-100/90 flex flex-col font-sans select-none">
            {/* Dedicated Top Mode Header (Quizlet Style) */}
            <StudyModeHeader currentMode="learn" basePath={basePath} />

            {/* Progress Top Bar */}
            <div className="max-w-6xl w-full mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between">
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mr-5 shadow-inner">
                    <div
                        className="bg-purple-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${((currentIndex + 1) / termsData.length) * 100}%` }}
                    />
                </div>
                <span className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {termsData.length - currentIndex}
                </span>
            </div>

            {/* Main Interactive Learning Container (To tầm 2/3 background) */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-8 flex flex-col justify-center">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 shadow-xs min-h-[540px] flex flex-col justify-between transition-all">
                    {/* Top Label & Định nghĩa câu hỏi to rõ */}
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
                            Định nghĩa
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-snug tracking-tight">
                            {currentTermObj.definition}
                        </h2>
                    </div>

                    {/* Answer Input Section */}
                    <form onSubmit={handleSubmitAnswer} className="space-y-6 pt-6 my-auto">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                            Đáp án của bạn
                        </span>

                        <div className="relative">
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={isAnswered}
                                placeholder="Nhập thuật ngữ tương ứng..."
                                className={`w-full px-6 py-5 text-xl font-semibold rounded-2xl border-2 outline-none transition-all ${
                                    isAnswered
                                        ? isCorrect
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                            : 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                                        : 'bg-slate-50/70 border-slate-200 focus:border-purple-600 focus:bg-white text-slate-900'
                                }`}
                            />

                            {isAnswered && (
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                                    {isCorrect ? (
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-rose-600" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Display hint if requested */}
                        {showHint && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-bold text-amber-800 flex items-center gap-3 animate-fadeIn">
                                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <span>Gợi ý: Từ bắt đầu bằng chữ "{currentTermObj.term.charAt(0)}" và có {currentTermObj.term.length} ký tự.</span>
                            </div>
                        )}

                        {/* Incorrect Answer Reveal */}
                        {isAnswered && !isCorrect && (
                            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 animate-fadeIn">
                                <span className="text-xs font-bold text-rose-600 block">Đáp án đúng là:</span>
                                <p className="text-2xl font-black text-rose-900">{currentTermObj.term}</p>
                            </div>
                        )}

                        {/* Bottom Actions Bar */}
                        <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowHint((prev) => !prev)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Hiển thị gợi ý
                                </button>
                                <button
                                    type="button"
                                    onClick={handleIDontKnow}
                                    className="text-sm font-bold text-purple-600 hover:text-purple-700 cursor-pointer hover:underline transition-all"
                                >
                                    Bạn không biết?
                                </button>
                            </div>

                            {isAnswered ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer active:scale-95"
                                >
                                    Tiếp theo →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer active:scale-95"
                                >
                                    Trả lời
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default StudyLearnPage;
