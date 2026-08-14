import { useState, useEffect } from 'react';
import { Layers, Plus, Check, FolderKanban, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import useFolders from '../../../hooks/useFolders';
import studySetService, { type StudySet } from '../../../services/studySetService';
import type { ExtractedVocabulary } from '../../../services/docScannerService';

interface AddToSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedVocabs: ExtractedVocabulary[];
    onSuccess?: () => void;
}

const AddToSetModal = ({ isOpen, onClose, selectedVocabs, onSuccess }: AddToSetModalProps) => {
    const { folders, loading: loadingFolders } = useFolders();
    const [mode, setMode] = useState<'existing' | 'new'>('existing');

    // Bộ thẻ có sẵn
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [loadingSets, setLoadingSets] = useState<boolean>(false);
    const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

    // Tạo bộ thẻ mới
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedFolderSlug, setSelectedFolderSlug] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchSets();
        }
    }, [isOpen]);

    const fetchSets = async () => {
        setLoadingSets(true);
        try {
            const allSets = await studySetService.getAllStudySets();
            setStudySets(allSets);
            if (allSets.length > 0) {
                setSelectedSetId(allSets[0].id);
            } else {
                setMode('new');
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách bộ thẻ:', err);
            setMode('new');
        } finally {
            setLoadingSets(false);
        }
    };

    useEffect(() => {
        if (folders.length > 0 && !selectedFolderSlug) {
            setSelectedFolderSlug(folders[0].slug);
        }
    }, [folders, selectedFolderSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedVocabs.length === 0 || isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const formattedVocabs = selectedVocabs.map((v) => ({
                term: v.term,
                definition: v.definition,
                example: v.example || '',
            }));

            if (mode === 'existing' && selectedSetId) {
                const targetSet = studySets.find((s) => s.id === selectedSetId);
                if (targetSet) {
                    await studySetService.createStudySet({
                        titleName: targetSet.titleName,
                        description: targetSet.description,
                        folderId: targetSet.folderId,
                        folderSlug: targetSet.folderSlug,
                        vocabularies: formattedVocabs,
                    });
                }
            } else {
                if (!newTitle.trim()) return;
                const selectedFolder = folders.find((f) => f.slug === selectedFolderSlug);
                await studySetService.createStudySet({
                    titleName: newTitle.trim(),
                    description: newDescription.trim(),
                    folderId: selectedFolder?.id,
                    folderSlug: selectedFolderSlug || 'tieng-anh',
                    vocabularies: formattedVocabs,
                });
            }

            setMessage(`Đã thêm thành công ${selectedVocabs.length} từ vựng!`);
            setTimeout(() => {
                setMessage(null);
                onClose();
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Lỗi khi lưu từ vựng vào bộ thẻ:', err);
            setMessage('Không thể lưu từ vựng. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Thêm ${selectedVocabs.length} từ vựng vào Bộ thẻ`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Switch Mode Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setMode('existing')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === 'existing'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Bộ từ vựng có sẵn
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('new')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === 'new'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        + Tạo Bộ từ vựng mới
                    </button>
                </div>

                {/* MODE 1: CHỌN BỘ TỪ VỰNG CÓ SẴN */}
                {mode === 'existing' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn bộ từ vựng đích <span className="text-rose-500">*</span>
                        </label>
                        {loadingSets ? (
                            <div className="py-4 flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Đang tải danh sách bộ thẻ...</span>
                            </div>
                        ) : studySets.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">
                                Bạn chưa có bộ từ vựng nào. Hãy chọn "+ Tạo Bộ từ vựng mới" ở trên!
                            </p>
                        ) : (
                            <select
                                value={selectedSetId || ''}
                                onChange={(e) => setSelectedSetId(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                            >
                                {studySets.map((set) => (
                                    <option key={set.id} value={set.id}>
                                        📚 {set.titleName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* MODE 2: TẠO BỘ TỪ VỰNG MỚI */}
                {mode === 'new' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tên bộ từ vựng mới <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder='Ví dụ "Từ vựng IELTS Quét từ sách Cambridge"'
                                required
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Mô tả ngắn
                            </label>
                            <input
                                type="text"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Thêm mô tả cho bộ thẻ từ vựng này..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Thư mục lưu trữ
                            </label>
                            <select
                                value={selectedFolderSlug}
                                onChange={(e) => setSelectedFolderSlug(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                            >
                                {loadingFolders ? (
                                    <option value="">Đang tải thư mục...</option>
                                ) : (
                                    folders.map((f) => (
                                        <option key={f.id || f.slug} value={f.slug}>
                                            📁 Thư mục: {f.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                )}

                {/* Form Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedVocabs.length === 0 || (mode === 'new' && !newTitle.trim())}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        <span>Xác nhận thêm ({selectedVocabs.length})</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddToSetModal;
