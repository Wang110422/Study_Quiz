import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Languages,
  Bell,
  User,
  Settings,
  LogOut,
  BookOpenText,
  FileText,
  Timer,
  Trophy,
  GraduationCap,
  Users,
  Library,
  Route as RouteIcon,
  ScanLine,
  Trash2,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../../../store';
import { classGroupService } from '../../../services/classGroupService';
import notificationService from '@/services/notificationService';
import NotificationPopover from '../notifications/NotificationPopover';

interface VocaHeaderProps {
  onSearch?: (query: string) => void;
}

const VocaHeader = ({}: VocaHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isTeacher, isAdmin, logout, updateUserStore } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng'
    : 'Người dùng';
  const userEmail = user?.email || 'user@example.com';
  const avatarInitial = fullName.charAt(0).toUpperCase() || 'U';

  const handleQuickSwitchRole = async () => {
    try {
      setIsSwitchingRole(true);
      const targetRole = isTeacher ? 'STUDENT' : 'TEACHER';
      await classGroupService.switchRole(targetRole);
      updateUserStore({ role: targetRole });
      window.location.reload();
    } catch (err) {
      console.error('Lỗi khi chuyển đổi vai trò:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Menu items: Nếu là Giáo viên thì hiển thị chuẩn 9 trang (kèm Thống kê)
  const navItems = isTeacher
    ? [
        { to: "/lessons", label: "Bài học", icon: BookOpenText },
        { to: "/exams", label: "Luyện đề", icon: FileText },
        { to: "/mock-test", label: "Thi thử", icon: Timer },
        { to: "/leaderboard", label: "Xếp hạng", icon: Trophy },
        { to: "/classes", label: "Lớp học", icon: GraduationCap },
        { to: "/folders", label: "Thư viện", icon: Library },
        { to: "/analytics", label: "Thống kê", icon: BarChart3 },
        { to: "/scan", label: "Quét tài liệu", icon: ScanLine },
        { to: "/trash", label: "Đã xóa", icon: Trash2 },
      ]
    : [
        { to: "/lessons", label: "Bài học", icon: BookOpenText },
        { to: "/exams", label: "Luyện đề", icon: FileText },
        { to: "/mock-test", label: "Thi thử", icon: Timer },
        { to: "/leaderboard", label: "Xếp hạng", icon: Trophy },
        { to: "/classes", label: "Lớp học", icon: GraduationCap },
        { to: "/study-groups", label: "Nhóm học", icon: Users },
        { to: "/folders", label: "Thư viện", icon: Library },
        { to: "/paths", label: "Lộ trình", icon: RouteIcon },
        { to: "/scan", label: "Quét tài liệu", icon: ScanLine },
        { to: "/trash", label: "Đã xóa", icon: Trash2 },
      ];

  const profileMenuItems = [
    { label: "Hồ sơ cá nhân", icon: User, action: () => navigate("/profile") },
    {
      label: isSwitchingRole
        ? "Đang chuyển vai trò..."
        : isTeacher
        ? "Chuyển sang Sinh viên"
        : "Chuyển sang Giảng viên",
      icon: Sparkles,
      action: handleQuickSwitchRole,
    },
    { label: "Cài đặt", icon: Settings, action: () => navigate("/profile") },
    { label: "Đăng xuất", icon: LogOut, action: () => logout(), isDestructive: true },
  ];

  const isActive = (to: string) => {
    const p = location.pathname;

    if (to === "/lessons") {
      return (
        p.startsWith("/lessons") ||
        p.startsWith("/grammar") ||
        p.includes("/grammar") ||
        p.startsWith("/practice")
      );
    }

    if (to === "/exams") {
      return p.startsWith("/exams") || p.startsWith("/exam-practice");
    }

    if (to === "/mock-test") {
      return p.startsWith("/mock-test") || p.startsWith("/mock-exam");
    }

    if (to === "/leaderboard") {
      return p.startsWith("/leaderboard") || p.startsWith("/ranking");
    }

    if (to === "/classes") {
      return p.startsWith("/classes");
    }

    if (to === "/study-groups") {
      return (
        p.startsWith("/study-groups") ||
        p.startsWith("/study_group") ||
        p.startsWith("/groups")
      );
    }

    if (to === "/folders") {
      return (
        p.startsWith("/folders") ||
        p.startsWith("/library") ||
        p.startsWith("/create-set") ||
        (p.startsWith("/studyset") && !p.includes("/grammar"))
      );
    }

    if (to === "/paths") {
      return p.startsWith("/paths") || p.startsWith("/roadmap");
    }

    if (to === "/scan") {
      return p.startsWith("/scan");
    }

    if (to === "/trash") {
      return p.startsWith("/trash");
    }

    return p.startsWith(to);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Tải số lượng thông báo chưa đọc khi mount
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Lỗi khi tải số thông báo chưa đọc:', err);
      }
    };
    fetchUnread();
  }, []);

  // Đóng notification popover khi click ra ngoài
  useEffect(() => {
    function handleNotificationOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleNotificationOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleNotificationOutside);
    };
  }, [isNotificationOpen]);

  // Đóng mobile menu khi chuyển route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border select-none">
      <div className="mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* 1. Logo bên trái - bấm vào sẽ ra landing page (/) */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group py-1"
          aria-label="LingoMaster - Trang chủ"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-pop transition-transform group-hover:scale-105">
            <Languages className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground hidden sm:inline-block">
            LingoMaster
          </span>
        </Link>

        {/* 2. Thanh Menu nằm ngang trên Header (Desktop / Tablet lớn) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Phía bên phải: Thông báo, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Chuông thông báo */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              aria-label="Thông báo"
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                isNotificationOpen
                  ? "border-primary bg-muted text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-extrabold flex items-center justify-center border-2 border-background animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Component Thông Báo */}
            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onUnreadChange={(count) => setUnreadCount(count)}
            />
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Tài khoản cá nhân"
              className={`flex items-center gap-1.5 rounded-full p-1 transition-colors cursor-pointer border ${
                isProfileOpen ? "border-primary bg-muted" : "border-border hover:bg-muted"
              }`}
            >
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-display font-bold text-xs sm:text-sm">
                {avatarInitial}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-sm">
                    {avatarInitial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {fullName}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {userEmail}
                    </span>
                    <span className="inline-block mt-0.5 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {isTeacher ? "Giáo viên" : isAdmin ? "Quản trị viên" : "Học viên"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col py-1">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (item.action) item.action();
                      }}
                      className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        item.isDestructive
                          ? "text-destructive hover:bg-destructive/10 font-bold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nút Hamburger menu cho màn hình nhỏ */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
            className="flex xl:hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu thả xuống cho màn hình nhỏ (Mobile & Tablet) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

    </header>
  );
};

export default VocaHeader;
