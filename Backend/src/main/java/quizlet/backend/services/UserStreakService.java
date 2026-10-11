package quizlet.backend.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import quizlet.backend.dto.UserStreakDTO;
import quizlet.backend.model.ExamAttempt;
import quizlet.backend.model.User;
import quizlet.backend.model.UserStreak;
import quizlet.backend.repository.ExamAttemptRepository;
import quizlet.backend.repository.UserRepository;
import quizlet.backend.repository.UserStreakRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserStreakService {

    private final UserStreakRepository userStreakRepository;
    private final UserRepository userRepository;
    private final ExamAttemptRepository examAttemptRepository;

    /**
     * Tự động ghi nhận hoạt động và tăng streak của ngày hôm đó:
     * - Đăng nhập
     * - Học từ vựng / bài học
     * - Kiểm tra / Thi thử (bắt đầu thi)
     * - Nộp bài thi
     */
    @Transactional
    public UserStreakDTO recordActivity(User user) {
        if (user == null || user.getId() == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        UserStreak streak = userStreakRepository.findByUserId(user.getId())
                .orElseGet(() -> UserStreak.builder()
                        .user(user)
                        .currentStreak(0)
                        .longestStreak(0)
                        .totalActiveDays(0)
                        .vocabLearned(0)
                        .build());

        LocalDate lastDate = streak.getLastActivityDate();

        if (lastDate == null) {
            // Ngày đầu tiên hoạt động
            streak.setCurrentStreak(1);
            streak.setLongestStreak(Math.max(streak.getLongestStreak() != null ? streak.getLongestStreak() : 0, 1));
            streak.setTotalActiveDays(1);
            streak.setLastActivityDate(today);
        } else if (lastDate.equals(today)) {
            // Đã hoạt động hôm nay -> không tăng thêm currentStreak nhưng đảm bảo totalActiveDays hợp lệ
            if (streak.getTotalActiveDays() == null || streak.getTotalActiveDays() == 0) {
                streak.setTotalActiveDays(1);
            }
        } else if (lastDate.equals(today.minusDays(1))) {
            // Hoạt động ngày hôm qua (ngày liền kề) -> Tăng streak thêm 1 ngày!
            int newStreak = (streak.getCurrentStreak() != null ? streak.getCurrentStreak() : 0) + 1;
            streak.setCurrentStreak(newStreak);
            int longest = streak.getLongestStreak() != null ? streak.getLongestStreak() : 0;
            if (newStreak > longest) {
                streak.setLongestStreak(newStreak);
            }
            streak.setTotalActiveDays((streak.getTotalActiveDays() != null ? streak.getTotalActiveDays() : 0) + 1);
            streak.setLastActivityDate(today);
        } else {
            // Gián đoạn hơn 1 ngày -> Chuỗi streak bị ngắt, reset bắt đầu chuỗi mới là 1
            streak.setCurrentStreak(1);
            streak.setTotalActiveDays((streak.getTotalActiveDays() != null ? streak.getTotalActiveDays() : 0) + 1);
            streak.setLastActivityDate(today);
        }

        streak.setUpdatedAt(LocalDateTime.now());
        UserStreak saved = userStreakRepository.save(streak);
        log.info("Recorded streak activity for user {}: currentStreak={}, totalActiveDays={}",
                user.getId(), saved.getCurrentStreak(), saved.getTotalActiveDays());

        return mapToDTO(saved);
    }

    /**
     * Ghi nhận hoạt động theo userId
     */
    @Transactional
    public UserStreakDTO recordActivityByUserId(Long userId) {
        if (userId == null) return null;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;
        return recordActivity(user);
    }

    /**
     * Lấy thông tin Streak của User kèm tính toán 7 ngày trong tuần và độ chuyên cần
     */
    @Transactional(readOnly = true)
    public UserStreakDTO getStreakByUserId(Long userId) {
        if (userId == null) {
            return getDefaultDTO(null);
        }

        UserStreak streak = userStreakRepository.findByUserId(userId).orElse(null);
        if (streak == null) {
            User user = userRepository.findById(userId).orElse(null);
            String name = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : "Người học";
            UserStreakDTO dto = getDefaultDTO(userId);
            dto.setUserName(name);
            return dto;
        }

        return mapToDTO(streak);
    }

    /**
     * Cập nhật số từ vựng đã học thuộc
     */
    @Transactional
    public UserStreakDTO updateVocabLearned(Long userId, int count, boolean isIncrement) {
        if (userId == null) return null;
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return null;

        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElseGet(() -> UserStreak.builder()
                        .user(user)
                        .currentStreak(0)
                        .longestStreak(0)
                        .totalActiveDays(0)
                        .vocabLearned(0)
                        .build());

        int currentVocab = streak.getVocabLearned() != null ? streak.getVocabLearned() : 0;
        if (isIncrement) {
            streak.setVocabLearned(Math.max(0, currentVocab + count));
        } else {
            streak.setVocabLearned(Math.max(0, count));
        }

        // Tự động ghi nhận hoạt động hôm nay vì đã học từ vựng
        LocalDate today = LocalDate.now();
        if (streak.getLastActivityDate() == null || !streak.getLastActivityDate().equals(today)) {
            recordActivity(user);
            streak = userStreakRepository.findByUserId(userId).orElse(streak);
        } else {
            streak.setUpdatedAt(LocalDateTime.now());
            streak = userStreakRepository.save(streak);
        }

        return mapToDTO(streak);
    }

    /**
     * Map UserStreak entity sang UserStreakDTO
     */
    public UserStreakDTO mapToDTO(UserStreak streak) {
        if (streak == null) return getDefaultDTO(null);

        LocalDate today = LocalDate.now();
        LocalDate lastDate = streak.getLastActivityDate();

        // Kiểm tra xem streak có bị hết hạn do ngày hôm qua không học
        int activeStreak = streak.getCurrentStreak() != null ? streak.getCurrentStreak() : 0;
        if (lastDate != null && lastDate.isBefore(today.minusDays(1))) {
            activeStreak = 0;
        }

        boolean hasActiveToday = lastDate != null && lastDate.equals(today);
        int totalDays = streak.getTotalActiveDays() != null ? streak.getTotalActiveDays() : (hasActiveToday ? 1 : 0);
        int longest = streak.getLongestStreak() != null ? streak.getLongestStreak() : activeStreak;
        if (activeStreak > longest) longest = activeStreak;

        // Tính tỉ lệ chuyên cần (attendance rate)
        double attendanceRate = 94.0;
        if (totalDays > 0) {
            attendanceRate = Math.min(100.0, Math.round((totalDays * 100.0 / Math.max(totalDays + 2, 1)) * 10.0) / 10.0);
        }

        // Lịch 7 ngày trong tuần hiện tại (Thứ 2 -> Chủ nhật)
        List<Boolean> weekly = calculateWeeklyActivity(lastDate, hasActiveToday, activeStreak);

        // Lịch 35 ngày gần nhất (tháng hiện tại) các ngày thật có hoạt động học tập
        List<String> monthlyDates = calculateMonthlyActiveDates(
                streak.getUser() != null ? streak.getUser().getId() : null,
                lastDate,
                activeStreak
        );

        String userName = streak.getUser() != null
                ? (streak.getUser().getFirstName() + " " + streak.getUser().getLastName()).trim()
                : "Người học";
        String avatarUrl = streak.getUser() != null ? streak.getUser().getAvatarUrl() : null;

        return UserStreakDTO.builder()
                .id(streak.getId())
                .userId(streak.getUser() != null ? streak.getUser().getId() : null)
                .userName(userName)
                .avatarUrl(avatarUrl)
                .currentStreak(activeStreak)
                .longestStreak(longest)
                .totalActiveDays(totalDays)
                .vocabLearned(streak.getVocabLearned() != null ? streak.getVocabLearned() : 0)
                .lastActivityDate(lastDate)
                .hasActiveToday(hasActiveToday)
                .attendanceRate(attendanceRate)
                .weeklyActivity(weekly)
                .activeDatesInMonth(monthlyDates)
                .build();
    }

    private List<String> calculateMonthlyActiveDates(Long userId, LocalDate lastDate, int currentStreak) {
        Set<String> activeDates = new TreeSet<>();
        LocalDate today = LocalDate.now();

        // 1. Nếu đang có streak, các ngày liên tiếp từ lastDate lùi lại currentStreak ngày đều active
        if (lastDate != null && currentStreak > 0) {
            for (int i = 0; i < currentStreak; i++) {
                LocalDate streakDay = lastDate.minusDays(i);
                if (!streakDay.isBefore(today.minusDays(35)) && !streakDay.isAfter(today)) {
                    activeDates.add(streakDay.toString());
                }
            }
        }

        // 2. Thêm các ngày user có nộp bài thi thực tế trong 35 ngày gần đây
        if (userId != null && examAttemptRepository != null) {
            try {
                List<ExamAttempt> attempts = examAttemptRepository.findByUserIdOrderByStartTimeDesc(userId);
                for (ExamAttempt att : attempts) {
                    if (att.getStartTime() != null) {
                        LocalDate examDate = att.getStartTime().toLocalDate();
                        if (!examDate.isBefore(today.minusDays(35)) && !examDate.isAfter(today)) {
                            activeDates.add(examDate.toString());
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Không thể tải lịch sử thi cho streak: ", ex);
            }
        }

        return new ArrayList<>(activeDates);
    }

    private List<Boolean> calculateWeeklyActivity(LocalDate lastDate, boolean hasActiveToday, int currentStreak) {
        List<Boolean> weekly = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = 0; i < 7; i++) {
            LocalDate day = startOfWeek.plusDays(i);
            if (day.isAfter(today)) {
                // Ngày trong tương lai của tuần
                weekly.add(false);
            } else if (day.equals(today)) {
                weekly.add(hasActiveToday);
            } else {
                // Ngày trong quá khứ của tuần: nếu streak bao phủ ngày này
                long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(day, today);
                if (hasActiveToday && daysAgo < currentStreak) {
                    weekly.add(true);
                } else if (!hasActiveToday && lastDate != null && !day.isAfter(lastDate) && daysAgo <= currentStreak) {
                    weekly.add(true);
                } else {
                    // Mặc định các ngày trước đó nếu người dùng đã có chuỗi
                    weekly.add(currentStreak > daysAgo);
                }
            }
        }
        return weekly;
    }

    private UserStreakDTO getDefaultDTO(Long userId) {
        List<Boolean> weekly = new ArrayList<>(List.of(false, false, false, false, false, false, false));
        return UserStreakDTO.builder()
                .userId(userId)
                .userName("Người học")
                .currentStreak(0)
                .longestStreak(0)
                .totalActiveDays(0)
                .vocabLearned(0)
                .lastActivityDate(null)
                .hasActiveToday(false)
                .attendanceRate(0.0)
                .weeklyActivity(weekly)
                .activeDatesInMonth(Collections.emptyList())
                .build();
    }
}
