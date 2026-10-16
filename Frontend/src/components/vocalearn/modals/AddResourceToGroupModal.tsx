import { useState, useEffect, useMemo } from 'react';
import { FolderKanban, BookOpen, Check, Loader2, Folder, Layers, BookA, FileText, Share2 } from 'lucide-react';
import Modal from '../../common/Modal';
import CustomSelect, { type SelectOption } from '../../common/CustomSelect';
import useFolders from '../../../hooks/useFolders';
import studySetService, { type StudySet } from '../../../services/studySetService';
import { grammarService, type GrammarSetDTO } from '../../../services/grammarService';
import examService, { type ExamDTO } from '../../../services/examService';
import classGroupService from '../../../services/classGroupService';

interface AddResourceToGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId?: number;
    classId?: number;
    onSuccess?: () => void;
}

type ResourceType = 'folder' | 'set' | 'grammar' | 'exam';

const AddResourceToGroupModal = ({ isOpen, onClose, groupId, classId, onSuccess }: AddResourceToGroupModalProps) => {
    const { folders, loading: loadingFolders } = useFolders();
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [loadingSets, setLoadingSets] = useState<boolean>(false);
    const [grammarSets, setGrammarSets] = useState<GrammarSetDTO[]>([]);
    const [loadingGrammar, setLoadingGrammar] = useState<boolean>(false);
    const [exams, setExams] = useState<ExamDTO[]>([]);
    const [loadingExams, setLoadingExams] = useState<boolean>(false);

    const [resourceType, setResourceType] = useState<ResourceType>('folder');
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
    const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(null);
    const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

    const folderOptions: SelectOption[] = useMemo(() => folders.map((f) => ({
        value: f.id,
        label: f.name,
        description: f.description || 'Thư mục cá nhân',
        icon: <Folder className="w-3.5 h-3.5 text-blue-500" />,
    })), [folders]);

    const setOptions: SelectOption[] = useMemo(() => studySets.map((s) => ({
        value: s.id,
        label: s.titleName,
        description: s.description || 'Bộ từ vựng cá nhân',
        icon: <Layers className="w-3.5 h-3.5 text-purple-500" />,
    })), [studySets]);

    const grammarOptions: SelectOption[] = useMemo(() => grammarSets.map((g) => ({
        value: g.id,
        label: g.title || g.slug,
        description: g.description || `${g.grammarCount || 0} chủ điểm ngữ pháp`,
        icon: <BookA className="w-3.5 h-3.5 text-emerald-500" />,
    })), [grammarSets]);

    const examOptions: SelectOption[] = useMemo(() => exams.map((e) => ({
        value: e.id,
        label: e.title,
        description: `${e.totalMinutes || 30} phút • ${e.type || 'TOEIC'}`,
        icon: <FileText className="w-3.5 h-3.5 text-amber-500" />,
    })), [exams]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAllResources();
        }
    }, [isOpen]);

    const fetchAllResources = async () => {
        setLoadingSets(true);
        setLoadingGrammar(true);
        setLoadingExams(true);
        try {
            const [setsList, grammarsList, examsList] = await Promise.all([
                studySetService.getUserStudySets().catch(() => []),
                grammarService.getAllGrammarSets().catch(() => []),
                examService.getPracticeExams().catch(() => []),
            ]);
            setStudySets(setsList);
            if (setsList.length > 0) setSelectedSetId(setsList[0].id);

            setGrammarSets(grammarsList);
            if (grammarsList.length > 0) setSelectedGrammarId(grammarsList[0].id);

            setExams(examsList);
            if (examsList.length > 0) setSelectedExamId(examsList[0].id);
        } catch (err) {
            console.error('Lỗi tải danh sách tài liệu:', err);
        } finally {
            setLoadingSets(false);
            setLoadingGrammar(false);
            setLoadingExams(false);
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
            if (classId) {
                if (resourceType === 'folder' && selectedFolderId) {
                    await classGroupService.addFolderToClass(classId, selectedFolderId);
                    setMessage('Đã chia sẻ Thư mục vào lớp học thành công!');
                } else if (resourceType === 'set' && selectedSetId) {
                    await classGroupService.addStudySetToClass(classId, selectedSetId);
                    setMessage('Đã chia sẻ Bộ từ vựng vào lớp học thành công!');
                } else if (resourceType === 'grammar' && selectedGrammarId) {
                    await classGroupService.addGrammarSetToClass(classId, selectedGrammarId);
                    setMessage('Đã chia sẻ Bộ ngữ pháp vào lớp học thành công!');
                } else if (resourceType === 'exam' && selectedExamId) {
                    await classGroupService.addExamToClass(classId, selectedExamId);
                    setMessage('Đã chia sẻ Bộ đề vào lớp học thành công!');
                }
            } else if (groupId) {
                if (resourceType === 'folder' && selectedFolderId) {
                    await classGroupService.addFolderToGroup(groupId, selectedFolderId);
                    setMessage('Đã chia sẻ Thư mục vào nhóm học thành công!');
                } else if (resourceType === 'set' && selectedSetId) {
                    await classGroupService.addStudySetToGroup(groupId, selectedSetId);
                    setMessage('Đã chia sẻ Bộ từ vựng vào nhóm học thành công!');
                }
            }

            setTimeout(() => {
                setMessage(null);
                onClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            console.error('Lỗi chia sẻ tài liệu:', err);
            setMessage(err?.response?.data?.message || 'Không thể chia sẻ tài liệu. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chia sẻ tài liệu vào Lớp học">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Resource Type Switcher (4 mục: Thư mục, Bộ từ vựng, Bộ ngữ pháp, Bộ đề) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setResourceType('folder')}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            resourceType === 'folder' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                        <span>Thư mục</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setResourceType('set')}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            resourceType === 'set' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>Từ vựng</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setResourceType('grammar')}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            resourceType === 'grammar' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <BookA className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ngữ pháp</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setResourceType('exam')}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            resourceType === 'exam' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Bộ đề thi</span>
                    </button>
                </div>

                {/* 1. Chọn Folder */}
                {resourceType === 'folder' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Thư mục muốn chia sẻ <span className="text-rose-500">*</span>
                        </label>
                        {loadingFolders ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span>Đang tải thư mục cá nhân...</span>
                            </div>
                        ) : folders.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Bạn chưa tạo thư mục nào.</p>
                        ) : (
                            <CustomSelect
                                value={selectedFolderId || ''}
                                onChange={(val) => setSelectedFolderId(val ? Number(val) : null)}
                                options={folderOptions}
                                placeholder="Chọn thư mục..."
                                prefixIcon={<Folder className="w-4 h-4 text-blue-500" />}
                                searchable={folders.length > 4}
                            />
                        )}
                    </div>
                )}

                {/* 2. Chọn StudySet (Từ vựng) */}
                {resourceType === 'set' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Bộ từ vựng muốn chia sẻ <span className="text-rose-500">*</span>
                        </label>
                        {loadingSets ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span>Đang tải bộ từ vựng cá nhân...</span>
                            </div>
                        ) : studySets.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Bạn chưa tạo bộ từ vựng nào.</p>
                        ) : (
                            <CustomSelect
                                value={selectedSetId || ''}
                                onChange={(val) => setSelectedSetId(val ? Number(val) : null)}
                                options={setOptions}
                                placeholder="Chọn bộ từ vựng..."
                                prefixIcon={<Layers className="w-4 h-4 text-purple-500" />}
                                searchable={studySets.length > 4}
                            />
                        )}
                    </div>
                )}

                {/* 3. Chọn GrammarSet (Ngữ pháp) */}
                {resourceType === 'grammar' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Bộ ngữ pháp muốn chia sẻ <span className="text-rose-500">*</span>
                        </label>
                        {loadingGrammar ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                <span>Đang tải bộ ngữ pháp...</span>
                            </div>
                        ) : grammarSets.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Chưa có bộ ngữ pháp nào.</p>
                        ) : (
                            <CustomSelect
                                value={selectedGrammarId || ''}
                                onChange={(val) => setSelectedGrammarId(val ? Number(val) : null)}
                                options={grammarOptions}
                                placeholder="Chọn bộ ngữ pháp..."
                                prefixIcon={<BookA className="w-4 h-4 text-emerald-500" />}
                                searchable={grammarSets.length > 4}
                            />
                        )}
                    </div>
                )}

                {/* 4. Chọn Exam (Bộ đề) */}
                {resourceType === 'exam' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Chọn Bộ đề muốn chia sẻ <span className="text-rose-500">*</span>
                        </label>
                        {loadingExams ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                <span>Đang tải danh sách bộ đề...</span>
                            </div>
                        ) : exams.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Chưa có bộ đề nào trong hệ thống.</p>
                        ) : (
                            <CustomSelect
                                value={selectedExamId || ''}
                                onChange={(val) => setSelectedExamId(val ? Number(val) : null)}
                                options={examOptions}
                                placeholder="Chọn đề thi..."
                                prefixIcon={<FileText className="w-4 h-4 text-amber-500" />}
                                searchable={exams.length > 4}
                            />
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
                        disabled={
                            isSubmitting ||
                            (resourceType === 'folder' && !selectedFolderId) ||
                            (resourceType === 'set' && !selectedSetId) ||
                            (resourceType === 'grammar' && !selectedGrammarId) ||
                            (resourceType === 'exam' && !selectedExamId)
                        }
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        <span>Xác nhận chia sẻ tài liệu</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddResourceToGroupModal;
