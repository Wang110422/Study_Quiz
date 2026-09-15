// Helper quản lý tiến trình Lộ trình học (Lưu trực tiếp vào MySQL Database via Spring Boot API)
// Kết nối với Roadmap & UserTaskProgress

import roadmapService from '../services/roadmapService';

export interface PathItemProgress {
    completedLearnCount: number;
    completedTestCount: number;
    targetLearnCount: number;
    targetTestCount: number;
    isCompleted: boolean;
}

export const fetchDbItemProgress = async (taskId?: number): Promise<PathItemProgress> => {
    if (!taskId) {
        return {
            completedLearnCount: 0,
            completedTestCount: 0,
            targetLearnCount: 1,
            targetTestCount: 1,
            isCompleted: false,
        };
    }
    try {
        const progress = await roadmapService.getTaskProgress(taskId);
        if (progress) {
            const isDone = Boolean(progress.isCompleted);
            return {
                completedLearnCount: isDone ? 1 : 0,
                completedTestCount: isDone ? 1 : 0,
                targetLearnCount: 1,
                targetTestCount: 1,
                isCompleted: isDone,
            };
        }
    } catch (e) {
        console.error('Lỗi khi lấy tiến trình task từ Database:', e);
    }
    return {
        completedLearnCount: 0,
        completedTestCount: 0,
        targetLearnCount: 1,
        targetTestCount: 1,
        isCompleted: false,
    };
};

export const updateDbLearnProgress = async (taskId?: number): Promise<PathItemProgress> => {
    if (!taskId) {
        return fetchDbItemProgress();
    }
    try {
        const updated = await roadmapService.updateTaskProgress(taskId, { mode: 'LEARN', isCompleted: true });
        if (updated) {
            return {
                completedLearnCount: 1,
                completedTestCount: 0,
                targetLearnCount: 1,
                targetTestCount: 1,
                isCompleted: Boolean(updated.isCompleted),
            };
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật tiến trình Học vào Database:', e);
    }
    return fetchDbItemProgress(taskId);
};

export const updateDbTestProgress = async (taskId?: number): Promise<PathItemProgress> => {
    if (!taskId) {
        return fetchDbItemProgress();
    }
    try {
        const updated = await roadmapService.updateTaskProgress(taskId, { mode: 'TEST', isCompleted: true });
        if (updated) {
            return {
                completedLearnCount: 1,
                completedTestCount: 1,
                targetLearnCount: 1,
                targetTestCount: 1,
                isCompleted: Boolean(updated.isCompleted),
            };
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật tiến trình Kiểm tra vào Database:', e);
    }
    return fetchDbItemProgress(taskId);
};
