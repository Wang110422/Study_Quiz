import api from "../config/api";
import type { Vocabulary } from "../data/vocabulary";

const VocabularyService = {
    getVocabularyBySlug: async (slug: string): Promise<Vocabulary[]> => {
        try {
            const response = await api.get(`/vocabularies/${slug}`);
            console.log("Fetched vocabulary by slug:", response.data.result);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching vocabulary by slug:", error);
            throw error;
        }
    }
};
export default VocabularyService;