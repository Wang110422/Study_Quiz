package quizlet.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import quizlet.backend.enums.Mode;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttemptDTO {
    private Long id;
    private Long examId;
    private String examTitle;
    private Mode mode;
    private Double totalScore;
    private Integer totalTime;
    private String answerDetail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
