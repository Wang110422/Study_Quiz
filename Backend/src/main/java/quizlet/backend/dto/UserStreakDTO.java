package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStreakDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String avatarUrl;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalActiveDays;
    private Integer vocabLearned;
    private LocalDate lastActivityDate;
    private Boolean hasActiveToday;
    private Double attendanceRate;
    private List<Boolean> weeklyActivity;
    private List<String> activeDatesInMonth;
}
