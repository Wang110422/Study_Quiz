import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy,
  Flame,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpenText,
  FileText,
  Clock,
  Search,
  Filter,
  TrendingUp,
  Award,
  Medal,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import { useAuthStore } from '@/store';
import leaderboardService, { type UserStreakDTO } from '@/services/leaderboardService';

// =============================================================================
// TYPES & DATA STRUCTURES
// =============================================================================
type MainFilter = 'vocab' | 'exam' | 'streak';
type ExamSubFilter = 'submitted' | 'latest_score' | 'avg_score';

interface StudentRanking {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  isCurrentUser?: boolean;
  // Metric: Từ vựng
  vocabLearned: number;
  studySetsCount: number;
  // Metric: Luyện đề
  examsSubmitted: number;
  latestExamScore: number;
  avgExamScore: number;
  lastExamDate: string;
  // Metric: Streak
  streakDays: number;
  totalActiveDays: number;
  lastActiveDate: string;
}

export const VocaLeaderboardPage = () => {
  const { user } = useAuthStore();
  const [mainFilter, setMainFilter] = useState<MainFilter>('exam');
  const [examSubFilter, setExamSubFilter] = useState<ExamSubFilter>('latest_score');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStudents, setApiStudents] = useState<StudentRanking[]>([]);
  const [streakData, setStreakData] = useState<UserStreakDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Người dùng hiện tại
  const currentUserName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Bạn'
    : 'Bạn';
  const currentUserEmail = user?.email || 'ban@lingomaster.vn';

  // Lấy dữ liệu bảng xếp hạng từ backend API (100% dữ liệu thực từ DB)
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leaderboardService.getLeaderboard(mainFilter, examSubFilter);
      if (res && res.rankings && Array.isArray(res.rankings)) {
        const mapped: StudentRanking[] = res.rankings.map((item, idx) => ({
          id: String(item.userId || `st-${idx}`),
          name: item.name,
          email: item.email,
          avatarInitial: item.avatarInitial || (item.name ? item.name.charAt(0).toUpperCase() : 'U'),
          isCurrentUser: Boolean(item.isCurrentUser),
          vocabLearned: item.vocabLearned || 0,
          studySetsCount: item.studySetsCount || 0,
          examsSubmitted: item.examsSubmitted || 0,
          latestExamScore: item.latestExamScore || 0,
          avgExamScore: item.avgExamScore || 0,
          lastExamDate: item.lastExamDate || 'Chưa thi',
          streakDays: item.streakDays || 0,
          totalActiveDays: item.totalActiveDays || 0,
          lastActiveDate: item.lastActiveDate || 'Chưa học',
        }));
        setApiStudents(mapped);
      } else {
        setApiStudents([]);
      }
      if (res && res.streakSummary) {
        setStreakData(res.streakSummary);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng xếp hạng từ DB:', err);
      setApiStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [mainFilter, examSubFilter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRecordStreak = async () => {
    setIsRecording(true);
    try {
      const updated = await leaderboardService.recordStreakActivity();
      if (updated) {
        setStreakData(updated);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error('Lỗi khi ghi nhận streak:', err);
    } finally {
      setIsRecording(false);
    }
  };

  // Sử dụng 100% dữ liệu từ Database, không chèn dữ liệu ảo
  const allStudents = useMemo(() => {
    return apiStudents;
  }, [apiStudents]);

  // Sắp xếp học viên theo Filter người dùng chọn
  const sortedStudents = useMemo(() => {
    let list = [...allStudents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    if (mainFilter === 'vocab') {
      // Sắp xếp theo số từ vựng đã thuộc
      list.sort((a, b) => b.vocabLearned - a.vocabLearned);
    } else if (mainFilter === 'exam') {
      // Sắp xếp theo 3 tiêu chí con của luyện đề
      if (examSubFilter === 'submitted') {
        list.sort((a, b) => b.examsSubmitted - a.examsSubmitted);
      } else if (examSubFilter === 'latest_score') {
        list.sort((a, b) => b.latestExamScore - a.latestExamScore);
      } else if (examSubFilter === 'avg_score') {
        list.sort((a, b) => b.avgExamScore - a.avgExamScore);
      }
    } else if (mainFilter === 'streak') {
      // Sắp xếp theo số ngày streak online
      list.sort((a, b) => b.streakDays - a.streakDays);
    }

    return list;
  }, [allStudents, mainFilter, examSubFilter, searchQuery]);

  // Vị trí của người dùng hiện tại
  const currentUserRankIndex = sortedStudents.findIndex((s) => s.isCurrentUser);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;

  // Lịch 7 ngày trong tuần động theo ngày thực tế và dữ liệu thật từ Database
  const computedWeekDays = useMemo(() => {
    const daysName = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0: Thứ 2, ..., 6: CN

    const monday = new Date(now);
    monday.setDate(now.getDate() - todayIndex);

    return daysName.map((day, idx) => {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + idx);
      const dateFormatted = `${String(currentDay.getDate()).padStart(2, '0')}/${String(currentDay.getMonth() + 1).padStart(2, '0')}`;
      const isToday = idx === todayIndex;
      const active = (streakData?.weeklyActivity && streakData.weeklyActivity.length > idx)
        ? Boolean(streakData.weeklyActivity[idx])
        : false;
      return {
        day,
        date: dateFormatted,
        active,
        isToday,
      };
    });
  }, [streakData]);

  // Danh sách các ngày trong tháng hiện tại và trạng thái Streak (2 mốc: Ô trắng vs Icon lửa)
  const monthlyCalendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const todayDate = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const firstDayJs = new Date(year, month, 1).getDay();
    const startPadding = firstDayJs === 0 ? 6 : firstDayJs - 1; // 0=T2, ..., 6=CN

    const activeDateSet = new Set<string>();
    if (streakData?.activeDatesInMonth && Array.isArray(streakData.activeDatesInMonth)) {
      streakData.activeDatesInMonth.forEach((d) => activeDateSet.add(d));
    }

    // Nếu hôm nay hasActiveToday = true thì chắc chắn hôm nay có ngọn lửa
    if (streakData?.hasActiveToday) {
      const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;
      activeDateSet.add(todayStr);
    }

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === todayDate;
      const isFuture = day > todayDate;
      const hasStreak = activeDateSet.has(dateStr);

      days.push({
        day,
        dateStr,
        isToday,
        isFuture,
        hasStreak,
      });
    }

    const activeCount = days.filter((d) => !d.isFuture && d.hasStreak).length;

    return {
      year,
      month: month + 1,
      todayDate,
      daysInMonth,
      startPadding,
      days,
      activeCount,
    };
  }, [streakData]);

  const currentStreakDisplay = streakData?.currentStreak ?? 0;
  const longestStreakDisplay = streakData?.longestStreak ?? 0;
  const totalDaysDisplay = streakData?.totalActiveDays ?? 0;
  const attendanceRateDisplay = streakData?.attendanceRate != null ? `${streakData.attendanceRate}%` : '0%';
  const hasActiveToday = streakData?.hasActiveToday ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-24">
      {/* Top Header thanh ngang */}
      <VocaHeader />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto space-y-8 animate-fadeIn">
        {/* ========================================================================= */}
        {/* PHẦN 1: BẢNG STREAK (HOẠT ĐỘNG HỌC TẬP DUOLINGO STYLE VỚI NGỌN LỬA & TÍCH XANH) */}
        {/* ========================================================================= */}
        <section className="surface-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  Hoạt động học tập & Streak
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mỗi khi đăng nhập, học bài, kiểm tra hoặc nộp đề thi sẽ tự động duy trì ngọn lửa chuỗi ngày học!
                </p>
              </div>
            </div>

            {/* Trạng thái hôm nay & Nút ghi nhận */}
            <div className="flex items-center gap-3 flex-wrap">
              {hasActiveToday ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl w-fit">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold shadow-xs">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                  <span className="text-xs font-bold">Hôm nay đã ghi nhận Streak!</span>
                </div>
              ) : (
                <button
                  onClick={handleRecordStreak}
                  disabled={isRecording}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-white animate-bounce" />
                  <span>{isRecording ? 'Đang ghi nhận...' : 'Kích hoạt Streak hôm nay'}</span>
                </button>
              )}

              <button
                onClick={fetchLeaderboard}
                disabled={isLoading}
                title="Tải lại bảng xếp hạng"
                className="p-2.5 rounded-2xl border border-border hover:bg-muted text-muted-foreground transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>
          </div>

          {/* Hàng số liệu Streak */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Chuỗi hiện tại */}
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-pop shrink-0">
                <Flame className="w-7 h-7 fill-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <strong className="font-display text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                    {currentStreakDisplay}
                  </strong>
                  <span className="text-xs font-bold text-muted-foreground">ngày</span>
                </div>
                <span className="text-xs font-semibold text-foreground/80 block mt-0.5">
                  Chuỗi hiện tại
                </span>
              </div>
            </div>

            {/* 2. Kỷ lục streak dài nhất */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <strong className="font-display text-3xl sm:text-4xl font-black text-foreground">
                    {longestStreakDisplay}
                  </strong>
                  <span className="text-xs font-bold text-muted-foreground">ngày</span>
                </div>
                <span className="text-xs font-semibold text-foreground/80 block mt-0.5">
                  Kỷ lục dài nhất
                </span>
              </div>
            </div>

            {/* 3. Tổng ngày vào học */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <strong className="font-display text-3xl sm:text-4xl font-black text-foreground">
                    {totalDaysDisplay}
                  </strong>
                  <span className="text-xs font-bold text-muted-foreground">ngày</span>
                </div>
                <span className="text-xs font-semibold text-foreground/80 block mt-0.5">
                  Tổng ngày vào học
                </span>
              </div>
            </div>

            {/* 4. Tỷ lệ hoàn thành */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <strong className="font-display text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {attendanceRateDisplay}
                  </strong>
                </div>
                <span className="text-xs font-semibold text-foreground/80 block mt-0.5">
                  Độ chuyên cần tháng
                </span>
              </div>
            </div>
          </div>

          {/* Lịch tuần này (Duolingo Style: Vòng tròn ngọn lửa / Tích xanh tròn cho 7 ngày) */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>Chuỗi tuần này (Tháng 9)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {hasActiveToday ? 'Đã duy trì ngọn lửa hôm nay!' : 'Đang đợi bạn vào học!'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-1">
              {computedWeekDays.map((item) => (
                <div
                  key={item.day}
                  className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl border transition-all ${
                    item.isToday
                      ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-2 ring-amber-500/20'
                      : 'border-border/60 bg-card hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xs font-bold text-muted-foreground">{item.day}</span>
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                      item.active
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-pop'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.active ? (
                      <Check className="w-5 h-5 stroke-[3] text-white" />
                    ) : (
                      <span className="text-xs font-bold">•</span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {item.isToday ? 'Hôm nay' : item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>


          {/* Lịch học tập 1 tháng gần nhất (Monthly Streak Calendar - Số ở trên, Đốm lửa ở dưới, Bỏ Border) */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            {/* Header thông tin tháng và chú thích 2 trạng thái lửa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Lịch học tập tháng {monthlyCalendarData.month}/{monthlyCalendarData.year}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Đã duy trì lửa <span className="font-semibold text-amber-500">{monthlyCalendarData.activeCount}</span>/{monthlyCalendarData.todayDate} ngày trong tháng này
                  </p>
                </div>
              </div>

              {/* 2 Trạng Thái Ngọn Lửa: Chưa học & Đã học */}
              <div className="flex items-center gap-3 text-xs bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flame className="w-4 h-4 fill-transparent text-muted-foreground/50 stroke-[1.5]" />
                  <span>Chưa học</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Đã học</span>
                </div>
              </div>
            </div>

            {/* Bảng lịch tháng 7 cột: Thứ 2 đến Chủ nhật (Không dùng border hộp ở các ô con) */}
            <div className="bg-muted/15 border border-border/70 rounded-2xl p-3 sm:p-4 shadow-2xs">
              {/* Header các ngày trong tuần */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName, idx) => (
                  <div
                    key={dayName}
                    className={`text-center text-[11px] sm:text-xs font-bold py-1 ${
                      idx >= 5 ? 'text-primary/80' : 'text-muted-foreground'
                    }`}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Grid các ô ngày trong tháng: Số ở trên, Đốm lửa ở dưới */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Các ô đệm đầu tháng cho đúng thứ */}
                {Array.from({ length: monthlyCalendarData.startPadding }).map((_, padIdx) => (
                  <div
                    key={`pad-${padIdx}`}
                    className="h-12 sm:h-14 bg-transparent"
                  />
                ))}

                {/* Các ngày trong tháng */}
                {monthlyCalendarData.days.map((item) => {
                  if (item.isFuture) {
                    return (
                      <div
                        key={item.day}
                        className="h-12 sm:h-14 flex flex-col items-center justify-center gap-1 opacity-25 cursor-not-allowed select-none"
                        title={`${item.day}/${monthlyCalendarData.month}/${monthlyCalendarData.year} (Chưa tới)`}
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.day}
                        </span>
                        <Flame className="w-4 h-4 fill-transparent text-muted-foreground/30 stroke-[1.2]" />
                      </div>
                    );
                  }

                  if (item.hasStreak) {
                    // Mốc 1: Có học -> Số ở trên, Ngọn lửa tô màu cam ấm ở dưới
                    return (
                      <div
                        key={item.day}
                        className="h-12 sm:h-14 flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-muted/30 transition-all cursor-pointer group"
                        title={`${item.day}/${monthlyCalendarData.month}/${monthlyCalendarData.year}: Đã hoàn thành mục tiêu học tập`}
                      >
                        <span
                          className={`text-xs font-bold leading-none ${
                            item.isToday
                              ? 'w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs'
                              : 'text-foreground group-hover:text-amber-500 transition-colors'
                          }`}
                        >
                          {item.day}
                        </span>
                        <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-500 text-amber-500 drop-shadow-xs group-hover:scale-115 transition-transform" />
                      </div>
                    );
                  }

                  // Mốc 2: Không học -> Số ở trên, Ngọn lửa chỉ có viền nét ở dưới
                  return (
                    <div
                      key={item.day}
                      className="h-12 sm:h-14 flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-muted/30 transition-all cursor-pointer group"
                      title={`${item.day}/${monthlyCalendarData.month}/${monthlyCalendarData.year}: Chưa ghi nhận học tập`}
                    >
                      <span
                        className={`text-xs font-semibold leading-none ${
                          item.isToday
                            ? 'w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs'
                            : 'text-muted-foreground/80 group-hover:text-foreground transition-colors'
                        }`}
                      >
                        {item.day}
                      </span>
                      {/* Ngọn lửa không có màu tô bên trong, chỉ có đường nét viền */}
                      <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-transparent text-muted-foreground/45 stroke-[1.5] group-hover:text-muted-foreground/75 transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PHẦN 2: BẢNG XẾP HẠNG CÁC THÍ SINH (CÓ ĐẦY ĐỦ BỘ LỌC TỪ VỰNG, LUYỆN ĐỀ, STREAK) */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          {/* Header Bảng Xếp Hạng & Bục Vinh Danh Top 3 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Bảng Vinh Danh Học Viên
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                Bảng xếp hạng toàn hệ thống
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Cập nhật liên tục thành tích học từ vựng, nộp đề thi và chuỗi chuyên cần.
              </p>
            </div>

            {/* Vị trí của bạn */}
            {currentUserRank && (
              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-3 sm:px-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs">
                  #{currentUserRank}
                </span>
                <div>
                  <span className="text-xs text-muted-foreground block">Vị trí hiện tại của</span>
                  <b className="text-sm font-bold text-primary">Bạn ({currentUserName})</b>
                </div>
              </div>
            )}
          </div>

          {/* Bộ lọc Filter Bar */}
          <div className="surface-card p-4 sm:p-5 rounded-3xl space-y-4 shadow-card">
            {/* Tab Lọc Chính (Từ vựng | Luyện đề | Streak) */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-2xl border border-border/80">
                {/* 1. Filter: Từ vựng */}
                <button
                  type="button"
                  onClick={() => setMainFilter('vocab')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    mainFilter === 'vocab'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpenText className="w-4 h-4 text-blue-500" />
                  <span>Từ vựng</span>
                </button>

                {/* 2. Filter: Luyện đề */}
                <button
                  type="button"
                  onClick={() => setMainFilter('exam')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    mainFilter === 'exam'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Luyện đề</span>
                </button>

                {/* 3. Filter: Streak */}
                <button
                  type="button"
                  onClick={() => setMainFilter('streak')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    mainFilter === 'streak'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Streak</span>
                </button>
              </div>

              {/* Ô tìm kiếm học viên */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học viên theo tên, email..."
                  className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-4 text-xs outline-none transition focus:border-ring"
                />
              </div>
            </div>

            {/* Sub-filter khi chọn "Luyện đề" (3 filter: Số lượng đề đã nộp, Điểm gần nhất, Trung bình điểm) */}
            {mainFilter === 'exam' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Sắp xếp theo:
                </span>

                <button
                  type="button"
                  onClick={() => setExamSubFilter('latest_score')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    examSubFilter === 'latest_score'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Điểm bài thi gần nhất
                </button>

                <button
                  type="button"
                  onClick={() => setExamSubFilter('submitted')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    examSubFilter === 'submitted'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Số lượng đề đã nộp
                </button>

                <button
                  type="button"
                  onClick={() => setExamSubFilter('avg_score')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    examSubFilter === 'avg_score'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Trung bình điểm các bài thi
                </button>
              </div>
            )}
          </div>

          {/* Bảng Xếp Hạng Chuẩn Hình 2 */}
          <div className="surface-card rounded-3xl overflow-hidden border border-border shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6 w-20 text-center">Hạng</th>
                    <th className="py-4 px-6">Học viên</th>
                    {/* Cột số liệu chính dựa theo Filter */}
                    {mainFilter === 'vocab' && (
                      <>
                        <th className="py-4 px-6 text-right">Từ vựng đã thuộc</th>
                        <th className="py-4 px-6 text-right">Bộ thẻ hoàn thành</th>
                        <th className="py-4 px-6 text-right">Lần học gần nhất</th>
                      </>
                    )}
                    {mainFilter === 'exam' && (
                      <>
                        <th className="py-4 px-6 text-right">
                          {examSubFilter === 'latest_score'
                            ? 'Điểm gần nhất'
                            : examSubFilter === 'avg_score'
                            ? 'Điểm trung bình'
                            : 'Điểm'}
                        </th>
                        <th className="py-4 px-6 text-right">Bài nộp</th>
                        <th className="py-4 px-6 text-right">Lần nộp gần nhất</th>
                      </>
                    )}
                    {mainFilter === 'streak' && (
                      <>
                        <th className="py-4 px-6 text-right">Chuỗi Streak</th>
                        <th className="py-4 px-6 text-right">Tổng ngày vào học</th>
                        <th className="py-4 px-6 text-right">Online gần nhất</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {sortedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground text-sm block">
                              Chưa có dữ liệu bảng xếp hạng
                            </span>
                            <span className="text-xs text-muted-foreground font-normal mt-0.5 block">
                              Dữ liệu được cập nhật từ hoạt động học thực tế của các học viên trong hệ thống.
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedStudents.map((student, idx) => {
                      const rank = idx + 1;
                      const isTop1 = rank === 1;
                      const isTop2 = rank === 2;
                      const isTop3 = rank === 3;

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors ${
                            student.isCurrentUser
                              ? 'bg-primary/5 font-semibold'
                              : 'hover:bg-muted/40'
                          }`}
                        >
                        {/* Cột 1: Hạng (Hình 2: Số 1, 2, 3 có vòng tròn màu cam/vàng/nâu đậm) */}
                        <td className="py-4 px-6 text-center">
                          {isTop1 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-sm shadow-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-900 font-black text-sm shadow-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/30 text-amber-800 dark:text-amber-300 font-black text-sm shadow-xs">
                              3
                            </span>
                          ) : (
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50/50 dark:bg-muted text-orange-600 dark:text-muted-foreground text-xs font-bold">
                              {rank}
                            </span>
                          )}
                        </td>

                        {/* Cột 2: Thông tin Học viên (Tên in đậm màu tối + Email phía dưới như Hình 2) */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-foreground text-sm tracking-tight block">
                                  {student.name}
                                </span>
                                {student.isCurrentUser && (
                                  <span className="rounded-md bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-bold">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground block font-normal mt-0.5">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cột 3, 4, 5: Số liệu tương ứng theo Filter */}
                        {mainFilter === 'vocab' && (
                          <>
                            <td className="py-4 px-6 text-right font-black text-base text-primary">
                              {student.vocabLearned.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-foreground">
                              {student.studySetsCount}
                            </td>
                            <td className="py-4 px-6 text-right text-xs text-muted-foreground font-medium">
                              {student.lastActiveDate}
                            </td>
                          </>
                        )}

                        {mainFilter === 'exam' && (
                          <>
                            {/* Điểm hiển thị màu đỏ sẫm đặc trưng như Hình 2 */}
                            <td className="py-4 px-6 text-right font-black text-base text-red-700 dark:text-red-400">
                              {examSubFilter === 'latest_score'
                                ? student.latestExamScore
                                : examSubFilter === 'avg_score'
                                ? student.avgExamScore.toFixed(1)
                                : student.latestExamScore}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-foreground">
                              {student.examsSubmitted}
                            </td>
                            <td className="py-4 px-6 text-right text-xs text-muted-foreground font-medium">
                              {student.lastExamDate}
                            </td>
                          </>
                        )}

                        {mainFilter === 'streak' && (
                          <>
                            <td className="py-4 px-6 text-right">
                              <span className="inline-flex items-center gap-1 font-black text-base text-amber-600 dark:text-amber-400">
                                <Flame className="w-4 h-4 fill-current" />
                                {student.streakDays} ngày
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-semibold text-foreground">
                              {student.totalActiveDays} ngày
                            </td>
                            <td className="py-4 px-6 text-right text-xs text-muted-foreground font-medium">
                              {student.lastActiveDate}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VocaLeaderboardPage;
