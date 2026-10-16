import api from '../config/api';

export type NotificationType =
  | 'EXAM_COMPLETED'
  | 'LESSON_COMPLETED'
  | 'CLASS_JOINED'
  | 'TEACHER_ADVICE'
  | 'ASSIGNMENT_NEW'
  | 'SYSTEM';

export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  referenceId?: number;
  referenceUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  targetUserId: number;
  title: string;
  content: string;
  type?: NotificationType;
  referenceId?: number;
  referenceUrl?: string;
}

export const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng (sắp xếp mới nhất đến cũ nhất)
   */
  getNotifications: async (): Promise<NotificationDTO[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data?.result || [];
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
      return [];
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data?.result ?? 0;
    } catch (err) {
      console.error('Lỗi khi lấy số thông báo chưa đọc:', err);
      return 0;
    }
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  markAsRead: async (id: number): Promise<NotificationDTO | null> => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data?.result || null;
    } catch (err) {
      console.error(`Lỗi khi đánh dấu đã đọc thông báo #${id}:`, err);
      return null;
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async (): Promise<boolean> => {
    try {
      await api.put('/notifications/read-all');
      return true;
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
      return false;
    }
  },

  /**
   * Xóa 1 thông báo
   */
  deleteNotification: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/notifications/${id}`);
      return true;
    } catch (err) {
      console.error(`Lỗi khi xóa thông báo #${id}:`, err);
      return false;
    }
  },

  /**
   * Tạo thông báo mới (Giảng viên gửi lời khuyên hoặc hệ thống gửi)
   */
  createNotification: async (payload: CreateNotificationPayload): Promise<NotificationDTO | null> => {
    try {
      const response = await api.post('/notifications', payload);
      return response.data?.result || null;
    } catch (err) {
      console.error('Lỗi khi tạo thông báo mới:', err);
      return null;
    }
  },
};

export default notificationService;
