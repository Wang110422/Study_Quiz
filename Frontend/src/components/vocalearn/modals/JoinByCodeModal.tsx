import { useState } from 'react';
import { Link2, Check, Loader2 } from 'lucide-react';
import Modal from '../../common/Modal';
import classGroupService from '../../../services/classGroupService';

interface JoinByCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    isTeacher: boolean;
    onSuccess?: () => void;
}

const JoinByCodeModal = ({ isOpen, onClose, isTeacher, onSuccess }: JoinByCodeModalProps) => {
    const [joinCode, setJoinCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);
        setIsError(false);

        try {
            if (isTeacher) {
                await classGroupService.joinClassByCode(joinCode.trim());
                setMessage('Đã gia nhập Lớp học thành công!');
            } else {
                await classGroupService.joinGroupByCode(joinCode.trim());
                setMessage('Đã gia nhập Nhóm học thành công!');
            }

            setTimeout(() => {
                setMessage(null);
                setJoinCode('');
                onClose();
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err: any) {
            console.error('Lỗi khi tham gia:', err);
            setIsError(true);
            setMessage(err?.response?.data?.message || 'Mã tham gia không hợp lệ hoặc đã hết hạn!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isTeacher ? 'Tham gia Lớp học bằng mã' : 'Tham gia Nhóm học bằng mã / link'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className={`p-3 text-xs font-semibold rounded-xl flex items-center gap-2 ${
                        isError ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    }`}>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhập Mã Mời (Join Code) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Ví dụ CLASS-9X82A hoặc GRP-7K92M"
                            required
                            className="w-full pl-9 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none transition-all uppercase tracking-wider"
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Mã tham gia được cung cấp bởi Giáo viên hoặc Trưởng nhóm học.
                    </p>
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
                        disabled={isSubmitting || !joinCode.trim()}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        <span>Gia nhập ngay</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default JoinByCodeModal;
