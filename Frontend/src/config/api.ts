// SỬA LẠI FILE CONFIG AXIOS CỦA BẠN
import axios from 'axios';

const api = axios.create({
    // 🎯 CHỈ ĐỂ LẠI NHƯ THẾ NÀY:
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;