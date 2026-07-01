import { useState } from "react";
import Header from "../components/layout/Header/Header";
import Sidebar from "../components/layout/SideBar/Sidebar";
import Button from "../components/common/Button";
import FlashCard from "../components/features/flashcard/FlashCard";
import FlashCardControl from "../components/features/flashcard/FlashCardControl";
import { useVocal } from "../hooks/useVocal";
import { useParams } from "react-router-dom";

let textList = ["Kiểm tra", "Học", "Button 3", "Button 4"];

const defaultFlashCard = {
    term: "...",
    definition: "...",
};

const FlashCardDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { vocabularyList, loading, error } = useVocal(slug || "");

    const handleNextCard = () => {
        if (currentCardIndex < vocabularyList.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        }
    };
    const handlePrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            <Sidebar open={sidebarOpen} />
            {/* <main className={`transition-transform duration-200 ${sidebarOpen ? 'translate-x-64' : 'translate-x-0'} pt-6`}> */}
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-semibold mb-2 mt-10">Title</h1>
                <p className="text-slate-600 mb-6">Nội dung mô tả ngắn cho trang flash card.</p>

                <div className="mx-auto w-full max-w-4xl">
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {textList.map((text, index) => (
                            <li key={index}>
                                <Button text={text} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-10">
                    <FlashCard term={vocabularyList[currentCardIndex]?.term || defaultFlashCard.term} definition={vocabularyList[currentCardIndex]?.definition || defaultFlashCard.definition} />
                    <FlashCardControl onNext={handleNextCard} onPrev={handlePrevCard} currentIndex={currentCardIndex + 1} totalCards={vocabularyList.length || 1} />
                </div>
            </div>
            {/* </main> */}
        </div>
    );
};

export default FlashCardDetailPage;  
