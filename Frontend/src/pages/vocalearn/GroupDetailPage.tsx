import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Users,
    FolderKanban,
    BookOpen,
    ArrowLeft,
    GraduationCap,
    Loader2,
    Folder,
    UserX,
    Share2,
    Check,
    Key,
    BookA,
    FileText,
    Trash2,
} from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import AddResourceToGroupModal from '../../components/vocalearn/modals/AddResourceToGroupModal';
import { useClassOrGroupDetail } from '../../hooks/useClassOrGroupDetail';
import classGroupService from '../../services/classGroupService';

const MAX_MEMBERS = 20; // Giới hạn tối đa 20 thành viên theo yêu cầu

interface DisplayMember {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    isOwner?: boolean;
}

const GroupDetailPage = () => {
    const { classId, groupId } = useParams<{ classId?: string; groupId?: string }>();
    const targetId = Number(classId || groupId);
    const isClassRoute = Boolean(classId);

    const {
        groupData,
        loading,
        fetchDetail,
    } = useClassOrGroupDetail(targetId, isClassRoute);

    const [activeTab, setActiveTab] = useState<'resources' | 'members'>('resources');
    const [isAddResourceOpen, setIsAddResourceOpen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const handleRemoveStudent = async (studentId: number, studentName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi lớp học này?`)) return;
        try {
            await classGroupService.removeStudentFromClass(targetId, studentId);
            fetchDetail();
        } catch (err) {
            console.error('Lỗi khi xóa học sinh:', err);
        }
    };

    const handleRemoveGrammarSet = async (grammarSetId: number, title?: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ ngữ pháp "${title || ''}" khỏi lớp học?`)) return;
        try {
            await classGroupService.removeGrammarSetFromClass(targetId, grammarSetId);
            fetchDetail();
        } catch (err) {
            console.error('Lỗi khi gỡ bộ ngữ pháp:', err);
        }
    };

    const handleRemoveExam = async (examId: number, title?: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn gỡ đề thi "${title || ''}" khỏi lớp học?`)) return;
        try {
            await classGroupService.removeExamFromClass(targetId, examId);
            fetchDetail();
        } catch (err) {
            console.error('Lỗi khi gỡ đề thi:', err);
        }
    };

    const joinCode = groupData?.joinCode || 'GRP-8X92A';
    const inviteLink = `${window.location.origin}/classes?joinCode=${joinCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Danh sách tài liệu thực tế từ DB
    const realFolders = groupData?.folders || [];
    const realSets = groupData?.studySets || [];
    const realGrammarSets = groupData?.grammarSets || [];
    const realExams = groupData?.exams || [];
    const totalResourcesCount = realFolders.length + realSets.length + realGrammarSets.length + realExams.length;

    // Sắp xếp danh sách thành viên:
    // 1. Owner (Giáo viên tạo lớp / Trưởng nhóm) ở trên cùng kèm icon Key vàng & viền vàng
    // 2. Các giáo viên khác
    // 3. Học sinh
    const sortedMembers = useMemo<DisplayMember[]>(() => {
        const list: DisplayMember[] = [];

        const ownerId = isClassRoute ? groupData?.teacherId : groupData?.creatorId;
        const ownerName = isClassRoute ? groupData?.teacherName : groupData?.creatorName;
        const ownerEmail = isClassRoute ? groupData?.teacherEmail : groupData?.creatorEmail;

        const rawList = (groupData?.members || groupData?.students || []) as any[];
        let hasOwnerInList = false;

        rawList.forEach((item) => {
            const isThisOwner = Boolean(
                (ownerId && item.id === ownerId) ||
                (ownerEmail && item.email && item.email.toLowerCase() === ownerEmail.toLowerCase())
            );

            if (isThisOwner) {
                hasOwnerInList = true;
                list.push({
                    id: item.id,
                    firstName: item.firstName || ownerName || '',
                    lastName: item.lastName || '',
                    email: item.email || ownerEmail || '',
                    role: isClassRoute ? 'TEACHER' : (item.role || 'LEADER'),
                    isOwner: true,
                });
            } else {
                list.push({
                    id: item.id,
                    firstName: item.firstName || '',
                    lastName: item.lastName || '',
                    email: item.email || '',
                    role: item.role || 'STUDENT',
                    isOwner: false,
                });
            }
        });

        // Nếu owner chưa có trong danh sách từ backend (thường gặp khi backend trả students chỉ chứa học sinh)
        if (!hasOwnerInList && (ownerName || ownerEmail)) {
            list.unshift({
                id: ownerId || 999999,
                firstName: ownerName || 'Giáo viên',
                lastName: '',
                email: ownerEmail || '',
                role: isClassRoute ? 'TEACHER' : 'LEADER',
                isOwner: true,
            });
        }

        return list.sort((a, b) => {
            if (a.isOwner) return -1;
            if (b.isOwner) return 1;
            const aIsTeacher = a.role === 'TEACHER' || a.role === 'ROLE_TEACHER';
            const bIsTeacher = b.role === 'TEACHER' || b.role === 'ROLE_TEACHER';
            if (aIsTeacher && !bIsTeacher) return -1;
            if (!aIsTeacher && bIsTeacher) return 1;
            return 0;
        });
    }, [groupData, isClassRoute]);

    const memberCount = sortedMembers.length > 0 ? sortedMembers.length : (groupData?.studentsCount || groupData?.membersCount || 1);

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <div className="flex flex-col min-h-screen w-full">
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

                        {/* Header Box: Tinh gọn, không icon khối màu sặc sỡ, không mã lớp trên màn hình */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                                    <GraduationCap className="w-6 h-6 text-slate-700" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">
                                        {groupData?.name || (isClassRoute ? 'Lớp Học' : 'Nhóm Học Tập')}
                                    </h1>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
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
                                    <span>Tài liệu học ({totalResourcesCount})</span>
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
                            <span>Đang tải thông tin...</span>
                        </div>
                    ) : (
                        <div>
                            {/* ============================================================== */}
                            {/* TAB 1: TÀI LIỆU HỌC (4 PHẦN: THƯ MỤC, BỘ TỪ VỰNG, NGỮ PHÁP, ĐỀ THI) */}
                            {/* ============================================================== */}
                            {activeTab === 'resources' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 mb-0.5">
                                                Tài liệu học tập
                                            </h2>
                                            <p className="text-xs text-slate-400">
                                                Các tài liệu được chia sẻ bao gồm thư mục, bộ từ vựng, ngữ pháp và đề thi.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setIsAddResourceOpen(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95 shrink-0"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span>Chia sẻ tài liệu</span>
                                        </button>
                                    </div>

                                    {/* 1. Phân mục: Thư mục học tập */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <Folder className="w-4 h-4 text-blue-600" />
                                            <h3 className="text-sm font-bold text-slate-900">
                                                1. Thư mục ({realFolders.length})
                                            </h3>
                                        </div>

                                        {realFolders.length === 0 ? (
                                            <div className="py-5 text-center text-xs text-slate-400 font-medium">
                                                Chưa có thư mục nào được chia sẻ vào lớp học.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realFolders.map((f) => (
                                                    <Link
                                                        key={f.id}
                                                        to={`/folders/${f.slug}`}
                                                        state={{ from: window.location.pathname, fromName: groupData?.name || 'Lớp học' }}
                                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-blue-400 transition-all cursor-pointer"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                                    <Folder className="w-3.5 h-3.5" />
                                                                </div>
                                                                <h4 className="font-bold text-slate-900 text-xs truncate">
                                                                    {f.name}
                                                                </h4>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                                                                {f.description || 'Thư mục học tập'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                                                            <span>{f.setsCount || 0} bộ từ vựng</span>
                                                            <span className="text-blue-600 font-semibold">Xem thư mục →</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Phân mục: Bộ từ vựng */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <BookOpen className="w-4 h-4 text-purple-600" />
                                            <h3 className="text-sm font-bold text-slate-900">
                                                2. Bộ từ vựng ({realSets.length})
                                            </h3>
                                        </div>

                                        {realSets.length === 0 ? (
                                            <div className="py-5 text-center text-xs text-slate-400 font-medium">
                                                Chưa có bộ từ vựng nào được chia sẻ vào lớp học.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realSets.map((s) => (
                                                    <Link
                                                        key={s.id}
                                                        to={s.folderSlug ? `/folders/${s.folderSlug}/${s.slug}` : `/studyset/${s.slug}`}
                                                        state={{ from: window.location.pathname, fromName: groupData?.name || 'Lớp học' }}
                                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-purple-300 transition-all cursor-pointer"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                                                    <BookOpen className="w-3.5 h-3.5" />
                                                                </div>
                                                                <h4 className="font-bold text-slate-900 text-xs truncate">
                                                                    {s.titleName}
                                                                </h4>
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                                                                {s.description || 'Bộ từ vựng ôn tập'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                                                            <span className="text-purple-700 font-bold">Luyện từ vựng</span>
                                                            <span className="text-purple-600">→</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Phân mục: Bộ ngữ pháp */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <BookA className="w-4 h-4 text-emerald-600" />
                                            <h3 className="text-sm font-bold text-slate-900">
                                                3. Bộ ngữ pháp ({realGrammarSets.length})
                                            </h3>
                                        </div>

                                        {realGrammarSets.length === 0 ? (
                                            <div className="py-5 text-center text-xs text-slate-400 font-medium">
                                                Chưa có bộ ngữ pháp nào được chia sẻ vào lớp học.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realGrammarSets.map((g) => (
                                                    <div
                                                        key={g.id}
                                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-all"
                                                    >
                                                        <div>
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                                        <BookA className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 text-xs truncate">
                                                                        {g.title || g.slug}
                                                                    </h4>
                                                                </div>
                                                                {isClassRoute && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveGrammarSet(g.id, g.title)}
                                                                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                                                        title="Gỡ bộ ngữ pháp"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                                                                {g.description || `${g.grammarCount || 0} chủ điểm ngữ pháp`}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                                                            <span className="text-emerald-700 font-bold">{g.grammarCount || 0} chủ điểm</span>
                                                            <Link
                                                                to={`/grammar`}
                                                                className="text-emerald-600 font-semibold hover:underline"
                                                            >
                                                                Học ngay →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 4. Phân mục: Bộ đề thi */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                            <FileText className="w-4 h-4 text-amber-600" />
                                            <h3 className="text-sm font-bold text-slate-900">
                                                4. Bộ đề thi ({realExams.length})
                                            </h3>
                                        </div>

                                        {realExams.length === 0 ? (
                                            <div className="py-5 text-center text-xs text-slate-400 font-medium">
                                                Chưa có bộ đề thi nào được chia sẻ vào lớp học.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realExams.map((e) => (
                                                    <div
                                                        key={e.id}
                                                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-all"
                                                    >
                                                        <div>
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                                                        <FileText className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 text-xs truncate">
                                                                        {e.title}
                                                                    </h4>
                                                                </div>
                                                                {isClassRoute && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveExam(e.id, e.title)}
                                                                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                                                        title="Gỡ đề thi"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mb-3 line-clamp-2">
                                                                {e.description || `${e.totalMinutes || 30} phút • ${e.totalQuestions || 0} câu hỏi`}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-200/60">
                                                            <span className="text-amber-700 font-bold">{e.totalMinutes || 30} phút</span>
                                                            <Link
                                                                to={`/practice`}
                                                                className="text-amber-600 font-semibold hover:underline"
                                                            >
                                                                Làm bài thi →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* TAB 2: THÀNH VIÊN (SẮP XẾP: GIÁO VIÊN/OWNER CÓ KEY VÀNG -> GIÁO VIÊN -> HỌC SINH) */}
                            {/* ============================================================== */}
                            {activeTab === 'members' && (
                                <div className="space-y-6">
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-7 shadow-xs">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <h3 className="text-base font-bold text-slate-900">
                                                    Danh sách thành viên ({memberCount}/{MAX_MEMBERS} người)
                                                </h3>
                                            </div>

                                            {/* Nút Chia sẻ ở góc phải danh sách học sinh */}
                                            <button
                                                type="button"
                                                onClick={handleCopyInviteLink}
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                                                title="Sao chép liên kết mời thành viên"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-emerald-700">Đã sao chép link!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 className="w-4 h-4 text-slate-500" />
                                                        <span>Chia sẻ</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Grid Danh sách thành viên sắp xếp thứ tự chuẩn */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sortedMembers.map((m) => {
                                                const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
                                                const isTeacherRole = m.role === 'TEACHER' || m.role === 'ROLE_TEACHER';

                                                return (
                                                    <div
                                                        key={`${m.id}-${m.email}`}
                                                        className={`rounded-2xl p-4 flex items-center gap-3.5 transition-all ${
                                                            m.isOwner
                                                                ? 'bg-amber-50/50 border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-xs'
                                                                : 'bg-white border border-slate-200 hover:border-slate-300 shadow-2xs'
                                                        }`}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className={`w-11 h-11 rounded-xl font-bold text-base flex items-center justify-center shrink-0 border ${
                                                                m.isOwner
                                                                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                                                    : isTeacherRole
                                                                    ? 'bg-blue-600 text-white border-blue-700'
                                                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}
                                                        >
                                                            {fullName.charAt(0).toUpperCase()}
                                                        </div>

                                                        {/* Thông tin */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                                                    {fullName}
                                                                </h4>
                                                                {m.isOwner && (
                                                                    <span title="Chủ sở hữu / Người tạo lớp">
                                                                        <Key className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate">{m.email}</p>

                                                            {/* Badge vai trò */}
                                                            <div className="mt-1">
                                                                {m.isOwner ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                                                        <Key className="w-2.5 h-2.5 fill-amber-600 text-amber-700" />
                                                                        {isClassRoute ? 'Chủ nhiệm lớp' : 'Trưởng nhóm'}
                                                                    </span>
                                                                ) : isTeacherRole ? (
                                                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                                        Giáo viên
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                                                                        Học viên
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Xóa học sinh khỏi lớp (nếu là lớp học và không phải owner) */}
                                                        {isClassRoute && !m.isOwner && (
                                                            <button
                                                                type="button"
                                                                title="Xóa học sinh khỏi lớp"
                                                                onClick={() => handleRemoveStudent(m.id, fullName)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Chia sẻ tài liệu (4 tabs: Thư mục, Bộ từ vựng, Bộ ngữ pháp, Bộ đề) */}
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
