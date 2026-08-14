import { useState, useEffect, useCallback } from 'react';
import folderService, { type FolderDTO } from '../services/folderService';
import studySetService, { type StudySet, type CreateStudySetPayload } from '../services/studySetService';

export const useFolderDetail = (slug?: string) => {
    const [folder, setFolder] = useState<FolderDTO | null>(null);
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const folderData = await folderService.getFolderBySlug(slug);
            setFolder(folderData);

            if (folderData) {
                const sets = await studySetService.getStudySetsByFolderId(folderData.id);
                setStudySets(sets);
            }
        } catch (err: unknown) {
            console.error('Lỗi khi tải chi tiết thư mục:', err);
            setError('Không thể tải dữ liệu chi tiết thư mục.');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const createStudySet = async (payload: CreateStudySetPayload): Promise<StudySet | null> => {
        try {
            const newSet = await studySetService.createStudySet({
                ...payload,
                folderId: folder?.id || payload.folderId,
                folderSlug: folder?.slug || payload.folderSlug,
            });
            setStudySets((prev) => [...prev, newSet]);
            return newSet;
        } catch (err: unknown) {
            console.error('Lỗi khi tạo bộ từ vựng:', err);
            throw err;
        }
    };

    const deleteStudySet = async (setId: number): Promise<boolean> => {
        try {
            const success = await studySetService.deleteStudySet(setId);
            if (success) {
                setStudySets((prev) => prev.filter((s) => s.id !== setId));
                console.log("xóa thành công")
            }
            return success;
        } catch (err: unknown) {
            console.error('Lỗi khi xóa bộ từ vựng:', err);
            return false;
        }
    };

    return {
        folder,
        studySets,
        loading,
        error,
        fetchDetail,
        createStudySet,
        deleteStudySet,
    };
};

export default useFolderDetail;
