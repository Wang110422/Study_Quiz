import { useEffect, useState, useCallback } from "react";
import studySetService, { type StudySet, type CreateStudySetPayload } from "../services/studySetService";

export const useStudySet = (folderId?: number) => {
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Hàm Tải danh sách bộ từ vựng
    const fetchStudySets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = folderId
                ? await studySetService.getStudySetsByFolderId(folderId)
                : await studySetService.getUserStudySets();
            setStudySets(data);
        } catch (err: unknown) {
            console.error('Lỗi khi tải bộ thẻ:', err);
            const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi tải danh sách bộ từ vựng.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [folderId]);

    useEffect(() => {
        fetchStudySets();
    }, [fetchStudySets]);

    // 2. Hàm Tạo bộ từ vựng mới
    const createStudySet = async (payload: CreateStudySetPayload): Promise<StudySet | null> => {
        try {
            const newSet = await studySetService.createStudySet({
                ...payload,
                folderId: folderId || payload.folderId,
            });
            setStudySets((prev) => [newSet, ...prev]);
            return newSet;
        } catch (err: unknown) {
            console.error('Lỗi khi tạo bộ từ vựng:', err);
            throw err;
        }
    };

    // 3. Hàm Xóa bộ từ vựng
    const deleteStudySet = async (id: number): Promise<boolean> => {
        try {
            const success = await studySetService.deleteStudySet(id);
            if (success) {
                setStudySets((prev) => prev.filter((s) => s.id !== id));
            }
            return success;
        } catch (err: unknown) {
            console.error('Lỗi khi xóa bộ từ vựng:', err);
            return false;
        }
    };

    return {
        studySets,
        studySet: studySets, // Giữ alias tương thích ngược với code cũ
        loading,
        error,
        refetch: fetchStudySets,
        createStudySet,
        deleteStudySet,
    };
};

export default useStudySet;