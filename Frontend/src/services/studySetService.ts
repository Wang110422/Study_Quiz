import api from "../config/api";

const StudySetService = {
    getStudySetById: async (id: number) => {
        try {
            const response = await api.get(`/studyset/${id}`);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching study set by ID:", error);
            throw error;
        }
    },
    getAllStudySets: async (): Promise<any[]> => {
        try {
            const response = await api.get(`/studyset/getAll`);
            return response.data.result;
        } catch (error) {
            console.error("Error fetching all study sets:", error);
            throw error;
        }
    }
}
export default StudySetService;