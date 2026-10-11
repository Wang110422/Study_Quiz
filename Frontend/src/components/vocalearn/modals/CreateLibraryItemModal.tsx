import Modal from '../../common/Modal';
import { Folder, Layers, PenTool, ChevronRight } from 'lucide-react';

interface CreateLibraryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectFolder: () => void;
    onSelectStudySet: () => void;
    onSelectGrammarSet: () => void;
}

const CreateLibraryItemModal = ({
    isOpen,
    onClose,
    onSelectFolder,
    onSelectStudySet,
    onSelectGrammarSet,
}: CreateLibraryItemModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tạo mới nội dung" maxWidth="md">
            <div className="space-y-3.5 text-slate-900 select-none">
                <p className="text-xs text-slate-400 font-medium -mt-2 mb-4">
                    Chọn loại nội dung bạn muốn thêm vào thư viện cá nhân
                </p>

                {/* Mục 1: Tạo thư mục */}
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        onSelectFolder();
                    }}
                    className="w-full flex items-center gap-4 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-400 rounded-2xl p-4 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            Tạo thư mục
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                            Gom nhóm và sắp xếp các bộ thẻ, bài học theo chủ đề hoặc môn học
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>

                {/* Mục 2: Tạo bộ từ vựng */}
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        onSelectStudySet();
                    }}
                    className="w-full flex items-center gap-4 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-4 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            Tạo bộ từ vựng
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                            Tạo danh sách các thuật ngữ, phiên âm, định nghĩa và ví dụ để ôn tập
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>

                {/* Mục 3: Tạo bộ ngữ pháp */}
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        onSelectGrammarSet();
                    }}
                    className="w-full flex items-center gap-4 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-4 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-md active:scale-[0.99]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                        <PenTool className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                            Tạo bộ ngữ pháp
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                            Tạo cấu trúc câu, giải thích ngữ pháp và bài học chuyên sâu
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>
            </div>
        </Modal>
    );
};

export default CreateLibraryItemModal;
