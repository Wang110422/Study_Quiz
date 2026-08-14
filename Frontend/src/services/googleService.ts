import api from '../config/api';

export const googleService = {
    // 1. Đồng bộ dữ liệu Web lên Google Sheet & Drive
    syncToGoogleSheet: async (folderId?: number, folderSlug?: string): Promise<string> => {
        const params = new URLSearchParams();
        if (folderId) params.append('folderId', folderId.toString());
        if (folderSlug) params.append('folderSlug', folderSlug);

        const response = await api.post(`/google/create_sheet?${params.toString()}`);
        return response.data?.result || response.data?.message || 'Đã đồng bộ lên Google Sheet!';
    },

    // 2. Đồng bộ dữ liệu từ Google Sheet về Web
    syncSheetToWeb: async (folderId?: number): Promise<unknown> => {
        const params = new URLSearchParams();
        if (folderId) params.append('folderId', folderId.toString());

        const response = await api.post(`/google/sync_sheet_to_web?${params.toString()}`);
        return response.data?.result;
    },
};

export default googleService;
