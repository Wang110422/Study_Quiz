import api from '../config/api';

export interface ClassOrGroup {
    id: number;
    name: string;
    description: string;
    joinCode: string;
    createdAt: string;
    teacherName?: string;
    teacherEmail?: string;
    creatorName?: string;
    creatorEmail?: string;
    studentsCount?: number;
    membersCount?: number;
    setsCount?: number;
    foldersCount?: number;
    members?: { id: number; firstName: string; lastName: string; email: string; role: string }[];
    students?: { id: number; firstName: string; lastName: string; email: string; role: string }[];
    folders?: { id: number; name: string; description: string; icon: string; slug: string; setsCount: number }[];
    studySets?: { id: number; titleName: string; description: string; slug: string; folderSlug?: string }[];
}

export const classGroupService = {
    // 1. Lớp học của Giáo viên
    getUserClasses: async (): Promise<ClassOrGroup[]> => {
        const response = await api.get('/classes');
        return response.data?.result || [];
    },

    getClassById: async (classId: number): Promise<ClassOrGroup> => {
        const response = await api.get(`/classes/${classId}`);
        return response.data?.result;
    },

    createClass: async (data: { name: string; description: string }): Promise<ClassOrGroup> => {
        const response = await api.post('/classes', data);
        return response.data?.result;
    },

    joinClassByCode: async (joinCode: string): Promise<ClassOrGroup> => {
        const response = await api.post(`/classes/join?joinCode=${encodeURIComponent(joinCode)}`);
        return response.data?.result;
    },

    addStudySetToClass: async (classId: number, studySetId: number) => {
        const response = await api.post(`/classes/${classId}/study-sets/${studySetId}`);
        return response.data?.result;
    },

    addFolderToClass: async (classId: number, folderId: number) => {
        const response = await api.post(`/classes/${classId}/folders/${folderId}`);
        return response.data?.result;
    },

    // 2. Nhóm học của Sinh viên
    getUserGroups: async (): Promise<ClassOrGroup[]> => {
        const response = await api.get('/study-groups');
        return response.data?.result || [];
    },

    getGroupById: async (groupId: number): Promise<ClassOrGroup> => {
        const response = await api.get(`/study-groups/${groupId}`);
        return response.data?.result;
    },

    createGroup: async (data: { name: string; description: string }): Promise<ClassOrGroup> => {
        const response = await api.post('/study-groups', data);
        return response.data?.result;
    },

    joinGroupByCode: async (joinCode: string): Promise<ClassOrGroup> => {
        const response = await api.post(`/study-groups/join?joinCode=${encodeURIComponent(joinCode)}`);
        return response.data?.result;
    },

    addStudySetToGroup: async (groupId: number, studySetId: number) => {
        const response = await api.post(`/study-groups/${groupId}/study-sets/${studySetId}`);
        return response.data?.result;
    },

    addFolderToGroup: async (groupId: number, folderId: number) => {
        const response = await api.post(`/study-groups/${groupId}/folders/${folderId}`);
        return response.data?.result;
    },
};

export default classGroupService;
