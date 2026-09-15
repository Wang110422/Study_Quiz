import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});


// Interceptor xử lý lỗi 401 Unauthorized và tự động làm mới Token qua Cookie
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Không tự động refresh nếu chính endpoint là login, register hoặc refresh-token
            const url = originalRequest.url || '';
            if (url.includes('/auth/login') || url.includes('/auth/refresh-token') || url.includes('/auth/register')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi endpoint refresh-token (cookie auth_token tự động gửi kèm qua withCredentials: true)
                await api.post('/auth/refresh-token');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr);
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;