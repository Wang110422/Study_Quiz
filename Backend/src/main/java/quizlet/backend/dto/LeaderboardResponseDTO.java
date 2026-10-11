package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponseDTO {
    private String filter;
    private String subFilter;
    private Integer totalParticipants;
    private List<LeaderboardItemDTO> rankings;
    private LeaderboardItemDTO currentUserRanking;
    private UserStreakDTO streakSummary;
}
