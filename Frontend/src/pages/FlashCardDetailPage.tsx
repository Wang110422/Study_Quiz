import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, Layers, Sparkles, Trash2 } from "lucide-react";
import VocaHeader from "../components/vocalearn/layout/VocaHeader";
import VocaSidebar from "../components/vocalearn/layout/VocaSidebar";
import FlashCard from "../components/features/flashcard/FlashCard";
import FlashCardControl from "../components/features/flashcard/FlashCardControl";
import { useVocal } from "../hooks/useVocal";
import VocabularyService from "../services/vocabularyService";
import trashService from "../services/trashService";

interface SetMetaInfo {
    title: string;
    description: string;
    folderTitle?: string;
    folderSlug?: string;
    terms: { term: string; definition: string; example?: string }[];
}

// Dữ liệu mẫu tiêu đề & từ vựng khi API chưa trả về
const studySetTitlesMap: Record<string, SetMetaInfo> = {
    'tieng-anh-du-lich': {
        title: 'Tiếng Anh Du Lịch',
        description: '45 từ vựng giao tiếp thiết yếu khi đi sân bay, khách sạn và nhà hàng nước ngoài.',
        folderTitle: 'Tiếng Anh',
        folderSlug: 'tieng-anh',
        terms: [
            { term: 'Boarding pass', definition: 'Thẻ lên máy bay', example: 'Please show your boarding pass at gate 4.' },
            { term: 'Luggage allowance', definition: 'Hành lý miễn cước quy định', example: 'The luggage allowance is 23kg per passenger.' },
            { term: 'Customs declaration', definition: 'Tờ khai hải quan', example: 'Fill out this customs declaration form before arriving.' },
            { term: 'Reservation', definition: 'Đặt chỗ trước', example: 'I have a reservation under the name Lan Anh.' },
            { term: 'Itinerary', definition: 'Lịch trình chuyến đi', example: 'Here is our travel itinerary for 5 days in Tokyo.' },
        ],
    },
    'tieng-anh-chuyen-nganh-it': {
        title: 'Tiếng Anh Chuyên ngành IT',
        description: 'Các thuật ngữ kỹ thuật phổ biến dành cho lập trình viên và kỹ sư phần mềm.',
        folderTitle: 'Tiếng Anh',
        folderSlug: 'tieng-anh',
        terms: [
            { term: 'Repository', definition: 'Kho lưu trữ mã nguồn (Git)', example: 'Clone the repository to your local computer.' },
            { term: 'Deployment', definition: 'Triển khai phần mềm lên máy chủ', example: 'Automated deployment reduces manual errors.' },
            { term: 'Authentication', definition: 'Xác thực người dùng (Đăng nhập)', example: 'JWT is widely used for API authentication.' },
            { term: 'Asynchronous', definition: 'Bất đồng bộ (không chờ đợi)', example: 'Promises handle asynchronous operations in JS.' },
        ],
    },
    'tu-vung-ielts-band-7': {
        title: 'Từ vựng IELTS Band 7+',
        description: 'Các từ vựng cao cấp giúp đạt điểm từ vựng ấn tượng trong Speaking & Writing.',
        folderTitle: 'Tiếng Anh',
        folderSlug: 'tieng-anh',
        terms: [
            { term: 'Substantial', definition: 'Đáng kể, lớn lao', example: 'There has been a substantial increase in prices.' },
            { term: 'Paramount', definition: 'Tối quan trọng, hàng đầu', example: 'Safety is of paramount importance.' },
            { term: 'Ubiquitous', definition: 'Có mặt ở khắp mọi nơi', example: 'Smartphones have become ubiquitous in daily life.' },
        ],
    },
    'hoa-hoc-huu-co': {
        title: 'Hóa học Hữu cơ',
        description: 'Công thức và tính chất đặc trưng của Hydrocarbon, Alcohol và Ester.',
        folderTitle: 'Khoa học tự nhiên',
        folderSlug: 'khoa-hoc-tu-nhien',
        terms: [
            { term: 'Ankan (Alkane)', definition: 'Hydrocarbon no mạch hở có công thức CnH2n+2', example: 'Methane (CH4) là ankan đơn giản nhất.' },
            { term: 'Phản ứng thế', definition: 'Phản ứng đặc trưng của hydrocarbon no với Halogen', example: 'CH4 + Cl2 -> CH3Cl + HCl (ánh sáng).' },
            { term: 'Esterification', definition: 'Phản ứng este hóa giữa Axit và Ancol', example: 'CH3COOH + C2H5OH <-> CH3COOC2H5 + H2O.' },
        ],
    },
    'tieng-nhat-n3': {
        title: 'Tiếng Nhật N3',
        description: 'Từ vựng và Hán tự (Kanji) mức độ N3 JLPT.',
        folderTitle: 'Ngoại ngữ Châu Á',
        folderSlug: 'ngoai-ngu-chau-a',
        terms: [
            { term: '予約 (よやく)', definition: 'Đặt chỗ / Hẹn trước', example: 'レストランを予約しました。' },
            { term: '準備 (じゅんび)', definition: 'Chuẩn bị', example: '明日の会議の準備をします。' },
            { term: '確認 (かくにん)', definition: 'Xác nhận / Kiểm tra lại', example: 'スケジュールを確認してください。' },
        ],
    },
};

const defaultSetInfo: SetMetaInfo = {
    title: 'Từ vựng học phần',
    description: 'Danh sách từ vựng và thuật ngữ ôn tập chuẩn ghi nhớ lâu dài.',
    folderTitle: 'Thư mục đã tạo',
    folderSlug: 'tieng-anh',
    terms: [
        { term: 'Accommodation', definition: 'Chỗ ở, nơi ở tiện nghi', example: 'The hotel provides comfortable accommodation.' },
        { term: 'Perspective', definition: 'Góc nhìn, quan điểm', example: 'Try to see the problem from a different perspective.' },
        { term: 'Efficiency', definition: 'Hiệu suất, năng suất làm việc', example: 'Automation improves work efficiency.' },
    ],
};

const FlashCardDetailPage = () => {
    const { folderSlug, slug } = useParams<{ folderSlug?: string; slug?: string }>();
    const location = useLocation();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const { vocabularyList, deleteVocabulary } = useVocal(slug || "");

    const setMeta = (slug && studySetTitlesMap[slug]) || defaultSetInfo;

    // Nguồn mở ban đầu (Ví dụ từ Nhóm học /study-groups/1)
    const customFrom = location.state?.from;
    const customFromName = location.state?.fromName;

    // Danh sách từ vựng hiển thị
    const termsData = vocabularyList && vocabularyList.length > 0
        ? vocabularyList
        : setMeta.terms;

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
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none">
            {/* Fixed Sidebar */}
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                {/* Header */}
                <VocaHeader />

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    {/* Breadcrumbs Navigation Smart Context-Aware */}
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

                    {/* Header Info */}
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <span className="p-2 bg-blue-100/80 text-blue-600 rounded-xl text-lg font-bold">📚</span>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {setMeta.title}
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 font-normal">
                                {setMeta.description} · {termsData.length} thuật ngữ
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Học kiểm tra</span>
                            </button>
                        </div>
                    </div>

                    {/* Interactive Flashcard Section - Full Width Main & Independent External Controls */}
                    <div className="w-full max-w-5xl mx-auto mb-10">
                        {/* Header Hint Bar */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3 px-1">
                            <div className="flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span>Thẻ ghi nhớ ({currentCardIndex + 1}/{termsData.length})</span>
                            </div>
                            <span className="text-[11px] text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg">
                                Nhấp vào thẻ để lật mặt xem nghĩa
                            </span>
                        </div>

                        {/* 1. Thẻ lật Full Màn chính */}
                        <div className="w-full">
                            <FlashCard
                                term={activeCard?.term || "..."}
                                definition={activeCard?.definition || "..."}
                            />
                        </div>

                        {/* 2. Cụm điều khiển ở phía dưới - ĐỨNG HẲN RA BÊN NGOÀI KHU CHỨA THẺ LẬT */}
                        <div className="mt-4">
                            <FlashCardControl
                                onNext={handleNextCard}
                                onPrev={handlePrevCard}
                                currentIndex={currentCardIndex + 1}
                                totalCards={termsData.length}
                            />
                        </div>
                    </div>

                    {/* Terms List Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span>Các thuật ngữ trong bộ thẻ này ({termsData.length})</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {termsData.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative group"
                                >
                                    <div className="flex-1 pr-4 border-b sm:border-b-0 sm:border-r border-slate-100 pb-2 sm:pb-0">
                                        <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Thuật ngữ #{index + 1}</span>
                                        <p className="text-sm font-bold text-slate-900">{item.term}</p>
                                    </div>
                                    <div className="flex-1 pl-0 sm:pl-4 pr-8">
                                        <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Định nghĩa</span>
                                        <p className="text-sm font-medium text-slate-700">{item.definition}</p>
                                        {item.example && (
                                            <p className="text-xs text-slate-400 italic mt-1">Ví dụ: "{item.example}"</p>
                                        )}
                                    </div>
                                    {(item as any).id && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (window.confirm(`Chuyển từ vựng "${item.term}" vào Thùng Rác?`)) {
                                                    await deleteVocabulary((item as any).id);
                                                }
                                            }}
                                            className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer absolute right-3 top-3 sm:relative sm:right-0 sm:top-0"
                                            title="Xóa từ vựng vào Thùng rác"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FlashCardDetailPage;
