import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudyModeHeader from '../../components/features/study/StudyModeHeader';
import FlashCard from '../../components/features/flashcard/FlashCard';
import FlashCardControl from '../../components/features/flashcard/FlashCardControl';
import { useVocal } from '../../hooks/useVocal';
import { Layers } from 'lucide-react';

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
    'tieng-anh-chuyen-nganh-it': {
        title: 'Tiếng Anh Chuyên ngành IT',
        terms: [
            { term: 'Repository', definition: 'Kho lưu trữ mã nguồn (Git)' },
            { term: 'Deployment', definition: 'Triển khai phần mềm lên máy chủ' },
            { term: 'Authentication', definition: 'Xác thực người dùng (Đăng nhập)' },
            { term: 'Asynchronous', definition: 'Bất đồng bộ (không chờ đợi)' },
        ],
    },
};

const defaultTerms = [
    { term: 'Accommodation', definition: 'Chỗ ở, nơi ở tiện nghi' },
    { term: 'Perspective', definition: 'Góc nhìn, quan điểm' },
    { term: 'Efficiency', definition: 'Hiệu suất, năng suất làm việc' },
];

const StudyFlashcardsPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { vocabularyList } = useVocal(slug || '');

    const setMeta = (slug && studySetTitlesMap[slug]) || { title: 'Từ vựng học phần', terms: defaultTerms };
    const termsData = vocabularyList && vocabularyList.length > 0 ? vocabularyList : setMeta.terms;
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

    const activeCard = termsData[currentCardIndex] || termsData[0];

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
            <StudyModeHeader currentMode="flashcards" basePath={basePath} />

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl w-full mx-auto">
                <div className="w-full mb-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Thẻ ghi nhớ ({currentCardIndex + 1}/{termsData.length})</span>
                    </div>
                    <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Nhấp vào thẻ để lật mặt xem nghĩa</span>
                </div>

                <div className="w-full">
                    <FlashCard
                        term={activeCard?.term || '...'}
                        definition={activeCard?.definition || '...'}
                    />
                </div>

                <div className="mt-6 w-full">
                    <FlashCardControl
                        onNext={handleNextCard}
                        onPrev={handlePrevCard}
                        currentIndex={currentCardIndex + 1}
                        totalCards={termsData.length}
                    />
                </div>
            </main>
        </div>
    );
};

export default StudyFlashcardsPage;
