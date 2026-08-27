import { useState, useEffect, useCallback } from 'react';
import AuthService, { type UserProfile } from '../services/authService';
import classGroupService, { type ClassOrGroup } from '../services/classGroupService';

export const useClassOrGroupDetail = (targetId: number, isClassRoute: boolean) => {
    const [groupData, setGroupData] = useState<ClassOrGroup | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch current user
    useEffect(() => {
        AuthService.getCurrentUser().then((u) => setCurrentUser(u));
    }, []);

    // 2. Fetch detail for class or group
    const fetchDetail = useCallback(async () => {
        if (!targetId || isNaN(targetId)) return;
        setLoading(true);
        setError(null);
        try {
            if (isClassRoute) {
                const detail = await classGroupService.getClassById(targetId);
                setGroupData(detail || null);
            } else {
                const detail = await classGroupService.getGroupById(targetId);
                setGroupData(detail || null);
            }
        } catch (err: unknown) {
            console.error('Lỗi khi tải chi tiết lớp/nhóm:', err);
            setError('Không thể tải thông tin chi tiết.');
        } finally {
            setLoading(false);
        }
    }, [targetId, isClassRoute]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // 3. Add StudySet to Class / Group
    const addStudySet = async (studySetId: number) => {
        if (!targetId) return;
        try {
            if (isClassRoute) {
                await classGroupService.addStudySetToClass(targetId, studySetId);
            } else {
                await classGroupService.addStudySetToGroup(targetId, studySetId);
            }
            await fetchDetail();
        } catch (err: unknown) {
            console.error('Lỗi khi thêm bộ thẻ vào lớp/nhóm:', err);
            throw err;
        }
    };

    // 4. Add Folder to Class / Group
    const addFolder = async (folderId: number) => {
        if (!targetId) return;
        try {
            if (isClassRoute) {
                await classGroupService.addFolderToClass(targetId, folderId);
            } else {
                await classGroupService.addFolderToGroup(targetId, folderId);
            }
            await fetchDetail();
        } catch (err: unknown) {
            console.error('Lỗi khi thêm thư mục vào lớp/nhóm:', err);
            throw err;
        }
    };

    return {
        groupData,
        currentUser,
        loading,
        error,
        fetchDetail,
        addStudySet,
        addFolder,
    };
};

export default useClassOrGroupDetail;
