import { useState } from 'react';
import {
  Route as RouteIcon,
  Plus,
  Trash2,
  CalendarDays,
  Layers,
  Gauge,
  Pin,
  BookOpen,
  Target,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { PageHeader } from '@/components/app/PageHeader';
import { EmojiTile, Progress, Avatar } from '@/components/app/ui-bits';
import CreatePathModal from '@/components/vocalearn/modals/CreatePathModal';
import { useStudyPaths } from '@/hooks/useStudyPaths';

const VocaPathsPage = () => {
  const {
    paths,
    selectedPath,
    loading,
    selectPathById,
    createPath,
    deletePath,
  } = useStudyPaths();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const active = selectedPath || paths[0];
  const activeItems = active?.items || [];
  const activeCompleted = activeItems.filter((i) => i.isCompleted).length;
  const activeTotal = activeItems.length || 1;
  const activePct = activeTotal > 0 ? Math.round((activeCompleted / activeTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      {/* Fixed Left Sidebar */}
      <VocaSidebar />

      {/* Main Wrapper with Sidebar Offset */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <RouteIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Lộ trình học của tôi</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Chia nhỏ mục tiêu thành các mốc bộ thẻ để học đều mỗi ngày.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 text-sm font-semibold text-white transition shadow-pop cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo lộ trình học mới</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-xs font-semibold text-muted-foreground">Đang tải dữ liệu lộ trình học...</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="surface-card p-16 text-center w-full space-y-4">
              <div className="w-16 h-16 bg-primary-soft text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto font-bold">
                🎓
              </div>
              <h2 className="text-lg font-bold text-foreground">Bạn chưa tạo lộ trình học nào</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Hãy tạo một lộ trình học có mục tiêu cụ thể (ví dụ hoàn thành 1 lần Học và 3 lần Kiểm tra bộ thẻ) để bắt đầu ôn luyện.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tạo lộ trình đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
              {/* Left Column: Selector list */}
              <div className="space-y-3">
                {paths.map((r) => {
                  const items = r.items || [];
                  const done = items.filter((i) => i.isCompleted).length;
                  const total = items.length || 1;
                  const pct = Math.round((done / total) * 100);
                  const isSelected = active?.id === r.id;

                  return (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectPathById(r.id)}
                      className={`group surface-card w-full p-4 text-left transition cursor-pointer ${
                        isSelected ? "border-primary ring-2 ring-primary/25" : "hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <EmojiTile>{r.icon || '🎯'}</EmojiTile>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground">{r.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {r.durationDays || 30} ngày · {r.level || 'Trung bình'}
                          </p>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          title="Xóa lộ trình"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn có chắc chắn muốn xóa lộ trình "${r.title}"?`)) {
                              deletePath(r.id);
                            }
                          }}
                          className="p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 flex-none" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {done}/{total} mốc
                        </span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={pct} />
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Tạo lộ trình mới
                </button>
              </div>

              {/* Right Column: Path details & milestones */}
              {active && (
                <div className="space-y-5">
                  {/* Active Path Header Card */}
                  <section className="surface-card p-6">
                    <div className="flex items-start gap-4">
                      <EmojiTile>{active.icon || '🎯'}</EmojiTile>
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-foreground">{active.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{active.description || 'Lộ trình học tập cá nhân'}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-6 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-primary" /> {active.durationDays || 30} ngày
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Layers className="h-4 w-4 text-primary" /> {activeTotal} mốc bộ thẻ
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Gauge className="h-4 w-4 text-primary" /> {active.level || 'Trung bình'}
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">Tiến trình hoàn thành mốc</span>
                      <span className="text-muted-foreground">
                        {activeCompleted}/{activeTotal} mốc hoàn thành ({activePct}%)
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress value={activePct} />
                    </div>
                  </section>

                  {/* Milestones List Card */}
                  <section className="surface-card p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
                        <Pin className="h-[18px] w-[18px] text-primary" /> Các mốc bộ thẻ trong lộ trình
                      </h3>
                      <span className="ml-auto text-xs text-muted-foreground">Nhấp vào mốc để bắt đầu học bộ thẻ</span>
                    </div>

                    <ul className="mt-4 space-y-3">
                      {activeItems.length === 0 ? (
                        <li className="p-6 text-center text-xs text-muted-foreground">
                          Chưa có mốc bộ thẻ nào trong lộ trình này.
                        </li>
                      ) : (
                        activeItems.map((m, i) => {
                          const termsCount = m.studySet?.vocabulariesCount || 0;
                          const authorName = m.studySet?.creatorName || 'Hệ thống';
                          const initial = authorName.charAt(0).toUpperCase();
                          const setLink = `/studyset/${m.studySet?.slug || m.studySet?.id || ''}`;
                          const learnReq = m.targetLearnCount || 1;
                          const testReq = m.targetTestCount || 1;
                          const learnCur = m.completedLearnCount || 0;
                          const testCur = m.completedTestCount || 0;
                          const isDone = m.isCompleted || (learnCur >= learnReq && testCur >= testReq);

                          return (
                            <li key={m.id || i}>
                              <Link
                                to={setLink}
                                className="block rounded-2xl border border-border p-4 transition hover:border-primary/50 bg-card hover:shadow-xs cursor-pointer group"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="icon-tile font-display text-sm font-bold shrink-0">#{i + 1}</span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                        {m.studySet?.titleName || m.title || `Mốc ${i + 1}`}
                                      </p>
                                      <span
                                        className={`ml-auto px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                          isDone
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}
                                      >
                                        {isDone ? 'Đã hoàn thành' : 'Đang học'}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5 text-primary" /> {termsCount} thuật ngữ
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Target className="h-3.5 w-3.5 text-primary" /> Tiến trình: {learnCur}/{learnReq} Học · {testCur}/{testReq} Kiểm tra
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 flex-none text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs">
                                  <Avatar initial={initial} size="sm" />
                                  <span className="text-muted-foreground">Tác giả: {authorName}</span>
                                  <span className="ml-auto font-semibold text-primary group-hover:underline flex items-center gap-1">
                                    Vào học bộ thẻ →
                                  </span>
                                </div>
                              </Link>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal Tạo Lộ Trình Mới */}
      <CreatePathModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload) => {
          await createPath(payload);
        }}
      />
    </div>
  );
};

export default VocaPathsPage;
