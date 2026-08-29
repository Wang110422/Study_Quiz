import api from '../config/api';

export interface QuestionDTO {
    id: number;
    content: string;
    answer: string; // JSON String list
    correctAnswer: string;
    explanation?: string;
    score?: number;
    orderIndex?: number;
}

export interface PassageGroupDTO {
    id: number;
    title: string;
    passageText?: string;
    audioUrl?: string;
    imageUrl?: string;
    orderIndex: number;
    toeicPart?: 'PART_1' | 'PART_2' | 'PART_3' | 'PART_4' | 'PART_5' | 'PART_6' | 'PART_7' | string;
    questions?: QuestionDTO[];
}

export interface SectionDTO {
    id: number;
    title: string;
    skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY' | string;
    orderIndex: number;
    minutes: number;
    questionCount?: number;
    passageGroups?: PassageGroupDTO[];
}

export interface ExamDTO {
    id: number;
    title: string;
    description: string;
    totalMinutes: number;
    totalScore: number;
    type: 'FULL_TEST' | 'PRACTICE' | string;
    primarySkill?: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'GRAMMAR' | 'VOCABULARY' | string;
    sectionCount?: number;
    totalQuestions?: number;
    sections?: SectionDTO[];
}

export interface ExamAttemptDTO {
    id: number;
    examId: number;
    examTitle: string;
    mode: string;
    totalScore?: number;
    totalTime?: number;
    answerDetail?: string;
    startTime: string;
    endTime?: string;
}

export const examService = {
    getPracticeExams: async (): Promise<ExamDTO[]> => {
        try {
            const response = await api.get('/exams/practice');
            return response.data?.result || [];
        } catch (err) {
            console.error('Lỗi khi lấy danh sách đề luyện tập:', err);
            return [];
        }
    },

    getMockExams: async (): Promise<ExamDTO[]> => {
        try {
            const response = await api.get('/exams/mock');
            return response.data?.result || [];
        } catch (err) {
            console.error('Lỗi khi lấy danh sách đề thi thử:', err);
            return [];
        }
    },

    getExamDetail: async (id: number | string): Promise<ExamDTO | null> => {
        try {
            const response = await api.get(`/exams/${id}`);
            return response.data?.result || null;
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết đề thi:', err);
            return null;
        }
    },

    startAttempt: async (
        examId: number | string,
        mode: 'REAL_TEST' | 'PRACTICE' = 'REAL_TEST'
    ): Promise<ExamAttemptDTO | null> => {
        try {
            const response = await api.post(`/exams/${examId}/attempt?mode=${mode}`);
            return response.data?.result || null;
        } catch (err) {
            console.error('Lỗi khi kích hoạt lượt thi:', err);
            return null;
        }
    },

    submitAttempt: async (
        attemptId: number | string,
        data: { totalScore?: number; totalTime?: number; answerDetail?: string }
    ): Promise<ExamAttemptDTO | null> => {
        try {
            const response = await api.post(`/exams/attempt/${attemptId}/submit`, data);
            return response.data?.result || null;
        } catch (err) {
            console.error('Lỗi khi nộp bài thi:', err);
            return null;
        }
    },

    getMyAttempts: async (): Promise<ExamAttemptDTO[]> => {
        try {
            const response = await api.get('/exams/attempts/me');
            return response.data?.result || [];
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử làm bài:', err);
            return [];
        }
    },
};

export default examService;
