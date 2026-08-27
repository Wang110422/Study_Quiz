// Helper quản lý tiến trình Lộ trình học (Lưu trực tiếp vào MySQL Database via Spring Boot API)
// Loại bỏ hoàn toàn localStorage

import studyPathService, { type StudyPathItemDTO } from '../services/studyPathService';

export interface PathItemProgress {
    completedLearnCount: number;
    completedTestCount: number;
    targetLearnCount: number;
    targetTestCount: number;
    isCompleted: boolean;
}

export const fetchDbItemProgress = async (itemId?: number): Promise<PathItemProgress> => {
    if (!itemId) {
        return {
            completedLearnCount: 0,
            completedTestCount: 0,
            targetLearnCount: 3,
            targetTestCount: 3,
            isCompleted: false,
        };
    }
    try {
        const item: StudyPathItemDTO = await studyPathService.getPathItemById(itemId);
        if (item) {
            return {
                completedLearnCount: item.completedLearnCount ?? 0,
                completedTestCount: item.completedTestCount ?? 0,
                targetLearnCount: item.targetLearnCount ?? 3,
                targetTestCount: item.targetTestCount ?? 3,
                isCompleted: Boolean(item.isCompleted),
            };
        }
    } catch (e) {
        console.error('Lỗi khi lấy tiến trình mốc từ Database:', e);
    }
    return {
        completedLearnCount: 0,
        completedTestCount: 0,
        targetLearnCount: 3,
        targetTestCount: 3,
        isCompleted: false,
    };
};

export const updateDbLearnProgress = async (itemId?: number): Promise<PathItemProgress> => {
    if (!itemId) {
        return fetchDbItemProgress();
    }
    try {
        const updated = await studyPathService.updateItemProgress(itemId, 'LEARN');
        if (updated) {
            return {
                completedLearnCount: updated.completedLearnCount ?? 0,
                completedTestCount: updated.completedTestCount ?? 0,
                targetLearnCount: updated.targetLearnCount ?? 3,
                targetTestCount: updated.targetTestCount ?? 3,
                isCompleted: Boolean(updated.isCompleted),
            };
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật tiến trình Học vào Database:', e);
    }
    return fetchDbItemProgress(itemId);
};

export const updateDbTestProgress = async (itemId?: number): Promise<PathItemProgress> => {
    if (!itemId) {
        return fetchDbItemProgress();
    }
    try {
        const updated = await studyPathService.updateItemProgress(itemId, 'TEST');
        if (updated) {
            return {
                completedLearnCount: updated.completedLearnCount ?? 0,
                completedTestCount: updated.completedTestCount ?? 0,
                targetLearnCount: updated.targetLearnCount ?? 3,
                targetTestCount: updated.targetTestCount ?? 3,
                isCompleted: Boolean(updated.isCompleted),
            };
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật tiến trình Kiểm tra vào Database:', e);
    }
    return fetchDbItemProgress(itemId);
};
