import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCheck,
  Award,
  BookOpen,
  GraduationCap,
  MessageSquareQuote,
  FileText,
  Bell,
  Trash2,
  Loader2,
  Inbox,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService, { type NotificationDTO, type NotificationType } from '@/services/notificationService';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (unreadCount: number) => void;
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onUnreadChange,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tải danh sách thông báo khi popover được mở
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      // Sắp xếp đảm bảo từ mới nhất đến cũ nhất
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
      const unread = sorted.filter((n) => !n.isRead).length;
      onUnreadChange?.(unread);
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    const newUnread = notifications.filter((n) => n.id !== id && !n.isRead).length;
    onUnreadChange?.(newUnread);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onUnreadChange?.(0);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    const newUnread = updated.filter((n) => !n.isRead).length;
    onUnreadChange?.(newUnread);
  };

  const handleItemClick = async (item: NotificationDTO) => {
    if (!item.isRead) {
      await handleMarkAsRead(item.id);
    }
    onClose();
    if (item.referenceUrl) {
      navigate(item.referenceUrl);
    }
  };

  // Helper tính thời gian thân thiện (relative time)
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Helper lấy icon và màu sắc tương ứng với loại tin
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'EXAM_COMPLETED':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <Award className="h-4 w-4" />
          </span>
        );
      case 'LESSON_COMPLETED':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            <BookOpen className="h-4 w-4" />
          </span>
        );
      case 'CLASS_JOINED':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25">
            <GraduationCap className="h-4 w-4" />
          </span>
        );
      case 'TEACHER_ADVICE':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <MessageSquareQuote className="h-4 w-4" />
          </span>
        );
      case 'ASSIGNMENT_NEW':
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
            <FileText className="h-4 w-4" />
          </span>
        );
      default:
        return (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/25">
            <Bell className="h-4 w-4" />
          </span>
        );
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-12 sm:top-14 z-50 w-[330px] sm:w-[410px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md"
    >
      {/* 1. Thanh Tiêu Đề (Header) */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
            Thông báo
          </h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-primary text-primary-foreground">
              {unreadCount} mới
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft rounded-xl transition cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đã đọc tất cả</span>
            </button>
          )}

          {/* Nút Dấu X để tắt popover */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Danh Sách Tin Thông Báo (Sắp xếp từ mới nhất đến cũ nhất) */}
      <div className="max-h-[440px] overflow-y-auto divide-y divide-border/60 scrollbar-thin">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 px-6 text-center flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground/70">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-foreground">Chưa có thông báo nào</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xs leading-relaxed">
              Các thông báo về bài thi, lớp học và nhận xét từ giảng viên sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`group flex items-start gap-3 p-3.5 sm:p-4 transition cursor-pointer relative hover:bg-muted/60 ${
                !item.isRead ? 'bg-primary-soft/25' : 'bg-transparent'
              }`}
            >
              {/* Icon phân loại */}
              {getNotificationIcon(item.type)}

              {/* Nội dung thông báo */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <h4
                    className={`text-xs sm:text-sm font-bold line-clamp-1 leading-snug ${
                      !item.isRead ? 'text-foreground' : 'text-foreground/80'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.content}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/80 font-medium">
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </div>
              </div>

              {/* Nút Xóa nhanh khi hover */}
              <button
                type="button"
                onClick={(e) => handleDelete(e, item.id)}
                title="Xóa thông báo này"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 3. Footer nếu có thông báo */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-center">
          <span className="text-[11px] text-muted-foreground font-medium">
            Thông báo được sắp xếp theo thời gian mới nhất
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
