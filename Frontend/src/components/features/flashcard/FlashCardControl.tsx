import Button from "../../common/Button";

interface FlashCardControlProps {
    currentIndex: number;
    totalCards: number;
    onNext?: () => void;
    onPrev?: () => void;
    onPlay?: () => void;
    onSetting?: () => void;
    onFullscreen?: () => void;
}

const FlashCardControl = ({ currentIndex, totalCards, onNext, onPrev, onPlay, onSetting, onFullscreen }: FlashCardControlProps) => {
    const rightBtnStyles = "rounded-full w-10 h-10 p-0 text-gray-500 hover:text-gray-800 hover:bg-gray-100";
    return (
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between p-4 relative">

            {/* 1. Khoảng trống bên trái (để giữ cụm điều hướng luôn nằm THẲNG CHÍNH GIỮA trang) */}
            <div className="w-40 hidden sm:block"></div>

            {/* 2. CỤM ĐIỀU HƯỚNG CHÍNH GIỮA */}
            <div className="flex items-center gap-6">
                {/* Nút quay lại (Ẩn/Mờ đi nếu là từ đầu tiên) */}
                <Button
                    onClick={onPrev}
                    text=""
                    disabled={currentIndex === 1}
                    className="rounded-full w-14 h-14 p-0 shadow-sm bg-white border border-gray-100 hover:bg-gray-50 disabled:opacity-30"
                >
                    <span className="text-x text-black">←</span>
                </Button>

                {/* Hiển thị số trang */}
                <span className="text-lg font-medium text-gray-700 min-w-[60px] text-center select-none">
                    {currentIndex} / {totalCards}
                </span>

                <Button
                    text=""
                    onClick={onNext}
                    disabled={currentIndex === totalCards}
                    className="rounded-full w-14 h-14 p-0 shadow-sm bg-white border border-gray-100 hover:bg-gray-50 disabled:opacity-30"
                >
                    <span className="text-xl">→</span>
                </Button>
            </div>

            {/* 3. CỤM TÍNH NĂNG PHỤ BÊN PHẢI */}
            <div className="flex items-center gap-1 sm:w-40 justify-end line-height-10">
                {/* Nút Tự động chạy (Play) */}
                <Button text="" onClick={onPlay} className={rightBtnStyles}>
                    <span className="text-sm">▶</span>
                </Button>
                {/* Nút Cài đặt */}
                <Button text="" onClick={onSetting} className={rightBtnStyles}>
                    <span className="text-lg">⚙️</span>
                </Button>

                {/* Nút Toàn màn hình */}
                <Button text="" onClick={onFullscreen} className={rightBtnStyles}>
                    <span className="text-md">⛶</span>
                </Button>
            </div>

        </div>
    );
};

export default FlashCardControl;