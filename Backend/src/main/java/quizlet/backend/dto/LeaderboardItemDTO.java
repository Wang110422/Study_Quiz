package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardItemDTO {
    private Long userId;
    private String name;
    private String email;
    private String avatarUrl;
    private String avatarInitial;
    private Boolean isCurrentUser;
    private Integer rank;

    // Tiêu chí 1: Từ vựng
    private Integer vocabLearned;
    private Integer studySetsCount;

    // Tiêu chí 2: Luyện đề (3 tiêu chuẩn con)
    private Integer examsSubmitted;
    private Double latestExamScore;
    private Double avgExamScore;
    private String lastExamDate;

    // Tiêu chí 3: Streak
    private Integer streakDays;
    private Integer totalActiveDays;
    private String lastActiveDate;

    // Tiêu chí 4: Điểm kinh nghiệm tổng hợp (EXP)
    private Integer expPoints;
}
