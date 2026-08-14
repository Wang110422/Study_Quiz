import { useState, useEffect, useCallback } from 'react';
import folderService, { type FolderDTO, type CreateFolderPayload } from '../services/folderService';
import googleService from '../services/googleService';

export const useFolders = () => {
    const [folders, setFolders] = useState<FolderDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);

    // 1. Tải danh sách thư mục từ API Backend
    const fetchFolders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await folderService.getAllFolders();
            setFolders(data);
        } catch (err: unknown) {
            console.error('Lỗi khi tải danh sách thư mục:', err);
            setError('Không thể tải danh sách thư mục từ hệ thống.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    // 2. Hàm Tạo thư mục mới
    const createFolder = async (payload: CreateFolderPayload): Promise<FolderDTO | null> => {
        try {
            const newFolder = await folderService.createFolder(payload);
            setFolders((prev) => [newFolder, ...prev]);
            return newFolder;
        } catch (err: unknown) {
            console.error('Lỗi khi tạo thư mục:', err);
            throw err;
        }
    };

    // 3. Hàm Xóa thư mục
    const deleteFolder = async (id: number): Promise<boolean> => {
        try {
            const success = await folderService.deleteFolder(id);
            if (success) {
                setFolders((prev) => prev.filter((f) => f.id !== id));
            }
            return success;
        } catch (err: unknown) {
            console.error('Lỗi khi xóa thư mục:', err);
            return false;
        }
    };

    // 4. Hàm Đồng bộ Google Drive & Sheets
    const syncGoogleDrive = async (folderId?: number, folderSlug?: string) => {
        setIsSyncing(true);
        setSyncMessage(null);
        try {
            const msg = await googleService.syncToGoogleSheet(folderId, folderSlug);
            setSyncMessage(msg);
            setTimeout(() => setSyncMessage(null), 5000);
        } catch (err: unknown) {
            console.error('Lỗi khi đồng bộ Google Drive:', err);
            setSyncMessage('Không thể đồng bộ với Google. Vui lòng kiểm tra lại quyền đăng nhập Google.');
            setTimeout(() => setSyncMessage(null), 5000);
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        folders,
        loading,
        error,
        isSyncing,
        syncMessage,
        fetchFolders,
        createFolder,
        deleteFolder,
        syncGoogleDrive,
    };
};

export default useFolders;
