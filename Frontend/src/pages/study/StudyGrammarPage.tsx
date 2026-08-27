import { useParams } from 'react-router-dom';
import StudyModeHeader from '../../components/features/study/StudyModeHeader';
import { PenTool, CheckCircle2 } from 'lucide-react';

const studySetGrammarMap: Record<string, any> = {
    'tieng-anh-du-lich': [
        {
            title: 'Câu hỏi lịch sự với Could / Would',
            formula: 'Could / Would you + V (bare) + please?',
            explanation: 'Sử dụng cấu trúc này khi đưa ra yêu cầu lịch sự tại sân bay, nhà hàng hoặc khách sạn.',
            example: 'Could you please check my boarding pass?'
        },
        {
            title: 'Hiện tại hoàn thành diễn tả trải nghiệm du lịch',
            formula: 'Subject + have/has + V3/ed + (ever/never)...',
            explanation: 'Diễn tả những trải nghiệm đã từng hoặc chưa bao giờ thực hiện trong quá khứ.',
            example: 'I have never visited Tokyo International Airport before.'
        }
    ]
};

const defaultGrammar = [
    {
        title: 'Cấu trúc so sánh tính từ dài',
        formula: 'S + be + more + Adj + than + Noun',
        explanation: 'Dùng để so sánh tính chất giữa hai sự vật hoặc hiện tượng.',
        example: 'Efficiency is more important than speed.'
    }
];

const StudyGrammarPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const grammarList = (slug && studySetGrammarMap[slug]) || defaultGrammar;
    const basePath = folderSlug && slug ? `/folders/${folderSlug}/${slug}` : `/studyset/${slug || 'tieng-anh-du-lich'}`;

    return (
        <div className="min-h-screen bg-slate-100/90 flex flex-col font-sans select-none pb-12">
            <StudyModeHeader currentMode="grammar" basePath={basePath} />

            <main className="flex-1 max-w-4xl w-full mx-auto p-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="pb-4 border-b border-slate-100">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                            Cấu trúc Ngữ pháp
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">
                            Các điểm ngữ pháp trọng tâm thuộc bài học
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {grammarList.map((g: any, idx: number) => (
                            <div key={idx} className="p-6 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2">
                                    <PenTool className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-bold text-slate-900 text-base">{g.title}</h3>
                                </div>
                                <div className="p-3 bg-white border border-amber-300 rounded-xl text-amber-900 font-mono text-xs font-bold">
                                    Công thức: {g.formula}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{g.explanation}</p>
                                <p className="text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                                    💡 Ví dụ: <span className="italic text-amber-700">"{g.example}"</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudyGrammarPage;
