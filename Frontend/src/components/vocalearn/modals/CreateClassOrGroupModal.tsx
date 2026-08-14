import { useState } from 'react';
import { School, Users, Check, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import classGroupService from '../../../services/classGroupService';

interface CreateClassOrGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    isTeacher: boolean;
    onSuccess?: () => void;
}

const CreateClassOrGroupModal = ({ isOpen, onClose, isTeacher, onSuccess }: CreateClassOrGroupModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            if (isTeacher) {
                await classGroupService.createClass({ name: name.trim(), description: description.trim() });
                setMessage('Đã tạo Lớp học mới thành công!');
            } else {
                await classGroupService.createGroup({ name: name.trim(), description: description.trim() });
                setMessage('Đã tạo Nhóm học tập mới thành công!');
            }

            setTimeout(() => {
                setMessage(null);
                setName('');
                setDescription('');
                onClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            console.error('Lỗi khi tạo lớp/nhóm:', err);
            setMessage(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const titleText = isTeacher ? 'Tạo Lớp học mới (Giáo viên)' : 'Tạo Nhóm học tập mới (Sinh viên)';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={titleText}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{message}</span>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isTeacher ? 'Tên lớp học' : 'Tên nhóm học'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isTeacher ? 'Ví dụ "Tiếng Anh 10A1"' : 'Ví dụ "Nhóm Ôn Thi IELTS 7.0"'}
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder={isTeacher ? 'Mô tả chương trình học và mục tiêu...' : 'Mô tả mục tiêu học tập nhóm...'}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition-all resize-none"
                    />
                </div>

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
                        disabled={isSubmitting || !name.trim()}
                        className={`flex items-center gap-1.5 px-5 py-2 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
                            isTeacher ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isTeacher ? (
                            <School className="w-4 h-4" />
                        ) : (
                            <Users className="w-4 h-4" />
                        )}
                        <span>{isTeacher ? 'Xác nhận tạo Lớp' : 'Xác nhận tạo Nhóm'}</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateClassOrGroupModal;
