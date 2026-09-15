package quizlet.backend.dto.req;

import lombok.Data;

@Data
public class UpdateTaskProgressRequest {
    private Double score;
    private Boolean isCompleted;
    private String mode; // e.g. "LEARN", "TEST", "COMPLETE"
}
