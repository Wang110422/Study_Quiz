import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Library,
  Route as RouteIcon,
  ScanLine,
  Trash2,
  BookOpenText,
  Dumbbell,
  FileText,
  Timer,
  User,
  Settings,
  Monitor,
  HelpCircle,
  Mail,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../../store";

export function VocaSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isTeacher, isAdmin, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng'
    : 'Người dùng';
  const userEmail = user?.email || 'user@example.com';
  const avatarInitial = fullName.charAt(0).toUpperCase() || 'U';

  const items = [
    { to: "/dashboard", label: "Trang chủ", icon: Home },
    { to: "/lessons", label: "Bài học", icon: BookOpenText },
    { to: "/exams", label: "Luyện đề", icon: FileText },
    { to: "/mock-test", label: "Thi thử", icon: Timer },
    {
      to: isTeacher || isAdmin ? "/classes" : "/study-groups",
      label: isTeacher ? "Lớp học" : isAdmin ? "Quản lý Lớp" : "Nhóm học",
      icon: Users,
    },
    { to: "/folders", label: "Thư viện của bạn", icon: Library },
    { to: "/paths", label: "Lộ trình học", icon: RouteIcon },
    { to: "/scan", label: "Quét tài liệu", icon: ScanLine },
    { to: "/trash", label: "Đã xóa", icon: Trash2 },
  ];

  const profileMenuItems = [
    { label: "Hồ sơ cá nhân", icon: User, action: () => navigate("/profile") },
    { label: "Giao diện màn hình", icon: Monitor, hasArrow: true },
    { label: "Cài đặt", icon: Settings, shortcut: "Ctrl.", action: () => navigate("/profile") },
    { label: "Trợ giúp", icon: HelpCircle, hasArrow: true },
    { label: "Liên hệ", icon: Mail, hasArrow: true },
    { label: "Đăng xuất", icon: LogOut, action: () => logout(), isDestructive: true },
  ];

  const isActive = (to: string) => {
    const p = location.pathname;

    if (to === "/dashboard") {
      return p === "/" || p === "/dashboard";
    }

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

    if (to === "/classes" || to === "/study-groups") {
      return (
        p.startsWith("/classes") ||
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

  return (
    <aside className="fixed top-0 left-0 h-screen w-[260px] shrink-0 flex flex-col overflow-y-auto bg-sidebar px-4 py-5 text-sidebar-foreground z-40 select-none border-r border-sidebar-border">
      {/* Brand Logo Header */}
      <Link to="/dashboard" className="mb-6 flex items-center gap-3 px-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <BookOpenText className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold leading-none">LingoMaster</span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60 font-semibold">
            Học từ vựng
          </span>
        </span>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-pop font-bold"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Popup Section */}
      <div className="relative mt-auto pt-4 border-t border-sidebar-border/50" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className={`flex w-full items-center gap-3 rounded-2xl p-2.5 transition-colors cursor-pointer ${
            isProfileOpen ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-primary bg-sidebar-primary/20 font-display font-bold text-sidebar-foreground">
            {avatarInitial}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold text-sidebar-foreground">{fullName}</span>
            <span className="block text-[11px] text-sidebar-foreground/60">
              {isTeacher ? 'Giáo viên' : isAdmin ? 'Quản trị viên' : 'Bản Pro'}
            </span>
          </span>
        </button>

        {isProfileOpen && (
          <div className="absolute bottom-16 left-0 z-50 w-[240px] overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar p-2 shadow-2xl backdrop-blur-lg">
            <div className="flex items-center gap-3 border-b border-sidebar-border px-3 pb-3 pt-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary font-display font-bold text-sidebar-primary-foreground text-sm">
                {avatarInitial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-sidebar-foreground">{fullName}</span>
                <span className="block truncate text-[11px] text-sidebar-foreground/60">{userEmail}</span>
              </span>
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
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    item.isDestructive
                      ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold'
                      : 'text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-sidebar-foreground/50">{item.shortcut}</span>
                  )}
                  {item.hasArrow && (
                    <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/50" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default VocaSidebar;
