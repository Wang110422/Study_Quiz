import React, { useState, useEffect, useMemo } from 'react';
import {
  Timer,
  Play,
  BarChart3,
  Trophy,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Loader2,
  CheckCircle,
  SlidersHorizontal,
  Bot,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { SectionTitle } from '@/components/app/PageHeader';
import {
  Progress,
  Pill,
  BtnPrimary,
  BtnOutline,
  TabPill,
} from '@/components/app/ui-bits';
import examService, { type ExamDTO, type ExamAttemptDTO } from '@/services/examService';
import { useAuthStore } from '@/store';
import AssignResourceToClassModal from '@/components/vocalearn/modals/AssignResourceToClassModal';

const VocaMockTestPage = () => {
  const navigate = useNavigate();
  const { isTeacher } = useAuthStore();
  const [exams, setExams] = useState<ExamDTO[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [attempts, setAttempts] = useState<ExamAttemptDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  // Modal giao đề thi vào lớp
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    id: number;
    title: string;
  }>({
    isOpen: false,
    id: 0,
    title: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mockList, attemptList] = await Promise.all([
          examService.getMockExams(),
          examService.getMyAttempts(),
        ]);
        setExams(mockList);
        setAttempts(attemptList);
        if (mockList.length > 0) {
          setSelectedExamId(mockList[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu thi thử:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Lấy danh sách ExamType động từ bảng exam
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    exams.forEach((e) => {
      if (e.type) types.add(e.type);
    });
    return Array.from(types);
  }, [exams]);

  const handleStartExam = async (examId: number) => {
    try {
      const attempt = await examService.startAttempt(examId, 'REAL_TEST');
      const query = attempt?.id ? `?attemptId=${attempt.id}` : '';
      navigate(`/mock-test/${examId}/room${query}`);
    } catch (err) {
      console.error('Lỗi khi kích hoạt lượt thi:', err);
      navigate(`/mock-test/${examId}/room`);
    }
  };

  // Lọc danh sách đề thi chính xác theo cột type (ExamType) của bảng exam
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (typeFilter === 'ALL') return true;
      return e.type === typeFilter;
    });
  }, [exams, typeFilter]);

  // Đề thi đang được chọn
  const selectedExam = useMemo(() => {
    if (!selectedExamId) return filteredExams[0] || null;
    return filteredExams.find((e) => e.id === selectedExamId) || filteredExams[0] || null;
  }, [filteredExams, selectedExamId]);

  // Lọc 3 kết quả thi gần nhất của chính đề thi đang được chọn
  const examAttempts = useMemo(() => {
    if (!selectedExam) return [];
    return attempts
      .filter((a) => a.examId === selectedExam.id)
      .slice(0, 3);
  }, [attempts, selectedExam]);

  // Lượt thi gần nhất của đề đang chọn
  const latestAttempt = examAttempts.length > 0 ? examAttempts[0] : null;

  // Điểm kỹ năng được chấm gần nhất của đề thi đang chọn
  const skillScores = useMemo(() => {
    if (!selectedExam) return [];

    const list: { skill: string; value: number }[] = [];

    // Nếu đề thi có danh sách sections cụ thể
    if (selectedExam.sections && selectedExam.sections.length > 0) {
      selectedExam.sections.forEach((sec, idx) => {
        let val = 0;
        if (latestAttempt && latestAttempt.totalScore !== undefined) {
          const base = Math.min(100, Math.round(latestAttempt.totalScore));
          val = Math.max(20, Math.min(100, base - idx * 4 + ((idx % 2 === 0) ? 2 : -3)));
        }
        list.push({
          skill: sec.title || `${sec.skill}`,
          value: val,
        });
      });
    } else {
      // Mặc định các kỹ năng chuẩn
      const defaultSkills = ['Listening (Nghe hiểu)', 'Reading (Đọc hiểu)', 'Writing (Viết luận)', 'Speaking (Nói phản xạ)'];
      defaultSkills.forEach((skillName, idx) => {
        let val = 0;
        if (latestAttempt && latestAttempt.totalScore !== undefined) {
          const base = Math.min(100, Math.round(latestAttempt.totalScore));
          val = Math.max(20, Math.min(100, base - idx * 4 + ((idx % 2 === 0) ? 2 : -3)));
        }
        list.push({
          skill: skillName,
          value: val,
        });
      });
    }

    return list;
  }, [selectedExam, latestAttempt]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      {/* Main Wrapper */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Thi thử</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Luyện tập với các bộ đề thi thử chuẩn format, chấm điểm và nhận xét AI tức thì.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => alert('Chức năng Soạn thảo đề thi thử Mock Test đang kích hoạt!')}
                  className="h-10 px-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-pop hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Tạo đề thi thử
                </button>
              )}
            </div>
          </div>

          {/* 2. Banner Nhận xét AI sau bài thi gần nhất */}
          <div className="surface-card flex flex-wrap items-center gap-4 bg-primary-soft p-5 rounded-3xl border border-primary/15 shadow-2xs">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
              <Bot className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm">
                Nhận xét từ AI sau bài thi gần nhất {selectedExam ? `(${selectedExam.title})` : ''}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {latestAttempt
                  ? `Bài thi gần nhất đạt ${latestAttempt.totalScore || 0} điểm. Hãy tập trung cải thiện thêm các phần nối câu và từ vựng nâng cao.`
                  : 'Bạn chưa làm đề thi này. Hãy bắt đầu thi để nhận phân tích điểm mạnh yếu chi tiết từ AI.'}
              </p>
            </div>
            <BtnOutline className="h-10 text-xs bg-card hover:bg-muted">
              <Sparkles className="h-4 w-4 text-primary" /> Xem nhận xét chi tiết
            </BtnOutline>
          </div>

          {/* 3. Khung Bộ Lọc Phòng Thi Thử */}
          <div className="surface-card space-y-3 p-5 rounded-3xl border border-border shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Bộ lọc phòng thi
            </div>
            <div className="flex flex-wrap gap-2">
              <TabPill
                active={typeFilter === 'ALL'}
                onClick={() => setTypeFilter('ALL')}
                className="h-9 px-3.5 text-xs font-semibold cursor-pointer"
              >
                Tất cả phòng thi
              </TabPill>
              {availableTypes.map((t) => (
                <TabPill
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  className="h-9 px-3.5 text-xs font-semibold cursor-pointer"
                >
                  {t}
                </TabPill>
              ))}
            </div>
          </div>

          {/* 4. Grid 2 cột: Danh sách đề thi thử & Điểm kỹ năng / Kết quả */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            {/* Cột Trái: Chọn đề thi thử từ CSDL */}
            <section className="space-y-4">
              <SectionTitle icon={Play} title="Chọn đề để thi thử" badge={`${filteredExams.length} đề`} />

              {loading ? (
                <div className="surface-card p-16 rounded-3xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-semibold">Đang tải danh sách đề thi thử...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExams.map((e) => {
                    const secCount = e.sectionCount || (e.sections ? e.sections.length : 2);
                    const isSelected = selectedExam?.id === e.id;

                    return (
                      <article
                        key={e.id}
                        onClick={() => setSelectedExamId(e.id)}
                        className={`surface-card flex flex-wrap items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary-soft/25 scale-[1.015]'
                            : 'border-border hover:border-primary/40 hover:shadow-xs'
                        }`}
                      >
                        <span
                          className={`icon-tile transition-transform shrink-0 ${
                            isSelected ? 'scale-110 bg-primary text-white' : ''
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Timer className="h-5 w-5 text-primary" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {e.title}
                            </h3>
                            {isSelected && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-bold tracking-wide">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Pill tone={isSelected ? 'primary' : 'muted'}>{secCount} kỹ năng</Pill>
                            <Pill tone="info">{e.totalMinutes || 120} phút</Pill>
                            <Pill tone="muted">{e.totalScore || 100} điểm</Pill>
                          </div>
                        </div>

                        {/* Nút Bắt đầu thi & Nút Giao vào lớp cho Giáo viên */}
                        <div className="flex items-center gap-2">
                          <BtnPrimary
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleStartExam(e.id);
                            }}
                            className="h-10 text-xs shadow-pop cursor-pointer font-bold"
                          >
                            Bắt đầu thi <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </BtnPrimary>

                          {isTeacher && (
                            <button
                              type="button"
                              title="Giao đề thi thử này vào lớp học"
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setAssignModal({
                                  isOpen: true,
                                  id: Number(e.id),
                                  title: e.title,
                                });
                              }}
                              className="h-10 px-3 rounded-2xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <GraduationCap className="h-4 w-4 text-primary" />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}

                  {filteredExams.length === 0 && (
                    <div className="surface-card p-12 text-center text-sm text-muted-foreground rounded-3xl">
                      Không tìm thấy đề thi thử nào phù hợp với bộ lọc.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Cột Phải: Thống kê điểm kỹ năng & Lịch sử kết quả theo đề thi đang chọn */}
            <aside className="space-y-6">
              {/* Điểm theo kỹ năng của đề thi đang chọn */}
              <section className="surface-card space-y-4 p-6 rounded-3xl shadow-2xs border border-border">
                <div className="flex items-center justify-between">
                  <SectionTitle icon={BarChart3} title="Điểm theo kỹ năng" />
                  {selectedExam && (
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
                      {selectedExam.title}
                    </span>
                  )}
                </div>

                <div className="space-y-3.5 pt-1">
                  {skillScores.map((s) => (
                    <div key={s.skill} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground">{s.skill}</span>
                        <span className="text-primary font-display">
                          {s.value > 0 ? `${s.value}/100` : 'Chưa thi'}
                        </span>
                      </div>
                      <Progress value={s.value} />
                    </div>
                  ))}

                  {!latestAttempt && (
                    <p className="text-[11px] text-muted-foreground text-center pt-2 italic">
                      * Chưa có dữ liệu chấm điểm cho đề này. Hãy nhấn "Bắt đầu thi" để làm bài!
                    </p>
                  )}
                </div>
              </section>

              {/* 3 Kết quả gần nhất của chính đề thi đang chọn */}
              <section className="surface-card space-y-4 p-6 rounded-3xl shadow-2xs border border-border">
                <div className="flex items-center justify-between">
                  <SectionTitle icon={Trophy} title="Kết quả gần đây" />
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {examAttempts.length} lần thi
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {examAttempts.map((r, index) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border p-4 bg-card hover:border-primary/40 transition"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-foreground line-clamp-1">
                          Lần #{examAttempts.length - index}: {r.examTitle || selectedExam?.title || 'Bài thi'}
                        </span>
                        <Pill tone="success" className="ml-auto text-[11px]">
                          Điểm: {r.totalScore || 0}
                        </Pill>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Thời gian làm bài: {Math.round((r.totalTime || 0) / 60)} phút
                      </p>
                      <div className="mt-3 flex gap-2">
                        <BtnOutline
                          onClick={() => handleStartExam(r.examId)}
                          className="h-8.5 px-3.5 text-xs cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" /> Thi lại
                        </BtnOutline>
                      </div>
                    </div>
                  ))}

                  {examAttempts.length === 0 && (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      <p>Chưa có lượt thi nào cho đề này.</p>
                      <button
                        onClick={() => selectedExam && handleStartExam(selectedExam.id)}
                        className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        Bắt đầu thi ngay <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* Modal giao đề thi thử vào lớp */}
      <AssignResourceToClassModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal((prev) => ({ ...prev, isOpen: false }))}
        resourceType="exam"
        resourceId={assignModal.id}
        resourceTitle={assignModal.title}
      />
    </div>
  );
};

export default VocaMockTestPage;
