import api from '../config/api';

export type Pos =
    | 'NOUN'
    | 'VERB'
    | 'ADJECTIVE'
    | 'ADVERB'
    | 'PREPOSITION'
    | 'CONJUNCTION'
    | 'PRONOUN'
    | 'INTERJECTION'
    | 'PHRASE'
    | 'IDIOM'
    | 'OTHER';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabularyItem {
    id?: number;
    term: string;
    definition: string;
    baseForm?: string;
    base_form?: string;
    ipa?: string;
    audioUrl?: string;
    audio_url?: string;
    pos?: Pos | string;
    partOfSpeech?: string;
    level?: Level | string;
    meaning?: string;
    hint?: string;
    example?: string;
    createAt?: string;
    create_at?: string;
    isDel?: boolean;
}

export interface StudySet {
    id: number;
    titleName: string;
    description?: string;
    slug: string;
    folderId?: number;
    folderSlug?: string;
    folderName?: string;
    vocabularies?: VocabularyItem[];
}

export interface CreateStudySetPayload {
    titleName: string;
    description?: string;
    folderId?: number;
    folderSlug?: string;
    folderName?: string;
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

    // 4. Lấy tất cả bộ thẻ hệ thống
    getAllStudySets: async (): Promise<StudySet[]> => {
        const response = await api.get('/studyset/all');
        return response.data?.result || [];
    },

    // 5. Lấy danh sách bộ thẻ thuộc tài khoản đăng nhập
    getUserStudySets: async (): Promise<StudySet[]> => {
        const response = await api.get('/studyset/user');
        return response.data?.result || [];
    },

    // 5. Xóa bộ từ vựng (xóa mềm)
    deleteStudySet: async (id: number): Promise<boolean> => {
        const response = await api.delete(`/studyset/${id}`);
        return response.data?.result || false;
    },
};

export default studySetService;