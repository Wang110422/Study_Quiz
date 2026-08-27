import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Link2,
  Copy,
  Check,
  BookOpen,
  Loader2,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { EmojiTile, Pill } from '@/components/app/ui-bits';
import CreateClassOrGroupModal from '@/components/vocalearn/modals/CreateClassOrGroupModal';
import JoinByCodeModal from '@/components/vocalearn/modals/JoinByCodeModal';
import { useClassesOrGroups } from '@/hooks/useClassesOrGroups';

const VocaClassesPage = () => {
  const {
    classesOrGroups,
    loading,
    isTeacher,
    fetchData,
  } = useClassesOrGroups();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-20">
      {/* Fixed Left Sidebar */}
      <VocaSidebar />

      {/* Main Container Offset */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong 1 hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              {/* Icon ô vuông bo góc mềm màu xanh nhạt */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {isTeacher ? 'Quản lý Lớp học' : 'Nhóm học'}
                </h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Học cùng bạn bè, chia sẻ thư mục và theo dõi tiến độ của cả nhóm.
                </p>
              </div>
            </div>

            {/* 2 nút hành động nằm trong khối chữ nhật bo góc */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsJoinOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <Link2 className="h-4 w-4 text-blue-600" />
                <span>Tham gia bằng mã</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 text-sm font-semibold text-white transition shadow-pop cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{isTeacher ? 'Tạo Lớp học mới' : 'Tạo Nhóm học mới'}</span>
              </button>
            </div>
          </div>

          {/* 2. Phần nội dung */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">
                Đang tải danh sách {isTeacher ? 'lớp học' : 'nhóm học'}...
              </span>
            </div>
          ) : classesOrGroups.length === 0 ? (
            /* Component Bạn chưa tham gia nhóm học nào (Hình chữ nhật bo tròn màu trắng) */
            <div className="surface-card p-16 text-center w-full rounded-3xl shadow-2xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {isTeacher ? 'Bạn chưa tạo lớp học nào' : 'Bạn chưa tham gia nhóm học nào'}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isTeacher
                  ? 'Bấm "Tạo Lớp học mới" hoặc "Tham gia bằng mã" để bắt đầu giảng dạy!'
                  : 'Bấm "Tạo Nhóm học mới" hoặc "Tham gia bằng mã" để học cùng bạn bè ngay!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {classesOrGroups.map((g) => {
                const membersCount = g.studentsCount || g.membersCount || 1;
                const setsCount = g.setsCount || 0;
                const ownerName = isTeacher ? g.teacherName || 'Tôi' : g.creatorName || 'Tôi';
                const groupLink = isTeacher ? `/classes/${g.id}` : `/study-groups/${g.id}`;

                return (
                  <Link
                    key={g.id}
                    to={groupLink}
                    className="surface-card flex flex-wrap items-start gap-4 p-5 rounded-2xl transition hover:border-primary/50 hover:shadow-xs block cursor-pointer group"
                  >
                    <EmojiTile>{'🏫'}</EmojiTile>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-display text-lg font-bold text-primary group-hover:underline">
                          {g.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyCode(g.id, g.joinCode);
                          }}
                          className="inline-flex items-center gap-1 cursor-pointer transition hover:opacity-80"
                          title="Sao chép mã nhóm"
                        >
                          <Pill tone="muted" className="gap-1">
                            {g.joinCode}{' '}
                            {copiedId === g.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Pill>
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {g.description || 'Nhóm học tập từ vựng'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" /> {membersCount} thành viên
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-primary" /> {setsCount} bộ thẻ
                        </span>
                        <span className="sm:ml-auto">
                          Quản lý: <span className="font-semibold text-foreground">{ownerName}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
