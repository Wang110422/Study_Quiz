package quizlet.backend.dto.req;

import lombok.Data;
import quizlet.backend.enums.TaskType;

import java.util.List;

@Data
public class CreateRoadmapRequest {
    private String title;
    private Integer targetScore;
    private Integer totalEstimatedDays;
    private List<PhaseRequest> phases;

    @Data
    public static class PhaseRequest {
        private String title;
        private Double minAvgScoreToPass;
        private Double minAccuracyRace;
        private List<TaskRequest> tasks;
    }

    @Data
    public static class TaskRequest {
        private String title;
        private TaskType taskType;
        private Long targetId;
        private Integer orderIndex;
    }
}
