import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudyModeHeader from '../../components/features/study/StudyModeHeader';
import { HelpCircle } from 'lucide-react';

const studySetReadingMap: Record<string, any> = {
    'tieng-anh-du-lich': {
        title: 'At Tokyo International Airport',
        content: 'Arriving at Tokyo International Airport can be an exciting experience. First, passengers need to present their boarding pass and passport at the immigration counter. Before retrieving their baggage, travelers must fill out a customs declaration form specifying any items they are bringing into the country. Having a pre-booked hotel reservation and a clear travel itinerary makes the customs process much smoother.',
        questions: [
            { question: 'What should passengers present at the immigration counter?', options: ['Ticket & Money', 'Boarding pass & Passport', 'Itinerary only', 'Customs form'], answer: 1 },
            { question: 'What form must be filled out before retrieving baggage?', options: ['Customs declaration', 'Hotel reservation', 'Flight ticket', 'Visa form'], answer: 0 }
        ]
    }
};

const defaultReading = {
    title: 'Building Long-term Learning Efficiency',
    content: 'Developing a new perspective on study habits can dramatically increase your efficiency. Having a comfortable accommodation and a quiet space enables students to focus deeply on vocabulary retention and grammar mastery.',
    questions: [
        { question: 'What can dramatically increase efficiency according to the passage?', options: ['New perspective on study habits', 'Sleeping long hours', 'Using complex tools', 'Skipping practice'], answer: 0 }
    ]
};

const StudyReadingPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
    const [readingSubmitted, setReadingSubmitted] = useState(false);

    const passageObj = (slug && studySetReadingMap[slug]) || defaultReading;
    const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;

    return (
        <div className="min-h-screen bg-slate-100/90 flex flex-col font-sans select-none pb-12">
            <StudyModeHeader currentMode="reading" basePath={basePath} />

            <main className="flex-1 max-w-4xl w-full mx-auto p-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                            Đọc hiểu theo ngữ cảnh
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">
                            {passageObj.title}
                        </h2>
                    </div>

                    <div className="p-6 bg-rose-50/30 border border-rose-200 rounded-2xl leading-relaxed text-sm text-slate-800 font-medium">
                        {passageObj.content}
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-rose-600" />
                            <span>Câu hỏi đọc hiểu bài viết</span>
                        </h3>

                        {passageObj.questions.map((rq: any, rIdx: number) => {
                            const selectedR = readingAnswers[rIdx];

                            return (
                                <div key={rIdx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                    <p className="text-xs font-bold text-slate-900">
                                        {rIdx + 1}. {rq.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {rq.options.map((opt: string, oIdx: number) => {
                                            const isChecked = selectedR === oIdx;
                                            const isCorrect = oIdx === rq.answer;

                                            let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
                                            if (readingSubmitted) {
                                                if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                                                else if (isChecked) btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                                            } else if (isChecked) {
                                                btnStyle = 'bg-rose-600 text-white border-rose-600 shadow-xs';
                                            }

                                            return (
                                                <button
                                                    key={oIdx}
                                                    type="button"
                                                    disabled={readingSubmitted}
                                                    onClick={() => setReadingAnswers((prev) => ({ ...prev, [rIdx]: oIdx }))}
                                                    className={`p-3.5 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${btnStyle}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {!readingSubmitted && (
                            <div className="pt-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setReadingSubmitted(true)}
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-500/20 cursor-pointer"
                                >
                                    Kiểm tra đáp án
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudyReadingPage;
