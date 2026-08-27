import { useState, useEffect, useCallback } from 'react';
import {
    Library,
    Search,
    Plus,
    Folder,
    Users,
    Layers,
    MoreHorizontal,
    BookOpen,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { PageHeader } from '@/components/app/PageHeader';
import { EmojiTile, Pill } from '@/components/app/ui-bits';
import CreateFolderModal from '@/components/vocalearn/modals/CreateFolderModal';
import useFolders from '@/hooks/useFolders';
import studySetService, { type StudySet } from '@/services/studySetService';
import classGroupService, { type ClassOrGroup } from '@/services/classGroupService';
import { useAuthStore } from '@/store';

const VocaFoldersPage = () => {
    const { role } = useAuthStore();
    const { folders, loading, isSyncing, syncMessage, createFolder, deleteFolder, syncGoogleDrive } = useFolders();
    const [tab, setTab] = useState<'folders' | 'groups' | 'sets'>('folders');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Dynamic data for Tab 2 & Tab 3
    const [studySets, setStudySets] = useState<StudySet[]>([]);
    const [classesOrGroups, setClassesOrGroups] = useState<ClassOrGroup[]>([]);

    const fetchExtraData = useCallback(async () => {
        try {
            const sets = await studySetService.getAllStudySets();
            setStudySets(sets);

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
    }, [role]);

    useEffect(() => {
        fetchExtraData();
    }, [fetchExtraData]);

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

    const isTeacher = role === 'TEACHER';

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
            {/* Fixed Left Sidebar */}
            <VocaSidebar />

            {/* Main Container Offset */}
            <div className="pl-[260px] flex flex-col min-h-screen">
                {/* Top Header */}
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
                    {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
                    <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Library className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Thư viện của bạn</h1>
                                <p className="text-xs text-slate-400 font-normal mt-0.5">
                                    Tổ chức từ vựng theo thư mục, nhóm học và bộ thẻ để học nhanh hơn.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => syncGoogleDrive()}
                                disabled={isSyncing}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
                                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Google'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 text-sm font-semibold text-white transition shadow-pop cursor-pointer active:scale-95 shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tạo Thư mục mới</span>
                            </button>
                        </div>
                    </div>

                    {/* Sync Message Notification */}
                    {syncMessage && (
                        <div className="p-3.5 bg-success-soft border border-success/30 text-success text-xs font-semibold rounded-2xl animate-in fade-in">
                            {syncMessage}
                        </div>
                    )}

                    {/* 2. Filter Tabs & Search Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setTab("folders")}
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${tab === "folders"
                                ? "bg-primary text-primary-foreground shadow-pop"
                                : "border border-border bg-card text-foreground hover:bg-muted"
                                }`}
                        >
                            <Folder className="h-4 w-4" /> Thư mục ({folders.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setTab("groups")}
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${tab === "groups"
                                ? "bg-primary text-primary-foreground shadow-pop"
                                : "border border-border bg-card text-foreground hover:bg-muted"
                                }`}
                        >
                            <Users className="h-4 w-4" /> {isTeacher ? "Lớp học" : "Nhóm học"} ({classesOrGroups.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setTab("sets")}
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${tab === "sets"
                                ? "bg-primary text-primary-foreground shadow-pop"
                                : "border border-border bg-card text-foreground hover:bg-muted"
                                }`}
                        >
                            <Layers className="h-4 w-4" /> Bộ từ vựng ({studySets.length})
                        </button>

                        <label className="relative ml-auto flex w-full max-w-xs items-center">
                            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm trong Thư viện..."
                                className="h-10 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground outline-none focus:border-ring"
                            />
                        </label>
                    </div>

                    {/* 3. TAB 1: THƯ MỤC (FOLDERS) */}
                    {tab === "folders" && (
                        <div>
                            {loading ? (
                                <div className="py-16 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span>Đang tải thư mục cá nhân...</span>
                                </div>
                            ) : folders.length === 0 ? (
                                <div className="surface-card p-10 text-center space-y-3">
                                    <Folder className="w-10 h-10 text-muted-foreground mx-auto" />
                                    <h3 className="text-sm font-bold text-foreground">Bạn chưa tạo thư mục nào</h3>
                                    <p className="text-xs text-muted-foreground">Bấm nút "Tạo Thư mục mới" ở trên để bắt đầu gom nhóm bộ thẻ!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {folders
                                        .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((f) => {
                                            const shortCode = f.icon || f.name.slice(0, 3).toUpperCase();
                                            const setsCount = f.setsCount || (f.studySets ? f.studySets.length : 0);
                                            const termsCount = f.termsCount || 0;

                                            return (
                                                <article key={f.id} className="surface-card p-5 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <span className="icon-tile font-display font-bold text-sm">{shortCode}</span>
                                                            <button
                                                                type="button"
                                                                aria-label="Tùy chọn"
                                                                onClick={() => deleteFolder(f.id)}
                                                                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer transition"
                                                                title="Xóa thư mục"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <Link
                                                            to={`/folders/${f.slug || f.id}`}
                                                            className="mt-4 block font-bold text-foreground hover:text-primary transition text-base"
                                                        >
                                                            {f.name}
                                                        </Link>
                                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                            {f.description || 'Thư mục từ vựng cá nhân'}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                                                        <span>{setsCount} bộ thẻ</span>
                                                        <span className="font-bold text-foreground">{termsCount} thuật ngữ</span>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. TAB 2: NHÓM HỌC / LỚP HỌC (GROUPS) */}
                    {tab === "groups" && (
                        <div>
                            {classesOrGroups.length === 0 ? (
                                <div className="surface-card p-10 text-center space-y-3">
                                    <Users className="w-10 h-10 text-muted-foreground mx-auto" />
                                    <h3 className="text-sm font-bold text-foreground">Chưa có {isTeacher ? 'lớp học' : 'nhóm học'} nào</h3>
                                    <Link to={isTeacher ? '/classes' : '/study-groups'} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                                        <span>Đến trang {isTeacher ? 'Lớp học' : 'Nhóm học'} để tham gia hoặc tạo mới →</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {classesOrGroups
                                        .filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((g) => (
                                            <article key={g.id} className="surface-card p-5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <EmojiTile>{'🏫'}</EmojiTile>
                                                        <Pill tone="muted">{g.joinCode || 'Mã: ---'}</Pill>
                                                    </div>
                                                    <Link
                                                        to={isTeacher ? `/classes/${g.id}` : `/study-groups/${g.id}`}
                                                        className="mt-4 block font-bold text-foreground hover:text-primary transition text-base"
                                                    >
                                                        {g.name}
                                                    </Link>
                                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                        {g.description || 'Nhóm học tập cùng chia sẻ bộ từ vựng'}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                                                    <span>{g.membersCount || 1} thành viên</span>
                                                    <span className="font-bold text-foreground">Mở nhóm →</span>
                                                </div>
                                            </article>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 5. TAB 3: BỘ TỪ VỰNG (CARD SETS) */}
                    {tab === "sets" && (
                        <div>
                            {studySets.length === 0 ? (
                                <div className="surface-card p-10 text-center space-y-3">
                                    <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
                                    <h3 className="text-sm font-bold text-foreground">Bạn chưa tạo bộ từ vựng nào</h3>
                                    <Link to="/create-set" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                                        <span>Tạo bộ từ vựng mới ngay →</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {studySets
                                        .filter((s) => s.titleName.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((s) => {
                                            const termsCount = s.vocabularies ? s.vocabularies.length : (0);
                                            const matchedFolder = s.folderId ? folders.find((f) => f.id === s.folderId) : folders.find((f) => f.slug === s.folderSlug);
                                            const folderName = s.folderName || matchedFolder?.name || (s.folderSlug ? `Thư mục: ${s.folderSlug}` : null);

                                            return (
                                                <article key={s.id} className="surface-card p-5 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <Pill tone={folderName ? "primary" : "muted"}>
                                                                {folderName ?? "Bộ từ vựng độc lập"}
                                                            </Pill>
                                                            <span className="text-xs text-muted-foreground">{termsCount} thuật ngữ</span>
                                                        </div>
                                                        <h3 className="mt-4 flex items-center gap-2 font-bold text-foreground text-base">
                                                            <span className="text-lg">📚</span>
                                                            {s.titleName}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                            {s.description || 'Bộ từ vựng học tập cá nhân'}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 border-t border-border pt-3">
                                                        <Link
                                                            to={s.folderSlug ? `/folders/${s.folderSlug}/${s.slug}` : `/studyset/${s.slug}`}
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            <BookOpen className="h-3.5 w-3.5" /> Bắt đầu học →
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Modal Tạo Thư Mục Mới */}
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
