import api from '../config/api';
import type { StudySet } from './studySetService';

export interface FolderDTO {
    id: number;
    name: string;
    description: string;
    slug: string;
    icon: string;
    driveFolderId?: string;
    sheetUrl?: string;
    createdAt?: string;
    setsCount?: number;
    termsCount?: number;
    studySets?: StudySet[];
}

export interface CreateFolderPayload {
    name: string;
    description?: string;
    icon?: string;
}

export const folderService = {
    // 1. Lấy tất cả thư mục của người dùng
    getAllFolders: async (): Promise<FolderDTO[]> => {
        const response = await api.get('/folders/getAll');
        return response.data?.result || [];
    },

    // 2. Lấy chi tiết thư mục theo Slug
    getFolderBySlug: async (slug: string): Promise<FolderDTO | null> => {
        const response = await api.get(`/folders/${slug}`);
        return response.data?.result || null;
    },

    // 3. Lấy chi tiết thư mục theo ID
    getFolderById: async (id: number): Promise<FolderDTO | null> => {
        const response = await api.get(`/folders/id/${id}`);
        return response.data?.result || null;
    },

    // 4. Tạo thư mục mới
    createFolder: async (payload: CreateFolderPayload): Promise<FolderDTO> => {
        const response = await api.post('/folders', payload);
        return response.data?.result;
    },

    // 5. Xóa thư mục theo ID
    deleteFolder: async (id: number): Promise<boolean> => {
        const response = await api.delete(`/folders/${id}`);
        return response.data?.result || false;
    },

    // 6. Gọi API đồng bộ Google Drive & Sheet
    syncGoogleDrive: async (folderId?: number): Promise<string> => {
        const url = folderId ? `/google/create_sheet?folderId=${folderId}` : '/folders/sync-google';
        const response = await api.post(url);
        return response.data?.message || 'Đồng bộ Google Drive thành công!';
    },
};

export default folderService;
