import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Award,
  FileCheck2,
  Flame,
  Search,
  MessageSquarePlus,
  Send,
  X,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import { classGroupService, type ClassOrGroup } from '@/services/classGroupService';
import leaderboardService, { type LeaderboardItemDTO } from '@/services/leaderboardService';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import notificationService from '@/services/notificationService';

interface StudentAdvice {
  id: string;
  studentId: string;
  studentName: string;
  type: 'praise' | 'warning' | 'advice';
  title: string;
  content: string;
  createdAt: string;
}

export const TeacherAnalyticsPage = () => {
  const navigate = useNavigate();
  const { isTeacher } = useAuthStore();

  const [classes, setClasses] = useState<ClassOrGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | 'ALL'>('ALL');
  const [students, setStudents] = useState<LeaderboardItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Modal gửi lời khuyên
  const [activeStudent, setActiveStudent] = useState<LeaderboardItemDTO | null>(null);
  const [adviceType, setAdviceType] = useState<'praise' | 'warning' | 'advice'>('advice');
  const [adviceTitle, setAdviceTitle] = useState<string>('');
  const [adviceContent, setAdviceContent] = useState<string>('');
  const [adviceList, setAdviceList] = useState<StudentAdvice[]>(() => {
    const saved = localStorage.getItem('vocalearn_teacher_advices');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tải danh sách lớp học của giáo viên và danh sách học sinh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [classList, studentList] = await Promise.all([
          classGroupService.getUserClasses().catch(() => []),
          leaderboardService.getLeaderboard('vocab').catch(() => null),
        ]);
        setClasses(classList || []);
        setStudents(studentList?.rankings || []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phân tích:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Tải lại leaderboard khi đổi lớp
  useEffect(() => {
    const loadClassStudents = async () => {
      if (selectedClassId === 'ALL') return; // Đã load ở useEffect trên
      setLoading(true);
      try {
        const result = await leaderboardService.getClassLeaderboard(selectedClassId, 'vocab').catch(() => null);
        setStudents(result?.rankings || []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    if (selectedClassId !== 'ALL') {
      loadClassStudents();
    }
  }, [selectedClassId]);

  // Reload tất cả khi chuyển về ALL
  useEffect(() => {
    if (selectedClassId !== 'ALL') return;
    const reload = async () => {
      setLoading(true);
      try {
        const result = await leaderboardService.getLeaderboard('vocab').catch(() => null);
        setStudents(result?.rankings || []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    reload();
  }, [selectedClassId]);

  // Lọc học sinh theo từ khóa tìm kiếm
  const filteredStudents = useMemo(() => {
    let list = students.filter((s) => !s.isCurrentUser || !isTeacher); // Chỉ xem học sinh
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, searchQuery, isTeacher]);

  // Tính toán KPI tổng quan
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const avgScore =
      totalStudents > 0
        ? Math.round(
            (filteredStudents.reduce((acc, s) => acc + (s.avgExamScore || 0), 0) /
              totalStudents) *
              10
          ) / 10
        : 0;
    const totalExamsSubmitted = filteredStudents.reduce(
      (acc, s) => acc + (s.examsSubmitted || 0),
      0
    );
    const avgStreak =
      totalStudents > 0
        ? Math.round(
            filteredStudents.reduce((acc, s) => acc + (s.streakDays || 0), 0) / totalStudents
          )
        : 0;

    return {
      totalStudents,
      avgScore,
      totalExamsSubmitted,
      avgStreak,
    };
  }, [filteredStudents]);

  // Xử lý gửi lời khuyên cho học sinh
  const handleSendAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !adviceContent.trim()) return;

    const newAdvice: StudentAdvice = {
      id: String(Date.now()),
      studentId: String(activeStudent.userId),
      studentName: activeStudent.name,
      type: adviceType,
      title: adviceTitle.trim() || 'Lời khuyên từ giảng viên',
      content: adviceContent.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newAdvice, ...adviceList];
    setAdviceList(updated);
    localStorage.setItem('vocalearn_teacher_advices', JSON.stringify(updated));

    // Gửi thông báo đến tài khoản học sinh
    if (activeStudent.userId) {
      notificationService.createNotification({
        targetUserId: Number(activeStudent.userId),
        title: adviceTitle.trim() || 'Lời khuyên từ giảng viên',
        content: adviceContent.trim(),
        type: 'TEACHER_ADVICE',
        referenceUrl: '/leaderboard',
      }).catch((err) => console.error('Lỗi gửi thông báo lời khuyên:', err));
    }

    // Reset form & thông báo
    setAdviceTitle('');
    setAdviceContent('');
    setActiveStudent(null);
    setToastMessage(`Đã gửi lời khuyên thành công đến học sinh ${activeStudent.name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tên lớp đang chọn
  const selectedClassName = selectedClassId === 'ALL'
    ? `Tất cả lớp học (${classes.length})`
    : classes.find((c) => c.id === selectedClassId)?.name || 'Lớp học';

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground flex flex-col font-sans select-none pb-24">
      {/* Top Header */}
      <VocaHeader />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
        {/* Toast thông báo */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Header Trang Thống Kê */}
        <section className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Cổng Giảng Viên • Quản Lý Học Tập
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Thống kê & Đánh giá học viên
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Theo dõi kết quả luyện đề, tiến độ học từ vựng và gửi lời khuyên, nhận xét trực tiếp đến từng học sinh.
            </p>
          </div>

          {/* Chọn Lớp Học - Custom Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
              className="flex items-center gap-2.5 bg-muted/40 hover:bg-muted/70 border border-border rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 min-w-[200px]"
            >
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase leading-tight">Lớp học</span>
                <span className="text-sm font-bold text-foreground truncate w-full text-left">{selectedClassName}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isClassDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsClassDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-xl min-w-[220px] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => { setSelectedClassId('ALL'); setIsClassDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      selectedClassId === 'ALL'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground hover:bg-muted/60 font-medium'
                    }`}
                  >
                    Tất cả lớp học ({classes.length})
                  </button>
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => { setSelectedClassId(cls.id); setIsClassDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                        selectedClassId === cls.id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground hover:bg-muted/60 font-medium'
                      }`}
                    >
                      {cls.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* 2. Các Thẻ KPI Thống Kê */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground">Tổng học viên</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">{stats.totalStudents}</h3>
            </div>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground">Điểm TB Lớp</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {stats.avgScore} <span className="text-xs font-medium text-muted-foreground">/ 10</span>
              </h3>
            </div>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground">Đề thi đã nộp</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">{stats.totalExamsSubmitted}</h3>
            </div>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground">Streak TB</span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {stats.avgStreak} <span className="text-xs font-medium text-muted-foreground">ngày</span>
              </h3>
            </div>
          </div>
        </section>

        {/* 3. Bảng Danh Sách Học Sinh & Tác Vụ Gửi Lời Khuyên */}
        <section className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
            <div>
              <h2 className="text-lg font-bold text-foreground">Bảng theo dõi thành tích học viên</h2>
              <p className="text-xs text-muted-foreground">
                Xem chi tiết số từ vựng, điểm thi gần nhất và gửi phản hồi cá nhân hóa
              </p>
            </div>

            {/* Tìm kiếm học viên */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Bảng dữ liệu học sinh */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-semibold">
                  <th className="py-3 px-3">Học viên</th>
                  <th className="py-3 px-3">Từ vựng thuộc</th>
                  <th className="py-3 px-3">Đề thi đã làm</th>
                  <th className="py-3 px-3">Điểm TB</th>
                  <th className="py-3 px-3">Điểm gần nhất</th>
                  <th className="py-3 px-3">Streak</th>
                  <th className="py-3 px-3 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Không tìm thấy học sinh nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    // Đếm xem học sinh này đã nhận bao nhiêu lời khuyên
                    const countAdvices = adviceList.filter((a) => a.studentId === String(student.userId)).length;

                    return (
                      <tr
                        key={student.userId}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Học viên */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                              {student.avatarInitial}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{student.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Từ vựng */}
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {student.vocabLearned} từ
                        </td>

                        {/* Đề thi đã làm */}
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {student.examsSubmitted} đề
                        </td>

                        {/* Điểm TB */}
                        <td className="py-3 px-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md ${
                              student.avgExamScore >= 8
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : student.avgExamScore >= 5
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {student.avgExamScore || 0}
                          </span>
                        </td>

                        {/* Điểm gần nhất */}
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {student.latestExamScore || '—'}
                        </td>

                        {/* Chuỗi Streak */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{student.streakDays}</span>
                          </div>
                        </td>

                        {/* Nút hành động */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveStudent(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            <span>Viết lời khuyên</span>
                            {countAdvices > 0 && (
                              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center ml-0.5">
                                {countAdvices}
                              </span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Modal Viết Lời Khuyên Cho Học Sinh */}
        {activeStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center">
                    {activeStudent.avatarInitial}
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Gửi Lời Khuyên Đến {activeStudent.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{activeStudent.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSendAdvice} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                {/* Loại lời khuyên */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Phân loại nhận xét</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdviceType('advice')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        adviceType === 'advice'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      💡 Lời khuyên
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdviceType('praise')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        adviceType === 'praise'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      🌟 Khen thưởng
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdviceType('warning')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                        adviceType === 'warning'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      ⚠️ Nhắc nhở
                    </button>
                  </div>
                </div>

                {/* Tiêu đề nhận xét */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Tiêu đề (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Cố gắng rèn thêm kỹ năng Listening Part 2..."
                    value={adviceTitle}
                    onChange={(e) => setAdviceTitle(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Nội dung nhận xét */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nội dung chi tiết *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập lời nhận xét, hướng dẫn hoặc tài liệu đề xuất cho học sinh này..."
                    value={adviceContent}
                    onChange={(e) => setAdviceContent(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                {/* Lịch sử các lời khuyên đã gửi cho học sinh này */}
                {adviceList.filter((a) => a.studentId === String(activeStudent.userId)).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Lịch sử lời khuyên đã gửi ({adviceList.filter((a) => a.studentId === String(activeStudent.userId)).length})
                    </span>
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {adviceList
                        .filter((a) => a.studentId === String(activeStudent.userId))
                        .map((adv) => (
                          <div
                            key={adv.id}
                            className="p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-primary">{adv.title}</span>
                              <span className="text-muted-foreground">
                                {new Date(adv.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-[11px]">{adv.content}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActiveStudent(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi lời khuyên</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherAnalyticsPage;
