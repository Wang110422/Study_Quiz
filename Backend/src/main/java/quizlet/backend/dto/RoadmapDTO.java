package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapDTO {
    private Long id;
    private String title;
    private Integer targetScore;
    private Integer totalEstimatedDays;
    private List<RoadmapPhaseDTO> phases;
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer progressPercent;
    private Boolean isCompleted;
    private Long currentPhaseId;
    private Long currentTaskId;
}
