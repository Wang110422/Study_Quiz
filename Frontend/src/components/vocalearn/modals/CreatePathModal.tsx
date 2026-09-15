import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Layers, Flag, CheckCircle2 } from 'lucide-react';
import studySetService, { type StudySet } from '../../../services/studySetService';
import { type CreateRoadmapPayload, type TaskType } from '../../../services/roadmapService';

interface CreatePathModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateRoadmapPayload) => Promise<void>;
}

export const CreatePathModal: React.FC<CreatePathModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [targetScore, setTargetScore] = useState(650);
    const [totalEstimatedDays, setTotalEstimatedDays] = useState(30);
    const [loading, setLoading] = useState(false);

    const [userStudySets, setUserStudySets] = useState<StudySet[]>([]);

    // Phases list, each phase has title, min score, and its tasks
    const [phases, setPhases] = useState<{
        title: string;
        minAvgScoreToPass: number;
        minAccuracyRace: number;
        tasks: {
            title: string;
            taskType: TaskType;
            targetId?: number;
            orderIndex: number;
        }[];
    }[]>([
        {
            title: 'Chặng 1 · Lấy gốc ngữ pháp & từ vựng',
            minAvgScoreToPass: 70,
            minAccuracyRace: 70,
            tasks: [
                { title: 'Học từ vựng · buổi 1', taskType: 'VOCABULARY', orderIndex: 1 },
                { title: 'Học ngữ pháp · buổi 2', taskType: 'GRAMMAR', orderIndex: 2 },
                { title: 'Luyện đề phản xạ câu · buổi 3', taskType: 'PRACTICE_QUESTION', orderIndex: 3 },
                { title: 'Kiểm tra mốc chặng 1', taskType: 'FULL_EXAM', orderIndex: 4 },
            ],
        },
    ]);

    useEffect(() => {
        if (isOpen) {
            studySetService.getAllStudySets().then((sets) => {
                setUserStudySets(sets || []);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Add Phase
    const handleAddPhase = () => {
        const nextOrder = phases.length + 1;
        setPhases((prev) => [
            ...prev,
            {
                title: `Chặng ${nextOrder} · Nâng cao kỹ năng & giải đề`,
                minAvgScoreToPass: 75,
                minAccuracyRace: 75,
                tasks: [
                    { title: `Từ vựng chuyên sâu Chặng ${nextOrder}`, taskType: 'VOCABULARY', orderIndex: 1 },
                    { title: `Luyện đề kỹ năng Chặng ${nextOrder}`, taskType: 'PRACTICE_QUESTION', orderIndex: 2 },
                    { title: `Kiểm tra mốc Chặng ${nextOrder}`, taskType: 'FULL_EXAM', orderIndex: 3 },
                ],
            },
        ]);
    };

    // Remove Phase
    const handleRemovePhase = (phaseIndex: number) => {
        if (phases.length <= 1) return;
        setPhases((prev) => prev.filter((_, idx) => idx !== phaseIndex));
    };

    // Add Task to a Phase
    const handleAddTask = (phaseIndex: number) => {
        setPhases((prev) =>
            prev.map((phase, pIdx) => {
                if (pIdx !== phaseIndex) return phase;
                const nextTaskOrder = phase.tasks.length + 1;
                return {
                    ...phase,
                    tasks: [
                        ...phase.tasks,
                        {
                            title: `Tác vụ mới · buổi ${nextTaskOrder}`,
                            taskType: 'VOCABULARY',
                            orderIndex: nextTaskOrder,
                        },
                    ],
                };
            })
        );
    };

    // Remove Task from a Phase
    const handleRemoveTask = (phaseIndex: number, taskIndex: number) => {
        setPhases((prev) =>
            prev.map((phase, pIdx) => {
                if (pIdx !== phaseIndex) return phase;
                if (phase.tasks.length <= 1) return phase;
                return {
                    ...phase,
                    tasks: phase.tasks.filter((_, tIdx) => tIdx !== taskIndex),
                };
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || loading) return;

        setLoading(true);
        try {
            await onSubmit({
                title,
                targetScore: Number(targetScore),
                totalEstimatedDays: Number(totalEstimatedDays),
                phases: phases.map((p) => ({
                    title: p.title,
                    minAvgScoreToPass: Number(p.minAvgScoreToPass),
                    minAccuracyRace: Number(p.minAccuracyRace),
                    tasks: p.tasks.map((t, idx) => ({
                        title: t.title,
                        taskType: t.taskType,
                        targetId: t.targetId ? Number(t.targetId) : undefined,
                        orderIndex: idx + 1,
                    })),
                })),
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
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>🎯 Tạo Lộ trình học mới (Chặng & Tác vụ)</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Thông tin chung Lộ trình */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Tên lộ trình học *</label>
                            <input
                                type="text"
                                required
                                placeholder="Ví dụ: Lộ trình TOEIC 650+ Bứt Phá"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5">Điểm mục tiêu (Target Score)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={targetScore}
                                    onChange={(e) => setTargetScore(Number(e.target.value))}
                                    className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5">Thời gian ước tính (ngày)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={totalEstimatedDays}
                                    onChange={(e) => setTotalEstimatedDays(Number(e.target.value))}
                                    className="w-full px-4 py-3 text-sm font-semibold border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Danh sách các Chặng (Phases) */}
                    <div className="pt-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Flag className="w-4 h-4 text-blue-600" />
                                Các chặng trong lộ trình ({phases.length} chặng)
                            </span>
                            <button
                                type="button"
                                onClick={handleAddPhase}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm chặng mới
                            </button>
                        </div>

                        {phases.map((phase, pIdx) => (
                            <div key={pIdx} className="p-5 bg-slate-50/80 border border-slate-200 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 bg-blue-600 text-white font-extrabold text-xs rounded-xl">
                                            CHẶNG {pIdx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={phase.title}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPhases((prev) =>
                                                    prev.map((p, idx) => (idx === pIdx ? { ...p, title: val } : p))
                                                );
                                            }}
                                            placeholder="Tên chặng..."
                                            className="px-3 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-xl w-64 sm:w-80 outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    {phases.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhase(pIdx)}
                                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
                                            title="Xóa chặng này"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Điểm tối thiểu qua chặng</label>
                                        <input
                                            type="number"
                                            value={phase.minAvgScoreToPass}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPhases((prev) =>
                                                    prev.map((p, idx) => (idx === pIdx ? { ...p, minAvgScoreToPass: val } : p))
                                                );
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Tỉ lệ đúng tối thiểu (%)</label>
                                        <input
                                            type="number"
                                            value={phase.minAccuracyRace}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPhases((prev) =>
                                                    prev.map((p, idx) => (idx === pIdx ? { ...p, minAccuracyRace: val } : p))
                                                );
                                            }}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Danh sách tác vụ của chặng */}
                                <div className="pt-2 border-t border-slate-200/60 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span className="flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-blue-600" /> Các tác vụ trong chặng ({phase.tasks.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleAddTask(pIdx)}
                                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" /> Thêm tác vụ
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {phase.tasks.map((task, tIdx) => (
                                            <div key={tIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
                                                <span className="text-xs font-extrabold text-slate-400 shrink-0 w-8 text-center">
                                                    #{tIdx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={task.title}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPhases((prev) =>
                                                            prev.map((p, pi) =>
                                                                pi === pIdx
                                                                    ? {
                                                                          ...p,
                                                                          tasks: p.tasks.map((t, ti) =>
                                                                              ti === tIdx ? { ...t, title: val } : t
                                                                          ),
                                                                      }
                                                                    : p
                                                            )
                                                        );
                                                    }}
                                                    placeholder="Tên tác vụ..."
                                                    className="flex-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                                                />
                                                <select
                                                    value={task.taskType}
                                                    onChange={(e) => {
                                                        const val = e.target.value as TaskType;
                                                        setPhases((prev) =>
                                                            prev.map((p, pi) =>
                                                                pi === pIdx
                                                                    ? {
                                                                          ...p,
                                                                          tasks: p.tasks.map((t, ti) =>
                                                                              ti === tIdx ? { ...t, taskType: val } : t
                                                                          ),
                                                                      }
                                                                    : p
                                                            )
                                                        );
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
                                                >
                                                    <option value="VOCABULARY">Học từ vựng</option>
                                                    <option value="GRAMMAR">Ngữ pháp</option>
                                                    <option value="PRACTICE_QUESTION">Luyện đề</option>
                                                    <option value="FULL_EXAM">Kiểm tra/Thi thử</option>
                                                </select>

                                                {task.taskType === 'VOCABULARY' && userStudySets.length > 0 && (
                                                    <select
                                                        value={task.targetId || ''}
                                                        onChange={(e) => {
                                                            const setId = Number(e.target.value);
                                                            const found = userStudySets.find((s) => s.id === setId);
                                                            setPhases((prev) =>
                                                                prev.map((p, pi) =>
                                                                    pi === pIdx
                                                                        ? {
                                                                              ...p,
                                                                              tasks: p.tasks.map((t, ti) =>
                                                                                  ti === tIdx
                                                                                      ? {
                                                                                            ...t,
                                                                                            targetId: setId || undefined,
                                                                                            title: found ? found.titleName : t.title,
                                                                                        }
                                                                                      : t
                                                                              ),
                                                                          }
                                                                        : p
                                                                )
                                                            );
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl max-w-[160px] truncate"
                                                    >
                                                        <option value="">-- Bộ thẻ --</option>
                                                        {userStudySets.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.titleName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}

                                                {phase.tasks.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTask(pIdx, tIdx)}
                                                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer"
                                                        title="Xóa tác vụ"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer"
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
