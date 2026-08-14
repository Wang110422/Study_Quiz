import { Navigate, Outlet } from 'react-router-dom';

const isTokenExpired = (token: string): boolean => {
    try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return true;
        const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const decoded = JSON.parse(decodedJson);
        if (!decoded.exp) return false;
        // Kiểm tra xem thời gian hết hạn exp (tính bằng giây) có nhỏ hơn hiện tại không
        return decoded.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

const ProtectedRoute = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    // Nếu không có token HOẶC token đã bị hết hạn
    if (!token || isTokenExpired(token)) {
        // Tự động dọn dẹp token rác hết hạn
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
