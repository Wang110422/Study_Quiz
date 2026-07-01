import { Link } from "react-router-dom";
import useStudySet from "../hooks/useStudySet";


const StudySetPage = () => {
    const { studySet, loading, error } = useStudySet();

    // 1. Trận chiến giao diện: Xử lý khi API đang tải dữ liệu
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600">Đang tải bộ học phần...</span>
            </div>
        );
    }

    // 2. Trận chiến giao diện: Xử lý khi API bị lỗi mạng/lỗi server
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500 font-medium">
                ❌ Lỗi: {error}
            </div>
        );
    }

    if (!studySet) {
        return (
            <div className="flex justify-center items-center min-h-screen text-slate-500">
                Không tìm thấy thông tin bộ chủ đề này!
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studySet.map((set: any) => (
                        /* 2. Biến mỗi phần tử thành một thẻ <Link> */
                        <Link
                            to={`/studyset/${set.slug}`} // Đường dẫn động dẫn tới slug của bộ đó (Ví dụ: /studyset/vocabulary-basics)
                            key={set.id}
                            className="block p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer text-left"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {set.titleName}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {set.description || "Bấm vào để bắt đầu học flashcard"}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="bg-gray-100 p-4 text-center text-gray-600">
                © 2024 Study Quiz. All rights reserved.
            </div>
        </div >
    );
};

export default StudySetPage;