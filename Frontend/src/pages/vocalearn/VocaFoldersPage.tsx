import { useState, useEffect } from 'react';
import { Library, Search, Plus, FolderKanban, Users, BookOpen, RefreshCw as CloudSync, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import FolderCard, { type FolderItem } from '../../components/vocalearn/folders/FolderCard';
import CreateFolderModal from '../../components/vocalearn/modals/CreateFolderModal';
import useFolders from '../../hooks/useFolders';
import studySetService, { type StudySet } from '../../services/studySetService';
import classGroupService, { type ClassOrGroup } from '../../services/classGroupService';
import AuthService, { type UserProfile } from '../../services/authService';

const VocaFoldersPage = () => {
    const { folders, loading, isSyncing, syncMessage, createFolder, deleteFolder, syncGoogleDrive } = useFolders();
    const [activeTab, setActiveTab] = useState<'folders' | 'groups' | 'sets'>('folders');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Dynamic data for Tab 2 & Tab 3
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [classesOrGroups, setClassesOrGroups] = useState<ClassOrGroup[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        AuthService.getCurrentUser().then((u) => {
            setUser(u);
            fetchExtraData(u);
        });
    }, []);

    const fetchExtraData = async (currentUser?: UserProfile | null) => {
        try {
            const sets = await studySetService.getAllStudySets();
            setStudySets(sets);

            const role = currentUser?.role || user?.role || 'STUDENT';
            if (role === 'TEACHER') {
                const classes = await classGroupService.getUserClasses();
                setClassesOrGroups(classes);
            } else {
                const groups = await classGroupService.getUserGroups();
                setClassesOrGroups(groups);
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu thư viện:', err);
        }
    };

    const handleCreateFolder = async (newFolder: { title: string; description: string; icon: string; slug: string }) => {
        try {
            await createFolder({
                name: newFolder.title,
                description: newFolder.description,
                icon: newFolder.icon,
            });
        } catch (err) {
            console.error('Không thể tạo thư mục:', err);
        }
    };

    const folderItems: FolderItem[] = folders.map((f) => ({
        id: f.id,
        initial: f.icon || '📁',
        bgColor: 'bg-blue-50 text-blue-600',
        title: f.name,
        description: f.description || 'Thư mục vừa tạo',
        tags: [],
        setsCount: f.setsCount || (f.studySets ? f.studySets.length : 0),
        termsCount: f.termsCount || 0,
        updatedAt: 'Vừa xong',
        slug: f.slug,
    }));

    const role = user?.role || 'STUDENT';
    const isTeacher = role === 'TEACHER';

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                    {/* Header Title */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <Library className="w-6 h-6 text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-900">
                                    Thư viện của bạn
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 font-normal">
                                Quản lý tất cả Thư mục, Nhóm học tập và các Bộ từ vựng cá nhân của bạn.
                            </p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={syncGoogleDrive}
                                disabled={isSyncing}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                                <CloudSync className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Google'}</span>
                            </button>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tạo Thư mục mới</span>
                            </button>
                        </div>
                    </div>

                    {/* Sync Message Alert */}
                    {syncMessage && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-in fade-in">
                            {syncMessage}
                        </div>
                    )}

                    {/* 3 TABS LỌC THƯ VIỆN: THƯ MỤC, NHÓM HỌC, BỘ TỪ VỰNG */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xs">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setActiveTab('folders')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === 'folders'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <FolderKanban className="w-4 h-4" />
                                <span>Thư mục ({folders.length})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('groups')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === 'groups'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>{isTeacher ? 'Lớp học' : 'Nhóm học'} ({classesOrGroups.length})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('sets')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                    activeTab === 'sets'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>Bộ từ vựng ({studySets.length})</span>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative max-w-xs w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm trong Thư viện..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* TAB 1: DANH SÁCH THƯ MỤC */}
                    {activeTab === 'folders' && (
                        <div>
                            {loading ? (
                                <div className="py-16 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span>Đang tải thư mục cá nhân...</span>
                                </div>
                            ) : folderItems.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs my-4 space-y-3">
                                    <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
                                    <h3 className="text-sm font-bold text-slate-800">Bạn chưa tạo thư mục nào</h3>
                                    <p className="text-xs text-slate-400">Bấm nút "Tạo Thư mục mới" ở trên để bắt đầu gom nhóm bộ thẻ!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {folderItems
                                        .filter((f) => f.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((folder) => (
                                            <FolderCard
                                                key={folder.id}
                                                folder={folder}
                                                onDelete={() => deleteFolder(folder.id)}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: DANH SÁCH NHÓM HỌC / LỚP HỌC */}
                    {activeTab === 'groups' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {classesOrGroups.length === 0 ? (
                                <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs my-4 space-y-3">
                                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                                    <h3 className="text-sm font-bold text-slate-800">Chưa có {isTeacher ? 'lớp học' : 'nhóm học'} nào</h3>
                                    <Link to={isTeacher ? '/classes' : '/study-groups'} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                                        <span>Đến trang {isTeacher ? 'Lớp học' : 'Nhóm học'} để tạo hoặc tham gia</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : (
                                classesOrGroups
                                    .filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((g) => (
                                        <Link
                                            key={g.id}
                                            to={isTeacher ? `/classes/${g.id}` : `/study-groups/${g.id}`}
                                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">🏫</span>
                                                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                                        {g.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                                    {g.description || 'Chưa có mô tả'}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                                                <span>Mã: {g.joinCode}</span>
                                                <span className="text-blue-600 font-bold">Mở chi tiết →</span>
                                            </div>
                                        </Link>
                                    ))
                            )}
                        </div>
                    )}

                    {/* TAB 3: BỘ TỪ VỰNG (BỘ THẺ TỰ DO & BỘ THẺ TRONG THƯ MỤC) */}
                    {activeTab === 'sets' && (
                        <div>
                            {studySets.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs my-4 space-y-3">
                                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                                    <h3 className="text-sm font-bold text-slate-800">Bạn chưa tạo bộ từ vựng nào</h3>
                                    <Link to="/create-set" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                                        <span>Tạo bộ từ vựng mới ngay</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {studySets
                                        .filter((s) => s.titleName.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((set) => (
                                            <Link
                                                key={set.id}
                                                to={set.folderSlug ? `/folders/${set.folderSlug}/${set.slug}` : `/studyset/${set.slug}`}
                                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                            {set.folderSlug ? `Folder: ${set.folderSlug}` : 'Bộ từ vựng Độc lập'}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-semibold">
                                                            {set.vocabularies ? set.vocabularies.length : 0} thuật ngữ
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors mb-1">
                                                        📚 {set.titleName}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                                        {set.description || 'Chưa có mô tả'}
                                                    </p>
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                                                    <span>Bắt đầu học</span>
                                                    <span>→</span>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal Create Folder */}
                    <CreateFolderModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreateFolder={handleCreateFolder}
                    />
                </main>
            </div>
        </div>
    );
};

export default VocaFoldersPage;
