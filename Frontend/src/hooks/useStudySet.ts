import { useEffect, useState } from "react";
import type { StudySet } from "../data/studySet";
import studySetService from "../services/studySetService";

const useStudySet = () => {
    const [studySet, setStudySet] = useState<StudySet[] | null>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        studySetService.getAllStudySets()
            .then((data) => {
                setStudySet(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message || "Bi lỗi khi tải dữ liệu từ server");
                setLoading(false);
            });
    }, []);
    return { studySet, loading, error };
}
export default useStudySet;