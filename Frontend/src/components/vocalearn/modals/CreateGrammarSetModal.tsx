import { useState, useMemo } from 'react';
import Modal from '../../common/Modal';
import CustomSelect, { type SelectOption } from '../../common/CustomSelect';
import { Folder, GraduationCap } from 'lucide-react';
import grammarService, { type GrammarSetDTO } from '../../../services/grammarService';
import type { FolderDTO } from '../../../services/folderService';

interface CreateGrammarSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    folders?: FolderDTO[];
    onSuccess?: (created: GrammarSetDTO) => void;
}

const levels = ['A1 - A2 (Cơ bản)', 'B1 - B2 (Trung cấp)', 'C1 - C2 (Nâng cao)'];

const CreateGrammarSetModal = ({
    isOpen,
    onClose,
    folders = [],
    onSuccess,
}: CreateGrammarSetModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState(levels[1]);
    const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const levelOptions: SelectOption[] = useMemo(() => [
        { value: 'A1 - A2 (Cơ bản)', label: 'A1 - A2 (Cơ bản)', description: 'Dành cho người mới bắt đầu', icon: <GraduationCap className="w-4 h-4 text-blue-500" /> },
        { value: 'B1 - B2 (Trung cấp)', label: 'B1 - B2 (Trung cấp)', description: 'Nắm vững cấu trúc câu & giao tiếp', icon: <GraduationCap className="w-4 h-4 text-indigo-500" /> },
        { value: 'C1 - C2 (Nâng cao)', label: 'C1 - C2 (Nâng cao)', description: 'Học thuật chuyên sâu & thi chứng chỉ', icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
    ], []);

    const folderOptions: SelectOption[] = useMemo(() => [
        { value: '', label: 'Không phân thư mục', description: 'Tạo bộ ngữ pháp độc lập trong thư viện' },
        ...folders.map((f) => ({
            value: f.id,
            label: f.name,
            description: f.description || 'Thư mục cá nhân',
            icon: <Folder className="w-4 h-4 text-blue-500" />,
        })),
    ], [folders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const created = await grammarService.createGrammarSet({
                title: title.trim(),
                description: description.trim(),
                level: level,
                folderId: selectedFolderId,
            });

            if (created) {
                if (onSuccess) onSuccess(created);
                setTitle('');
                setDescription('');
                setLevel(levels[1]);
                setSelectedFolderId(undefined);
                onClose();
            }
        } catch (err: any) {
            console.error('Lỗi khi tạo bộ ngữ pháp:', err);
            setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo bộ ngữ pháp. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ ngữ pháp mới">
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 select-none">
                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tên bộ ngữ pháp <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Thì Hiện tại hoàn thành, Mệnh đề quan hệ..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mô tả ngắn
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả về cấu trúc và các điểm lưu ý chính..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Trình độ
                        </label>
                        <CustomSelect
                            value={level}
                            onChange={(val) => setLevel(val)}
                            options={levelOptions}
                            placeholder="Chọn trình độ"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Lưu vào thư mục (tùy chọn)
                        </label>
                        <CustomSelect
                            value={selectedFolderId || ''}
                            onChange={(val) => setSelectedFolderId(val ? Number(val) : undefined)}
                            options={folderOptions}
                            placeholder="Chọn thư mục"
                            prefixIcon={<Folder className="w-4 h-4 text-slate-400" />}
                            searchable={folders.length > 4}
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                        {isSubmitting ? 'Đang tạo...' : 'Tạo bộ ngữ pháp'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGrammarSetModal;
