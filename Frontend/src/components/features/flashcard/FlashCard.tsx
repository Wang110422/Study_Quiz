import { useState } from "react";

interface FlashCardProps {
    term: string;
    definition: string;
}

const FlashCard = ({ term, definition }: FlashCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full max-w-4xl aspect-[16/9] min-h-[350px] mx-auto relative cursor-pointer select-none" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`absolute inset-0 transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col p-6 backface-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                            <span>💡</span>
                            <span>Hiển thị gợi ý</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400">
                            <button className="hover:text-gray-600" onClick={(e) => e.stopPropagation()}>🔊</button>
                            <button className="hover:text-yellow-500" onClick={(e) => e.stopPropagation()}>⭐</button>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-6xl font-semibold text-gray-800 tracking-wide text-center">
                            {term}
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-blue-50 rounded-2xl shadow-md border border-blue-100 flex flex-col p-6 backface-hidden rotate-y-180">
                    <div className="text-blue-500 text-sm font-medium mb-6">
                        Ý nghĩa
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-4xl font-normal text-blue-900 text-center leading-relaxed max-w-2xl">
                            {definition}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FlashCard;