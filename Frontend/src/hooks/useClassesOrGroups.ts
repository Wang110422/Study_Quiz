import { useState, useEffect, useCallback } from 'react';
import classGroupService, { type ClassOrGroup } from '../services/classGroupService';
import { useAuthStore } from '../store';

export const useClassesOrGroups = () => {
    const { user, role, isTeacher, isAdmin } = useAuthStore();
    const [classesOrGroups, setClassesOrGroups] = useState<ClassOrGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch list of classes or groups based on role
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (isTeacher) {
                const list = await classGroupService.getUserClasses();
                setClassesOrGroups(list);
            } else {
                const list = await classGroupService.getUserGroups();
                setClassesOrGroups(list);
            }
        } catch (err: unknown) {
            console.error('Lỗi khi tải danh sách lớp/nhóm:', err);
            setError('Không thể tải danh sách lớp hoặc nhóm học.');
        } finally {
            setLoading(false);
        }
    }, [isTeacher]);

    // 2. Process auto join by code from URL, then fetch list
    useEffect(() => {
        const init = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const autoJoinCode = urlParams.get('joinCode') || urlParams.get('code');
            if (autoJoinCode) {
                try {
                    if (isTeacher) {
                        await classGroupService.joinClassByCode(autoJoinCode);
                    } else {
                        await classGroupService.joinGroupByCode(autoJoinCode);
                    }
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (err: unknown) {
                    console.error('Lỗi khi tự động gia nhập bằng mã:', err);
                }
            }
            fetchData();
        };

        init();
    }, [isTeacher, fetchData]);

    // 3. Create a new class or group
    const createClassOrGroup = async (data: { name: string; description: string }): Promise<ClassOrGroup | null> => {
        try {
            let res: ClassOrGroup;
            if (isTeacher) {
                res = await classGroupService.createClass(data);
            } else {
                res = await classGroupService.createGroup(data);
            }
            await fetchData();
            return res;
        } catch (err: unknown) {
            console.error('Lỗi khi tạo lớp/nhóm:', err);
            throw err;
        }
    };

    // 4. Join a class or group by code
    const joinByCode = async (joinCode: string): Promise<ClassOrGroup | null> => {
        try {
            let res: ClassOrGroup;
            if (isTeacher) {
                res = await classGroupService.joinClassByCode(joinCode);
            } else {
                res = await classGroupService.joinGroupByCode(joinCode);
            }
            await fetchData();
            return res;
        } catch (err: unknown) {
            console.error('Lỗi khi tham gia bằng mã:', err);
            throw err;
        }
    };

    return {
        user,
        role,
        isTeacher,
        isAdmin,
        classesOrGroups,
        loading,
        error,
        fetchData,
        createClassOrGroup,
        joinByCode,
    };
};

export default useClassesOrGroups;
