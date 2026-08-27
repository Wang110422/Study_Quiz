import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Layers } from 'lucide-react';
import studySetService, { type StudySet } from '../../../services/studySetService';
import { type CreatePathPayload } from '../../../services/studyPathService';

interface CreatePathModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreatePathPayload) => Promise<void>;
}

export const CreatePathModal: React.FC<CreatePathModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState('Trung bình');
    const [durationDays, setDurationDays] = useState(30);
    const [icon, setIcon] = useState('🎓');
    const [loading, setLoading] = useState(false);

    const [userStudySets, setUserStudySets] = useState<StudySet[]>([]);
    const [selectedItems, setSelectedItems] = useState<{
        studySetId?: number;
        title: string;
        targetLearnCount: number;
        targetTestCount: number;
    }[]>([
        { title: 'Mốc 1: Từ vựng cơ bản', targetLearnCount: 1, targetTestCount: 3 },
    ]);

    useEffect(() => {
        if (isOpen) {
            studySetService.getAllStudySets().then((sets) => {
                setUserStudySets(sets);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        const nextStep = selectedItems.length + 1;
        setSelectedItems((prev) => [
            ...prev,
            { title: `Mốc ${nextStep}: Từ vựng nâng cao`, targetLearnCount: 1, targetTestCount: 3 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || loading) return;

        setLoading(true);
        try {
            await onSubmit({
                title,
                description,
                level,
                durationDays: Number(durationDays),
                icon,
                items: selectedItems,
            });
            onClose();
        } catch (err) {
            console.error('Lỗi khi tạo lộ trình:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>🎓 Tạo Lộ trình học mới</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Tên lộ trình học *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ví dụ: Lộ trình IELTS 7.0 Cấp tốc"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Biểu tượng Icon</label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600 text-center"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Trình độ</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                            >
                                <option value="Cơ bản">Cơ bản</option>
                                <option value="Trung bình">Trung bình</option>
                                <option value="Nâng cao">Nâng cao</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Thời gian (ngày)</label>
                            <input
                                type="number"
                                min={1}
                                value={durationDays}
                                onChange={(e) => setDurationDays(Number(e.target.value))}
                                className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600 text-center"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Mô tả ngắn</label>
                        <textarea
                            rows={2}
                            placeholder="Mô tả mục tiêu lộ trình..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                        />
                    </div>

                    {/* Danh sách các Mốc Bộ thẻ */}
                    <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-blue-600" />
                                Các mốc bộ thẻ trong lộ trình ({selectedItems.length})
                            </span>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm mốc
                            </button>
                        </div>

                        {/* Thanh cuộn bên trong danh sách mốc chọn bộ thẻ */}
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                            {selectedItems.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-600">Mốc #{idx + 1}</span>
                                    {selectedItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Tên mốc</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedItems((prev) =>
                                                    prev.map((it, i) => (i === idx ? { ...it, title: val } : it))
                                                );
                                            }}
                                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Bộ thẻ liên kết</label>
                                        <select
                                            value={item.studySetId || ''}
                                            onChange={(e) => {
                                                const setId = Number(e.target.value);
                                                const foundSet = userStudySets.find((s) => s.id === setId);
                                                setSelectedItems((prev) =>
                                                    prev.map((it, i) =>
                                                        i === idx
                                                            ? {
                                                                ...it,
                                                                studySetId: setId || undefined,
                                                                title: foundSet ? foundSet.titleName : it.title,
                                                            }
                                                            : it
                                                    )
                                                );
                                            }}
                                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl"
                                        >
                                            <option value="">-- Chọn bộ thẻ --</option>
                                            {userStudySets.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.titleName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Yêu cầu Học (lần)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.targetLearnCount}
                                            onChange={(e) => {
                                                const num = Number(e.target.value);
                                                setSelectedItems((prev) =>
                                                    prev.map((it, i) => (i === idx ? { ...it, targetLearnCount: num } : it))
                                                );
                                            }}
                                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Yêu cầu Kiểm tra (lần)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.targetTestCount}
                                            onChange={(e) => {
                                                const num = Number(e.target.value);
                                                setSelectedItems((prev) =>
                                                    prev.map((it, i) => (i === idx ? { ...it, targetTestCount: num } : it))
                                                );
                                            }}
                                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo lộ trình học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePathModal;
