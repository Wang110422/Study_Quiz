import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { BtnPrimary, BtnOutline, Pill } from '@/components/app/ui-bits';
import examService, { type ExamDTO, type PassageGroupDTO, type QuestionDTO } from '@/services/examService';

const ExamPracticeRoomPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // User state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showTranscripts, setShowTranscripts] = useState<Record<number, boolean>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết bài thi luyện tập:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Bộ đếm thời gian làm bài
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: number, option: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const toggleTranscript = (groupId: number) => {
    setShowTranscripts((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Tính kết quả
  const allQuestions: QuestionDTO[] = [];
  if (exam && exam.sections) {
    exam.sections.forEach((sec) => {
      if (sec.passageGroups) {
        sec.passageGroups.forEach((pg) => {
          if (pg.questions) {
            allQuestions.push(...pg.questions);
          }
        });
      }
    });
  }

  let correctCount = 0;
  allQuestions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const handleSubmit = () => {
    if (window.confirm('Bạn có chắc chắn muốn nộp bài và xem điểm số chi tiết?')) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 font-semibold text-sm">Đang tải phòng thi luyện tập...</span>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground font-semibold">Không tìm thấy bộ đề luyện tập.</p>
        <Link to="/exams" className="mt-4 inline-block">
          <BtnPrimary>Quay lại danh sách đề</BtnPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header Bar: Tiêu đề, Timer & Nút nộp bài */}
          <div className="surface-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-20 shadow-md border border-border/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/exams')}
                className="w-10 h-10 rounded-2xl bg-muted/60 hover:bg-muted text-foreground flex items-center justify-center transition cursor-pointer"
                title="Quay lại"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground line-clamp-1">{exam.title}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đã trả lời: <span className="font-bold text-primary">{Object.keys(userAnswers).length}</span> / {allQuestions.length} câu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-blue-700 font-display font-bold text-sm border border-blue-200/60">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{formatTimer(timeSpent)}</span>
              </div>

              {!submitted ? (
                <BtnPrimary onClick={handleSubmit} className="h-10 px-5 text-xs shadow-pop cursor-pointer">
                  <FileCheck2 className="w-4 h-4" /> Nộp bài
                </BtnPrimary>
              ) : (
                <BtnOutline
                  onClick={() => {
                    setSubmitted(false);
                    setUserAnswers({});
                    setTimeSpent(0);
                  }}
                  className="h-10 px-4 text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Làm lại
                </BtnOutline>
              )}
            </div>
          </div>

          {/* 2. Banner Kết Quả khi nộp bài */}
          {submitted && (
            <div className="surface-card p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-fadeIn">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4" /> Kết quả bài luyện tập
                </span>
                <h2 className="text-2xl font-extrabold font-display">
                  Đúng {correctCount} / {allQuestions.length} câu ({allQuestions.length > 0 ? Math.round((correctCount / allQuestions.length) * 100) : 0}%)
                </h2>
                <p className="text-xs text-blue-100">Thời gian làm bài: {formatTimer(timeSpent)}</p>
              </div>
              <div className="flex gap-3">
                <Link to="/exams">
                  <BtnOutline className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-10 text-xs">
                    Xem bộ đề khác
                  </BtnOutline>
                </Link>
              </div>
            </div>
          )}

          {/* 3. Danh sách các nhóm câu hỏi PassageGroups */}
          {exam.sections?.map((section) => (
            <div key={section.id} className="space-y-6">
              {section.passageGroups?.map((group, gIdx) => {
                const isPart1 = group.toeicPart === 'PART_1';
                const isConversation = group.toeicPart === 'PART_3' || group.toeicPart === 'PART_4';
                const isReading = group.toeicPart === 'PART_7';

                return (
                  <div
                    key={group.id}
                    className="surface-card p-6 rounded-3xl border border-border shadow-2xs space-y-5"
                  >
                    {/* Header Group */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          #{gIdx + 1}
                        </span>
                        <h3 className="font-bold text-sm text-foreground">{group.title}</h3>
                      </div>
                      {group.toeicPart && (
                        <Pill tone="primary" className="text-[11px] font-bold">
                          {group.toeicPart.replace('_', ' ')}
                        </Pill>
                      )}
                    </div>

                    {/* Part 1 Media Box (Ảnh minh họa) */}
                    {group.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden max-w-md mx-auto border border-border bg-muted/30 p-2">
                        <img
                          src={group.mediaUrl}
                          alt={group.title}
                          className="w-full h-auto object-cover rounded-xl shadow-xs"
                        />
                      </div>
                    )}

                    {/* Audio Player giả lập cho bài nghe */}
                    {(isPart1 || isConversation) && (
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/60 max-w-lg">
                        <button
                          type="button"
                          onClick={() => alert('Đang phát file âm thanh mẫu chuẩn format.')}
                          className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-xs hover:scale-105 transition cursor-pointer shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground">Audio Track #{gIdx + 1}</p>
                          <div className="w-full bg-border h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-primary h-full w-2/5 rounded-full" />
                          </div>
                        </div>
                        {group.passageText && (
                          <button
                            type="button"
                            onClick={() => toggleTranscript(group.id)}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {showTranscripts[group.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showTranscripts[group.id] ? 'Ẩn lời thoại' : 'Xem lời thoại'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Đoạn hội thoại / Bài đọc Passage Text */}
                    {group.passageText && (showTranscripts[group.id] || isReading) && (
                      <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs text-foreground leading-relaxed whitespace-pre-line font-serif animate-fadeIn">
                        {group.passageText}
                      </div>
                    )}

                    {/* Danh sách câu hỏi trong Group */}
                    <div className="space-y-4 pt-2">
                      {group.questions?.map((q, qIndex) => {
                        let parsedOptions: string[] = [];
                        try {
                          parsedOptions = typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer;
                        } catch {
                          parsedOptions = ['(A) Option A', '(B) Option B', '(C) Option C', '(D) Option D'];
                        }

                        const selectedOpt = userAnswers[q.id];
                        const isCorrect = selectedOpt === q.correctAnswer;

                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-2xl border transition ${
                              submitted
                                ? isCorrect
                                  ? 'border-emerald-300 bg-emerald-50/40'
                                  : 'border-rose-300 bg-rose-50/40'
                                : 'border-border bg-card'
                            }`}
                          >
                            <p className="font-bold text-xs sm:text-sm text-foreground mb-3 flex items-start gap-2">
                              <span className="text-primary">Câu {qIndex + 1}:</span>
                              <span>{q.content}</span>
                            </p>

                            {/* 4 Phương án A, B, C, D */}
                            <div className="grid gap-2 sm:grid-cols-2">
                              {parsedOptions.map((opt) => {
                                const isSelected = selectedOpt === opt;
                                const isRightAnswer = q.correctAnswer === opt;

                                let optStyle = 'border-border bg-muted/20 text-foreground hover:bg-muted/50';

                                if (submitted) {
                                  if (isRightAnswer) {
                                    optStyle = 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold';
                                  } else if (isSelected && !isRightAnswer) {
                                    optStyle = 'border-rose-500 bg-rose-100 text-rose-900 line-through';
                                  }
                                } else if (isSelected) {
                                  optStyle = 'border-primary bg-primary/10 text-primary font-bold shadow-xs';
                                }

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleSelectOption(q.id, opt)}
                                    className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${optStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {submitted && isRightAnswer && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                    )}
                                    {submitted && isSelected && !isRightAnswer && (
                                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Lời giải thích khi đã nộp bài */}
                            {submitted && q.explanation && (
                              <div className="mt-3 p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed animate-fadeIn">
                                <span className="font-bold text-foreground">💡 Giải thích chi tiết: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ExamPracticeRoomPage;
