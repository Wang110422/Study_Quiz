import api from '../config/api';

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface RegisterRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
}

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | string;
    avatarUrl?: string;
    bio?: string;
    themePreference?: 'light' | 'dark' | 'system' | string;
    languagePreference?: 'vi' | 'en' | 'ja' | string;
    reminderEnabled?: boolean;
    reminderTime?: string;
}

const AuthService = {
    login: async (credentials: LoginRequest) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: RegisterRequest) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh-token');
        return response.data;
    },

    getCurrentUser: async (): Promise<UserProfile | null> => {
        try {
            const response = await api.get('/user/me');
            return response.data?.result || null;
        } catch {
            return null;
        }
    },

    updateUserProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await api.put('/user/profile', payload);
        return response.data?.result;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Lỗi khi đăng xuất:', e);
        } finally {
            window.location.href = '/login';
        }
    },
};

export default AuthService;
