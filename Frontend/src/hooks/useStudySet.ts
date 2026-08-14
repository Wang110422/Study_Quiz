import { useEffect, useState } from "react";
import studySetService, { type StudySet } from "../services/studySetService";

const useStudySet = (folderId?: number) => {
    const [studySet, setStudySet] = useState<StudySet[] | null>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const fetchSets = async () => {
            try {
                const data = folderId
                    ? await studySetService.getStudySetsByFolderId(folderId)
                    : await studySetService.getStudySetsByFolderName("Tiếng Anh");
                setStudySet(data);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Bị lỗi khi tải dữ liệu từ server";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchSets();
    }, [folderId]);

    return { studySet, loading, error };
};

export default useStudySet;