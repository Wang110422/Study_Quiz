import { useCallback, useEffect, useState } from "react";
import VocabularyService from "../services/vocabularyService";

export const useVocal = (slug: string) => {
    const [vocabularyList, setVocabularyList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Hàm tải danh sách từ vựng theo slug (dùng useCallback)
    const fetchVoc = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const data = await VocabularyService.getVocabularyBySlug(slug);
            setVocabularyList(data || []);
        } catch (err: any) {
            console.error("Lỗi khi tải danh sách từ vựng:", err);
            setError(err?.message || "Bị lỗi khi tải dữ liệu từ server");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchVoc();
    }, [fetchVoc]);

    // 2. Hàm xóa từ vựng và TỰ ĐỘNG CẬP NHẬT GIAO DIỆN LẬP TỨC
    const deleteVocabulary = async (id: number): Promise<boolean> => {
        try {
            const success = await VocabularyService.deleteVocabulary(id);
            if (success) {
                // 🟢 Loại bỏ từ vựng vừa xóa khỏi danh sách local state ngay lập tức
                setVocabularyList((prev) => prev.filter((item) => item.id !== id));
            }
            return success;
        } catch (err) {
            console.error("Lỗi khi xóa từ vựng:", err);
            return false;
        }
    };

    return { 
        vocabularyList, 
        loading, 
        error, 
        fetchVoc, 
        deleteVocabulary 
    };
};

export default useVocal;
