import api from '../config/api';

export interface VocabularyItem {
    term: string;
    definition: string;
    example?: string;
}

export interface StudySet {
    id: number;
    titleName: string;
    description?: string;
    slug: string;
    folderId?: number;
    folderSlug?: string;
    vocabularies?: VocabularyItem[];
}

export interface CreateStudySetPayload {
    titleName: string;
    description?: string;
    folderId?: number;
    folderSlug?: string;
    vocabularies?: VocabularyItem[];
}

export const studySetService = {
    // 1. Lấy danh sách StudySet theo Folder ID
    getStudySetsByFolderId: async (folderId: number): Promise<StudySet[]> => {
        const response = await api.get(`/studyset/folder/${folderId}`);
        return response.data?.result || [];
    },

    // 2. Lấy danh sách StudySet theo Tên Folder
    getStudySetsByFolderName: async (folderName: string): Promise<StudySet[]> => {
        const response = await api.get(`/studyset/folder-name/${folderName}`);
        return response.data?.result || [];
    },

    // 3. Tạo bộ từ vựng (StudySet) mới
    createStudySet: async (payload: CreateStudySetPayload): Promise<StudySet> => {
        const response = await api.post('/studyset', payload);
        return response.data?.result;
    },

    // 4. Lấy tất cả bộ thẻ
    getAllStudySets: async (): Promise<StudySet[]> => {
        const response = await api.get('/studyset/all');
        return response.data?.result || [];
    },

    // 5. Xóa bộ từ vựng (xóa mềm)
    deleteStudySet: async (id: number): Promise<boolean> => {
        const response = await api.delete(`/studyset/${id}`);
        return response.data?.result || false;
    },
};

export default studySetService;