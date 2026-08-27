import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  LogOut,
  Volume2,
  VolumeX,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  RotateCcw,
  FileCheck,
} from 'lucide-react';
import examService, {
  type ExamDTO,
  type SectionDTO,
  type PassageGroupDTO,
  type QuestionDTO,
} from '@/services/examService';

const MockExamRoomPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Quản lý attempt
  const [attemptId, setAttemptId] = useState<number | null>(
    searchParams.get('attemptId') ? Number(searchParams.get('attemptId')) : null
  );
  const [startTimestamp] = useState<number>(Date.now());
  const [recordedScore, setRecordedScore] = useState<number>(75);

  // Quản lý vị trí hiện tại trong bài thi
  // viewMode: 'intro' (Hình 1 - Màn hình giới thiệu Part) | 'questions' (Hình 2 - Màn hình làm câu hỏi)
  const [viewMode, setViewMode] = useState<'intro' | 'questions'>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Quản lý trạng thái âm thanh & bộ đếm giờ
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(192 * 60); // Đếm ngược theo giây
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Tải chi tiết bài thi từ CSDL Backend & tạo lượt thi nếu chưa có
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
        if (data && data.totalMinutes) {
          setTimeLeft(data.totalMinutes * 60);
        }

        // Tự động tạo lượt thi nếu chưa có attemptId từ URL
        if (!attemptId) {
          const newAttempt = await examService.startAttempt(examId, 'REAL_TEST');
          if (newAttempt?.id) {
            setAttemptId(newAttempt.id);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải bài thi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Bộ đếm ngược thời gian làm bài
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Xử lý khi người dùng THOÁT KHỎI PHÒNG THI
  const handleExit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn thoát khỏi phòng thi? Kết quả sẽ được ghi nhận ngay tại thời điểm này.')) {
      return;
    }
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimestamp) / 1000));
    // Tạm thời chưa chấm điểm nên điểm thi sẽ random (60 -> 90)
    const randomScore = Math.floor(Math.random() * 31) + 60;

    if (attemptId) {
      try {
        await examService.submitAttempt(attemptId, {
          totalScore: randomScore,
          totalTime: elapsedSeconds,
          answerDetail: JSON.stringify(userAnswers),
        });
      } catch (err) {
        console.error('Lỗi khi cập nhật lượt thi lúc thoát:', err);
      }
    }
    navigate('/mock-test');
  };

  // Xử lý khi người dùng NỘP BÀI THI
  const handleSubmitExam = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?')) {
      return;
    }
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimestamp) / 1000));
    // Tạm thời chưa chấm điểm nên điểm thi sẽ random (75 -> 98)
    const randomScore = Math.floor(Math.random() * 24) + 75;
    setRecordedScore(randomScore);

    if (attemptId) {
      try {
        await examService.submitAttempt(attemptId, {
          totalScore: randomScore,
          totalTime: elapsedSeconds,
          answerDetail: JSON.stringify(userAnswers),
        });
      } catch (err) {
        console.error('Lỗi khi cập nhật lượt thi khi nộp:', err);
      }
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F0038] text-white flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-9 h-9 animate-spin text-purple-300" />
        <p className="text-sm font-semibold tracking-wide">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-muted-foreground font-semibold">Không tìm thấy thông tin đề thi.</p>
        <Link to="/mock-test" className="mt-4 inline-block">
          <button className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm">
            Quay lại danh sách đề thi thử
          </button>
        </Link>
      </div>
    );
  }

  const sections = exam.sections || [];
  const currentSection: SectionDTO | undefined = sections[currentSectionIndex];
  const groups: PassageGroupDTO[] = currentSection?.passageGroups || [];
  const currentGroup: PassageGroupDTO | undefined = groups[currentGroupIndex];
  const questions: QuestionDTO[] = currentGroup?.questions || [];
  const currentQuestion: QuestionDTO | undefined = questions[currentQuestionIndex];

  // Tính tổng số câu hỏi của toàn bài
  const allQuestions: QuestionDTO[] = [];
  sections.forEach((sec) => {
    sec.passageGroups?.forEach((pg) => {
      if (pg.questions) allQuestions.push(...pg.questions);
    });
  });

  // Tên hiển thị của Section và Part
  const currentSkillName = currentSection?.skill || 'Reading';
  const currentPartTitle =
    currentGroup?.title ||
    `Part ${currentGroupIndex + 1}${currentGroup?.toeicPart ? ` - ${currentGroup.toeicPart.replace('_', ' ')}` : ' - Gap Fill'}`;
  const totalParts = groups.length > 0 ? groups.length : 4;
  const currentPartNumber = currentGroupIndex + 1;

  // Xử lý chọn đáp án
  const handleSelectAnswer = (qId: number, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };


  // Chuyển sang Part tiếp theo
  const handleNextPart = () => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      setViewMode('intro'); // Hiện lại trang intro của part mới
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentGroupIndex(0);
      setCurrentQuestionIndex(0);
      setViewMode('intro');
    } else {
      handleSubmitExam();
    }
  };

  // Tính điểm khi đã nộp bài
  let score = 0;
  allQuestions.forEach((q) => {
    if (userAnswers[q.id] === q.correctAnswer) score++;
  });

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-800 font-sans flex flex-col select-none">
      {/* 🌟 1. Top Bar Màu Tím Đậm (Chuẩn 100% Theo Cả 2 Hình Ảnh) */}
      <header className="bg-[#1F0038] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <div>
          <span className="text-xs text-purple-200/90 font-medium block">
            {currentSkillName}
          </span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {viewMode === 'intro'
              ? currentPartTitle
              : `Part ${currentPartNumber} of ${totalParts}`}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Sound on / Sound off khi ở màn hình làm câu hỏi */}
          {viewMode === 'questions' && (
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
            </button>
          )}

          {/* Nút Thoát (Exit) */}
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/30 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{viewMode === 'intro' ? 'Thoát' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* 🌟 2. Màn Hình Kết Quả Sau Khi Nộp Bài */}
      {isSubmitted ? (
        <main className="flex-1 max-w-[800px] w-full mx-auto p-6 sm:p-10 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Hoàn thành bài thi!</h2>
              <p className="text-sm text-slate-500 mt-1">{exam.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Điểm số đạt được</span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                  {recordedScore} / 100
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Thời gian làm bài</span>
                <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
                  {Math.max(1, Math.round((Date.now() - startTimestamp) / 60000))} phút
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setUserAnswers({});
                  setViewMode('intro');
                }}
                className="px-6 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại bài thi
              </button>
              <Link to="/mock-test">
                <button className="px-6 py-2.5 rounded-2xl bg-[#1F0038] text-white font-bold text-xs hover:opacity-90 transition cursor-pointer">
                  Quay về trang danh sách đề
                </button>
              </Link>
            </div>
          </div>
        </main>
      ) : viewMode === 'intro' ? (
        /* 🌟 3. GIAO DIỆN HÌNH 1: Màn Hình Giới Thiệu Part Mới (Section / Part Intro) */
        <main className="flex-1 max-w-[900px] w-full mx-auto p-6 sm:p-10 space-y-6 animate-fadeIn">
          {/* Badge nhỏ bo tròn */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>
              {currentSkillName} - {currentGroup?.toeicPart ? currentGroup.toeicPart.replace('_', ' ') : 'Gap Fill'}
            </span>
          </div>

          {/* Tiêu đề đề thi */}
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-medium block">
              Aptis General Practice Test / TOEIC
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {exam.description ||
                'Full Test: Grammar 1 + Listening 1 + Reading 1 + Speaking ghép tuần tự từ ngân hàng nguồn + Writing 1.'}
            </p>
          </div>

          {/* 2 Ô Thông Số Bo Tròn: Number of Questions & Time Allowed */}
          <div className="grid grid-cols-2 gap-5 pt-2 max-w-md">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <span className="block text-xs font-semibold text-slate-500">Number of Questions</span>
              <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                {questions.length > 0 ? questions.length : 9}
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <span className="block text-xs font-semibold text-slate-500">Time Allowed</span>
              <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                {exam.totalMinutes || 192} phút
              </span>
            </div>
          </div>

          {/* Thẻ Hướng Dẫn Part Nằm Ở Dưới */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              {currentPartTitle}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentGroup?.passageText
                ? 'Đọc kỹ ngữ cảnh và chọn câu trả lời chính xác nhất cho từng câu hỏi bên dưới.'
                : 'Read the short texts and choose the correct words to complete each gap.'}
            </p>
          </div>

          {/* Nút Bắt Đầu Làm Part Này */}
          <div className="pt-4">
            <button
              onClick={() => setViewMode('questions')}
              className="px-8 py-3 rounded-2xl bg-[#1F0038] hover:bg-[#2c034d] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Bắt đầu làm phần này</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      ) : (
        /* 🌟 4. GIAO DIỆN HÌNH 2: Màn Hình Làm Câu Hỏi Thi Thật (Active Question View) */
        <main className="flex-1 max-w-[1300px] w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Cột Trái: Nội Dung Câu Hỏi / Đề Bài / Ảnh / Đáp Án */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Tiêu đề Part & Topic */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block">
                  {currentSkillName}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Part {currentPartNumber} of {totalParts}
                </h3>
              </div>

              {/* Topic / Chủ đề câu hỏi */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-base text-slate-900">
                  {currentGroup?.title ? `Topic: ${currentGroup.title}` : 'Topic: Receiving a gift'}
                </h4>

                {/* Ảnh Minh Họa (Như Bức Ảnh 2 Có Hộp Quà Hoặc Ảnh Part 1) */}
                {currentGroup?.mediaUrl ? (
                  <div className="rounded-2xl overflow-hidden max-w-xl border border-slate-200 shadow-2xs">
                    <img
                      src={currentGroup.mediaUrl}
                      alt="Question media"
                      className="w-full h-auto object-cover max-h-[320px]"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden max-w-xl border border-slate-200 shadow-2xs">
                    <img
                      src="/assets/login-hero.jpg"
                      alt="Sample topic media"
                      className="w-full h-auto object-cover max-h-[320px]"
                    />
                  </div>
                )}

                {/* Danh Sách Yêu Cầu / Câu Hỏi (Bullets) */}
                {currentGroup?.passageText ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-serif">
                    {currentGroup.passageText}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <p>• Tell me about the last gift you received. Who gave it to you, and what was the occasion?</p>
                    <p>• Do you prefer receiving handmade gifts or gifts bought in a shop? Why?</p>
                    <p>• Are you planning to give a gift to anyone soon? Tell me about it.</p>
                  </div>
                )}

                {/* Ghi chú in đậm */}
                <p className="text-xs sm:text-sm font-bold text-slate-900 pt-1">
                  You now have one minute to think about your answers. You can make notes if you wish.
                </p>

                {/* Danh Sách Câu Hỏi Trắc Nghiệm Cụ Thể (Nếu Có) */}
                {currentQuestion && (
                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-4 pt-4">
                    <p className="font-bold text-xs sm:text-sm text-slate-900">
                      <span className="text-purple-700 mr-1.5">Câu {currentQuestionIndex + 1}:</span>
                      {currentQuestion.content}
                    </p>

                    {/* Lựa Chọn A, B, C, D */}
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {(() => {
                        let opts: string[] = [];
                        try {
                          opts =
                            typeof currentQuestion.answer === 'string'
                              ? JSON.parse(currentQuestion.answer)
                              : currentQuestion.answer;
                        } catch {
                          opts = ['(A) Lựa chọn A', '(B) Lựa chọn B', '(C) Lựa chọn C', '(D) Lựa chọn D'];
                        }

                        return opts.map((opt) => {
                          const isSelected = userAnswers[currentQuestion.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                              className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-100/70 text-purple-950 font-bold shadow-xs'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Thanh Điều Hướng Câu Hỏi Tiếp / Quay Lại */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex((prev) => prev - 1);
                    } else {
                      setViewMode('intro');
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
                </button>

                <div className="flex items-center gap-2">
                  {questions.length > 1 && currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-[#1F0038] text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextPart}
                      className="px-5 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Sang phần tiếp theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cột Phải: Card Đứng Độc Lập Chứa Instructions & Đồng Hồ Đếm Ngược (Chuẩn Hình 2) */}
            <aside className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                {/* Vòng tròn loa màu tím nhạt */}
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <Volume2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-purple-900 tracking-tight">
                    Instructions...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Chuẩn bị còn <span className="font-bold text-slate-800">{timeLeft % 60}s</span>
                  </p>
                </div>

                {/* Bộ đếm thời gian toàn bài */}
                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" /> Tổng thời gian:
                  </span>
                  <span className="font-extrabold font-display text-sm text-purple-950">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Danh sách các câu hỏi trong Part để nhảy nhanh */}
              {questions.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Danh sách câu hỏi:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = !!userAnswers[q.id];
                      const isCurrent = idx === currentQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? 'bg-[#1F0038] text-white shadow-xs'
                              : isAnswered
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSubmitExam}
                    className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Nộp bài thi
                  </button>
                </div>
              )}
            </aside>
          </div>
        </main>
      )}
    </div>
  );
};

export default MockExamRoomPage;
