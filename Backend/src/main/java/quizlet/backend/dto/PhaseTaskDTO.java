package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.TaskType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhaseTaskDTO {
    private Long id;
    private String title;
    private TaskType taskType;
    private Long targetId;
    private Integer orderIndex;
    private String status; // "done" | "current" | "locked"
    private Boolean isCompleted;
    private Double score;
    private String targetTitle;
    private String targetSlug;
    private Integer targetItemCount;
    private String link;
}
