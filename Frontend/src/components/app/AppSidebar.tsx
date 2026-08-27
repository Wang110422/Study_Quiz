import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

const items = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/lessons", label: "Bài học", icon: BookOpenText },
  { to: "/exams", label: "Luyện đề", icon: FileText },
  { to: "/mock-test", label: "Thi thử", icon: Timer },
  { to: "/groups", label: "Nhóm học", icon: Users },
  { to: "/library", label: "Thư viện của bạn", icon: Library },
  { to: "/roadmap", label: "Lộ trình học", icon: RouteIcon },
  { to: "/scan", label: "Quét tài liệu", icon: ScanLine },
  { to: "/trash", label: "Đã xóa", icon: Trash2 },
];

const profileMenuItems = [
  { label: "Hồ sơ cá nhân", icon: User },
  { label: "Giao diện màn hình", icon: Monitor, hasArrow: true },
  { label: "Cài đặt", icon: Settings, shortcut: "Ctrl." },
  { label: "Trợ giúp", icon: HelpCircle, hasArrow: true },
  { label: "Liên hệ", icon: Mail, hasArrow: true },
  { label: "Đăng xuất", icon: LogOut },
];

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

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
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
      <Link to="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
          <BookOpenText className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold leading-none">LingoMaster</span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
            Học từ vựng
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
              isActive(item.to)
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-pop"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="relative mt-auto pt-4" ref={profileRef}>
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className={`flex w-full items-center gap-3 rounded-2xl p-3 transition-colors ${
            isProfileOpen ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-primary bg-sidebar font-display font-bold text-sidebar-foreground">
            C
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold">Chan Wo Sin</span>
            <span className="block text-[11px] text-sidebar-foreground/60">Bản Pro</span>
          </span>
        </button>

        {isProfileOpen && (
          <div className="absolute bottom-4 left-[calc(260px-1rem)] z-50 w-[260px] overflow-hidden rounded-2xl border border-sidebar-border bg-[#1e1e1e] p-2 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-sidebar-border px-3 pb-3 pt-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary font-display font-bold text-sidebar-primary-foreground">
                C
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-sidebar-foreground">Chan Wo Sin</span>
                <span className="block text-[11px] text-sidebar-foreground/60">quangoke34@gmail.com</span>
              </span>
            </div>

            <div className="flex flex-col py-1">
              {profileMenuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <item.icon className="h-[18px] w-[18px] text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-sidebar-foreground/50">{item.shortcut}</span>
                  )}
                  {item.hasArrow && (
                    <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
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
