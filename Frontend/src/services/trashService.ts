import api from '../config/api';
import type { FolderDTO } from './folderService';
import type { StudySet } from './studySetService';

export interface TrashItemVocabulary {
    id: number;
    term: string;
    definition: string;
    isDel?: boolean;
}

export interface TrashData {
    folders: FolderDTO[];
    studySets: StudySet[];
    vocabularies: TrashItemVocabulary[];
}

export const trashService = {
    // 1. Lấy danh sách tất cả các mục đã bị xóa mềm
    getTrashItems: async (): Promise<TrashData> => {
        const response = await api.get('/trash/all');
        return response.data?.result || { folders: [], studySets: [], vocabularies: [] };
    },

    // 2. Khôi phục (Restore) mục đã xóa mềm
    restoreItem: async (type: 'folder' | 'set' | 'vocabulary', id: number): Promise<boolean> => {
        const response = await api.put(`/trash/restore?type=${type}&id=${id}`);
        return response.data?.result || false;
    },

    // 3. Xóa vĩnh viễn (Permanent Delete)
    permanentDelete: async (type: 'folder' | 'set' | 'vocabulary', id: number): Promise<boolean> => {
        const response = await api.delete(`/trash/permanent?type=${type}&id=${id}`);
        return response.data?.result || false;
    },
};

export default trashService;
