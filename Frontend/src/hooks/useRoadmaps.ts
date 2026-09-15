import { useState, useEffect, useCallback } from 'react';
import roadmapService, {
    type RoadmapDTO,
    type CreateRoadmapPayload,
} from '../services/roadmapService';

export const useRoadmaps = () => {
    const [roadmaps, setRoadmaps] = useState<RoadmapDTO[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoadmaps = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roadmapService.getAllRoadmaps();
            setRoadmaps(data);
            if (data.length > 0) {
                // Preserve selection if still exists, otherwise pick first
                setSelectedRoadmap((prev) => {
                    if (prev) {
                        const existing = data.find((r) => r.id === prev.id);
                        if (existing) return existing;
                    }
                    return data[0];
                });
            } else {
                setSelectedRoadmap(null);
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách lộ trình học:', err);
            setError('Không thể tải danh sách lộ trình.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    const selectRoadmapById = (id: number) => {
        const found = roadmaps.find((r) => r.id === id);
        if (found) setSelectedRoadmap(found);
    };

    const createRoadmap = async (payload: CreateRoadmapPayload): Promise<RoadmapDTO | null> => {
        try {
            const created = await roadmapService.createRoadmap(payload);
            await fetchRoadmaps();
            return created;
        } catch (err) {
            console.error('Lỗi khi tạo lộ trình mới:', err);
            throw err;
        }
    };

    const updateTaskProgress = async (
        taskId: number,
        payload: { score?: number; isCompleted?: boolean; mode?: 'LEARN' | 'TEST' | 'COMPLETE' }
    ) => {
        try {
            await roadmapService.updateTaskProgress(taskId, payload);
            await fetchRoadmaps();
        } catch (err) {
            console.error('Lỗi khi cập nhật tiến độ task:', err);
        }
    };

    const deleteRoadmap = async (id: number) => {
        try {
            const ok = await roadmapService.deleteRoadmap(id);
            if (ok) {
                const nextList = roadmaps.filter((r) => r.id !== id);
                setRoadmaps(nextList);
                setSelectedRoadmap(nextList.length > 0 ? nextList[0] : null);
            }
        } catch (err) {
            console.error('Lỗi khi xóa lộ trình:', err);
        }
    };

    return {
        roadmaps,
        selectedRoadmap,
        loading,
        error,
        selectRoadmapById,
        refetch: fetchRoadmaps,
        createRoadmap,
        updateTaskProgress,
        deleteRoadmap,
    };
};

export default useRoadmaps;
