import { useState, useEffect } from 'react';
import { FolderKanban, BookOpen, Check, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import useFolders from '../../../hooks/useFolders';
import studySetService, { type StudySet } from '../../../services/studySetService';
import classGroupService from '../../../services/classGroupService';

interface AddResourceToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: number;
    classId?: number;
    onSuccess?: () => void;
}

const AddResourceToGroupModal = ({ isOpen, onClose, groupId, classId, onSuccess }: AddResourceToGroupModalProps) => {
    const { folders, loading: loadingFolders } = useFolders();
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [loadingSets, setLoadingSets] = useState<boolean>(false);

    const [resourceType, setResourceType] = useState<'folder' | 'set'>('folder');
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedSetId, setSelectedSetId] = useState<number | null>(null);

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
            const list = await studySetService.getUserStudySets();
            setStudySets(list);
            if (list.length > 0) setSelectedSetId(list[0].id);
        } catch (err) {
            console.error('Lỗi tải bộ thẻ:', err);
        } finally {
            setLoadingSets(false);
        }
    };

    useEffect(() => {
        if (folders.length > 0 && !selectedFolderId) {
            setSelectedFolderId(folders[0].id);
        }
    }, [folders, selectedFolderId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            if (groupId) {
                if (resourceType === 'folder' && selectedFolderId) {
                    await classGroupService.addFolderToGroup(groupId, selectedFolderId);
                    setMessage('Đã thêm Thư mục vào nhóm học thành công!');
                } else if (resourceType === 'set' && selectedSetId) {
                    await classGroupService.addStudySetToGroup(groupId, selectedSetId);
                    setMessage('Đã thêm Bộ từ vựng vào nhóm học thành công!');
                }
            } else if (classId) {
                if (resourceType === 'folder' && selectedFolderId) {
                    await classGroupService.addFolderToClass(classId, selectedFolderId);
                    setMessage('Đã thêm Thư mục vào lớp học thành công!');
                } else if (resourceType === 'set' && selectedSetId) {
                    await classGroupService.addStudySetToClass(classId, selectedSetId);
                    setMessage('Đã thêm Bộ từ vựng vào lớp học thành công!');
                }
            }

            setTimeout(() => {
                setMessage(null);
                onClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            console.error('Lỗi thêm tài liệu:', err);
            setMessage(err?.response?.data?.message || 'Không thể thêm tài liệu. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm Tài liệu / Thư mục vào Nhóm học">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Resource Type Switcher */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setResourceType('folder')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            resourceType === 'folder' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <FolderKanban className="w-4 h-4 text-blue-600" />
                        <span>Thư mục cá nhân</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setResourceType('set')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            resourceType === 'set' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>Bộ từ vựng cá nhân</span>
                    </button>
                </div>

                {/* Select Folder */}
                {resourceType === 'folder' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Thư mục muốn thêm vào nhóm <span className="text-rose-500">*</span>
                        </label>
                        {loadingFolders ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Đang tải thư mục cá nhân...</span>
                            </div>
                        ) : folders.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Bạn chưa tạo thư mục nào.</p>
                        ) : (
                            <select
                                value={selectedFolderId || ''}
                                onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                            >
                                {folders.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        📁 Thư mục: {f.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Select StudySet */}
                {resourceType === 'set' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Bộ từ vựng muốn thêm vào nhóm <span className="text-rose-500">*</span>
                        </label>
                        {loadingSets ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span>Đang tải bộ từ vựng cá nhân...</span>
                            </div>
                        ) : studySets.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Bạn chưa tạo bộ từ vựng nào.</p>
                        ) : (
                            <select
                                value={selectedSetId || ''}
                                onChange={(e) => setSelectedSetId(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer"
                            >
                                {studySets.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        📚 Bộ thẻ: {s.titleName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

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
                        disabled={isSubmitting || (resourceType === 'folder' && !selectedFolderId) || (resourceType === 'set' && !selectedSetId)}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Xác nhận thêm vào Nhóm</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddResourceToGroupModal;
