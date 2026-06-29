type SidebarProps = {
    open: boolean;
};

const Sidebar = ({ open }: SidebarProps) => {
    return (
        <aside className={`fixed top-0 left-0 h-screen w-64 transition-transform duration-200 ease-in-out z-20 ${open ? 'translate-x-0' : '-translate-x-full'} bg-white text-slate-900 shadow-lg border-r`}>
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold">Thư viện của bạn</h2>
            </div>
            <ul className="flex-1 p-4 space-y-2">
                <li>
                    <a href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-100 text-slate-700">
                        <span className="text-xl">🏠</span>
                        <span>Trang chủ</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl bg-slate-100 text-blue-700 font-semibold">
                        <span className="text-xl">📁</span>
                        <span>Thư viện của bạn</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-100 text-slate-700">
                        <span className="text-xl">👥</span>
                        <span>Nhóm học</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-100 text-slate-700">
                        <span className="text-xl">🔔</span>
                        <span>Thông báo</span>
                    </a>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;