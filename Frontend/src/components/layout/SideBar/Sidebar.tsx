import {
    LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";
type SidebarProps = {
    open: boolean;
};

interface SidebarItem {
    icon: typeof LayoutDashboard
    lable: string
    to: string
}

const SidebarItem: SidebarItem[] = [
    { icon: LayoutDashboard, lable: "Trang chủ", to: "/" },
    { icon: LayoutDashboard, lable: "Thư viện của bạn", to: "/library" },
    { icon: LayoutDashboard, lable: "Bộ chủ đề", to: "/studyset" },
    { icon: LayoutDashboard, lable: "Thông báo", to: "/notification" },
]
const Sidebar = ({ open }: SidebarProps) => {
    return (
        <aside className={`fixed top-0 left-0 h-screen w-64 transition-transform duration-200 ease-in-out z-20 ${open ? 'translate-x-0' : '-translate-x-full'} bg-white text-slate-900 shadow-lg border-r`}>
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Thư viện của bạn</h2>
            </div>
            <ul className="flex-1 p-4 space-y-2">
                {SidebarItem.map((item, index) => (
                    <li key={index}>
                        <Link to={item.to} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-100 text-slate-700">
                            <span className="text-xl">
                                <item.icon />
                            </span>
                            <span>{item.lable}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;