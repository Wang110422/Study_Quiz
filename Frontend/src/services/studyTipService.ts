import api from '../config/api';
import type { ExamDTO } from './examService';

export interface StudyTipDTO {
    id: number;
    examType: 'TOEIC' | 'IELTS' | 'TOPIC' | 'APTIS' | string;
    skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY' | string;
    partName: string;
    fromQuestion?: number;
    toQuestion?: number;
    title: string;
    content: string;
    tips?: string[];
    orderIndex?: number;
    isActive?: boolean;
    examId?: number;
    cta?: string;
    examsCount?: number;
    exams?: ExamDTO[];
    examIds?: number[];
}

export const studyTipService = {
    getStudyTips: async (skill?: string, examType?: string): Promise<StudyTipDTO[]> => {
        try {
            const params: Record<string, string> = {};
            if (skill && skill !== 'all') {
                params.skill = skill.toUpperCase();
            }
            if (examType && examType !== 'all') {
                params.examType = examType.toUpperCase();
            }
            const response = await api.get('/study-tips', { params });
            return response.data?.result || [];
        } catch (err) {
            console.error('Lỗi khi lấy danh sách study tips:', err);
            return [];
        }
    },

    getStudyTipById: async (id: number): Promise<StudyTipDTO | null> => {
        try {
            const response = await api.get(`/study-tips/${id}`);
            return response.data?.result || null;
        } catch (err) {
            console.error(`Lỗi khi lấy study tip với ID ${id}:`, err);
            return null;
        }
    },

    getExamsByStudyTipId: async (id: number): Promise<ExamDTO[]> => {
        try {
            const response = await api.get(`/study-tips/${id}/exams`);
            return response.data?.result || [];
        } catch (err) {
            console.error(`Lỗi khi lấy danh sách bài thi của study tip ID ${id}:`, err);
            return [];
        }
    },
};

export default studyTipService;
