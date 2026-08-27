import api from '../config/api';

export interface GrammarDTO {
    id: number;
    title: string;
    structure: string;
    explanation: string;
    example: string;
    note: string;
}

export interface GrammarSetDTO {
    id: number;
    title: string;
    description: string;
    slug: string;
    emoji?: string;
    grammarCount: number;
    level: string;
    grammars?: GrammarDTO[];
}

export const grammarService = {
    getAllGrammarSets: async (): Promise<GrammarSetDTO[]> => {
        try {
            const response = await api.get('/grammar-sets');
            return response.data?.result || [];
        } catch (err) {
            console.error('Lỗi khi lấy danh sách bộ ngữ pháp:', err);
            return [];
        }
    },

    getGrammarSetBySlug: async (slug: string): Promise<GrammarSetDTO | null> => {
        try {
            const response = await api.get(`/grammar-sets/${slug}`);
            return response.data?.result || null;
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết bộ ngữ pháp:', err);
            return null;
        }
    },
};

export default grammarService;
