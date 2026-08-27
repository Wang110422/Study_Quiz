import api from '../config/api';

export interface StudyPathItemDTO {
    id: number;
    title: string;
    stepOrder: number;
    targetLearnCount: number;
    targetTestCount: number;
    completedLearnCount: number;
    completedTestCount: number;
    isCompleted: boolean;
    isLocked: boolean;
    studySet?: {
        id: number;
        titleName: string;
        slug: string;
        vocabulariesCount: number;
        creatorName: string;
    };
}

export interface StudyPathDTO {
    id: number;
    title: string;
    description: string;
    level: string;
    durationDays: number;
    icon: string;
    items: StudyPathItemDTO[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePathPayload {
    title: string;
    description: string;
    level?: string;
    durationDays?: number;
    icon?: string;
    items: {
        studySetId?: number;
        title: string;
        targetLearnCount: number;
        targetTestCount: number;
    }[];
}

class StudyPathService {
    async getUserPaths(): Promise<StudyPathDTO[]> {
        const response = await api.get('/paths/user');
        return response.data?.result || [];
    }

    async getPathById(id: number): Promise<StudyPathDTO> {
        const response = await api.get(`/paths/${id}`);
        return response.data?.result;
    }

    async getPathItemById(itemId: number): Promise<StudyPathItemDTO> {
        const response = await api.get(`/paths/items/${itemId}`);
        return response.data?.result;
    }

    async createPath(payload: CreatePathPayload): Promise<StudyPathDTO> {
        const response = await api.post('/paths', payload);
        return response.data?.result;
    }

    async updateItemProgress(itemId: number, mode: 'LEARN' | 'TEST'): Promise<StudyPathItemDTO> {
        const response = await api.post(`/paths/items/${itemId}/progress`, { mode });
        return response.data?.result;
    }

    async deletePath(id: number): Promise<boolean> {
        const response = await api.delete(`/paths/${id}`);
        return response.status === 200;
    }
}

export default new StudyPathService();
