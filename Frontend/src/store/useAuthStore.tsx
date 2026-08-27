import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService, { type UserProfile } from '../services/authService';

interface AuthStoreType {
    user: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    role: string;
    isTeacher: boolean;
    isAdmin: boolean;
    fetchUser: () => Promise<UserProfile | null>;
    setUserStore: (user: UserProfile | null) => void;
    updateUserStore: (updatedUser: Partial<UserProfile>) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthStoreType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch current logged-in user ONCE at root level
    const fetchUser = useCallback(async (): Promise<UserProfile | null> => {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (!token) {
            setUserState(null);
            setLoading(false);
            return null;
        }

        try {
            setLoading(true);
            const u = await AuthService.getCurrentUser();
            setUserState(u);
            return u;
        } catch (error) {
            console.error('Lỗi khi tải thông tin user từ store:', error);
            setUserState(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const setUserStore = useCallback((newUser: UserProfile | null) => {
        setUserState(newUser);
    }, []);

    const updateUserStore = useCallback((updatedFields: Partial<UserProfile>) => {
        setUserState((prev) => (prev ? { ...prev, ...updatedFields } : (updatedFields as UserProfile)));
    }, []);

    const logout = useCallback(async () => {
        await AuthService.logout();
        setUserState(null);
    }, []);

    const role = user?.role || 'STUDENT';
    const isTeacher = role === 'TEACHER';
    const isAdmin = role === 'ADMIN';
    const isAuthenticated = Boolean(user && (localStorage.getItem('auth_token') || localStorage.getItem('token')));

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                role,
                isTeacher,
                isAdmin,
                fetchUser,
                setUserStore,
                updateUserStore,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthStore = (): AuthStoreType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthStore phải được sử dụng bên trong AuthProvider');
    }
    return context;
};

export default useAuthStore;
