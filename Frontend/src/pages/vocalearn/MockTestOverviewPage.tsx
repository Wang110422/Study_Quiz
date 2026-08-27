import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Play,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  Award,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { BtnPrimary, BtnOutline } from '@/components/app/ui-bits';
import examService, { type ExamDTO } from '@/services/examService';

const MockTestOverviewPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết đề thi thử:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [examId]);

  // Kích hoạt lượt thi thật và vào làm bài
  const handleStartAttempt = async () => {
    if (!examId) return;
    setStarting(true);
    try {
      const attempt = await examService.startAttempt(examId, 'REAL_TEST');
      const query = attempt?.id ? `?attemptId=${attempt.id}` : '';
      navigate(`/mock-test/${examId}/room${query}`);
    } catch (err) {
      console.error('Lỗi khi kích hoạt lượt thi:', err);
      navigate(`/mock-test/${examId}/room`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 font-semibold text-sm">Đang tải thông tin đề thi...</span>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground font-semibold">Không tìm thấy thông tin đề thi.</p>
        <Link to="/mock-test" className="mt-4 inline-block">
          <BtnPrimary>Quay lại danh sách đề thi thử</BtnPrimary>
        </Link>
      </div>
    );
  }

  const sectionCount = exam.sectionCount || (exam.sections ? exam.sections.length : 5);
  const totalMinutes = exam.totalMinutes || 192;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-12 max-w-[1000px] w-full mx-auto space-y-8 animate-fadeIn">
          {/* Nút quay lại */}
          <div>
            <button
              onClick={() => navigate('/mock-test')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đề thi thử
            </button>
          </div>

          {/* 🌟 Phần Tiêu Đề Chính (Chuẩn 100% Theo Mẫu Ảnh) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground block">
              Aptis / TOEIC General Practice Test
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display tracking-tight">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {exam.description ||
                'Full Test: Grammar & Vocabulary + Listening + Reading + Speaking ghép tuần tự từ ngân hàng nguồn + Writing.'}
            </p>
          </div>

          {/* 🌟 2 Ô Thông Số: Number of Sections & Time Allowed */}
          <div className="grid grid-cols-2 gap-8 pt-2">
            <div>
              <span className="block text-xs font-semibold text-muted-foreground">Number of Sections</span>
              <span className="mt-1 block text-lg sm:text-xl font-extrabold text-foreground font-display">
                {sectionCount} kỹ năng
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground">Time Allowed</span>
              <span className="mt-1 block text-lg sm:text-xl font-extrabold text-foreground font-display">
                {totalMinutes} phút
              </span>
            </div>
          </div>

          {/* 🌟 Khối Danh Sách Các Phần Thi (Card Trắng Bo Tròn Đẹp Như Ảnh) */}
          <div className="surface-card rounded-3xl border border-border/80 p-4 sm:p-6 shadow-xs divide-y divide-border/60">
            {exam.sections && exam.sections.length > 0 ? (
              exam.sections.map((sec, idx) => (
                <div key={sec.id || idx} className="py-4.5 first:pt-2 last:pb-2 flex items-center gap-4.5">
                  {/* Vòng tròn số thứ tự màu tím đậm */}
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-foreground">{sec.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {sec.skill} · {sec.minutes || 25} min
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback hiển thị 5 mục chuẩn Aptis đúng như ảnh mẫu
              <>
                <div className="py-4 first:pt-2 flex items-center gap-4.5">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Speaking</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">4 parts · 12 min</p>
                  </div>
                </div>

                <div className="py-4 flex items-center gap-4.5">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Listening</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">4 parts · 40 min</p>
                  </div>
                </div>

                <div className="py-4 flex items-center gap-4.5">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Grammar & Vocabulary</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">30 questions · 25 min</p>
                  </div>
                </div>

                <div className="py-4 flex items-center gap-4.5">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Reading</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">5 parts · 35 min</p>
                  </div>
                </div>

                <div className="py-4 last:pb-2 flex items-center gap-4.5">
                  <div className="w-9 h-9 rounded-full bg-[#1A0B2E] text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow-xs">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Writing</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">4 parts · 50 min</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 🌟 Nút Kích Hoạt Lượt Thi */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <BtnPrimary
              onClick={handleStartAttempt}
              disabled={starting}
              className="h-12 px-8 rounded-2xl shadow-pop text-sm font-bold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang kích hoạt lượt thi...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Bắt đầu làm bài thi</span>
                </>
              )}
            </BtnPrimary>
            <span className="text-xs text-muted-foreground">
              ⚡ Hệ thống sẽ tự động bấm giờ và lưu kết quả sau khi bạn nhấn bắt đầu.
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MockTestOverviewPage;
