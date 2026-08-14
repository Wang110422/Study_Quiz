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
        if (response.data?.result?.token) {
            const token = response.data.result.token;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('token', token);
            document.cookie = `auth_token=${token}; path=/; max-age=864000; SameSite=Lax`;
        }
        return response.data;
    },

    register: async (userData: RegisterRequest) => {
        const response = await api.post('/auth/register', userData);
        if (response.data?.result?.token) {
            const token = response.data.result.token;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('token', token);
            document.cookie = `auth_token=${token}; path=/; max-age=864000; SameSite=Lax`;
        }
        return response.data;
    },

    getCurrentUser: async (): Promise<UserProfile | null> => {
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) return null;
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
        } catch (e) { }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');

        // Clear auth cookies
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        window.location.href = '/login';
    },

    getToken: () => {
        return localStorage.getItem('auth_token') || localStorage.getItem('token');
    }
};

export default AuthService;
