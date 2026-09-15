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
public class RoadmapPhaseDTO {
    private Long id;
    private String title;
    private Double minAvgScoreToPass;
    private Double minAccuracyRace;
    private Integer phaseOrder;
    private List<PhaseTaskDTO> tasks;
    private Integer totalTasks;
    private Integer completedTasks;
    private Boolean isCompleted;
    private Boolean isLocked;
}
