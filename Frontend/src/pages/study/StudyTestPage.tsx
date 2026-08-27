import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudyModeHeader from '../../components/features/study/StudyModeHeader';
import { useVocal } from '../../hooks/useVocal';
import { updateDbTestProgress } from '../../utils/pathProgress';
import { Check, X, RotateCcw, Award, ArrowRight, FileText, ChevronDown, Eye, EyeOff } from 'lucide-react';

interface TermItem {
    id?: number;
    term: string;
    definition: string;
    example?: string;
}

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

const defaultTerms: TermItem[] = [
    { term: '잠깐', definition: 'một lát, một chút' },
    { term: '실례하다', definition: 'Thất lễ, xin lỗi' },
    { term: '파란색', definition: 'màu xanh da trời' },
    { term: 'hello', definition: 'xin chào' },
    { term: 'Accommodation', definition: 'Chỗ ở, nơi ở tiện nghi' },
    { term: 'Perspective', definition: 'Góc nhìn, quan điểm' },
    { term: 'Efficiency', definition: 'Hiệu suất, năng suất làm việc' },
];

const StudyTestPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { vocabularyList } = useVocal(slug || '');
    const setMeta = (slug && studySetTitlesMap[slug]) || { title: 'Từ vựng học phần', terms: defaultTerms };
    const rawTerms: TermItem[] = (vocabularyList && vocabularyList.length > 0) ? vocabularyList : setMeta.terms;
    const termsData: TermItem[] = rawTerms.length > 0 ? rawTerms : defaultTerms;
    const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;

    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [showQuestionList, setShowQuestionList] = useState(true);

    // Tính thời gian làm bài
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [elapsedMinutes, setElapsedMinutes] = useState<number>(1);

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    // Chuẩn bị 3-4 lựa chọn ngẫu nhiên cho từng câu hỏi
    const questions = useMemo(() => {
        return termsData.map((item, idx) => {
            const correctAnswer = item.term;
            const otherTerms = termsData
                .filter((_, i) => i !== idx)
                .map((t) => t.term);

            // Lấy 2 hoặc 3 đáp án nhiễu
            const shuffledOthers = [...otherTerms].sort(() => 0.5 - Math.random());
            const distractors = shuffledOthers.slice(0, 3);

            while (distractors.length < 2) {
                const fallback = `Phương án ${distractors.length + 1}`;
                if (!distractors.includes(fallback) && fallback !== correctAnswer) {
                    distractors.push(fallback);
                }
            }

            const allOptions = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

            return {
                index: idx,
                definition: item.definition || item.term,
                correctAnswer,
                options: allOptions,
            };
        });
    }, [termsData]);

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });
        const total = questions.length;
        const wrong = total - correct;
        const percent = Math.round((correct / total) * 100);
        return {
            correct,
            wrong,
            total,
            percent,
        };
    };

    const scoreResult = calculateScore();

    const handleSubmitTest = () => {
        const timeDiffSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        const mins = Math.max(1, Math.round(timeDiffSeconds / 60));
        setElapsedMinutes(mins);
        setTestSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToQuestion = (idx: number) => {
        const el = document.getElementById(`quiz-question-${idx}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans select-none pb-24">
            {/* Header duy nhất của chế độ kiểm tra */}
            <StudyModeHeader
                currentMode="test"
                basePath={basePath}
                rightContent={
                    testSubmitted ? (
                        <div className="text-right pr-2">
                            <div className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {scoreResult.correct} / {scoreResult.total} · {scoreResult.percent}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">
                                Màu sắc
                            </div>
                        </div>
                    ) : null
                }
            />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 relative">
                {/* Cột trái: Sidebar điều hướng câu hỏi nằm sát lề bên trái với chữ to hơn 5px */}
                {testSubmitted && (
                    <div className="hidden xl:block absolute -left-36 top-12 w-32 space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowQuestionList(!showQuestionList)}
                            className="flex items-center gap-2 text-[14px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1"
                        >
                            <X className="w-4 h-4" />
                            <span>{showQuestionList ? 'Ẩn danh sách câu hỏi' : 'Hiện danh sách'}</span>
                        </button>

                        {showQuestionList && (
                            <div className="space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
                                {questions.map((q, qIdx) => {
                                    const isCorrect = userAnswers[qIdx] === q.correctAnswer;
                                    return (
                                        <button
                                            key={qIdx}
                                            type="button"
                                            onClick={() => scrollToQuestion(qIdx)}
                                            className="flex items-center gap-2.5 text-[17px] font-black w-full text-left py-1 hover:bg-slate-200/60 rounded-lg px-2 transition-colors cursor-pointer"
                                        >
                                            {isCorrect ? (
                                                <span className="text-emerald-600 flex items-center gap-2">
                                                    <Check className="w-4.5 h-4.5 stroke-[3.5]" />
                                                    <span>{qIdx + 1}</span>
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 flex items-center gap-2">
                                                    <X className="w-4.5 h-4.5 stroke-[3.5]" />
                                                    <span>{qIdx + 1}</span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Toàn bộ nội dung: Component Kết quả & Component Câu hỏi TO BẰNG NHAU THẲNG HÀNG 100% */}
                <div className="w-full space-y-10">
                    {/* Khi đã nộp bài: Layout kết quả to bằng component câu hỏi */}
                    {testSubmitted && (
                        <div className="animate-fadeIn bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xs">
                            {/* Tiêu đề động viên */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                                {scoreResult.percent === 100
                                    ? 'Tuyệt vời, bạn đã hoàn thành xuất sắc!'
                                    : scoreResult.percent >= 80
                                    ? 'Rất tốt! Hãy tiếp tục duy trì phong độ!'
                                    : 'Hãy đối tốt với bản thân, và tiếp tục ôn luyện!'}
                            </h1>

                            <p className="text-base font-bold text-slate-700 mb-6">
                                Thời gian của bạn: {elapsedMinutes} phút
                            </p>

                            {/* Thống kê Vòng tròn % và Đúng/Sai */}
                            <div className="flex items-center gap-10 mb-8 flex-wrap">
                                {/* Vòng tròn phần trăm */}
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-100"
                                            strokeWidth="3.8"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={`${scoreResult.percent >= 80 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000`}
                                            strokeDasharray={`${scoreResult.percent}, 100`}
                                            strokeWidth="3.8"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <span className="absolute text-lg font-bold text-slate-800">
                                        {scoreResult.percent}%
                                    </span>
                                </div>

                                {/* Badge Đúng & Sai */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-8">
                                        <span className="text-base font-bold text-emerald-600 w-14">Đúng</span>
                                        <span className="px-5 py-1 rounded-full text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                            {scoreResult.correct}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-base font-bold text-amber-600 w-14">Sai</span>
                                        <span className="px-5 py-1 rounded-full text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200">
                                            {scoreResult.wrong}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tiêu đề Đáp án của bạn */}
                            <h3 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">
                                Đáp án của bạn
                            </h3>
                        </div>
                    )}

                    {/* Danh sách các Card câu hỏi: RỘNG 100% KHỚP VỚI COMPONENT KẾT QUẢ */}
                    <div className="space-y-10">
                        {questions.map((q, qIdx) => {
                            const selectedAns = userAnswers[qIdx];
                            const isCorrect = selectedAns === q.correctAnswer;

                            return (
                                <div
                                    key={qIdx}
                                    id={`quiz-question-${qIdx}`}
                                    className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8 transition-all min-h-[400px] flex flex-col justify-between"
                                >
                                    {/* Header của câu hỏi: Định nghĩa (trái) - 1/3 (phải) */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm font-bold text-slate-400 mb-3">
                                            <span className="text-slate-600 text-sm">Định nghĩa</span>
                                            <span className="text-slate-400 font-semibold">
                                                {qIdx + 1}/{questions.length}
                                            </span>
                                        </div>

                                        {/* Nội dung câu hỏi (Định nghĩa) */}
                                        <h2 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight leading-relaxed">
                                            {q.definition}
                                        </h2>
                                    </div>

                                    {/* Phần lựa chọn: Chọn đáp án đúng HOẶC Thử lại câu hỏi này sau */}
                                    <div className="my-auto">
                                        <p className="text-sm font-bold text-slate-700 mb-5">
                                            {testSubmitted
                                                ? (isCorrect ? 'Chính xác!' : 'Thử lại câu hỏi này sau!')
                                                : 'Chọn đáp án đúng'}
                                        </p>

                                        {/* Grid các ô đáp án (2 cột, to rộng rãi) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {q.options.map((optText, oIdx) => {
                                                const isThisOptSelected = selectedAns === optText;
                                                const isThisOptCorrect = optText === q.correctAnswer;

                                                let buttonStyle = 'bg-white border-slate-200 text-slate-800 hover:border-blue-500 hover:shadow-2xs';

                                                if (testSubmitted) {
                                                    if (isThisOptCorrect) {
                                                        // Đáp án đúng
                                                        buttonStyle = 'bg-white border-slate-300 text-slate-900 font-bold';
                                                    } else if (isThisOptSelected && !isThisOptCorrect) {
                                                        // Đáp án sai đã chọn
                                                        buttonStyle = 'bg-rose-50 border-rose-400 text-rose-700 font-bold';
                                                    } else {
                                                        buttonStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                                                    }
                                                } else if (isThisOptSelected) {
                                                    buttonStyle = 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold shadow-xs';
                                                }

                                                return (
                                                    <button
                                                        key={oIdx}
                                                        type="button"
                                                        disabled={testSubmitted}
                                                        onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: optText }))}
                                                        className={`p-6 sm:p-7 min-h-[90px] rounded-2xl border text-left text-lg sm:text-xl font-medium transition-all cursor-pointer shadow-2xs flex items-center gap-3.5 ${buttonStyle}`}
                                                    >
                                                        {testSubmitted && isThisOptCorrect && (
                                                            <Check className="w-6 h-6 text-slate-700 stroke-[2.5] shrink-0" />
                                                        )}
                                                        {testSubmitted && isThisOptSelected && !isThisOptCorrect && (
                                                            <X className="w-6 h-6 text-rose-600 stroke-[2.5] shrink-0" />
                                                        )}
                                                        <span className="leading-snug">{optText}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Nút Bạn không biết? (chỉ hiện khi chưa nộp bài) */}
                                    {!testSubmitted && (
                                        <div className="text-center pt-3">
                                            <button
                                                type="button"
                                                onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: '__DONT_KNOW__' }))}
                                                className={`text-blue-600 hover:text-blue-700 font-bold text-sm hover:underline cursor-pointer transition-colors ${
                                                    selectedAns === '__DONT_KNOW__' ? 'text-slate-400 line-through' : ''
                                                }`}
                                            >
                                                {selectedAns === '__DONT_KNOW__' ? 'Đã chọn: Bạn không biết' : 'Bạn không biết?'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Bar: Nút Nộp bài kiểm tra (khi chưa nộp) hoặc Nút hành động sau khi nộp */}
                <div className="mt-14 mb-20 flex justify-center gap-4">
                    {!testSubmitted ? (
                        <button
                            type="button"
                            onClick={handleSubmitTest}
                            className="px-16 py-4.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-extrabold rounded-2xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer active:scale-98"
                        >
                            Nộp bài kiểm tra
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setUserAnswers({});
                                    setTestSubmitted(false);
                                    setStartTime(Date.now());
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Làm lại bài kiểm tra</span>
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    const pathItemId = location.state?.pathItemId;
                                    if (pathItemId) {
                                        await updateDbTestProgress(pathItemId);
                                    }
                                    navigate(basePath, { state: location.state });
                                }}
                                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer flex items-center gap-2 active:scale-98"
                            >
                                <span>Hoàn thành & Ghi nhận Lộ trình</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudyTestPage;
