import { useState, useEffect, useCallback } from 'react';
import studyPathService, { type StudyPathDTO, type CreatePathPayload } from '../services/studyPathService';

export const useStudyPaths = () => {
    const [paths, setPaths] = useState<StudyPathDTO[]>([]);
    const [selectedPath, setSelectedPath] = useState<StudyPathDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPaths = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await studyPathService.getUserPaths();
            setPaths(data);
            if (data.length > 0) {
                setSelectedPath(data[0]);
            }
        } catch (err: any) {
            console.error('Lỗi khi tải lộ trình học:', err);
            setError('Không thể tải danh sách lộ trình học.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPaths();
    }, [fetchPaths]);

    const selectPathById = (id: number) => {
        const found = paths.find((p) => p.id === id);
        if (found) setSelectedPath(found);
    };

    const createPath = async (payload: CreatePathPayload): Promise<StudyPathDTO | null> => {
        try {
            const newPath = await studyPathService.createPath(payload);
            setPaths((prev) => [newPath, ...prev]);
            setSelectedPath(newPath);
            return newPath;
        } catch (err) {
            console.error('Lỗi khi tạo lộ trình mới:', err);
            throw err;
        }
    };

    const updateItemProgress = async (itemId: number, mode: 'LEARN' | 'TEST') => {
        try {
            const updatedItem = await studyPathService.updateItemProgress(itemId, mode);
            if (updatedItem) {
                // Tải lại lộ trình hiện tại để cập nhật trạng thái các mốc
                await fetchPaths();
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật tiến trình mốc bộ thẻ:', err);
        }
    };

    const deletePath = async (id: number) => {
        try {
            const ok = await studyPathService.deletePath(id);
            if (ok) {
                const nextList = paths.filter((p) => p.id !== id);
                setPaths(nextList);
                setSelectedPath(nextList.length > 0 ? nextList[0] : null);
            }
        } catch (err) {
            console.error('Lỗi khi xóa lộ trình:', err);
        }
    };

    return {
        paths,
        selectedPath,
        loading,
        error,
        selectPathById,
        refetch: fetchPaths,
        createPath,
        updateItemProgress,
        deletePath,
    };
};

export default useStudyPaths;
