import { Navigate } from 'react-router-dom';

// Trang dashboard đã được xóa bỏ theo yêu cầu của người dùng.
// Tự động chuyển hướng về trang bài học (/lessons).
const VocaDashboardPage = () => {
    return <Navigate to="/lessons" replace />;
};

export default VocaDashboardPage;
