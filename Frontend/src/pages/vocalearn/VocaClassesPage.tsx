import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, School, GraduationCap, Shield, Copy, Check, BookOpen, FolderKanban, Link2 } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import AuthService, { type UserProfile } from '../../services/authService';
import classGroupService, { type ClassOrGroup } from '../../services/classGroupService';
import CreateClassOrGroupModal from '../../components/vocalearn/modals/CreateClassOrGroupModal';
import JoinByCodeModal from '../../components/vocalearn/modals/JoinByCodeModal';

const VocaClassesPage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [classesOrGroups, setClassesOrGroups] = useState<ClassOrGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        AuthService.getCurrentUser().then(async (u) => {
            setUser(u);

            // Kiểm tra nếu URL có mã tham gia joinCode (từ link mời)
            const urlParams = new URLSearchParams(window.location.search);
            const autoJoinCode = urlParams.get('joinCode') || urlParams.get('code');
            if (autoJoinCode) {
                try {
                    const role = u?.role || 'STUDENT';
                    if (role === 'TEACHER') {
                        await classGroupService.joinClassByCode(autoJoinCode);
                    } else {
                        await classGroupService.joinGroupByCode(autoJoinCode);
                    }
                    // Xóa param khỏi URL sau khi gia nhập thành công
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (err) {
                    console.error('Lỗi khi tự động gia nhập bằng mã:', err);
                }
            }

            fetchData(u);
        });
    }, []);

    const fetchData = async (currentUser?: UserProfile | null) => {
        setLoading(true);
        try {
            const currentRole = currentUser?.role || user?.role || 'STUDENT';
            if (currentRole === 'TEACHER') {
                const list = await classGroupService.getUserClasses();
                setClassesOrGroups(list);
            } else {
                const list = await classGroupService.getUserGroups();
                setClassesOrGroups(list);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách lớp/nhóm:', err);
        } finally {
            setLoading(false);
        }
    };

    const role = user?.role || 'STUDENT';
    const isTeacher = role === 'TEACHER';
    const isAdmin = role === 'ADMIN';

    const handleCopyCode = (id: number, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                    {/* Header Title & Dynamic Actions Based on User Role */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                                isTeacher ? 'bg-purple-600' : isAdmin ? 'bg-rose-600' : 'bg-blue-600'
                            }`}>
                                {isTeacher ? <School className="w-6 h-6" /> : isAdmin ? <Shield className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {isTeacher ? 'Quản lý Lớp học của tôi (Giáo viên)' : isAdmin ? 'Quản trị Lớp học hệ thống' : 'Nhóm học tập của tôi (Sinh viên)'}
                                </h1>
                                <p className="text-xs text-slate-400 font-normal">
                                    {isTeacher
                                        ? 'Tạo các lớp học mới, mời học sinh bằng link/mã và gán bài tập bộ thẻ vào lớp.'
                                        : 'Tham gia các nhóm học, mời bạn bè cùng ôn luyện và chia sẻ bộ thẻ từ vựng.'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsJoinOpen(true)}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                                <Link2 className="w-4 h-4 text-blue-600" />
                                <span>Tham gia bằng mã</span>
                            </button>

                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className={`flex items-center gap-1.5 px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 ${
                                    isTeacher ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isTeacher ? 'Tạo Lớp học mới' : 'Tạo Nhóm học mới'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Classes / Groups List Grid */}
                    {loading ? (
                        <div className="py-16 text-center text-xs font-semibold text-slate-400">
                            Đang tải danh sách {isTeacher ? 'lớp học' : 'nhóm học'}...
                        </div>
                    ) : classesOrGroups.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs my-6 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                                {isTeacher ? <School className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-1">
                                    {isTeacher ? 'Bạn chưa tạo lớp học nào' : 'Bạn chưa tham gia nhóm học nào'}
                                </h3>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    {isTeacher
                                        ? 'Bấm "Tạo Lớp học mới" để khởi tạo lớp học đầu tiên và gửi mã mời cho học sinh!'
                                        : 'Bấm "Tạo Nhóm học mới" hoặc "Tham gia bằng mã" để học cùng bạn bè ngay!'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {classesOrGroups.map((item) => (
                                <Link
                                    key={item.id}
                                    to={isTeacher ? `/classes/${item.id}` : `/study-groups/${item.id}`}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer block"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🏫</span>
                                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            {/* Code copy badge */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleCopyCode(item.id, item.joinCode);
                                                }}
                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-bold text-slate-700 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                                title="Bấm để sao chép mã mời"
                                            >
                                                {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                <span>{item.joinCode}</span>
                                            </button>
                                        </div>

                                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                                            {item.description || 'Chưa có mô tả cho lớp/nhóm này.'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{item.studentsCount || item.membersCount || 1} thành viên</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{item.setsCount || 0} bộ thẻ</span>
                                            </span>
                                        </div>

                                        <span className="text-[11px] text-slate-300">
                                            {isTeacher ? item.teacherName : item.creatorName}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Tạo Lớp / Nhóm mới */}
            <CreateClassOrGroupModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                isTeacher={isTeacher}
                onSuccess={() => fetchData()}
            />

            {/* Modal Tham gia bằng mã/link */}
            <JoinByCodeModal
                isOpen={isJoinOpen}
                onClose={() => setIsJoinOpen(false)}
                isTeacher={isTeacher}
                onSuccess={() => fetchData()}
            />
        </div>
    );
};

export default VocaClassesPage;
