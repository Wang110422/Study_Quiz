import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, FolderKanban, BookOpen, Plus, Copy, Check, ArrowLeft, Link2, Shield, School, GraduationCap, Sparkles, Loader2 } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import classGroupService, { type ClassOrGroup } from '../../services/classGroupService';
import AddResourceToGroupModal from '../../components/vocalearn/modals/AddResourceToGroupModal';
import AuthService, { type UserProfile } from '../../services/authService';

const MAX_MEMBERS = 20; // Giới hạn tối đa 20 thành viên theo yêu cầu

const GroupDetailPage = () => {
    const { classId, groupId } = useParams<{ classId?: string; groupId?: string }>();
    const targetId = Number(classId || groupId);
    const isClassRoute = Boolean(classId);

    const [activeTab, setActiveTab] = useState<'resources' | 'members'>('resources');
    const [groupData, setGroupData] = useState<ClassOrGroup | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [isAddResourceOpen, setIsAddResourceOpen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        AuthService.getCurrentUser().then((u) => setCurrentUser(u));
        fetchDetail();
    }, [targetId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            if (isClassRoute) {
                const detail = await classGroupService.getClassById(targetId);
                setGroupData(detail || null);
            } else {
                const detail = await classGroupService.getGroupById(targetId);
                setGroupData(detail || null);
            }
        } catch (err) {
            console.error('Lỗi khi tải chi tiết nhóm:', err);
        } finally {
            setLoading(false);
        }
    };

    const joinCode = groupData?.joinCode || 'GRP-8X92A';
    const inviteLink = `${window.location.origin}/classes?joinCode=${joinCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Danh sách thành viên thực tế từ DB
    const realMembers = groupData?.members || groupData?.students || [];
    const memberCount = realMembers.length > 0 ? realMembers.length : (groupData?.membersCount || groupData?.studentsCount || 1);
    const isFull = memberCount >= MAX_MEMBERS;
    const progressPercent = Math.min(Math.round((memberCount / MAX_MEMBERS) * 100), 100);

    // Danh sách tài liệu thực tế từ DB
    const realFolders = groupData?.folders || [];
    const realSets = groupData?.studySets || [];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    {/* Back Link & Header Title */}
                    <div className="mb-6">
                        <Link
                            to={isClassRoute ? '/classes' : '/study-groups'}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-3"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Quay lại danh sách {isClassRoute ? 'lớp học' : 'nhóm học'}</span>
                        </Link>

                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                                    🏫
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-xl font-bold text-slate-900">
                                            {groupData?.name || (isClassRoute ? 'Lớp Học' : 'Nhóm Học Tập')}
                                        </h1>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                            Mã: {joinCode}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {groupData?.description || 'Chưa có mô tả cho nhóm học này.'}
                                    </p>
                                </div>
                            </div>

                            {/* 2 Tabs Buttons */}
                            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shrink-0">
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'resources'
                                            ? 'bg-white text-blue-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <FolderKanban className="w-4 h-4" />
                                    <span>Tài liệu học ({groupData?.foldersCount || 0})</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('members')}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                        activeTab === 'members'
                                            ? 'bg-white text-blue-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Thành viên ({memberCount}/{MAX_MEMBERS})</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span>Đang tải thông tin nhóm học...</span>
                        </div>
                    ) : (
                        <div>
                            {/* ============================================================== */}
                            {/* TAB 1: TÀI LIỆU HỌC (THƯ MỤC VÀ BỘ TỪ VỰNG HỌC SINH THÊM VÀO) */}
                            {/* ============================================================== */}
                            {activeTab === 'resources' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 mb-0.5">
                                                Tài liệu & Thư mục học tập của nhóm
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                Các thư mục và bộ thẻ được các thành viên học sinh chia sẻ để cả nhóm cùng luyện tập.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setIsAddResourceOpen(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95 shrink-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Thêm Thư mục / Bộ thẻ vào Nhóm</span>
                                        </button>
                                    </div>

                                    {/* Sub-section: Thư mục nhóm */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <FolderKanban className="w-5 h-5 text-blue-600" />
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Danh sách Thư mục & Bộ từ vựng trong nhóm ({realFolders.length + realSets.length} tài liệu)
                                            </h3>
                                        </div>

                                        {realFolders.length === 0 && realSets.length === 0 ? (
                                            <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                                                Chưa có thư mục hoặc bộ từ vựng nào được thêm vào nhóm này.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realFolders.map((f) => (
                                                    <Link
                                                        key={f.id}
                                                        to={`/folders/${f.slug}`}
                                                        state={{ from: window.location.pathname, fromName: groupData?.name || (isClassRoute ? 'Lớp học' : 'Nhóm học') }}
                                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">{f.icon || '📁'}</span>
                                                                <h4 className="font-bold text-slate-900 text-xs">Thư mục: {f.name}</h4>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3">{f.description || 'Chưa có mô tả'}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                                                            <span>{f.setsCount || 0} bộ từ vựng</span>
                                                            <span className="text-blue-600 font-semibold">Thư mục CSDL</span>
                                                        </div>
                                                    </Link>
                                                ))}

                                                {realSets.map((s) => (
                                                    <Link
                                                        key={s.id}
                                                        to={s.folderSlug ? `/folders/${s.folderSlug}/${s.slug}` : `/studyset/${s.slug}`}
                                                        state={{ from: window.location.pathname, fromName: groupData?.name || (isClassRoute ? 'Lớp học' : 'Nhóm học') }}
                                                        className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-purple-300 transition-all cursor-pointer"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">📚</span>
                                                                <h4 className="font-bold text-slate-900 text-xs">Bộ thẻ: {s.titleName}</h4>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3">{s.description || 'Bộ từ vựng ôn tập'}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-purple-100">
                                                            <span className="text-purple-700 font-bold">Bắt đầu học</span>
                                                            <span className="text-purple-600">→</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* TAB 2: THÀNH VIÊN (THÔNG BÁO MỜI ĐƯỜNG LINK & DANH SÁCH THÀNH VIÊN REAL) */}
                            {/* ============================================================== */}
                            {activeTab === 'members' && (
                                <div className="space-y-6">
                                    {/* 1. KHUNG THÔNG BÁO MỜI THÀNH VIÊN BẰNG LIÊN KẾT (TỐI ĐA 20 THÀNH VIÊN) Ở TRÊN CÙNG */}
                                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 lg:p-7 shadow-md relative overflow-hidden">
                                        <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div className="space-y-2 max-w-xl">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white shadow-2xs">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                                    <span>Mời thành viên bằng liên kết (Tối đa 20 thành viên)</span>
                                                </div>

                                                <h3 className="text-lg font-bold tracking-tight">
                                                    Gửi đường link mời bạn bè vào nhóm học tập
                                                </h3>
                                                <p className="text-xs text-blue-100 font-medium">
                                                    Chia sẻ đường link hoặc mã mời bên dưới. Bất kỳ ai có mã này đều có thể gia nhập nhóm học tập cùng bạn (sĩ số tối đa 20 người).
                                                </p>

                                                {/* Progress bar sĩ số thành viên */}
                                                <div className="pt-2">
                                                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                                                        <span>Sĩ số thành viên:</span>
                                                        <span>{memberCount} / {MAX_MEMBERS} người {isFull ? '(Đã đầy)' : ''}</span>
                                                    </div>
                                                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                isFull ? 'bg-rose-400' : 'bg-amber-400'
                                                            }`}
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ô Đường Link & Nút Sao Chép */}
                                            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 space-y-3 shrink-0 md:w-80">
                                                <div className="flex items-center gap-2 bg-slate-900/40 rounded-xl px-3 py-2 border border-white/10">
                                                    <Link2 className="w-4 h-4 text-amber-300 shrink-0" />
                                                    <span className="text-xs font-mono font-bold text-white truncate">
                                                        {inviteLink}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={handleCopyInviteLink}
                                                    className="w-full py-2.5 px-4 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                    <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết mời'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. DANH SÁCH CÁC THÀNH VIÊN THỰC TẾ TỪ DATABASE */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-7 shadow-xs">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-base font-bold text-slate-900">
                                                    Danh sách thành viên nhóm ({memberCount} người)
                                                </h3>
                                            </div>
                                            <span className="text-xs text-slate-400 font-semibold">Tối đa 20 thành viên</span>
                                        </div>

                                        {/* Grid Thành viên THẬT từ Database */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {realMembers.length === 0 ? (
                                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs col-span-full">
                                                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0">
                                                        {(groupData?.creatorName || groupData?.teacherName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                                            {groupData?.creatorName || groupData?.teacherName || 'Người dùng'}
                                                        </h4>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {groupData?.creatorEmail || groupData?.teacherEmail || ''}
                                                        </p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-md">
                                                            👑 Trưởng nhóm
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                realMembers.map((m) => {
                                                    const isOwner = m.id === groupData?.creatorId || m.id === groupData?.teacherId;
                                                    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
                                                    return (
                                                        <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:border-blue-300 transition-all">
                                                            <div className={`w-11 h-11 rounded-xl font-bold text-base flex items-center justify-center shrink-0 ${
                                                                isOwner ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {fullName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-slate-900 text-sm truncate">{fullName}</h4>
                                                                <p className="text-xs text-slate-400 truncate">{m.email}</p>
                                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                                                                    isOwner
                                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {isOwner ? '👑 Trưởng nhóm' : 'Thành viên'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Thêm Thư mục / Bộ thẻ vào nhóm */}
            <AddResourceToGroupModal
                isOpen={isAddResourceOpen}
                onClose={() => setIsAddResourceOpen(false)}
                groupId={!isClassRoute ? targetId : undefined}
                classId={isClassRoute ? targetId : undefined}
                onSuccess={() => fetchDetail()}
            />
        </div>
    );
};

export default GroupDetailPage;
