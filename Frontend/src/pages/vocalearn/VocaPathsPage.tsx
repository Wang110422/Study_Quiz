import React, { useState, useEffect } from 'react';
import {
  Route as RouteIcon,
  Plus,
  Trash2,
  CalendarDays,
  Layers,
  Gauge,
  Flag,
  Lock,
  CheckCircle2,
  Play,
  BookOpen,
  Headphones,
  FileText,
  Loader2,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { Progress } from '@/components/app/ui-bits';
import CreatePathModal from '@/components/vocalearn/modals/CreatePathModal';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { type PhaseTaskDTO, type RoadmapPhaseDTO } from '@/services/roadmapService';

// ==============================================================================
// 🌟 COMPONENT: TASK NODE (THẺ BÀI HỌC DẠNG VIÊN THUỐC LƯỢN SÓNG ZIC-ZAC)
// ==============================================================================
function TaskNode({
  task,
  offset,
  onComplete,
}: {
  task: PhaseTaskDTO;
  offset: number;
  onComplete?: (taskId: number) => void;
}) {
  const locked = task.status === 'locked';
  const isDone = task.status === 'done';
  const isCurrent = task.status === 'current';

  const tone = isDone
    ? 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-400'
    : isCurrent
      ? 'border-blue-600 bg-white ring-4 ring-blue-500/15 shadow-md hover:border-blue-700'
      : 'border-dashed border-slate-300 bg-slate-50/80 hover:border-slate-400';

  // Chọn icon phù hợp theo taskType hoặc tiêu đề
  const getEmoji = () => {
    if (task.taskType === 'VOCABULARY') {
      return <BookOpen className={`h-5 w-5 ${isDone ? 'text-emerald-600' : 'text-blue-600'}`} />;
    }
    if (task.taskType === 'GRAMMAR') {
      return <span className={`font-extrabold text-xs ${isDone ? 'text-emerald-600' : 'text-blue-600'}`}>abc</span>;
    }
    if (task.taskType === 'PRACTICE_QUESTION') {
      return <FileText className={`h-5 w-5 ${isDone ? 'text-emerald-600' : 'text-blue-600'}`} />;
    }
    return <Trophy className={`h-5 w-5 ${isDone ? 'text-emerald-600' : 'text-amber-500'}`} />;
  };

  const getDetail = () => {
    if (task.taskType === 'VOCABULARY') {
      return task.targetItemCount
        ? `${task.targetItemCount} từ mới + ôn nhanh thẻ ghi nhớ`
        : 'Học từ mới và ôn thẻ ghi nhớ';
    }
    if (task.taskType === 'GRAMMAR') {
      return '1 chủ điểm ngữ pháp trọng tâm kèm kiểm tra';
    }
    if (task.taskType === 'PRACTICE_QUESTION') {
      return 'Luyện đề phản xạ theo từng nhóm câu';
    }
    return 'Đạt điểm tối thiểu để vượt mốc chặng';
  };

  const inner = (
    <div
      className={`flex w-full max-w-[440px] items-center gap-3.5 rounded-3xl border px-5 py-3.5 transition-all ${tone} ${locked ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xs cursor-pointer'
        }`}
    >
      {/* Icon tròn nét đứt bên trái */}
      <span
        className={`flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 border-dashed text-lg shadow-2xs ${isDone
            ? 'border-emerald-400 bg-white text-emerald-600'
            : isCurrent
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-slate-300 bg-white text-slate-400'
          }`}
      >
        {locked ? <Lock className="h-4 w-4 text-slate-400" /> : getEmoji()}
      </span>

      {/* Nội dung Task */}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider ${isDone ? 'text-emerald-800' : isCurrent ? 'text-blue-700' : 'text-slate-400'
              }`}
          >
            TASK {task.orderIndex || 1}
          </span>
          {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-none" />}
        </span>
        <span className="block truncate text-sm font-bold text-slate-900 leading-tight">
          {task.title}
        </span>
        <span className="block truncate text-xs text-slate-500 mt-0.5">
          {getDetail()}
        </span>
      </span>

      {/* Điểm nếu có */}
      {task.score != null && (
        <span className="flex-none text-right text-xs">
          <span className="block font-bold text-slate-900">{task.score}đ</span>
        </span>
      )}

      {/* Nút Play nếu đang là task hiện tại */}
      {isCurrent && (
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
          <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
        </span>
      )}
    </div>
  );

  return (
    <li
      className="relative flex transition-all duration-300"
      style={{ paddingLeft: `${offset}px` }}
    >
      {locked ? (
        <div className="block w-full max-w-[440px]">{inner}</div>
      ) : (
        <Link
          to={task.link || '/lessons'}
          state={{ from: '/paths', taskId: task.id }}
          className="block w-full max-w-[440px]"
        >
          {inner}
        </Link>
      )}
    </li>
  );
}

// ==============================================================================
// 🌟 MAIN PAGE: VOCA PATHS PAGE (LỘ TRÌNH HỌC TẬP VÀ CÂY TIẾN ĐỘ)
// ==============================================================================
const VocaPathsPage = () => {
  const {
    roadmaps,
    selectedRoadmap,
    loading,
    selectRoadmapById,
    refetch,
    createRoadmap,
    deleteRoadmap,
    updateTaskProgress,
  } = useRoadmaps();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Tự động tải lại tiến độ mới nhất khi mở lại trang
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Lộ trình đang chọn
  const active = selectedRoadmap || roadmaps[0];
  const phases: RoadmapPhaseDTO[] = active?.phases || [];

  // Tính offset uốn lượn zic-zac hình sin cho từng node
  const getWaveOffset = (index: number) => {
    const pattern = [0, 36, 72, 108, 144, 108, 72, 36];
    return pattern[index % pattern.length];
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      {/* Main Wrapper */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* Header nằm trong hình chữ nhật bo góc tròn */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <RouteIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Lộ trình học của tôi</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Lộ trình chia thành các chặng và mỗi chặng có các tác vụ học tập bài bản.
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
          ) : roadmaps.length === 0 ? (
            <div className="surface-card p-16 text-center w-full space-y-4 rounded-3xl">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto font-bold">
                🎯
              </div>
              <h2 className="text-lg font-bold text-foreground">Chưa có lộ trình học nào</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Hãy tạo một lộ trình học có mục tiêu cụ thể để bắt đầu ôn luyện theo từng chặng.
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
              {/* ========================================================================= */}
              {/* 👈 CỘT TRÁI: DANH SÁCH CÁC LỘ TRÌNH HỌC */}
              {/* ========================================================================= */}
              <div className="space-y-3">
                {roadmaps.map((r) => {
                  const done = r.completedTasks || 0;
                  const total = r.totalTasks || 1;
                  const pct = r.progressPercent || 0;
                  const isSelected = active?.id === r.id;

                  return (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectRoadmapById(r.id)}
                      className={`group surface-card w-full p-5 text-left rounded-3xl transition-all cursor-pointer ${isSelected
                          ? 'border-2 border-blue-600 shadow-md ring-2 ring-blue-500/15 bg-white'
                          : 'hover:border-slate-300 bg-white/90 border border-slate-200'
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 font-bold">
                          🎯
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 text-sm leading-tight">{r.title}</p>
                          <p className="mt-1 text-xs text-slate-400 font-medium">
                            {r.totalEstimatedDays || 30} ngày · Mục tiêu {r.targetScore || 650}đ · {r.phases?.length || 0} chặng
                          </p>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          title="Xóa lộ trình"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn có chắc chắn muốn xóa lộ trình "${r.title}"?`)) {
                              deleteRoadmap(r.id);
                            }
                          }}
                          className="p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4 flex-none" />
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">
                          {done}/{total} tác vụ
                        </span>
                        <span className="font-bold text-slate-900">{pct}%</span>
                      </div>
                      <div className="mt-2">
                        <Progress value={pct} />
                      </div>
                    </div>
                  );
                })}

                {/* Nút Tạo lộ trình mới */}
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 py-4 text-sm font-bold text-slate-600 transition hover:border-blue-600 hover:text-blue-600 bg-white/50 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Tạo lộ trình mới
                </button>
              </div>

              {/* ========================================================================= */}
              {/* 👉 CỘT PHẢI: CHI TIẾT LỘ TRÌNH VÀ CÂY TIẾN ĐỘ THEO CHẶNG */}
              {/* ========================================================================= */}
              {active && (
                <div className="space-y-6">
                  {/* 1. Card Tổng Quan Lộ Trình Đang Chọn */}
                  <section className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0 font-bold">
                        🎯
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-extrabold text-slate-900">{active.title}</h2>
                        <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">
                          Lộ trình bài bản giúp bạn nâng cao điểm số mục tiêu {active.targetScore} trong vòng {active.totalEstimatedDays} ngày qua từng chặng học tập.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-600 pt-1">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-blue-600" /> {active.totalEstimatedDays || 30} ngày
                      </span>
                      <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-600" /> {phases.length} chặng ({active.totalTasks} tác vụ)
                      </span>
                      <span className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-blue-600" /> Mục tiêu {active.targetScore || 650} điểm
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">Tiến trình tổng thể lộ trình</span>
                        <span className="text-slate-500 font-medium">
                          {active.completedTasks}/{active.totalTasks} tác vụ hoàn thành ({active.progressPercent}%)
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <Progress value={active.progressPercent} />
                      </div>
                    </div>
                  </section>

                  {/* 2. Hiển Thị Các Chặng (Phases) & Cây Lộ Trình Zic-Zac */}
                  <div className="space-y-8">
                    {phases.map((phase) => {
                      const phaseTasks = phase.tasks || [];
                      const phaseDone = phase.completedTasks || 0;
                      const phaseTotal = phase.totalTasks || 1;
                      const phasePct = Math.round((phaseDone / phaseTotal) * 100);

                      return (
                        <section key={phase.id} className="space-y-4">
                          {/* Tiêu đề Chặng */}
                          <div className="text-center pt-2">
                            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block">
                              CHẶNG {phase.phaseOrder}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                              {phase.title}
                            </h3>
                          </div>

                          {/* Thanh Mục Tiêu & Điều Kiện Chặng */}
                          <div className="surface-card p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <Flag className="h-4 w-4 text-blue-600 flex-none" />
                                <span className="text-xs font-bold text-slate-900">
                                  Yêu cầu: Điểm pass ≥{phase.minAvgScoreToPass || 70}đ · Tỉ lệ đúng ≥{phase.minAccuracyRace || 70}%
                                </span>
                              </div>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${phase.isCompleted
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-700'
                                  }`}
                              >
                                {phaseDone}/{phaseTotal} task · {phase.isCompleted ? '✓ Đạt chặng' : `${phasePct}%`}
                              </span>
                            </div>
                            <div className="w-full">
                              <Progress value={phasePct} />
                            </div>
                          </div>

                          {/* Danh Sách Các TaskNode Uốn Lượn Zic-Zac Trong Chặng */}
                          <div className="pt-2">
                            <ol className="flex flex-col gap-4">
                              {phaseTasks.map((task, i) => (
                                <TaskNode
                                  key={task.id}
                                  task={task}
                                  offset={getWaveOffset(i)}
                                  onComplete={(tId) => updateTaskProgress(tId, { isCompleted: true })}
                                />
                              ))}
                            </ol>
                          </div>
                        </section>
                      );
                    })}
                  </div>
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
          await createRoadmap(payload);
        }}
      />
    </div>
  );
};

export default VocaPathsPage;
