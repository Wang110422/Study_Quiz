import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
  FileCheck2,
  Search,
  Loader2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import { SectionTitle } from '@/components/app/PageHeader';
import { Pill, BtnPrimary } from '@/components/app/ui-bits';
import studyTipService, { type StudyTipDTO } from '@/services/studyTipService';
import type { ExamDTO } from '@/services/examService';

const LessonDrillsPage = () => {
  const { tipId } = useParams<{ tipId: string }>();
  const navigate = useNavigate();

  const [tip, setTip] = useState<StudyTipDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');

  // Tải chi tiết StudyTip và danh sách các bài drill từ Backend
  useEffect(() => {
    const fetchTipDetail = async () => {
      if (!tipId) return;
      setLoading(true);
      try {
        const data = await studyTipService.getStudyTipById(Number(tipId));
        setTip(data);
      } catch (err) {
        console.error('Lỗi khi tải thông tin bài học:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTipDetail();
  }, [tipId]);

  // Danh sách các bài drill thuộc về StudyTip này
  const drills: ExamDTO[] = useMemo(() => {
    return tip?.exams || [];
  }, [tip?.exams]);

  // Tách các gạch đầu dòng mẹo
  const tipLines = useMemo(() => {
    if (!tip) return [];
    if (tip.tips && tip.tips.length > 0) return tip.tips;
    if (tip.content) {
      return tip.content
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [tip]);

  // Lọc bài drill theo từ khóa tìm kiếm
  const filteredDrills = useMemo(() => {
    if (!query.trim()) return drills;
    const q = query.toLowerCase();
    return drills.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [drills, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <VocaHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Đang tải chuyên đề bài học...</p>
        </div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <VocaHeader />
        <main className="flex-1 max-w-[1000px] w-full mx-auto p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Không tìm thấy chuyên đề bài học</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Chuyên đề bài học này có thể đã bị xóa hoặc đường dẫn không chính xác.
          </p>
          <Link to="/lessons">
            <button className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 flex items-center gap-2 cursor-pointer shadow-xs">
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bài học
            </button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      <VocaHeader />

      <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-8 animate-fadeIn">
        {/* 1. Nút quay lại & Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/lessons"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl bg-card border border-border shadow-2xs hover:border-primary/40"
          >
            <ArrowLeft className="w-4 h-4 text-primary" /> Quay lại danh sách bài học
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Bài học</span>
            <span>/</span>
            <span className="text-primary font-bold">{tip.skill}</span>
            <span>/</span>
            <span className="text-foreground font-extrabold">{tip.partName || 'Chuyên đề'}</span>
          </div>
        </div>

        {/* 2. Hero Box: Banner Chuyên Đề & Chiến Thuật Làm Bài */}
        <section className="surface-card p-6 sm:p-8 rounded-3xl border border-border shadow-2xs space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Header Chuyên đề */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              {tip.partName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                  {tip.partName}
                </span>
              )}

              {tip.fromQuestion && tip.toQuestion && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  Câu {tip.fromQuestion} – {tip.toQuestion}
                </span>
              )}

              {tip.examType && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 shadow-2xs">
                  {tip.examType}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-auto">
                <Sparkles className="w-3.5 h-3.5" />
                {drills.length} bài tập thực hành
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {tip.title}
            </h1>
          </div>

          {/* Khung Chiến thuật & Mẹo */}
          {tipLines.length > 0 && (
            <div className="space-y-3 pt-2 relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <BookOpenText className="w-4 h-4 text-primary" />
                Chiến thuật & Mẹo làm bài trọng tâm:
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tipLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 text-xs sm:text-sm font-semibold text-foreground leading-relaxed shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. Tiêu đề danh sách bài drill & Ô tìm kiếm */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionTitle
              title={`Kho bài tập rèn luyện ${tip.partName || ''}`}
              badge={`${filteredDrills.length} bài drill`}
            />

            {drills.length > 3 && (
              <label className="surface-card relative flex h-11 items-center p-0 rounded-2xl border border-border shadow-2xs w-full sm:w-72 cursor-text">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm bài tập thực hành..."
                  className="h-full w-full rounded-2xl bg-transparent pl-10 pr-4 text-xs text-foreground outline-none"
                />
              </label>
            )}
          </div>

          {/* 4. Grid Danh Sách Các Bài Thi Ngắn (Drill Exams) */}
          {drills.length === 0 ? (
            <div className="surface-card p-16 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-3xl bg-muted text-muted-foreground flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Đang cập nhật bài tập thực hành cho {tip.partName || 'chuyên đề này'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Giảng viên đang biên soạn các bộ câu hỏi rèn luyện phản xạ mới. Bạn hãy ghi nhớ các mẹo chiến thuật ở trên trước nhé!
              </p>
            </div>
          ) : filteredDrills.length === 0 ? (
            <div className="surface-card p-12 rounded-3xl text-center text-xs text-muted-foreground">
              Không tìm thấy bài tập nào khớp với từ khóa "{query}".
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDrills.map((drill, index) => {
                const totalQ =
                  drill.totalQuestions ||
                  (drill.sections
                    ? drill.sections.reduce((acc, s) => acc + (s.questionCount || 0), 0)
                    : 3);
                const totalMins = drill.totalMinutes || 5;
                const totalPts = drill.totalScore || totalQ * 10;

                return (
                  <article
                    key={drill.id}
                    className="surface-card flex flex-col justify-between p-6 rounded-3xl border border-border hover:border-primary/50 hover:shadow-xs transition group"
                  >
                    <div className="space-y-4">
                      {/* Top Bar Card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="icon-tile group-hover:scale-105 transition-transform bg-primary/10 text-primary">
                          <FileCheck2 className="h-5 w-5" />
                        </span>

                        <Pill tone="info" className="text-[11px] font-bold">
                          Bài #{index + 1}
                        </Pill>
                      </div>

                      {/* Thông tin bài drill */}
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {drill.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {drill.description ||
                            `Bộ câu hỏi thực hành củng cố chiến thuật ${tip.partName || 'làm bài'}.`}
                        </p>
                      </div>

                      {/* Chi tiết thông số (Số câu, Thời gian, Điểm) */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground border-t border-border/60 pt-3 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-primary" />
                          {totalQ} câu hỏi
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          {totalMins} phút
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-emerald-600" />
                          {totalPts}đ
                        </span>
                      </div>
                    </div>

                    {/* Nút làm bài thi drill */}
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/exams/${drill.id}/practice?mode=lesson&unlimited=true`)
                        }
                        className="h-11 w-full rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                      >
                        Bắt đầu luyện bài này <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LessonDrillsPage;
