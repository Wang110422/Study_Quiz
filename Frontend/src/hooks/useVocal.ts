import { useEffect, useState } from "react";
import VocabularyService from "../services/vocabularyService";


export const useVocal = (slug: string) => {
    const [vocabularyList, setVocabularyList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true)
        VocabularyService.getVocabularyBySlug(slug)
            .then((data) => {
                setVocabularyList(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Bi lỗi khi tải dữ liệu từ server");
                setLoading(false);
            });
    }, [slug]);

    return { vocabularyList, loading, error };
}
export default useVocal;
