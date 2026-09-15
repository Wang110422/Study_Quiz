import api from '../config/api';

export type TaskType = 'VOCABULARY' | 'GRAMMAR' | 'PRACTICE_QUESTION' | 'FULL_EXAM';

export interface PhaseTaskDTO {
    id: number;
    title: string;
    taskType: TaskType;
    targetId?: number;
    orderIndex: number;
    status: 'done' | 'current' | 'locked';
    isCompleted: boolean;
    score?: number;
    targetTitle?: string;
    targetSlug?: string;
    targetItemCount?: number;
    link: string;
}

export interface RoadmapPhaseDTO {
    id: number;
    title: string;
    minAvgScoreToPass?: number;
    minAccuracyRace?: number;
    phaseOrder: number;
    tasks: PhaseTaskDTO[];
    totalTasks: number;
    completedTasks: number;
    isCompleted: boolean;
    isLocked: boolean;
}

export interface RoadmapDTO {
    id: number;
    title: string;
    targetScore: number;
    totalEstimatedDays: number;
    phases: RoadmapPhaseDTO[];
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    isCompleted: boolean;
    currentPhaseId?: number;
    currentTaskId?: number;
}

export interface CreateRoadmapPayload {
    title: string;
    targetScore?: number;
    totalEstimatedDays?: number;
    phases: {
        title: string;
        minAvgScoreToPass?: number;
        minAccuracyRace?: number;
        tasks: {
            title: string;
            taskType: TaskType;
            targetId?: number;
            orderIndex: number;
        }[];
    }[];
}

class RoadmapService {
    async getAllRoadmaps(): Promise<RoadmapDTO[]> {
        const response = await api.get('/roadmaps');
        return response.data?.result || [];
    }

    async getUserRoadmaps(): Promise<RoadmapDTO[]> {
        const response = await api.get('/roadmaps/user');
        return response.data?.result || [];
    }

    async getRoadmapById(id: number): Promise<RoadmapDTO> {
        const response = await api.get(`/roadmaps/${id}`);
        return response.data?.result;
    }

    async createRoadmap(payload: CreateRoadmapPayload): Promise<RoadmapDTO> {
        const response = await api.post('/roadmaps', payload);
        return response.data?.result;
    }

    async deleteRoadmap(id: number): Promise<boolean> {
        const response = await api.delete(`/roadmaps/${id}`);
        return response.status === 200;
    }

    async addPhase(roadmapId: number, payload: CreateRoadmapPayload['phases'][0]): Promise<any> {
        const response = await api.post(`/roadmaps/${roadmapId}/phases`, payload);
        return response.data?.result;
    }

    async deletePhase(phaseId: number): Promise<boolean> {
        const response = await api.delete(`/roadmaps/phases/${phaseId}`);
        return response.status === 200;
    }

    async addTask(phaseId: number, payload: CreateRoadmapPayload['phases'][0]['tasks'][0]): Promise<any> {
        const response = await api.post(`/roadmaps/phases/${phaseId}/tasks`, payload);
        return response.data?.result;
    }

    async deleteTask(taskId: number): Promise<boolean> {
        const response = await api.delete(`/roadmaps/tasks/${taskId}`);
        return response.status === 200;
    }

    async updateTaskProgress(
        taskId: number,
        payload: { score?: number; isCompleted?: boolean; mode?: 'LEARN' | 'TEST' | 'COMPLETE' }
    ): Promise<any> {
        const response = await api.post(`/roadmaps/tasks/${taskId}/progress`, payload);
        return response.data?.result;
    }

    async getTaskProgress(taskId: number): Promise<any> {
        const response = await api.get(`/roadmaps/tasks/${taskId}/progress`);
        return response.data?.result;
    }
}

export default new RoadmapService();
